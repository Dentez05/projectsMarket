using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Store.API.Models.DTOs;
using Store.API.Services;

namespace Store.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class PaymentsController : ControllerBase
    {
        private readonly IPaymentService _paymentService;
        private readonly IOrderService _orderService;

        public PaymentsController(IPaymentService paymentService, IOrderService orderService)
        {
            _paymentService = paymentService;
            _orderService = orderService;
        }

        [HttpPost("orders/{id}")]
        public async Task<IActionResult> CreatePayment(int id, [FromBody] CreatePaymentRequest request)
        {
            var userId = int.Parse(User.FindFirst("uid")?.Value ?? "0");
            var isAdmin = User.IsInRole("Admin");
                
            var order = await _orderService.GetOrderByIdAsync(userId, id, isAdmin);

            if (order == null)
                return NotFound();

            if (order.Status != "Pending")
                return BadRequest("Заказ уже оплачен или отменён");

            var payment = await _paymentService.CreatePaymentAsync(id, "https://localhost:7105/payment/success");

            return Ok(new
            {
                paymentId = payment.PaymentId,  
                confirmationUrl = payment.ConfirmationUrl
            });
        }

        [HttpGet("success")]
        [AllowAnonymous]
        public async Task<IActionResult> Success([FromQuery] int orderId)
        {
            var order = await _orderService.GetOrderByIdAsyncForAdmin(orderId);
            if (order == null)
                return NotFound("Заказ не найден");

            if (order.Status == "Paid")
            {
                return Ok(new { message = "Заказ успешно оплачен", orderId, status = order.Status });
            }

            if (!string.IsNullOrEmpty(order.PaymentId))
            {
                var paymentStatus = await _paymentService.CheckPaymentStatusAsync(order.PaymentId);
                if (paymentStatus == "succeeded")
                {
                    await _orderService.MarkOrderAsPaidAsync(orderId);
                    return Ok(new { message = "Заказ успешно оплачен", orderId, status = "Paid" });
                }
            }

            return BadRequest(new { message = "Заказ не оплачен", orderId, status = order.Status });
        }
    }
}