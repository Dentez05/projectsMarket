using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Text;
using Auth.API.Data;
using Auth.API.Models.Entities;
using Auth.API.Models.DTOs;
using System.Security.Claims;
using System.Security.Cryptography;

namespace Auth.API.Services
{
    public class AuthService : IAuthService
    {
        private readonly AuthDbContext _context;
        private readonly IConfiguration _configuration;
        private readonly ILogger<AuthService> _logger;

        public AuthService(
            AuthDbContext context,
            IConfiguration configuration,
            ILogger<AuthService> logger)
        {
            _context = context;
            _configuration = configuration;
            _logger = logger;
        }

        public async Task<AuthResponse> RegisterAsync(RegisterRequest request, string ip)
        {
            var existingUser = await _context.Users
                .FirstOrDefaultAsync(u => u.Email == request.Email);
            if (existingUser != null)
                throw new Exception("Пользователь с таким Email уже существует");

            var passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);

            var user = new User
            {
                Email = request.Email,
                PasswordHash = passwordHash,
                FullName = request.FullName,
                Role = "User",
                CreatedAt = DateTime.UtcNow
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Новый пользователь зарегистрирован: {Email}", user.Email);

            return await IssueSessionAsync(user, ip);
        }

        public async Task<AuthResponse> LoginAsync(LoginRequest request, string ip)
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Email == request.Email);

            if (user == null)
                throw new Exception("Неверный Email или пароль");

            if (!BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
                throw new Exception("Неверный email или пароль");

            _logger.LogInformation("Пользователь вошел: {Email}", user.Email);

            await CleanupUserTokensAsync(user.Id);

            return await IssueSessionAsync(user, ip);
        }

        public async Task<AuthResponse?> RefreshAsync(string refreshToken, string ip)
        {
            if (string.IsNullOrWhiteSpace(refreshToken))
                return null;

            var tokenHash = HashToken(refreshToken);
            var stored = await _context.RefreshTokens
                .Include(t => t.User)
                .FirstOrDefaultAsync(t => t.TokenHash == tokenHash);

            if (stored == null)
                return null;

            // Использование отозванного токена — возможная кража: отзываем всю цепочку
            if (stored.RevokedAt != null)
            {
                _logger.LogWarning("Повторное использование отозванного refresh-токена пользователя {UserId} (IP {Ip}) — все сессии отозваны",
                    stored.UserId, ip);
                await RevokeAllUserTokensAsync(stored.UserId);
                await _context.SaveChangesAsync();
                return null;
            }

            if (stored.ExpiresAt <= DateTime.UtcNow)
                return null;

            // Ротация: старый токен отключаем, выдаём новый
            stored.RevokedAt = DateTime.UtcNow;
            var newToken = GenerateRefreshTokenValue();
            _context.RefreshTokens.Add(new RefreshToken
            {
                UserId = stored.UserId,
                TokenHash = HashToken(newToken),
                ExpiresAt = DateTime.UtcNow.AddDays(GetRefreshTokenDays()),
                CreatedIp = ip
            });
            await _context.SaveChangesAsync();

            return new AuthResponse
            {
                Token = GenerateJwtToken(stored.User),
                RefreshToken = newToken,
                User = MapToDto(stored.User)
            };
        }

        public async Task LogoutAsync(string refreshToken)
        {
            if (string.IsNullOrWhiteSpace(refreshToken))
                return;

            var tokenHash = HashToken(refreshToken);
            var stored = await _context.RefreshTokens
                .FirstOrDefaultAsync(t => t.TokenHash == tokenHash);

            if (stored == null || stored.RevokedAt != null)
                return;

            stored.RevokedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            _logger.LogInformation("Пользователь вышел (revoked refresh-токен, IP записан при создании)");
        }

        public async Task<UserDto> GetUserByIdAsync(int id)
        {
            var user = await _context.Users.FindAsync(id);
            return user == null ? null : MapToDto(user);
        }

        private async Task<AuthResponse> IssueSessionAsync(User user, string ip)
        {
            var refreshToken = GenerateRefreshTokenValue();
            _context.RefreshTokens.Add(new RefreshToken
            {
                UserId = user.Id,
                TokenHash = HashToken(refreshToken),
                ExpiresAt = DateTime.UtcNow.AddDays(GetRefreshTokenDays()),
                CreatedIp = ip
            });
            await _context.SaveChangesAsync();

            return new AuthResponse
            {
                Token = GenerateJwtToken(user),
                RefreshToken = refreshToken,
                User = MapToDto(user)
            };
        }

        private async Task CleanupUserTokensAsync(int userId)
        {
            var now = DateTime.UtcNow;
            var stale = await _context.RefreshTokens
                .Where(t => t.UserId == userId
                    && (t.ExpiresAt < now || (t.RevokedAt != null && t.RevokedAt < now.AddDays(-7))))
                .ToListAsync();

            if (stale.Count > 0)
            {
                _context.RefreshTokens.RemoveRange(stale);
                await _context.SaveChangesAsync();
            }
        }

        private async Task RevokeAllUserTokensAsync(int userId)
        {
            var active = await _context.RefreshTokens
                .Where(t => t.UserId == userId && t.RevokedAt == null)
                .ToListAsync();

            foreach (var token in active)
                token.RevokedAt = DateTime.UtcNow;
        }

        private string GenerateJwtToken(User user)
        {
            var claims = new[]
            {
                new Claim("uid", user.Id.ToString()),
                new Claim("name", user.FullName),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Role, user.Role)
            };

            var key = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            // Короткий access-токен: жизнь продлевается только через refresh-ротацию
            var accessMinutes = int.TryParse(_configuration["Jwt:AccessTokenMinutes"], out var m) ? m : 15;

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(accessMinutes),
                signingCredentials: creds);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        private int GetRefreshTokenDays()
        {
            return int.TryParse(_configuration["Jwt:RefreshTokenDays"], out var d) && d > 0 ? d : 30;
        }

        private static string GenerateRefreshTokenValue()
        {
            var bytes = RandomNumberGenerator.GetBytes(64);
            return Convert.ToBase64String(bytes)
                .TrimEnd('=')
                .Replace('+', '-')
                .Replace('/', '_');
        }

        private static string HashToken(string token)
        {
            var hash = SHA256.HashData(Encoding.UTF8.GetBytes(token));
            return Convert.ToHexString(hash).ToLowerInvariant();
        }

        private UserDto MapToDto(User user)
        {
            return new UserDto
            {
                Id = user.Id,
                Email = user.Email,
                FullName = user.FullName,
                Role = user.Role,
                CreatedAt = user.CreatedAt
            };
        }
    }
}
