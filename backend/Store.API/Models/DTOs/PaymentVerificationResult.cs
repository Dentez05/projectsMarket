namespace Store.API.Models.DTOs
{
    // Результат перепроверки платежа через API ЮKassa (источник истины — не вебхук)
    public class PaymentVerificationResult
    {
        public string PaymentId { get; set; } = null!;
        public string Status { get; set; } = null!;
        public string? OrderId { get; set; }
        public string? AmountValue { get; set; }
        public string? AmountCurrency { get; set; }
    }
}
