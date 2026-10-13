using Microsoft.AspNetCore.Authorization;
using Auth.API.Models.DTOs;
using Auth.API.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace Auth.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private const string RefreshCookieName = "pm_refresh";
        private const string RefreshCookiePath = "/api/Auth";

        private readonly IAuthService _authService;
        private readonly IConfiguration _configuration;
        private readonly ILogger<AuthController> _logger;

        public AuthController(IAuthService authService, IConfiguration configuration, ILogger<AuthController> logger)
        {
            _authService = authService;
            _configuration = configuration;
            _logger = logger;
        }

        [EnableRateLimiting("auth")]
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            try
            {
                var result = await _authService.RegisterAsync(request, GetIp());
                AppendRefreshCookie(result);
                return Ok(ToClientResponse(result));
            }

            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка регистрации");
                return BadRequest(new { message = ex.Message });
            }
        }

        [EnableRateLimiting("auth")]
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            try
            {
                var result = await _authService.LoginAsync(request, GetIp());
                AppendRefreshCookie(result);
                return Ok(ToClientResponse(result));
            }

            catch(Exception ex)
            {
                _logger.LogError(ex, "Ошибка входа");
                return Unauthorized(new { message = ex.Message });
            }
        }

        [HttpPost("refresh")]
        public async Task<IActionResult> Refresh()
        {
            if (!Request.Cookies.TryGetValue(RefreshCookieName, out var refreshToken)
                || string.IsNullOrEmpty(refreshToken))
                return Unauthorized(new { message = "Сессия не найдена" });

            var result = await _authService.RefreshAsync(refreshToken, GetIp());
            if (result == null)
            {
                DeleteRefreshCookie();
                return Unauthorized(new { message = "Сессия истекла — войдите в систему заново" });
            }

            AppendRefreshCookie(result);
            return Ok(ToClientResponse(result));
        }

        [HttpPost("logout")]
        [AllowAnonymous]
        public async Task<IActionResult> Logout()
        {
            if (Request.Cookies.TryGetValue(RefreshCookieName, out var refreshToken)
                && !string.IsNullOrEmpty(refreshToken))
            {
                await _authService.LogoutAsync(refreshToken);
            }

            DeleteRefreshCookie();
            return Ok(new { ok = true });
        }

        [Authorize]
        [HttpGet("profile")]
        public async Task<IActionResult> GetProfile()
        {
            var userId = User.FindFirst("uid")?.Value;
            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            var user = await _authService.GetUserByIdAsync(int.Parse(userId));
            return Ok(user);
        }

        [HttpPost("confirm-email")]
        [AllowAnonymous]
        public async Task<IActionResult> ConfirmEmail([FromBody] ConfirmEmailRequest request)
        {
            try
            {
                await _authService.ConfirmEmailAsync(request.Token);
                return Ok(new { ok = true });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [EnableRateLimiting("auth")]
        [HttpPost("resend-confirmation")]
        [AllowAnonymous]
        public async Task<IActionResult> ResendConfirmation([FromBody] ForgotPasswordRequest request)
        {
            await _authService.ResendConfirmationAsync(request.Email);
            // Всегда 200 — не раскрываем, существует ли аккаунт
            return Ok(new { ok = true });
        }

        [EnableRateLimiting("auth")]
        [HttpPost("forgot-password")]
        [AllowAnonymous]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequest request)
        {
            try
            {
                await _authService.ForgotPasswordAsync(request.Email);
                return Ok(new { ok = true });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка запроса сброса пароля");
                return Ok(new { ok = true });
            }
        }

        [EnableRateLimiting("auth")]
        [HttpPost("reset-password")]
        [AllowAnonymous]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest request)
        {
            try
            {
                await _authService.ResetPasswordAsync(request.Token, request.NewPassword);
                return Ok(new { ok = true });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // Ответ клиенту: только access-токен и пользователь, refresh — только в cookie
        private static object ToClientResponse(AuthResponse result)
        {
            return new { token = result.Token, user = result.User };
        }

        private void AppendRefreshCookie(AuthResponse result)
        {
            if (string.IsNullOrEmpty(result.RefreshToken))
                return;

            var days = int.TryParse(_configuration["Jwt:RefreshTokenDays"], out var d) && d > 0 ? d : 30;

            Response.Cookies.Append(RefreshCookieName, result.RefreshToken, new CookieOptions
            {
                HttpOnly = true,
                Secure = Request.IsHttps,
                SameSite = SameSiteMode.Lax,
                Path = RefreshCookiePath,
                Expires = DateTimeOffset.UtcNow.AddDays(days)
            });
        }

        private void DeleteRefreshCookie()
        {
            Response.Cookies.Delete(RefreshCookieName, new CookieOptions { Path = RefreshCookiePath });
        }

        // Защита от CSRF: cookie выставляется с SameSite=Lax — браузер не пришлёт её
        // в запросах с чужого origin (эндпоинты refresh/logout только POST).

        private string GetIp()
        {
            return HttpContext.Connection.RemoteIpAddress?.ToString() ?? "";
        }
    }
}
