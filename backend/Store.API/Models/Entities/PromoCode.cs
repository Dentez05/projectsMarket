using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Store.API.Models.Entities
{
    [Table("promo_codes")]
    public class PromoCode
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [Required]
        [MaxLength(50)]
        public string Code { get; set; } = null!;

        // "Percent" — % от суммы, "Fixed" — фиксированная скидка в рублях
        [Required]
        [MaxLength(20)]
        public string Type { get; set; } = null!;

        public decimal Value { get; set; }

        public decimal? MinOrderAmount { get; set; }

        public int? MaxUses { get; set; }

        public int UsedCount { get; set; }

        public DateTime? ExpiresAt { get; set; }

        public bool IsActive { get; set; } = true;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
