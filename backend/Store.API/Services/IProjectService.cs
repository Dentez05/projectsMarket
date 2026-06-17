using Store.API.Models.DTOs;

namespace Store.API.Services
{
    public interface IProjectService
    {
        Task<IEnumerable<ProjectResponse>> GetAllAsync();
        Task<ProjectResponse?> GetByIdAsync(int id);
        Task<ProjectResponse> CreateAsync(CreateProjectRequest request, int createdByUserId);
        Task<ProjectResponse?> UpdateAsync(int id, UpdateProjectRequest request, int userId, bool isAdmin);
        Task<bool> DeleteAsync(int id, int userId, bool isAdmin);
    }
}
