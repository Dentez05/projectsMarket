using Store.API.Models.Entities;

namespace Store.API.Repositories
{
    public interface IProjectRepository
    {
        Task<Project?> GetByIdAsync(int id);
        Task<List<Project>> GetAllAsync();
        Task<bool> ExistsAsync(int id);

        Task<Project?> GetByIdWithCategoryAsync(int id);
        Task<List<Project>> GetByUserIdAsync(int userId);
        Task<Dictionary<int, int>> GetSalesCountsAsync();

        Task AddAsync(Project project);
        Task UpdateAsync(Project project);
        Task DeleteAsync(Project project);
        Task<int> SaveChangesAsync();
    }
}