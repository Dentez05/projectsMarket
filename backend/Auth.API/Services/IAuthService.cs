using Auth.API.Models.DTOs;

namespace Auth.API.Services
{
    public interface IAuthService
    {
        Task<AuthResponse> RegisterAsync(RegisterRequest request, string ip);
        Task<AuthResponse> LoginAsync(LoginRequest request, string ip);
        Task<AuthResponse?> RefreshAsync(string refreshToken, string ip);
        Task LogoutAsync(string refreshToken);
        Task<UserDto> GetUserByIdAsync(int id);
        Task ConfirmEmailAsync(string token);
        Task ResendConfirmationAsync(string email);
        Task ForgotPasswordAsync(string email);
        Task ResetPasswordAsync(string token, string newPassword);
    }
}
