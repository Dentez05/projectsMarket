namespace Store.API.Models.DTOs
{
    public class PaymentResponse
    {
        public string PaymentId { get; set; } = null!;
        public string ConfirmationUrl { get; set; } = null!;
        public string Status { get; set; } = null!;
    }
}