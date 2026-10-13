using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Store.API.Data;
using Store.API.Models.DTOs;
using Store.API.Models.Entities;

namespace Store.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class FavoritesController : ControllerBase
    {
        private readonly StoreDbContext _context;
        private readonly ILogger<FavoritesController> _logger;

        public FavoritesController(StoreDbContext context, ILogger<FavoritesController> logger)
        {
            _context = context;
            _logger = logger;
        }

        [HttpGet]
        public async Task<IActionResult> GetMy()
        {
            var userId = GetUserId();
            var favorites = await _context.Favorites
                .Where(f => f.UserId == userId)
                .OrderByDescending(f => f.CreatedAt)
                .Select(f => f.ProjectId)
                .ToListAsync();

            return Ok(favorites);
        }

        [HttpPost("{projectId:int}")]
        public async Task<IActionResult> Toggle(int projectId)
        {
            var userId = GetUserId();

            var project = await _context.Projects.FindAsync(projectId);
            if (project == null) return NotFound();
            if (project.Status != "Active")
                throw new ArgumentException("Проект снят с продажи и не может быть в избранном");

            var existing = await _context.Favorites
                .FirstOrDefaultAsync(f => f.UserId == userId && f.ProjectId == projectId);

            bool added;
            if (existing != null)
            {
                _context.Favorites.Remove(existing);
                added = false;
            }
            else
            {
                _context.Favorites.Add(new Favorite
                {
                    UserId = userId,
                    ProjectId = projectId,
                    CreatedAt = DateTime.UtcNow
                });
                added = true;
            }

            await _context.SaveChangesAsync();

            _logger.LogInformation("Избранное: пользователь {UserId} {Action} проект {ProjectId}",
                userId, added ? "добавил" : "убрал", projectId);

            return Ok(new { favorited = added });
        }

        private int GetUserId()
        {
            var userIdClaim = User.FindFirst("uid")?.Value;
            if (string.IsNullOrEmpty(userIdClaim))
                throw new UnauthorizedAccessException("User ID not found in token");
            return int.Parse(userIdClaim);
        }
    }
}
