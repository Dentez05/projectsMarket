using Store.API.Models.Entities;
using Store.API.Models.DTOs;
using Store.API.Repositories;

namespace Store.API.Services
{
    public class CartService : ICartService
    {
        private readonly ICartRepository _cartRepository;
        private readonly IProjectRepository _projectRepository;
        private readonly ILogger<CartService> _logger;

        public CartService(
            ICartRepository cartRepository, 
            IProjectRepository projectRepository,
            ILogger<CartService> logger)
        {
            _cartRepository = cartRepository;
            _projectRepository = projectRepository;
            _logger = logger;
        }

        public async Task<CartResponse> GetCartAsync(int userId)
        {
            var cartItems = await _cartRepository.GetUserCartAsync(userId);

            var response = new CartResponse();
            response.Items = cartItems.Select(c => new CartItemResponse
            {
                Id = c.Id,
                ProjectId = c.ProjectId,
                Title = c.Project.Title,
                Price = c.Project.Price,
                AddedAt = c.AddedAt
            }).ToList();

            return response;
        }

        public async Task AddToCartAsync(int userId, int projectId)
        {
            var exists = await _cartRepository.IsProjectInCartAsync(userId, projectId);
            if (exists)
            {
                _logger.LogWarning("Проект {ProjectId} уже в корзине пользователя {UserId}", projectId, userId);
                return;
            }

            var projectExists = await _projectRepository.ExistsAsync(projectId);
            if (!projectExists)
                throw new ArgumentException("Проект не найден");

            var cartItem = new CartItem
            {
                UserId = userId,
                ProjectId = projectId,
                AddedAt = DateTime.UtcNow
            };

            await _cartRepository.AddToCartAsync(cartItem);
            await _cartRepository.SaveChangesAsync();

            _logger.LogInformation("Проект {ProjectId} добавлен в корзину пользователя {UserId}", projectId, userId);
        }

        public async Task RemoveFromCartAsync(int userId, int projectId)
        {
            var cartItem = await _cartRepository.GetCartItemAsync(userId, projectId);
            if (cartItem == null)
            {
                _logger.LogWarning("Проект {ProjectId} не найден в корзине пользователя {UserId}", projectId, userId);
                return;
            }

            await _cartRepository.RemoveFromCartAsync(cartItem);
            await _cartRepository.SaveChangesAsync();

            _logger.LogInformation("Проект {ProjectId} удалён из корзины пользователя {UserId}", projectId, userId);
        }

        public async Task ClearCartAsync(int userId)
        {
            var cartItems = await _cartRepository.GetUserCartAsync(userId);
            if (!cartItems.Any())
            {
                _logger.LogWarning("Корзина пользователя {UserId} уже пуста", userId);
                return;
            }

            await _cartRepository.RemoveRangeAsync(cartItems);
            await _cartRepository.SaveChangesAsync();

            _logger.LogInformation("Корзина пользователя {UserId} очищена", userId);
        }
    }

}
