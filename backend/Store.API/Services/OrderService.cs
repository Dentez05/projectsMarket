using Store.API.Models.Entities;
using Store.API.Models.DTOs;
using Store.API.Repositories;
using System.ComponentModel.DataAnnotations.Schema;
#pragma warning disable CS8601

namespace Store.API.Services
{
    public class OrderService : IOrderService
    {
        private readonly IOrderRepository _orderRepository;
        private readonly ICartRepository _cartRepository;
        private readonly IProjectRepository _projectRepository;
        private readonly IPromoCodeService _promoService;
        private readonly ILogger<OrderService> _logger;

        public OrderService (
            IOrderRepository orderRepository, 
            ICartRepository cartRepository, 
            IProjectRepository projectRepository,
            IPromoCodeService promoService,
            ILogger<OrderService> logger)
        {
            _orderRepository = orderRepository;
            _cartRepository = cartRepository;
            _projectRepository = projectRepository;
            _promoService = promoService;
            _logger = logger;
        }

        public async Task<OrderResponse> CreateOrderFromCartAsync(int userId, string userName, string userEmail, CreateOrderRequest request)
        {
            var cartItems = await _cartRepository.GetUserCartAsync(userId);
            if (!cartItems.Any())
                throw new InvalidOperationException("Корзина пуста");

            var hidden = cartItems.FirstOrDefault(c => c.Project.Status != "Active");
            if (hidden != null)
                throw new ArgumentException(
                    $"Проект «{hidden.Project.Title}» снят с продажи — уберите его из корзины");

            var subtotal = cartItems.Sum(c => c.Project.Price);
            var discount = 0m;
            string? promoCodeApplied = null;

            if (!string.IsNullOrWhiteSpace(request.PromoCode))
            {
                var promoResult = await _promoService.ValidateAsync(request.PromoCode!, subtotal);
                if (!promoResult.IsValid)
                    throw new ArgumentException(promoResult.Error);

                var promo = await _orderRepository.GetPromoCodeAsync(promoResult.Code!);
                if (promo != null)
                    promo.UsedCount++;

                discount = promoResult.Discount;
                promoCodeApplied = promoResult.Code;
            }

            var totalAmount = Math.Max(subtotal - discount, 0m);

            var order = new Order
            {
                UserId = userId,
                UserName = userName,
                UserEmail = userEmail,
                OrderNumber = GenerateOrderNumber(),
                TotalAmount = totalAmount,
                Status = "Pending",
                PromoCode = promoCodeApplied,
                DiscountAmount = discount,
                CreatedAt = DateTime.UtcNow
            };

            await _orderRepository.CreateOrderAsync(order);
            await _orderRepository.SaveChangesAsync();

            foreach (var cartItem in cartItems)
            {
                var orderItem = new OrderItem
                {
                    OrderId = order.Id,
                    ProjectId = cartItem.Project.Id,
                    PriceAtTime = cartItem.Project.Price,
                    CreatedAt = DateTime.UtcNow
                };
                await _orderRepository.AddOrderItemAsync(orderItem);
            }
            
            await _orderRepository.SaveChangesAsync();

            await _cartRepository.RemoveRangeAsync(cartItems);
            await _cartRepository.SaveChangesAsync();

            _logger.LogInformation(
                "Создан заказ {OrderNumber} для пользователя {UserId}: {Total} ₽ (скидка {Discount} ₽, промо {Promo})",
                order.OrderNumber, userId, totalAmount, discount, promoCodeApplied ?? "—");

            return await MapToResponse(order);
        }

        public async Task<List<OrderResponse>> GetUserOrdersAsync(int userId, bool isAdmin)
        {
            List<Order> orders;

            if (isAdmin)
                orders = await _orderRepository.GetAllOrdersAsync();  
            else
                orders = await _orderRepository.GetUserOrdersAsync(userId);

            var result = new List<OrderResponse>();
            foreach (var order in orders)
            {
                result.Add(await MapToResponse(order));
            }
            return result;
        }
        public async Task<OrderResponse?> GetOrderByIdAsyncForAdmin(int orderId)
        {
            var order = await _orderRepository.GetOrderByIdAsync(orderId);
            if (order == null)
                return null;
            return await MapToResponse(order);
        }

        public async Task<OrderResponse?> GetOrderByIdAsync(int userId, int orderId, bool isAdmin)
        {
            var order = await _orderRepository.GetOrderByIdAsync(orderId);
            if (order == null)
                return null;

            if (!isAdmin && order.UserId != userId)
                return null;

            return await MapToResponse(order);
        }

        public async Task UpdateOrderAsync(Order order)
        {
            await _orderRepository.SaveChangesAsync();
        }

        public async Task<Order?> GetOrderEntityAsync(int orderId)
        {
            return await _orderRepository.GetOrderByIdAsync(orderId);
        }

        public async Task MarkOrderAsPaidAsync(int orderId)
        {
            var order = await _orderRepository.GetOrderByIdAsync(orderId);
            if (order == null)
                throw new ArgumentException("Заказ не найден");

            order.Status = "Delivered";
            order.PaidAt = DateTime.UtcNow;
            await _orderRepository.SaveChangesAsync();
        }

        private string GenerateOrderNumber()
        {
            return $"ORD-{DateTime.UtcNow:yyyyMMddHHmmss}-{Random.Shared.Next(1000, 9999)}";
        }

        private Task<OrderResponse> MapToResponse(Order order)
        {
            return Task.FromResult(new OrderResponse
            {
                Id = order.Id,
                OrderNumber = order.OrderNumber,
                TotalAmount = order.TotalAmount,
                Status = order.Status,
                CreatedAt = order.CreatedAt,
                PaymentId = order.PaymentId,
                UserName = order.UserName,
                UserEmail = order.UserEmail,
                PromoCode = order.PromoCode,
                DiscountAmount = order.DiscountAmount,
                Items = order.OrderItems.Select(oi => new OrderItemResponse
                {
                    ProjectId = oi.ProjectId,
                    Title = oi.Project?.Title ?? "Проект не найден",
                    Price = oi.PriceAtTime
                }).ToList()
            });
        }
    }
}
