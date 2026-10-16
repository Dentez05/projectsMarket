using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Store.API.Data;

namespace Store.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    public class StatsController : ControllerBase
    {
        private readonly StoreDbContext _context;

        public StatsController(StoreDbContext context)
        {
            _context = context;
        }

        [HttpGet("summary")]
        public async Task<IActionResult> GetSummary()
        {
            var delivered = _context.Orders.Where(o => o.Status == "Delivered");

            var totalOrders = await delivered.CountAsync();
            var totalRevenue = await delivered.SumAsync(o => (decimal?)o.TotalAmount) ?? 0m;
            // в store-БД нет таблицы users — считаем уникальных покупателей по заказам
            var totalBuyers = await delivered.Select(o => o.UserId).Distinct().CountAsync();
            var totalProjects = await _context.Projects.CountAsync();
            var pendingOrders = await _context.Orders.CountAsync(o => o.Status == "Pending");
            var openTickets = await _context.SupportTickets.CountAsync(t => t.Status != "Closed");
            var avgRating = await _context.Reviews.AverageAsync(r => (double?)r.Rating) ?? 0;
            var reviewCount = await _context.Reviews.CountAsync();

            return Ok(new
            {
                totalOrders,
                totalRevenue,
                totalBuyers,
                totalProjects,
                pendingOrders,
                openTickets,
                avgRating = Math.Round(avgRating, 2),
                reviewCount
            });
        }

        [HttpGet("sales")]
        public async Task<IActionResult> GetSales([FromQuery] int days = 30)
        {
            if (days < 1 || days > 365) days = 30;
            var from = DateTime.UtcNow.Date.AddDays(-(days - 1));

            var orders = await _context.Orders
                .Where(o => o.Status == "Delivered" && o.CreatedAt >= from)
                .Select(o => new { o.CreatedAt, o.TotalAmount })
                .ToListAsync();

            var byDay = orders
                .GroupBy(o => o.CreatedAt.Date)
                .ToDictionary(g => g.Key, g => new
                {
                    orders = g.Count(),
                    revenue = g.Sum(x => x.TotalAmount)
                });

            var series = Enumerable.Range(0, days)
                .Select(i =>
                {
                    var day = from.AddDays(i);
                    byDay.TryGetValue(day, out var v);
                    return new
                    {
                        date = day.ToString("yyyy-MM-dd"),
                        orders = v?.orders ?? 0,
                        revenue = v?.revenue ?? 0m
                    };
                })
                .ToList();

            return Ok(new { days, series });
        }

        [HttpGet("top-projects")]
        public async Task<IActionResult> GetTopProjects([FromQuery] int limit = 10)
        {
            if (limit < 1 || limit > 50) limit = 10;

            var top = await _context.OrderItems
                .Where(i => i.Order!.Status == "Delivered")
                .GroupBy(i => new { i.ProjectId, i.Project!.Title })
                .Select(g => new
                {
                    projectId = g.Key.ProjectId,
                    title = g.Key.Title,
                    sold = g.Count(),
                    revenue = g.Sum(i => i.PriceAtTime)
                })
                .OrderByDescending(x => x.revenue)
                .ThenByDescending(x => x.sold)
                .Take(limit)
                .ToListAsync();

            return Ok(top);
        }
    }
}
