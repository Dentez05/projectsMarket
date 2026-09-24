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
        private readonly ILogger<OrderService> _logger;

        public OrderService (
            IOrderRepository orderRepository, 
            ICartRepository cartRepository, 
            IProjectRepository projectRepository,
            ILogger<OrderService> logger)
        {
            _orderRepository = orderRepository;
            _cartRepository = cartRepository;
            _projectRepository = projectRepository;
            _logger = logger;
        }

        public async Task<OrderResponse> CreateOrderFromCartAsync(int userId, CreateOrderRequest request)
        {
            var cartItems = await _cartRepository.GetUserCartAsync(userId);
            if (!cartItems.Any())
                throw new InvalidOperationException("Корзина пуста");

            var totalAmount = cartItems.Sum(c => c.Project.Price);

            var order = new Order
            {
                UserId = userId,
                OrderNumber = GenerateOrderNumber(),
                TotalAmount = totalAmount,
                Status = "Pending",
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

            _logger.LogInformation("Создан заказ {OrderNumber} для пользователя {UserId} на сумму {TotalAmount}",
                order.OrderNumber, userId, totalAmount);

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
