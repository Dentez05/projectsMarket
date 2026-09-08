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
        [HttpPost]
        public async Task<IActionResult> Upload(List<IFormFile> files, [FromQuery] int? projectId)
        {
            if (files == null || files.Count == 0)
                return BadRequest("Файлы не переданы");

            var uploadsDir = projectId.HasValue
                ? Path.Combine(_env.WebRootPath, "uploads", "projects", projectId.Value.ToString())
                : Path.Combine(_env.WebRootPath, "uploads", "misc");

            Directory.CreateDirectory(uploadsDir);

            var urls = new List<string>();

            foreach (var file in files)
            {
                if (file.Length == 0) continue;

                var ext = Path.GetExtension(file.FileName);
                var fileName = $"{Guid.NewGuid()}{ext}";
                var filePath = Path.Combine(uploadsDir, fileName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                var relativePath = projectId.HasValue
                    ? $"/uploads/projects/{projectId}/{fileName}"
                    : $"/uploads/misc/{fileName}";

                urls.Add(relativePath);

                _logger.LogInformation("Загружен файл: {Path} ({Size} bytes)", relativePath, file.Length);
            }

            return Ok(new { urls });
        }

        [Authorize]
        [HttpPost("image")]
        public async Task<IActionResult> UploadImage(IFormFile file, [FromQuery] int? projectId)
        {
            if (file == null || file.Length == 0)
                return BadRequest("Файл не передан");

            var allowedTypes = new[] { ".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg" };
            var ext = Path.GetExtension(file.FileName).ToLowerInvariant();

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