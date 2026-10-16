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
        private readonly IConfiguration _configuration;

        public PaymentsController(IPaymentService paymentService, IOrderService orderService, IConfiguration configuration)
        {
            _paymentService = paymentService;
            _orderService = orderService;
            _configuration = configuration;
        }

        [HttpPost("orders/{id}")]
        public async Task<IActionResult> CreatePayment(int id)
        {
            var userId = int.Parse(User.FindFirst("uid")?.Value ?? "0");
            var isAdmin = User.IsInRole("Admin");

            var order = await _orderService.GetOrderByIdAsync(userId, id, isAdmin);

            if (order == null)
                return NotFound();

            if (order.Status != "Pending")
                return BadRequest("Заказ уже оплачен или отменён");

            var returnUrl = _configuration["YooKassa:ReturnUrl"] ?? "http://localhost:5010/payment-success";
            returnUrl += $"{(returnUrl.Contains('?') ? '&' : '?')}orderId={id}";
            var payment = await _paymentService.CreatePaymentAsync(id, returnUrl);

            return Ok(new
            {
                paymentId = payment.PaymentId,
                confirmationUrl = payment.ConfirmationUrl
            });
        }

        [HttpGet("success")]
        public async Task<IActionResult> Success([FromQuery] int orderId)
        {
            var userId = int.Parse(User.FindFirst("uid")?.Value ?? "0");
            var isAdmin = User.IsInRole("Admin");

            var order = await _orderService.GetOrderByIdAsync(userId, orderId, isAdmin);
            if (order == null)
                return NotFound("Заказ не найден");

            if (order.Status == "Delivered")
            {
                return Ok(new { message = "Заказ успешно оплачен", orderId, status = order.Status });
            }

            if (!string.IsNullOrEmpty(order.PaymentId))
            {
                var paymentStatus = await _paymentService.CheckPaymentStatusAsync(order.PaymentId);
                if (paymentStatus == "succeeded")
                {
                    await _orderService.MarkOrderAsPaidAsync(orderId);
                    return Ok(new { message = "Заказ успешно оплачен", orderId, status = "Delivered" });
                }
            }

            return BadRequest(new { message = "Заказ не оплачен", orderId, status = order.Status });
        }

        [HttpGet("check/{orderId}")]
        public async Task<IActionResult> CheckStatus(int orderId)
        {
            var userId = int.Parse(User.FindFirst("uid")?.Value ?? "0");
            var isAdmin = User.IsInRole("Admin");

            var order = await _orderService.GetOrderByIdAsync(userId, orderId, isAdmin);
            if (order == null)
                return NotFound();

            if (order.Status == "Delivered")
                return Ok(new { status = "Delivered" });

            if (!string.IsNullOrEmpty(order.PaymentId))
            {
                var paymentStatus = await _paymentService.CheckPaymentStatusAsync(order.PaymentId);
                if (paymentStatus == "succeeded")
                {
                    await _orderService.MarkOrderAsPaidAsync(orderId);
                    return Ok(new { status = "Delivered" });
                }
            }

            return Ok(new { status = order.Status });
        }
    }
}
