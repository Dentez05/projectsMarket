using System.Text.Json;
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

        private static readonly HashSet<string> AllowedStatuses = new() { "Active", "Hidden" };

        public async Task<IEnumerable<ProjectResponse>> GetAllAsync()
        {
            var projects = await _projectRepository.GetAllAsync();
            var sales = await _projectRepository.GetSalesCountsAsync();
            return projects.Select(p =>
            {
                var response = MapToResponse(p);
                response.SoldCount = sales.GetValueOrDefault(p.Id);
                return response;
            });
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
                FullDescription = request.FullDescription,
                Price = request.Price,
                CreatedByUserId = createdByUserId,
                CategoryId = request.CategoryId,
                Status = "Active",
                Images = JsonSerializer.Serialize(request.Images),
                Technologies = JsonSerializer.Serialize(request.Technologies),
                PreviewImages = JsonSerializer.Serialize(request.PreviewImages),
                Demo = request.Demo,
                IsNew = request.IsNew,
                Popular = request.Popular,
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

            if (request.Description != null)
                project.Description = request.Description;

            if (request.FullDescription != null)
                project.FullDescription = request.FullDescription;

            if (request.Price.HasValue)
                project.Price = request.Price.Value;

            if (request.CategoryId.HasValue)
                project.CategoryId = request.CategoryId;

            if (!string.IsNullOrWhiteSpace(request.Status))
            {
                if (!AllowedStatuses.Contains(request.Status))
                    throw new ArgumentException($"Недопустимый статус: {request.Status}. Допустимые: Active, Hidden");
                project.Status = request.Status;
            }

            if (request.Images != null)
                project.Images = JsonSerializer.Serialize(request.Images);

            if (request.Technologies != null)
                project.Technologies = JsonSerializer.Serialize(request.Technologies);

            if (request.PreviewImages != null)
                project.PreviewImages = JsonSerializer.Serialize(request.PreviewImages);

            if (request.Demo != null)
                project.Demo = request.Demo;

            if (request.IsNew.HasValue)
                project.IsNew = request.IsNew.Value;

            if (request.Popular.HasValue)
                project.Popular = request.Popular.Value;

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

            var sales = await _projectRepository.GetSalesCountsAsync();
            var soldCount = sales.GetValueOrDefault(id);
            if (soldCount > 0)
                throw new ArgumentException(
                    $"Нельзя удалить проект «{project.Title}» — его уже купили {soldCount} раз. Снимите его с продажи (Скрыть), чтобы он больше не покупался");

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
                FullDescription = project.FullDescription,
                Price = project.Price,
                CreatedByUserId = project.CreatedByUserId,
                Status = project.Status,
                CreatedAt = project.CreatedAt,
                UpdatedAt = project.UpdatedAt,
                CategoryId = project.CategoryId,
                CategoryName = project.Category?.Name ?? string.Empty,
                Images = SafeDeserializeList(project.Images),
                Technologies = SafeDeserializeList(project.Technologies),
                Demo = project.Demo,
                IsNew = project.IsNew,
                Popular = project.Popular,
                PreviewImages = SafeDeserializeList(project.PreviewImages)
            };
        }

        private static List<string> SafeDeserializeList(string? json)
        {
            if (string.IsNullOrWhiteSpace(json) || json == "{}" || json == "null")
                return new();
            try
            {
                return JsonSerializer.Deserialize<List<string>>(json) ?? new();
            }
            catch
            {
                return new();
            }
        }
    }
}
