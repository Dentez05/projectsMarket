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
    public class SupportController : ControllerBase
    {
        private readonly StoreDbContext _context;
        private readonly ILogger<SupportController> _logger;

        public SupportController(StoreDbContext context, ILogger<SupportController> logger)
        {
            _context = context;
            _logger = logger;
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateSupportTicketRequest request)
        {
            var userId = GetUserId();
            var userName = User.FindFirst("name")?.Value ?? "";
            var userEmail = User.FindFirst(System.Security.Claims.ClaimTypes.Email)?.Value
                         ?? User.FindFirst("email")?.Value ?? "";

            var ticket = new SupportTicket
            {
                UserId = userId,
                UserName = userName,
                UserEmail = userEmail,
                Subject = request.Subject.Trim(),
                Message = request.Message.Trim(),
                Status = "Open",
                CreatedAt = DateTime.UtcNow
            };

            _context.SupportTickets.Add(ticket);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Создано обращение в поддержку #{TicketId} от пользователя {UserId}", ticket.Id, userId);

            return CreatedAtAction(nameof(GetMyTickets), new { id = ticket.Id }, MapToResponse(ticket));
        }

        [HttpGet("my")]
        public async Task<IActionResult> GetMyTickets()
        {
            var userId = GetUserId();
            var tickets = await _context.SupportTickets
                .Where(t => t.UserId == userId)
                .OrderByDescending(t => t.CreatedAt)
                .ToListAsync();

            return Ok(tickets.Select(MapToResponse).ToList());
        }

        [Authorize(Roles = "Admin")]
        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] string? status)
        {
            var query = _context.SupportTickets.AsQueryable();
            if (!string.IsNullOrEmpty(status))
                query = query.Where(t => t.Status == status);

            var tickets = await query.OrderByDescending(t => t.CreatedAt).ToListAsync();
            return Ok(tickets.Select(MapToResponse).ToList());
        }

        [Authorize(Roles = "Admin")]
        [HttpPatch("{id}/reply")]
        public async Task<IActionResult> Reply(int id, [FromBody] ReplySupportTicketRequest request)
        {
            var ticket = await _context.SupportTickets.FindAsync(id);
            if (ticket == null) return NotFound();

            ticket.AdminReply = request.Reply.Trim();
            ticket.Status = "Answered";
            ticket.RepliedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            _logger.LogInformation("Ответ на обращение #{TicketId}", id);
            return Ok(MapToResponse(ticket));
        }

        [HttpPatch("{id}/close")]
        public async Task<IActionResult> Close(int id)
        {
            var userId = GetUserId();
            var isAdmin = User.IsInRole("Admin");

            var ticket = await _context.SupportTickets.FindAsync(id);
            if (ticket == null) return NotFound();
            if (!isAdmin && ticket.UserId != userId) return Forbid();

            ticket.Status = "Closed";
            await _context.SaveChangesAsync();

            return Ok(MapToResponse(ticket));
        }

        private int GetUserId()
        {
            var userIdClaim = User.FindFirst("uid")?.Value;
            if (string.IsNullOrEmpty(userIdClaim))
                throw new UnauthorizedAccessException("User ID not found in token");
            return int.Parse(userIdClaim);
        }

        private static SupportTicketResponse MapToResponse(SupportTicket t) => new()
        {
            Id = t.Id,
            UserId = t.UserId,
            UserName = t.UserName,
            UserEmail = t.UserEmail,
            Subject = t.Subject,
            Message = t.Message,
            Status = t.Status,
            AdminReply = t.AdminReply,
            CreatedAt = t.CreatedAt,
            RepliedAt = t.RepliedAt
        };
    }
}
