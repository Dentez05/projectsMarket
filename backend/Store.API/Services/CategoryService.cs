using Microsoft.EntityFrameworkCore;
using Store.API.Data;
using Store.API.Models.Entities;
using Store.API.Models.DTOs;

namespace Store.API.Services
{
    public class CategoryService : ICategoryService
    {
        private readonly StoreDbContext _context;
        private readonly ILogger<CategoryService> _logger;

        public CategoryService(StoreDbContext context, ILogger<CategoryService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<List<CategoryResponse>> GetAllAsync()
        {
            var categories = await _context.Categories.ToListAsync();
            return categories.Select(MapToResponse).ToList();
        }

        public async Task<CategoryResponse?> GetByIdAsync(int id)
        {
            var category = await _context.Categories.FindAsync(id);
            return category == null ? null : MapToResponse(category);
        }

        public async Task<CategoryResponse> CreateAsync(CreateCategoryRequest request)
        {
            var category = new Category
            {
                Name = request.Name,
                Description = request.Description ?? string.Empty
            };

            _context.Categories.Add(category);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Создана категория: {Name} (ID: {Id})", category.Name, category.Id);

            return MapToResponse(category);
        }

        public async Task<CategoryResponse?> UpdateAsync(int id, CreateCategoryRequest request)
        {
            var category = await _context.Categories.FindAsync(id);
            if (category == null)
                return null;

            category.Name = request.Name;
            category.Description = request.Description ?? string.Empty;

            await _context.SaveChangesAsync();

            _logger.LogInformation("Обновлена категория: {Name} (ID: {Id})", category.Name, category.Id);

            return MapToResponse(category);
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var category = await _context.Categories.FindAsync(id);
            if (category == null)
                return false;

            _context.Categories.Remove(category);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Удалена категория: {Name} (ID: {Id})", category.Name, category.Id);

            return true;
        }

        private CategoryResponse MapToResponse(Category category)
        {
            return new CategoryResponse
            {
                Id = category.Id,
                Name = category.Name,
                Description = category.Description
            };
        }
    }
}