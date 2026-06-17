using Store.API.Models.DTOs;
using Store.API.Models.Entities;
using Store.API.Repositories;

namespace Store.API.Services
{
    public interface IOrderService
    {
        Task<OrderResponse> CreateOrderFromCartAsync(int userId, CreateOrderRequest request);
        Task<List<OrderResponse>> GetUserOrdersAsync(int userId, bool isAdmin);
        Task<OrderResponse?> GetOrderByIdAsyncForAdmin(int orderId);
        Task<OrderResponse?> GetOrderByIdAsync(int userId, int orderId, bool isAdmin);
        Task UpdateOrderAsync(Order order);
        Task MarkOrderAsPaidAsync(int orderId);
    }
}
