using System.ComponentModel.DataAnnotations;

namespace Auth.API.Models.DTOs
{
    public class ConfirmEmailRequest
    {
        [Required(ErrorMessage = "Токен обязателен")]
        public string Token { get; set; } = null!;
    }

    public class ForgotPasswordRequest
    {
        [Required(ErrorMessage = "Email обязателен")]
        [EmailAddress(ErrorMessage = "Некорректный email")]
        public string Email { get; set; } = null!;
    }

    public class ResetPasswordRequest
    {
        [Required(ErrorMessage = "Токен обязателен")]
        public string Token { get; set; } = null!;

        [Required(ErrorMessage = "Новый пароль обязателен")]
        [MinLength(6, ErrorMessage = "Пароль должен быть не короче 6 символов")]
        public string NewPassword { get; set; } = null!;
    }
}
