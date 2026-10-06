using Microsoft.EntityFrameworkCore;
using Store.API.Data;
using Store.API.Models.DTOs;
using Store.API.Models.Entities;
using System.Globalization;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace Store.API.Services
{
    public class PaymentService : IPaymentService
    {
        private readonly StoreDbContext _context;
        private readonly IConfiguration _configuration;
        private readonly ILogger<PaymentService> _logger;
        private readonly IHttpClientFactory _httpClientFactory;

        public PaymentService(StoreDbContext context, IConfiguration configuration, ILogger<PaymentService> logger, IHttpClientFactory httpClientFactory)
        {
            _context = context;
            _configuration = configuration;
            _logger = logger;
            _httpClientFactory = httpClientFactory;
        }

        public async Task<string> CheckPaymentStatusAsync(string paymentId)
        {
            var info = await GetPaymentInfoAsync(paymentId);
            return info?.Status ?? "unknown";
        }

        public async Task<PaymentVerificationResult?> GetPaymentInfoAsync(string paymentId)
        {
            var shopId = _configuration["YooKassa:ShopId"];
            var secretKey = _configuration["YooKassa:SecretKey"];
            if (string.IsNullOrEmpty(shopId) || string.IsNullOrEmpty(secretKey))
            {
                _logger.LogWarning("YooKassa не настроена (ShopId/SecretKey пусты)");
                return null;
            }

            try
            {
                var auth = Convert.ToBase64String(Encoding.UTF8.GetBytes($"{shopId}:{secretKey}"));

                var client = _httpClientFactory.CreateClient();
                client.DefaultRequestHeaders.Authorization =
                    new System.Net.Http.Headers.AuthenticationHeaderValue("Basic", auth);

                var response = await client.GetAsync($"https://api.yookassa.ru/v3/payments/{Uri.EscapeDataString(paymentId)}");
                if (!response.IsSuccessStatusCode)
                {
                    _logger.LogWarning("ЮKassa вернула {StatusCode} для платежа {PaymentId}",
                        response.StatusCode, paymentId);
                    return null;
                }

                var responseJson = await response.Content.ReadAsStringAsync();
                using var jsonDoc = JsonDocument.Parse(responseJson);
                var root = jsonDoc.RootElement;

                var info = new PaymentVerificationResult
                {
                    PaymentId = root.GetProperty("id").GetString() ?? paymentId,
                    Status = root.GetProperty("status").GetString() ?? "unknown"
                };

                if (root.TryGetProperty("metadata", out var metadata)
                    && metadata.TryGetProperty("orderId", out var orderId))
                    info.OrderId = orderId.GetString();

                if (root.TryGetProperty("amount", out var amount))
                {
                    if (amount.TryGetProperty("value", out var value))
                        info.AmountValue = value.GetString();
                    if (amount.TryGetProperty("currency", out var currency))
                        info.AmountCurrency = currency.GetString();
                }

                return info;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Не удалось получить платёж {PaymentId} из ЮKassa", paymentId);
                return null;
            }
        }

        public async Task<PaymentResponse> CreatePaymentAsync(int orderId, string returnUrl)
        {
            var order = await _context.Orders
                .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.Project)
                .FirstOrDefaultAsync(o => o.Id == orderId);

            if (order == null)
                throw new ArgumentException("Заказ не найден");

            if (order.Status != "Pending")
                throw new InvalidOperationException("Заказ уже оплачен или отменён");

            _logger.LogInformation("Сумма для оплаты: {Amount}",
                order.TotalAmount.ToString("F2", CultureInfo.InvariantCulture));

            var receipt = new
            {
                customer = new
                {
                    email = "customer@example.com"
                },
                items = order.OrderItems.Select(oi => new
                {
                    description = oi.Project?.Title ?? "Проект",
                    quantity = "1.00",
                    amount = new
                    {
                        value = oi.PriceAtTime.ToString("F2", CultureInfo.InvariantCulture),
                        currency = "RUB"
                    },
                    vat_code = "2",
                    payment_mode = "full_prepayment",
                    payment_subject = "commodity"
                }).ToList()
            };

            var requestBody = new
            {
                amount = new
                {
                    value = order.TotalAmount.ToString("F2", CultureInfo.InvariantCulture),
                    currency = "RUB"
                },
                capture = true,
                confirmation = new
                {
                    type = "redirect",
                    return_url = returnUrl
                },
                description = $"Заказ №{order.OrderNumber}",
                receipt = receipt,
                metadata = new
                {
                    orderId = order.Id.ToString()
                }
            };

            var json = JsonSerializer.Serialize(requestBody);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            var shopId = _configuration["YooKassa:ShopId"];
            var secretKey = _configuration["YooKassa:SecretKey"];
            var auth = Convert.ToBase64String(Encoding.UTF8.GetBytes($"{shopId}:{secretKey}"));

            var client = _httpClientFactory.CreateClient();
            client.DefaultRequestHeaders.Add("Authorization", $"Basic {auth}");
            client.DefaultRequestHeaders.Add("Idempotence-Key", Guid.NewGuid().ToString());

            var response = await client.PostAsync("https://api.yookassa.ru/v3/payments", content);
            var responseJson = await response.Content.ReadAsStringAsync();

            _logger.LogInformation("Ответ ЮKassa: {Response}", responseJson);

            if (!response.IsSuccessStatusCode)
            {
                _logger.LogError("Ошибка при создании платежа: {Response}", responseJson);
                throw new Exception($"Ошибка платежной системы: {responseJson}");
            }

            var paymentResult = JsonSerializer.Deserialize<YooKassaPaymentResponse>(responseJson);

            if (paymentResult == null)
            {
                _logger.LogError("Не удалось десериализовать ответ ЮKassa: {Response}", responseJson);
                throw new Exception("Не удалось обработать ответ платежной системы");
            }

            if (paymentResult.Confirmation == null)
            {
                _logger.LogError("В ответе ЮKassa отсутствует Confirmation: {Response}", responseJson);
                throw new Exception("Платежная система не вернула ссылку на оплату");
            }

            order.PaymentId = paymentResult.Id;
            await _context.SaveChangesAsync();

            return new PaymentResponse
            {
                PaymentId = paymentResult.Id,
                ConfirmationUrl = paymentResult.Confirmation.ConfirmationUrl,
                Status = paymentResult.Status
            };
        }

        public async Task HandlePaymentSucceededAsync(string paymentId)
        {
            // Вебхуку не верим: перепроверяем платёж напрямую в ЮKassa
            var info = await GetPaymentInfoAsync(paymentId);
            if (info == null || !string.Equals(info.Status, "succeeded", StringComparison.Ordinal))
            {
                _logger.LogWarning("Вебхук отклонён: платёж {PaymentId} не подтверждён API ЮKassa (статус: {Status})",
                    paymentId, info?.Status ?? "неизвестен");
                return;
            }

            var order = await _context.Orders.FirstOrDefaultAsync(o => o.PaymentId == paymentId);
            if (order == null)
            {
                _logger.LogWarning("Заказ с paymentId {PaymentId} не найден", paymentId);
                return;
            }

            if (info.OrderId != null && info.OrderId != order.Id.ToString())
            {
                _logger.LogWarning("Вебхук отклонён: платёж {PaymentId} привязан к заказу {ExternalOrderId}, ожидался {OrderId}",
                    paymentId, info.OrderId, order.Id);
                return;
            }

            if (!decimal.TryParse(info.AmountValue, NumberStyles.Number, CultureInfo.InvariantCulture, out var paidAmount)
                || decimal.Round(paidAmount, 2) != decimal.Round(order.TotalAmount, 2)
                || !string.Equals(info.AmountCurrency, "RUB", StringComparison.OrdinalIgnoreCase))
            {
                _logger.LogWarning("Вебхук отклонён: сумма платежа {Amount} {Currency} не совпадает с заказом {OrderNumber} ({Total})",
                    info.AmountValue, info.AmountCurrency, order.OrderNumber, order.TotalAmount);
                return;
            }

            if (order.Status != "Delivered")
            {
                order.Status = "Delivered";
                order.PaidAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();
                _logger.LogInformation("Заказ {OrderNumber} оплачен", order.OrderNumber);
            }
        }

        private class YooKassaPaymentResponse
        {
            [JsonPropertyName("id")]
            public string Id { get; set; } = null!;

            [JsonPropertyName("status")]
            public string Status { get; set; } = null!;

            [JsonPropertyName("confirmation")]
            public YooKassaConfirmation Confirmation { get; set; } = null!;
        }
        private class YooKassaConfirmation
        {
            [JsonPropertyName("confirmation_url")]
            public string ConfirmationUrl { get; set; } = null!;
        }
    }
}