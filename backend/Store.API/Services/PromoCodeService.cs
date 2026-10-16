using Microsoft.EntityFrameworkCore;
using Store.API.Data;

namespace Store.API.Services
{
    public class PromoCodeService : IPromoCodeService
    {
        private readonly StoreDbContext _context;

        public PromoCodeService(StoreDbContext context)
        {
            _context = context;
        }

        public async Task<PromoValidationResult> ValidateAsync(string code, decimal subtotal)
        {
            var normalized = (code ?? "").Trim();
            if (normalized.Length == 0)
                return new PromoValidationResult { IsValid = false, Error = "Введите промокод" };

            var promo = await _context.PromoCodes
                .FirstOrDefaultAsync(p => p.Code == normalized);

            if (promo == null || !promo.IsActive)
                return Fail("Промокод не найден или отключён");
            if (promo.ExpiresAt != null && promo.ExpiresAt <= DateTime.UtcNow)
                return Fail("Срок действия промокода истёк");
            if (promo.MaxUses != null && promo.UsedCount >= promo.MaxUses)
                return Fail("Промокод больше не действует (лимит использован)");
            if (promo.MinOrderAmount != null && subtotal < promo.MinOrderAmount)
                return Fail($"Минимальная сумма для этого промокода — {promo.MinOrderAmount.Value:F0} ₽");

            var discount = promo.Type == "Percent"
                ? Math.Round(subtotal * promo.Value / 100m, 2)
                : Math.Min(promo.Value, subtotal);

            return new PromoValidationResult
            {
                IsValid = true,
                Code = promo.Code,
                Type = promo.Type,
                Value = promo.Value,
                Discount = discount,
                Total = Math.Max(subtotal - discount, 0m)
            };

            PromoValidationResult Fail(string error) => new() { IsValid = false, Error = error };
        }
    }
}
