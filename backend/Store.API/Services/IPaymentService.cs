using Store.API.Models.DTOs;

namespace Store.API.Services
{
    public interface IPaymentService
    {
        Task<PaymentResponse> CreatePaymentAsync(int orderId, string returnUrl);
        Task HandlePaymentSucceededAsync(string paymentId);
        Task<string> CheckPaymentStatusAsync(string paymentId);
    }
}
