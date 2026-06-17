using System.ComponentModel.DataAnnotations;

namespace Auth.API.Models.DTOs
{
    public class RegisterRequest
    {
        [Required(ErrorMessage = "Email обязателен")]
        [EmailAddress(ErrorMessage = "Неверный формат email")]
        public string Email { get; set; }

        [Required(ErrorMessage = "Пароль обязателен")]
        [MinLength(6, ErrorMessage = "Пароль должен быть минимум 6 символов")]
        public string Password { get; set; }

        [Required(ErrorMessage = "Имя обязательно")]
        public string FullName { get; set; }
    }
}