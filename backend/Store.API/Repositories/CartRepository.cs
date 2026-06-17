using Microsoft.EntityFrameworkCore;
using Store.API.Data;
using Store.API.Models.Entities;

namespace Store.API.Repositories
{
    public class CartRepository : ICartRepository
    {
        private readonly StoreDbContext _context;

        public CartRepository(StoreDbContext context)
        {
            _context = context;
        }

        public async Task<List<CartItem>> GetUserCartAsync(int userId)
        {
            return await _context.CartItems
                .Include(c => c.Project)
                .Where(c => c.UserId == userId)
                .ToListAsync();
        }

        public async Task<CartItem?> GetCartItemAsync(int userId, int projectId)
        {
            return await _context.CartItems
                .FirstOrDefaultAsync(c => c.UserId == userId && c.ProjectId == projectId);
        }

        public async Task<bool> IsProjectInCartAsync(int userId, int projectId)
        {
            return await _context.CartItems
                .AnyAsync(c => c.UserId == userId && c.ProjectId == projectId);
        }

        public async Task AddToCartAsync(CartItem cartItem)
        {
            await _context.CartItems.AddAsync(cartItem);
        }

        public Task RemoveFromCartAsync(CartItem cartItem)
        {
            _context.CartItems.Remove(cartItem);
            return Task.CompletedTask;
        }

        public Task RemoveRangeAsync(IEnumerable<CartItem> cartItems)
        {
            _context.CartItems.RemoveRange(cartItems);
            return Task.CompletedTask;
        }

        public async Task<int> SaveChangesAsync()
        {
            return await _context.SaveChangesAsync();
        }

    }
}
