namespace Auth.API.Models.DTOs
{
    public class AuthResponse
    {
        public string Token { get; set; }
        // Отдаётся в httpOnly-cookie, в JSON-ответ не попадает
        public string? RefreshToken { get; set; }
        public UserDto User { get; set; }
    }
}
