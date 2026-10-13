using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Text;
using Auth.API.Data;
using Auth.API.Email;
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
        private readonly IEmailService _emailService;

        public AuthService(
            AuthDbContext context,
            IConfiguration configuration,
            ILogger<AuthService> logger,
            IEmailService emailService)
        {
            _context = context;
            _configuration = configuration;
            _logger = logger;
            _emailService = emailService;
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

            await SendConfirmationEmailAsync(user);

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

        public async Task ConfirmEmailAsync(string token)
        {
            var stored = await FindAuthTokenAsync(token, "Confirm");
            if (stored == null)
                throw new Exception("Ссылка недействительна или устарела");

            stored.UsedAt = DateTime.UtcNow;

            var user = await _context.Users.FindAsync(stored.UserId);
            if (user == null)
                throw new Exception("Пользователь не найден");

            if (!user.EmailConfirmed)
            {
                user.EmailConfirmed = true;
                user.UpdatedAt = DateTime.UtcNow;
                _logger.LogInformation("Email подтверждён: {Email}", user.Email);
            }

            await _context.SaveChangesAsync();
        }

        public async Task ResendConfirmationAsync(string email)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
            // Не раскрываем, существует ли аккаунт
            if (user == null || user.EmailConfirmed)
                return;

            await SendConfirmationEmailAsync(user);
        }

        public async Task ForgotPasswordAsync(string email)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
            // Не раскрываем, существует ли аккаунт — всегда «отправляем»
            if (user == null)
                return;

            // Отзываем прошлые непротухшие токены сброса
            var stale = await _context.AuthTokens
                .Where(t => t.UserId == user.Id
                    && t.Purpose == "Reset"
                    && t.UsedAt == null
                    && t.ExpiresAt > DateTime.UtcNow)
                .ToListAsync();
            foreach (var t in stale)
                t.UsedAt = DateTime.UtcNow;

            var token = GenerateAuthTokenValue();
            _context.AuthTokens.Add(new AuthToken
            {
                UserId = user.Id,
                Purpose = "Reset",
                TokenHash = HashToken(token),
                ExpiresAt = DateTime.UtcNow.AddHours(1)
            });
            await _context.SaveChangesAsync();

            var link = $"{GetFrontendUrl()}/reset-password?token={Uri.EscapeDataString(token)}";
            await _emailService.SendAsync(
                user.Email,
                "Сброс пароля — ProjectMarket",
                $"""
                <p>Здравствуйте, {System.Net.WebUtility.HtmlEncode(user.FullName)}!</p>
                <p>Мы получили запрос на сброс пароля для вашего аккаунта.</p>
                <p><a href="{link}">Нажмите здесь, чтобы задать новый пароль</a> (действует 1 час).</p>
                <p>Если это были не вы — просто проигнорируйте письмо.</p>
                """);

            _logger.LogInformation("Отправлена ссылка сброса пароля на {Email}", user.Email);
        }

        public async Task ResetPasswordAsync(string token, string newPassword)
        {
            var stored = await FindAuthTokenAsync(token, "Reset");
            if (stored == null)
                throw new Exception("Ссылка недействительна или устарела");

            stored.UsedAt = DateTime.UtcNow;

            var user = await _context.Users.FindAsync(stored.UserId);
            if (user == null)
                throw new Exception("Пользователь не найден");

            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(newPassword);
            user.UpdatedAt = DateTime.UtcNow;

            await RevokeAllUserTokensAsync(user.Id);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Пароль сброшен, все сессии отозваны: {Email}", user.Email);
        }

        private async Task SendConfirmationEmailAsync(User user)
        {
            var token = GenerateAuthTokenValue();
            _context.AuthTokens.Add(new AuthToken
            {
                UserId = user.Id,
                Purpose = "Confirm",
                TokenHash = HashToken(token),
                ExpiresAt = DateTime.UtcNow.AddDays(1)
            });
            await _context.SaveChangesAsync();

            var link = $"{GetFrontendUrl()}/confirm-email?token={Uri.EscapeDataString(token)}";
            await _emailService.SendAsync(
                user.Email,
                "Подтвердите email — ProjectMarket",
                $"""
                <p>Здравствуйте, {System.Net.WebUtility.HtmlEncode(user.FullName)}!</p>
                <p>Подтвердите ваш email, чтобы завершить регистрацию.</p>
                <p><a href="{link}">Подтвердить email</a> (действует 24 часа).</p>
                <p>Если вы не регистрировались — проигнорируйте письмо.</p>
                """);

            _logger.LogInformation("Отправлена ссылка подтверждения email на {Email}", user.Email);
        }

        private async Task<AuthToken?> FindAuthTokenAsync(string token, string purpose)
        {
            var tokenHash = HashToken(token);
            var stored = await _context.AuthTokens
                .FirstOrDefaultAsync(t => t.TokenHash == tokenHash && t.Purpose == purpose);

            if (stored == null)
                return null;
            if (stored.UsedAt != null || stored.ExpiresAt <= DateTime.UtcNow)
                return null;

            return stored;
        }

        private string GetFrontendUrl()
        {
            return _configuration["App:FrontendUrl"] ?? "http://localhost:5010";
        }

        private static string GenerateAuthTokenValue()
        {
            var bytes = RandomNumberGenerator.GetBytes(64);
            return Convert.ToBase64String(bytes)
                .TrimEnd('=')
                .Replace('+', '-')
                .Replace('/', '_');
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
                CreatedAt = user.CreatedAt,
                EmailConfirmed = user.EmailConfirmed
            };
        }
    }
}
