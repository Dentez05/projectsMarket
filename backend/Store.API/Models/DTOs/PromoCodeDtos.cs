using System.ComponentModel.DataAnnotations;

namespace Store.API.Models.DTOs
{
    public class PromoCodeResponse
    {
        public int Id { get; set; }
        public string Code { get; set; } = null!;
        public string Type { get; set; } = null!;
        public decimal Value { get; set; }
        public decimal? MinOrderAmount { get; set; }
        public int? MaxUses { get; set; }
        public int UsedCount { get; set; }
        public DateTime? ExpiresAt { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class CreatePromoCodeRequest
    {
        [Required(ErrorMessage = "Код обязателен")]
        [MaxLength(50)]
        public string Code { get; set; } = null!;

        [Required(ErrorMessage = "Тип обязателен")]
        [MaxLength(20)]
        public string Type { get; set; } = null!;  // Percent | Fixed

        [Range(0.01, double.MaxValue, ErrorMessage = "Значение должно быть больше нуля")]
        public decimal Value { get; set; }

        public decimal? MinOrderAmount { get; set; }

        public int? MaxUses { get; set; }

        public DateTime? ExpiresAt { get; set; }
    }

    public class UpdatePromoCodeRequest
    {
        public decimal? Value { get; set; }
        public decimal? MinOrderAmount { get; set; }
        public int? MaxUses { get; set; }
        public DateTime? ExpiresAt { get; set; }
        public bool? IsActive { get; set; }
    }
}
