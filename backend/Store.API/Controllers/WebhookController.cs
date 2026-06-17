using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Store.API.Services;
using System.Text.Json;

namespace Store.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [AllowAnonymous]
    public class WebhookController : ControllerBase
    {
        private readonly IPaymentService _paymentService;
        private readonly ILogger<WebhookController> _logger;

        public WebhookController(IPaymentService paymentService, ILogger<WebhookController> logger)
        {
            _paymentService = paymentService;
            _logger = logger;
        }

        [HttpPost]
        public async Task<IActionResult> Handle([FromBody] JsonElement webhookData)
        {
            var eventType = webhookData.GetProperty("event").GetString();
            _logger.LogInformation("Получен вебхук: {Event}", eventType);

            if (eventType == "payment.succeeded")
            {
                var paymentId = webhookData.GetProperty("object").GetProperty("id").GetString();
                if (!string.IsNullOrEmpty(paymentId))
                    await _paymentService.HandlePaymentSucceededAsync(paymentId);
            }

            return Ok();
        }
    }
}