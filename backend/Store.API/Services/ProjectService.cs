using Store.API.Models.DTOs;
using Store.API.Models.Entities;
using Store.API.Repositories;

namespace Store.API.Services
{
    public class ProjectService : IProjectService
    {
        private readonly IProjectRepository _projectRepository;
        private readonly ILogger<ProjectService> _logger;

        public ProjectService(IProjectRepository projectRepository, ILogger<ProjectService> logger)
        {
            _projectRepository = projectRepository;
            _logger = logger;
        }

        public async Task<IEnumerable<ProjectResponse>> GetAllAsync()
        {
            var projects = await _projectRepository.GetAllAsync();
            return projects.Select(p => MapToResponse(p));
        }

        public async Task<ProjectResponse?> GetByIdAsync(int id)
        {
            var project = await _projectRepository.GetByIdWithCategoryAsync(id);
            return project == null ? null : MapToResponse(project);
        }

        public async Task<ProjectResponse> CreateAsync(CreateProjectRequest request, int createdByUserId)
        {
            if (request.Price < 0)
                throw new ArgumentException("Цена не может быть отрицательной");

            var project = new Project
            {
                Title = request.Title,
                Description = request.Description,
                Price = request.Price,
                CreatedByUserId = createdByUserId,
                CategoryId = request.CategoryId,
                Status = "Draft",
                CreatedAt = DateTime.UtcNow
            };

            await _projectRepository.AddAsync(project);
            await _projectRepository.SaveChangesAsync();

            _logger.LogInformation("Создан новый проект: {Title} (ID: {Id})", project.Title, project.Id);

            return MapToResponse(project);
        }

        public async Task<ProjectResponse?> UpdateAsync(int id, UpdateProjectRequest request, int userId, bool isAdmin)
        {
            var project = await _projectRepository.GetByIdAsync(id);
            if (project == null)
                return null;

            if (project.CreatedByUserId != userId && !isAdmin)
                throw new UnauthorizedAccessException("Вы можете редактировать только свои проекты");

            if (!string.IsNullOrWhiteSpace(request.Title))
                project.Title = request.Title;

            if (!string.IsNullOrWhiteSpace(request.Description))
                project.Description = request.Description;

            if (request.Price.HasValue)
                project.Price = request.Price.Value;

            if (request.CategoryId.HasValue)
                project.CategoryId = request.CategoryId;

            if (!string.IsNullOrWhiteSpace(request.Status))
                project.Status = request.Status;

            project.UpdatedAt = DateTime.UtcNow;

            await _projectRepository.UpdateAsync(project);
            await _projectRepository.SaveChangesAsync();

            _logger.LogInformation("Обновлён проект: {Title} (ID: {Id})", project.Title, project.Id);

            return MapToResponse(project);
        }

        public async Task<bool> DeleteAsync(int id, int userId, bool isAdmin)
        {
            var project = await _projectRepository.GetByIdAsync(id);
            if (project == null)
                return false;

            if (project.CreatedByUserId != userId && !isAdmin)
                throw new UnauthorizedAccessException("Вы можете удалять только свои проекты");

            await _projectRepository.DeleteAsync(project);
            await _projectRepository.SaveChangesAsync();

            _logger.LogInformation("Удалён проект: {Title} (ID: {Id})", project.Title, project.Id);

            return true;
        }

        private ProjectResponse MapToResponse(Project project)
        {
            return new ProjectResponse
            {
                Id = project.Id,
                Title = project.Title,
                Description = project.Description,
                Price = project.Price,
                CreatedByUserId = project.CreatedByUserId,
                Status = project.Status,
                CreatedAt = project.CreatedAt,
                UpdatedAt = project.UpdatedAt,
                CategoryId = project.CategoryId,
                CategoryName = project.Category?.Name ?? string.Empty
            };
        }
    }
}