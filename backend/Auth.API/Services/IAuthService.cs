using Auth.API.Models.DTOs;

namespace Auth.API.Services
{
    public interface IAuthService
    {
        Task<AuthResponse> RegisterAsync(RegisterRequest request);
        Task<AuthResponse> LoginAsync(LoginRequest request);
        Task<UserDto> GetUserByIdAsync(int id);
    }
}
