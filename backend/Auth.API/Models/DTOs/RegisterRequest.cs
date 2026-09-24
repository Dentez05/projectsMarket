using System.ComponentModel.DataAnnotations;

namespace Auth.API.Models.DTOs
{
    public class RegisterRequest
    {
        [Required(ErrorMessage = "Email обязателен")]
        [EmailAddress(ErrorMessage = "Неверный формат email")]
        [MaxLength(256, ErrorMessage = "Email не может быть длиннее 256 символов")]
        public string Email { get; set; }

        [Required(ErrorMessage = "Пароль обязателен")]
        [MinLength(6, ErrorMessage = "Пароль должен быть минимум 6 символов")]
        [MaxLength(128, ErrorMessage = "Пароль не может быть длиннее 128 символов")]
        public string Password { get; set; }

        [Required(ErrorMessage = "Имя обязательно")]
        [MinLength(2, ErrorMessage = "Имя должно содержать минимум 2 символа")]
        [MaxLength(100, ErrorMessage = "Имя не может быть длиннее 100 символов")]
        public string FullName { get; set; }
    }
}
