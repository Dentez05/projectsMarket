using Store.API.Models.DTOs;

namespace Store.API.Services
{
    public interface ICategoryService
    {
        Task<List<CategoryResponse>> GetAllAsync();
        Task<CategoryResponse?> GetByIdAsync(int id);
        Task<CategoryResponse> CreateAsync(CreateCategoryRequest request);
        Task<CategoryResponse?> UpdateAsync(int id, CreateCategoryRequest request);
        Task<bool> DeleteAsync(int id);
    }
}