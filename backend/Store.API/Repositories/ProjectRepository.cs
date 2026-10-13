using Microsoft.EntityFrameworkCore;
using Store.API.Data;
using Store.API.Models.Entities;

namespace Store.API.Repositories
{
    public class ProjectRepository : IProjectRepository
    {
        private readonly StoreDbContext _context;

        public ProjectRepository(StoreDbContext context)
        {
            _context = context;
        }

        public async Task<Project?> GetByIdAsync(int id)
        {
            return await _context.Projects
                .FirstOrDefaultAsync(p => p.Id == id);
        }

        public async Task<Project?> GetByIdWithCategoryAsync(int id)
        {
            return await _context.Projects
                .Include(p => p.Category)
                .FirstOrDefaultAsync(p => p.Id == id);
        }

        public async Task<List<Project>> GetAllAsync()
        {
            return await _context.Projects
                .Include(p => p.Category)
                .ToListAsync();
        }

        public async Task<bool> ExistsAsync(int id)
        {
            return await _context.Projects
                .AnyAsync(p => p.Id == id);
        }

        public async Task<List<Project>> GetByUserIdAsync(int userId)
        {
            return await _context.Projects
                .Where(p => p.CreatedByUserId == userId)
                .ToListAsync();
        }

        public async Task<Dictionary<int, int>> GetSalesCountsAsync()
        {
            return await _context.OrderItems
                .GroupBy(oi => oi.ProjectId)
                .ToDictionaryAsync(g => g.Key, g => g.Count());
        }

        public async Task<int> GetSoldCountAsync(int projectId)
        {
            return await _context.OrderItems.CountAsync(oi => oi.ProjectId == projectId);
        }

        public async Task<Dictionary<int, (double Average, int Count)>> GetRatingSummariesAsync()
        {
            var grouped = await _context.Reviews
                .GroupBy(r => r.ProjectId)
                .Select(g => new
                {
                    ProjectId = g.Key,
                    Average = g.Average(r => r.Rating),
                    Count = g.Count()
                })
                .ToListAsync();

            return grouped.ToDictionary(
                g => g.ProjectId,
                g => (g.Average, g.Count));
        }

        public async Task AddAsync(Project project)
        {
            await _context.Projects.AddAsync(project);
        }

        public Task UpdateAsync(Project project)
        {
            _context.Projects.Update(project);
            return Task.CompletedTask;
        }

        public Task DeleteAsync(Project project)
        {
            _context.Projects.Remove(project);
            return Task.CompletedTask;
        }

        public async Task<int> SaveChangesAsync()
        {
            return await _context.SaveChangesAsync();
        }
    }
}