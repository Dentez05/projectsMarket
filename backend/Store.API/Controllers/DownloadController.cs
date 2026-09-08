using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Store.API.Data;
using Store.API.Models.DTOs;

namespace Store.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class DownloadController : ControllerBase
    {
        private readonly StoreDbContext _context;
        private readonly IWebHostEnvironment _env;
        private readonly ILogger<DownloadController> _logger;

        public DownloadController(StoreDbContext context, IWebHostEnvironment env, ILogger<DownloadController> logger)
        {
            _context = context;
            _env = env;
            _logger = logger;
        }

        [HttpGet("orders/{orderId}")]
        public async Task<IActionResult> DownloadByOrder(int orderId)
        {
            var userId = GetUserId();
            var isAdmin = User.IsInRole("Admin");

            var order = await _context.Orders
                .Include(o => o.OrderItems)
                .FirstOrDefaultAsync(o => o.Id == orderId);

            if (order == null)
                return NotFound(new { message = "Заказ не найден" });

            if (!isAdmin && order.UserId != userId)
                return Forbid();

            if (order.Status != "Paid" && order.Status != "Delivered")
                return BadRequest(new { message = "Заказ ещё не оплачен" });

            var projectIds = order.OrderItems.Select(oi => oi.ProjectId).ToList();

            var files = await _context.ProjectFiles
                .Where(f => projectIds.Contains(f.ProjectId) && f.FileType == "source_code")
                .ToListAsync();

            if (!files.Any())
                return NotFound(new { message = "Файлы для скачивания не найдены" });

            if (files.Count == 1)
            {
                var file = files.First();
                var fullPath = Path.Combine(_env.WebRootPath, file.FilePath.TrimStart('/'));
                if (!System.IO.File.Exists(fullPath))
                    return NotFound(new { message = "Файл не найден на сервере" });

                var fileBytes = await System.IO.File.ReadAllBytesAsync(fullPath);
                var contentType = GetContentType(file.FilePath);
                var fileName = file.OriginalFileName ?? Path.GetFileName(file.FilePath);

                _logger.LogInformation("User {UserId} downloaded file {FileName} from order {OrderNumber}",
                    userId, fileName, order.OrderNumber);

                return File(fileBytes, contentType, fileName);
            }

            // Multiple files - return list for client to download individually
            var fileResponses = files.Select(f => new ProjectFileResponse
            {
                Id = f.Id,
                ProjectId = f.ProjectId,
                FileType = f.FileType,
                FilePath = f.FilePath,
                OriginalFileName = f.OriginalFileName,
                FileSize = f.FileSize,
                UploadedAt = f.UploadedAt
            }).ToList();

            return Ok(fileResponses);
        }

        [HttpGet("files/{fileId}")]
        public async Task<IActionResult> DownloadFile(int fileId)
        {
            var userId = GetUserId();
            var isAdmin = User.IsInRole("Admin");

            var file = await _context.ProjectFiles
                .Include(f => f.Project)
                .FirstOrDefaultAsync(f => f.Id == fileId);

            if (file == null)
                return NotFound();

            // Check if user has paid for this project
            var hasPaid = await _context.Orders
                .AnyAsync(o => o.UserId == userId &&
                              (o.Status == "Paid" || o.Status == "Delivered") &&
                              o.OrderItems.Any(oi => oi.ProjectId == file.ProjectId));

            if (!hasPaid && !isAdmin)
                return Forbid();

            var fullPath = Path.Combine(_env.WebRootPath, file.FilePath.TrimStart('/'));
            if (!System.IO.File.Exists(fullPath))
                return NotFound(new { message = "Файл не найден на сервере" });

            var fileBytes = await System.IO.File.ReadAllBytesAsync(fullPath);
            var contentType = GetContentType(file.FilePath);
            var fileName = file.OriginalFileName ?? Path.GetFileName(file.FilePath);

            return File(fileBytes, contentType, fileName);
        }

        [HttpPost("upload")]
        public async Task<IActionResult> UploadFile([FromForm] IFormFile file, [FromQuery] int projectId, [FromQuery] string fileType = "source_code")
        {
            var userId = GetUserId();
            var isAdmin = User.IsInRole("Admin");

            var project = await _context.Projects.FindAsync(projectId);
            if (project == null)
                return NotFound(new { message = "Проект не найден" });

            if (project.CreatedByUserId != userId && !isAdmin)
                return Forbid();

            if (file == null || file.Length == 0)
                return BadRequest(new { message = "Файл не выбран" });

            var uploadsDir = Path.Combine(_env.WebRootPath, "uploads", "projects", projectId.ToString());
            Directory.CreateDirectory(uploadsDir);

            var extension = Path.GetExtension(file.FileName);
            var fileName = $"{Guid.NewGuid()}{extension}";
            var filePath = Path.Combine(uploadsDir, fileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            var relativePath = $"/uploads/projects/{projectId}/{fileName}";

            var projectFile = new Models.Entities.ProjectFile
            {
                ProjectId = projectId,
                FileType = fileType,
                FilePath = relativePath,
                OriginalFileName = file.FileName,
                FileSize = file.Length,
                UploadedAt = DateTime.UtcNow
            };

            _context.ProjectFiles.Add(projectFile);
            await _context.SaveChangesAsync();

            return Ok(new ProjectFileResponse
            {
                Id = projectFile.Id,
                ProjectId = projectFile.ProjectId,
                FileType = projectFile.FileType,
                FilePath = projectFile.FilePath,
                OriginalFileName = projectFile.OriginalFileName,
                FileSize = projectFile.FileSize,
                UploadedAt = projectFile.UploadedAt
            });
        }

        [HttpGet("project/{projectId}")]
        public async Task<IActionResult> GetProjectFiles(int projectId)
        {
            var files = await _context.ProjectFiles
                .Where(f => f.ProjectId == projectId)
                .Select(f => new ProjectFileResponse
                {
                    Id = f.Id,
                    ProjectId = f.ProjectId,
                    FileType = f.FileType,
                    FilePath = f.FilePath,
                    OriginalFileName = f.OriginalFileName,
                    FileSize = f.FileSize,
                    UploadedAt = f.UploadedAt
                })
                .ToListAsync();

            return Ok(files);
        }

        private int GetUserId()
        {
            var userIdClaim = User.FindFirst("uid")?.Value;
            if (string.IsNullOrEmpty(userIdClaim))
                throw new UnauthorizedAccessException("User ID not found in token");
            return int.Parse(userIdClaim);
        }

        private static string GetContentType(string filePath)
        {
            var ext = Path.GetExtension(filePath).ToLowerInvariant();
            return ext switch
            {
                ".zip" => "application/zip",
                ".rar" => "application/x-rar-compressed",
                ".7z" => "application/x-7z-compressed",
                ".pdf" => "application/pdf",
                ".md" => "text/markdown",
                ".txt" => "text/plain",
                ".png" => "image/png",
                ".jpg" or ".jpeg" => "image/jpeg",
                ".gif" => "image/gif",
                ".svg" => "image/svg+xml",
                _ => "application/octet-stream"
            };
        }
    }
}