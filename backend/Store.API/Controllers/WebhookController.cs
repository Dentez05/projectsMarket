using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Store.API.Services;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;

namespace Store.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [AllowAnonymous]
    public class WebhookController : ControllerBase
    {
        private readonly IPaymentService _paymentService;
        private readonly IConfiguration _configuration;
        private readonly ILogger<WebhookController> _logger;

        public WebhookController(IPaymentService paymentService, IConfiguration configuration, ILogger<WebhookController> logger)
        {
            _paymentService = paymentService;
            _configuration = configuration;
            _logger = logger;
        }

        [HttpPost]
        public async Task<IActionResult> Handle([FromBody] JsonElement webhookData)
        {
            // Optional Basic-auth уведомления ЮKassa (YooKassa__WebhookUser/Password)
            var expectedUser = _configuration["YooKassa:WebhookUser"];
            if (!string.IsNullOrEmpty(expectedUser)
                && !CheckWebhookBasicAuth(expectedUser, _configuration["YooKassa:WebhookPassword"] ?? ""))
            {
                _logger.LogWarning("Вебхук: неверная Basic-аутентификация с {RemoteIp}",
                    HttpContext.Connection.RemoteIpAddress);
                return Unauthorized();
            }

            if (!webhookData.TryGetProperty("event", out var eventProperty))
                return BadRequest(new { message = "Некорректный вебхук" });

            var eventType = eventProperty.GetString();
            _logger.LogInformation("Получен вебхук: {Event}", eventType);

            if (eventType == "payment.succeeded"
                && webhookData.TryGetProperty("object", out var objectProperty)
                && objectProperty.TryGetProperty("id", out var idProperty))
            {
                var paymentId = idProperty.GetString();
                if (!string.IsNullOrEmpty(paymentId))
                {
                    // Здесь же выполняется перепроверка платежа в API ЮKassa:
                    // подделанное тело вебхука заказ не оплатит
                    await _paymentService.HandlePaymentSucceededAsync(paymentId);
                }
            }

            return Ok();
        }

        private bool CheckWebhookBasicAuth(string expectedUser, string expectedPassword)
        {
            if (!Request.Headers.TryGetValue("Authorization", out var header))
                return false;

            var value = header.ToString();
            if (!value.StartsWith("Basic ", StringComparison.OrdinalIgnoreCase))
                return false;

            string decoded;
            try
            {
                decoded = Encoding.UTF8.GetString(Convert.FromBase64String(value["Basic ".Length..].Trim()));
            }
            catch (FormatException)
            {
                return false;
            }

            var separator = decoded.IndexOf(':');
            if (separator < 0)
                return false;

            var user = decoded[..separator];
            var password = decoded[(separator + 1)..];

            return FixedTimeEquals(user, expectedUser) && FixedTimeEquals(password, expectedPassword);
        }

        private static bool FixedTimeEquals(string a, string b)
        {
            return CryptographicOperations.FixedTimeEquals(
                Encoding.UTF8.GetBytes(a), Encoding.UTF8.GetBytes(b));
        }
    }
}
