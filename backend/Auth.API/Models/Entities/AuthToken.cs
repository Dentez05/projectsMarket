using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Auth.API.Models.Entities
{
    [Table("auth_tokens")]
    public class AuthToken
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        public int UserId { get; set; }

        public User User { get; set; } = null!;

        // "Confirm" — подтверждение email, "Reset" — сброс пароля
        [Required]
        [MaxLength(20)]
        public string Purpose { get; set; } = null!;

        // SHA-256 (hex) от открытого токена
        [Required]
        [MaxLength(64)]
        public string TokenHash { get; set; } = null!;

        public DateTime ExpiresAt { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? UsedAt { get; set; }
    }
}
