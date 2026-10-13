using System.ComponentModel.DataAnnotations;
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
    public class ReviewsController : ControllerBase
    {
        private readonly StoreDbContext _context;
        private readonly ILogger<ReviewsController> _logger;

        public ReviewsController(StoreDbContext context, ILogger<ReviewsController> logger)
        {
            _context = context;
            _logger = logger;
        }

        [AllowAnonymous]
        [HttpGet("project/{projectId:int}")]
        public async Task<IActionResult> GetByProject(int projectId)
        {
            var reviews = await _context.Reviews
                .Where(r => r.ProjectId == projectId)
                .OrderByDescending(r => r.CreatedAt)
                .Select(r => new ReviewResponse
                {
                    Id = r.Id,
                    ProjectId = r.ProjectId,
                    UserId = r.UserId,
                    UserName = r.UserName,
                    Rating = r.Rating,
                    Comment = r.Comment,
                    CreatedAt = r.CreatedAt
                })
                .ToListAsync();

            return Ok(reviews);
        }

        [HttpPost("project/{projectId:int}")]
        public async Task<IActionResult> Create(int projectId, [FromBody] CreateReviewRequest request)
        {
            var userId = GetUserId();
            var userName = User.FindFirst("name")?.Value ?? "";

            var project = await _context.Projects.FindAsync(projectId);
            if (project == null) return NotFound();

            var hasPurchased = await HasPurchasedAsync(userId, projectId);
            if (!hasPurchased)
                throw new UnauthorizedAccessException(
                    "Оставить отзыв можно только после покупки проекта");

            var existing = await _context.Reviews
                .FirstOrDefaultAsync(r => r.ProjectId == projectId && r.UserId == userId);
            if (existing != null)
                throw new InvalidOperationException("Вы уже оставляли отзыв на этот проект — отредактируйте его");

            var review = new Review
            {
                ProjectId = projectId,
                UserId = userId,
                UserName = userName,
                Rating = request.Rating,
                Comment = (request.Comment ?? "").Trim(),
                CreatedAt = DateTime.UtcNow
            };

            _context.Reviews.Add(review);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Отзыв #{ReviewId} на проект {ProjectId} от пользователя {UserId}",
                review.Id, projectId, userId);

            return Ok(new ReviewResponse
            {
                Id = review.Id,
                ProjectId = review.ProjectId,
                UserId = review.UserId,
                UserName = review.UserName,
                Rating = review.Rating,
                Comment = review.Comment,
                CreatedAt = review.CreatedAt
            });
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, [FromBody] CreateReviewRequest request)
        {
            var userId = GetUserId();
            var review = await _context.Reviews.FindAsync(id);
            if (review == null) return NotFound();
            if (review.UserId != userId) return Forbid();

            review.Rating = request.Rating;
            review.Comment = (request.Comment ?? "").Trim();
            review.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return Ok(new { ok = true });
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var userId = GetUserId();
            var isAdmin = User.IsInRole("Admin");
            var review = await _context.Reviews.FindAsync(id);
            if (review == null) return NotFound();
            if (review.UserId != userId && !isAdmin) return Forbid();

            _context.Reviews.Remove(review);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Отзыв #{ReviewId} удалён (пользователь {UserId})", id, userId);
            return NoContent();
        }

        private async Task<bool> HasPurchasedAsync(int userId, int projectId)
        {
            return await _context.Orders
                .AnyAsync(o => o.UserId == userId
                    && o.Status == "Delivered"
                    && o.OrderItems.Any(oi => oi.ProjectId == projectId));
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
