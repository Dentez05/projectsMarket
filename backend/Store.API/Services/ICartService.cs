using Store.API.Models.DTOs;

namespace Store.API.Services
{
    public interface ICartService
    {
        Task<CartResponse> GetCartAsync(int userId);
        Task AddToCartAsync(int userId, int projectId);
        Task RemoveFromCartAsync(int userId, int projectId);
        Task ClearCartAsync(int userId);
    }
}
