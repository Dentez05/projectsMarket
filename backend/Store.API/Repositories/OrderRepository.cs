using Microsoft.EntityFrameworkCore;
using Store.API.Data;
using Store.API.Models.Entities;

namespace Store.API.Repositories
{
    public class OrderRepository : IOrderRepository
    {
        private readonly StoreDbContext _context;

        public OrderRepository(StoreDbContext context)
        {
            _context = context;
        }

        public async Task<Order> CreateOrderAsync(Order order)
        {
            await _context.Orders.AddAsync(order);
            return order;
        }

        public async Task<List<Order>> GetUserOrdersAsync(int userId)
        {
            return await _context.Orders
                .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.Project)
                .Where(o => o.UserId == userId)
                .OrderByDescending(o => o.CreatedAt)
                .ToListAsync();
        }

        public async Task<Order?> GetOrderByIdAsync(int id)
        {
            return await _context.Orders
                .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.Project)
                .FirstOrDefaultAsync(o => o.Id == id);
        }

        public Task Update(Order order)
        {
            _context.Orders.Update(order);
            return Task.CompletedTask;
        }

        public async Task<List<Order>> GetAllOrdersAsync()
        {
            return await _context.Orders
                .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.Project)
                .OrderByDescending(o => o.CreatedAt)
                .ToListAsync();
        }

        public async Task AddOrderItemAsync(OrderItem orderItem)
        {
            await _context.OrderItems.AddAsync(orderItem);
        }

        public async Task<PromoCode?> GetPromoCodeAsync(string code)
        {
            return await _context.PromoCodes
                .FirstOrDefaultAsync(p => p.Code == code);
        }

        public async Task<int> SaveChangesAsync()
        {
            return await _context.SaveChangesAsync();
        }

    }
}