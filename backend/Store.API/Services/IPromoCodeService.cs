namespace Store.API.Services
{
    public class PromoValidationResult
    {
        public bool IsValid { get; set; }
        public string? Error { get; set; }
        public string? Code { get; set; }
        public string? Type { get; set; }
        public decimal Value { get; set; }
        public decimal Discount { get; set; }
        public decimal Total { get; set; }
    }

    public interface IPromoCodeService
    {
        Task<PromoValidationResult> ValidateAsync(string code, decimal subtotal);
    }
}
