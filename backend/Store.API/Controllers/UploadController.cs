using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Store.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UploadController : ControllerBase
    {
        private readonly IWebHostEnvironment _env;
        private readonly ILogger<UploadController> _logger;

        public UploadController(IWebHostEnvironment env, ILogger<UploadController> logger)
        {
            _env = env;
            _logger = logger;
        }

        [Authorize]
        [HttpPost("image")]
        public async Task<IActionResult> UploadImage(IFormFile file, [FromQuery] int? projectId)
        {
            if (file == null || file.Length == 0)
                return BadRequest("Файл не передан");

            var allowedTypes = new[] { ".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg" };
            var ext = Path.GetExtension(file.FileName).ToLowerInvariant();

            if (string.IsNullOrEmpty(ext))
            {
                ext = file.ContentType switch
                {
                    "image/jpeg" => ".jpg",
                    "image/gif" => ".gif",
                    "image/webp" => ".webp",
                    "image/svg+xml" => ".svg",
                    _ => ".png",
                };
            }

            if (!allowedTypes.Contains(ext))
                return BadRequest("Допустимые форматы: jpg, jpeg, png, gif, webp, svg");

            var maxSize = 10 * 1024 * 1024; // 10MB
            if (file.Length > maxSize)
                return BadRequest("Максимальный размер изображения: 10MB");

            var uploadsDir = projectId.HasValue
                ? Path.Combine(_env.WebRootPath, "uploads", "projects", projectId.Value.ToString(), "images")
                : Path.Combine(_env.WebRootPath, "uploads", "misc");

            Directory.CreateDirectory(uploadsDir);

            var fileName = $"{Guid.NewGuid()}{ext}";
            var filePath = Path.Combine(uploadsDir, fileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            var relativePath = projectId.HasValue
                ? $"/uploads/projects/{projectId}/images/{fileName}"
                : $"/uploads/misc/{fileName}";

            _logger.LogInformation("Загружено изображение: {Path}", relativePath);

            return Ok(new { url = relativePath });
        }
    }
}