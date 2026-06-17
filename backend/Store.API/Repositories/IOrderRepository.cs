using Store.API.Models.Entities;

namespace Store.API.Repositories
{
    public interface IOrderRepository
    {
        Task<Order> CreateOrderAsync(Order order);
        Task<List<Order>> GetUserOrdersAsync(int userId);
        Task<Order?> GetOrderByIdAsync(int id);
        Task Update(Order order);
        Task<List<Order>> GetAllOrdersAsync();
        Task AddOrderItemAsync(OrderItem orderItem);
        Task<int> SaveChangesAsync();
    }
}