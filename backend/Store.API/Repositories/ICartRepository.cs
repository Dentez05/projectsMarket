using Store.API.Models.Entities;

namespace Store.API.Repositories
{
    public interface ICartRepository
    {
        Task<List<CartItem>> GetUserCartAsync(int userId);
        Task<CartItem?> GetCartItemAsync(int userId, int projectId);
        Task<bool> IsProjectInCartAsync(int userId, int projectId);
        Task AddToCartAsync(CartItem cartItem);
        Task RemoveFromCartAsync(CartItem cartItem);
        Task RemoveRangeAsync(IEnumerable<CartItem> cartItems);
        Task<int> SaveChangesAsync();
    }
}
