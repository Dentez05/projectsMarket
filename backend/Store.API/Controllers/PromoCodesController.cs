using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Store.API.Data;
using Store.API.Models.DTOs;
using Store.API.Models.Entities;
using Store.API.Services;

namespace Store.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PromoCodesController : ControllerBase
    {
        private readonly StoreDbContext _context;
        private readonly IPromoCodeService _promoService;
        private readonly ILogger<PromoCodesController> _logger;

        public PromoCodesController(StoreDbContext context, IPromoCodeService promoService, ILogger<PromoCodesController> logger)
        {
            _context = context;
            _promoService = promoService;
            _logger = logger;
        }

        [AllowAnonymous]
        [HttpPost("validate")]
        public async Task<IActionResult> Validate([FromBody] ValidatePromoRequest request)
        {
            var result = await _promoService.ValidateAsync(request.Code, request.Subtotal);
            return Ok(result);
        }

        [Authorize(Roles = "Admin")]
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var codes = await _context.PromoCodes
                .OrderByDescending(p => p.CreatedAt)
                .Select(p => new PromoCodeResponse
                {
                    Id = p.Id,
                    Code = p.Code,
                    Type = p.Type,
                    Value = p.Value,
                    MinOrderAmount = p.MinOrderAmount,
                    MaxUses = p.MaxUses,
                    UsedCount = p.UsedCount,
                    ExpiresAt = p.ExpiresAt,
                    IsActive = p.IsActive,
                    CreatedAt = p.CreatedAt
                })
                .ToListAsync();

            return Ok(codes);
        }

        [Authorize(Roles = "Admin")]
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreatePromoCodeRequest request)
        {
            var code = request.Code.Trim().ToUpperInvariant();
            if (await _context.PromoCodes.AnyAsync(p => p.Code == code))
                throw new ArgumentException($"Промокод «{code}» уже существует");

            if (request.Value <= 0)
                throw new ArgumentException("Значение скидки должно быть больше нуля");
            if (request.Type == "Percent" && request.Value > 100)
                throw new ArgumentException("Процентная скидка не может превышать 100%");

            var promo = new PromoCode
            {
                Code = code,
                Type = request.Type,
                Value = request.Value,
                MinOrderAmount = request.MinOrderAmount,
                MaxUses = request.MaxUses,
                ExpiresAt = request.ExpiresAt,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            _context.PromoCodes.Add(promo);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Создан промокод {Code} ({Type} {Value})", promo.Code, promo.Type, promo.Value);

            return Ok(MapToResponse(promo));
        }

        [Authorize(Roles = "Admin")]
        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdatePromoCodeRequest request)
        {
            var promo = await _context.PromoCodes.FindAsync(id);
            if (promo == null) return NotFound();

            if (request.Value.HasValue)
            {
                if (request.Value.Value <= 0)
                    throw new ArgumentException("Значение скидки должно быть больше нуля");
                if (promo.Type == "Percent" && request.Value.Value > 100)
                    throw new ArgumentException("Процентная скидка не может превышать 100%");
                promo.Value = request.Value.Value;
            }

            if (request.MinOrderAmount.HasValue)
                promo.MinOrderAmount = request.MinOrderAmount;
            if (request.MaxUses.HasValue)
                promo.MaxUses = request.MaxUses;
            if (request.ExpiresAt.HasValue)
                promo.ExpiresAt = request.ExpiresAt;
            if (request.IsActive.HasValue)
                promo.IsActive = request.IsActive.Value;

            await _context.SaveChangesAsync();
            return Ok(MapToResponse(promo));
        }

        [Authorize(Roles = "Admin")]
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var promo = await _context.PromoCodes.FindAsync(id);
            if (promo == null) return NotFound();

            _context.PromoCodes.Remove(promo);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Промокод {Code} удалён", promo.Code);
            return NoContent();
        }

        private static PromoCodeResponse MapToResponse(PromoCode p)
        {
            return new PromoCodeResponse
            {
                Id = p.Id,
                Code = p.Code,
                Type = p.Type,
                Value = p.Value,
                MinOrderAmount = p.MinOrderAmount,
                MaxUses = p.MaxUses,
                UsedCount = p.UsedCount,
                ExpiresAt = p.ExpiresAt,
                IsActive = p.IsActive,
                CreatedAt = p.CreatedAt
            };
        }
    }
}
