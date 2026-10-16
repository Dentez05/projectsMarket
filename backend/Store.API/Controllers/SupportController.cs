using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Store.API.Data;
using Store.API.Email;
using Store.API.Hubs;
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
        private readonly IEmailService _emailService;
        private readonly IHubContext<SupportHub> _hubContext;

        public SupportController(StoreDbContext context, ILogger<SupportController> logger, IEmailService emailService, IHubContext<SupportHub> hubContext)
        {
            _context = context;
            _logger = logger;
            _emailService = emailService;
            _hubContext = hubContext;
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateSupportTicketRequest request)
        {
            var userId = GetUserId();
            var userName = User.FindFirst("name")?.Value ?? "";
            var userEmail = User.FindFirst(System.Security.Claims.ClaimTypes.Email)?.Value
                         ?? User.FindFirst("email")?.Value ?? "";
            var now = DateTime.UtcNow;

            var ticket = new SupportTicket
            {
                UserId = userId,
                UserName = userName,
                UserEmail = userEmail,
                Subject = request.Subject.Trim(),
                Message = request.Message.Trim(),
                Status = "Open",
                CreatedAt = now,
                LastMessageAt = now,
                UserLastReadAt = now,
                Messages = new List<SupportMessage>
                {
                    new()
                    {
                        SenderId = userId,
                        SenderRole = "User",
                        SenderName = userName,
                        Body = request.Message.Trim(),
                        CreatedAt = now
                    }
                }
            };

            _context.SupportTickets.Add(ticket);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Создано обращение в поддержку #{TicketId} от пользователя {UserId}", ticket.Id, userId);

            await BroadcastAsync(ticket, "ticketCreated");

            var detail = await GetDetailAsync(ticket.Id);
            return CreatedAtAction(nameof(GetTicket), new { id = ticket.Id }, detail);
        }

        [HttpGet("my")]
        public async Task<IActionResult> GetMyTickets()
        {
            var userId = GetUserId();
            var tickets = await _context.SupportTickets
                .Where(t => t.UserId == userId)
                .OrderByDescending(t => t.LastMessageAt)
                .Select(t => new SupportTicketResponse
                {
                    Id = t.Id,
                    UserId = t.UserId,
                    UserName = t.UserName,
                    UserEmail = t.UserEmail,
                    Subject = t.Subject,
                    Message = t.Message,
                    Status = t.Status,
                    CreatedAt = t.CreatedAt,
                    LastMessageAt = t.LastMessageAt,
                    UnreadCount = t.Messages.Count(m =>
                        m.SenderRole == "Admin" &&
                        m.CreatedAt > (t.UserLastReadAt ?? t.CreatedAt))
                })
                .ToListAsync();

            return Ok(tickets);
        }

        [Authorize(Roles = "Admin")]
        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] string? status)
        {
            var query = _context.SupportTickets.AsQueryable();
            if (!string.IsNullOrEmpty(status))
                query = query.Where(t => t.Status == status);

            var tickets = await query
                .OrderByDescending(t => t.LastMessageAt)
                .Select(t => new SupportTicketResponse
                {
                    Id = t.Id,
                    UserId = t.UserId,
                    UserName = t.UserName,
                    UserEmail = t.UserEmail,
                    Subject = t.Subject,
                    Message = t.Message,
                    Status = t.Status,
                    CreatedAt = t.CreatedAt,
                    LastMessageAt = t.LastMessageAt,
                    UnreadCount = t.Messages.Count(m =>
                        m.SenderRole == "User" &&
                        m.CreatedAt > (t.AdminLastReadAt ?? t.CreatedAt))
                })
                .ToListAsync();

            return Ok(tickets);
        }

        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetTicket(int id)
        {
            if (!await CanAccessAsync(id)) return Forbid();

            var detail = await GetDetailAsync(id);
            if (detail == null) return NotFound();
            return Ok(detail);
        }

        [HttpPost("{id:int}/messages")]
        public async Task<IActionResult> SendMessage(int id, [FromBody] SendMessageRequest request)
        {
            var userId = GetUserId();
            var isAdmin = User.IsInRole("Admin");
            var senderName = User.FindFirst("name")?.Value ?? "";

            var ticket = await _context.SupportTickets.FindAsync(id);
            if (ticket == null) return NotFound();
            if (!isAdmin && ticket.UserId != userId) return Forbid();
            if (ticket.Status == "Closed")
                throw new ArgumentException("Обращение закрыто, ответить нельзя");

            var now = DateTime.UtcNow;
            var body = request.Body.Trim();

            _context.SupportMessages.Add(new SupportMessage
            {
                TicketId = ticket.Id,
                SenderId = userId,
                SenderRole = isAdmin ? "Admin" : "User",
                SenderName = senderName,
                Body = body,
                CreatedAt = now
            });

            ticket.LastMessageAt = now;
            ticket.Status = isAdmin ? "Answered" : "Open";
            if (isAdmin) ticket.AdminLastReadAt = now;
            else ticket.UserLastReadAt = now;

            await _context.SaveChangesAsync();

            _logger.LogInformation("Сообщение в обращение #{TicketId} от {Role} {UserId}", id, isAdmin ? "Admin" : "User", userId);

            await BroadcastAsync(ticket, "newMessage");

            if (isAdmin)
                await SendAdminReplyEmailAsync(ticket);

            var detail = await GetDetailAsync(id);
            return Ok(detail);
        }

        private async Task SendAdminReplyEmailAsync(SupportTicket ticket)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(ticket.UserEmail))
                    return;

                await _emailService.SendAsync(
                    ticket.UserEmail,
                    $"Вам ответили в поддержке — обращение #{ticket.Id}",
                    $"""
                    <p>Здравствуйте, {System.Net.WebUtility.HtmlEncode(ticket.UserName)}!</p>
                    <p>Поддержка ответила на ваше обращение <b>#{ticket.Id} «{System.Net.WebUtility.HtmlEncode(ticket.Subject)}»</b>.</p>
                    <p>Ответить и посмотреть переписку можно в разделе «Поддержка» на сайте.</p>
                    """);

                _logger.LogInformation("Отправлено уведомление о ответе поддержки по обращению #{TicketId} на {Email}",
                    ticket.Id, ticket.UserEmail);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Не удалось отправить письмо о ответе поддержки по обращению #{TicketId}", ticket.Id);
            }
        }

        [HttpPost("{id:int}/read")]
        public async Task<IActionResult> MarkRead(int id)
        {
            var userId = GetUserId();
            var isAdmin = User.IsInRole("Admin");

            var ticket = await _context.SupportTickets.FindAsync(id);
            if (ticket == null) return NotFound();
            if (!isAdmin && ticket.UserId != userId) return Forbid();

            var now = DateTime.UtcNow;
            if (isAdmin) ticket.AdminLastReadAt = now;
            else ticket.UserLastReadAt = now;

            await _context.SaveChangesAsync();

            await BroadcastAsync(ticket, "ticketUpdated");

            var detail = await GetDetailAsync(id);
            return Ok(detail);
        }

        [HttpPatch("{id:int}/close")]
        public async Task<IActionResult> Close(int id)
        {
            var userId = GetUserId();
            var isAdmin = User.IsInRole("Admin");

            var ticket = await _context.SupportTickets.FindAsync(id);
            if (ticket == null) return NotFound();
            if (!isAdmin && ticket.UserId != userId) return Forbid();

            ticket.Status = "Closed";
            await _context.SaveChangesAsync();

            await BroadcastAsync(ticket, "ticketUpdated");

            var detail = await GetDetailAsync(id);
            return Ok(detail);
        }

        private async Task BroadcastAsync(SupportTicket ticket, string evt)
        {
            try
            {
                var payload = new { ticketId = ticket.Id, status = ticket.Status, lastMessageAt = ticket.LastMessageAt };
                await _hubContext.Clients.Group($"user_{ticket.UserId}").SendAsync(evt, payload);
                await _hubContext.Clients.Group("admins").SendAsync(evt, payload);
            }
            catch (Exception ex)
            {
                // SignalR не должен ломать REST-запрос
                _logger.LogWarning(ex, "Не удалось разослать событие {Event} по тикету #{TicketId}", evt, ticket.Id);
            }
        }

        private async Task<bool> CanAccessAsync(int id)
        {
            var isAdmin = User.IsInRole("Admin");
            if (isAdmin) return await _context.SupportTickets.AnyAsync(t => t.Id == id);

            var userId = GetUserId();
            return await _context.SupportTickets.AnyAsync(t => t.Id == id && t.UserId == userId);
        }

        private async Task<SupportTicketResponse?> GetDetailAsync(int id)
        {
            var isAdmin = User.IsInRole("Admin");
            var incomingRole = isAdmin ? "User" : "Admin";

            var query = _context.SupportTickets.Where(t => t.Id == id);

            return await query
                .Select(t => new SupportTicketResponse
                {
                    Id = t.Id,
                    UserId = t.UserId,
                    UserName = t.UserName,
                    UserEmail = t.UserEmail,
                    Subject = t.Subject,
                    Message = t.Message,
                    Status = t.Status,
                    CreatedAt = t.CreatedAt,
                    LastMessageAt = t.LastMessageAt,
                    UnreadCount = t.Messages.Count(m =>
                        m.SenderRole == incomingRole &&
                        m.CreatedAt > (isAdmin
                            ? (t.AdminLastReadAt ?? t.CreatedAt)
                            : (t.UserLastReadAt ?? t.CreatedAt))),
                    Messages = t.Messages
                        .OrderBy(m => m.CreatedAt)
                        .Select(m => new SupportMessageResponse
                        {
                            Id = m.Id,
                            TicketId = m.TicketId,
                            SenderId = m.SenderId,
                            SenderRole = m.SenderRole,
                            SenderName = m.SenderName,
                            Body = m.Body,
                            CreatedAt = m.CreatedAt
                        })
                        .ToList()
                })
                .FirstOrDefaultAsync();
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
