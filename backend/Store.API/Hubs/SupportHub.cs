using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace Store.API.Hubs
{
    [Authorize]
    public class SupportHub : Hub
    {
        private readonly ILogger<SupportHub> _logger;

        public SupportHub(ILogger<SupportHub> logger)
        {
            _logger = logger;
        }

        public override async Task OnConnectedAsync()
        {
            var userId = Context.User?.FindFirst("uid")?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                Context.Abort();
                return;
            }

            // Группа «мой личный поток» — сообщения по моим тикетам
            await Groups.AddToGroupAsync(Context.ConnectionId, $"user_{userId}");

            // Админы — в общий поток новых обращений/сообщений
            if (Context.User.IsInRole("Admin"))
                await Groups.AddToGroupAsync(Context.ConnectionId, "admins");

            _logger.LogInformation("SignalR: пользователь {UserId} подключился ({ConnectionId})",
                userId, Context.ConnectionId);

            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            var userId = Context.User?.FindFirst("uid")?.Value;
            if (!string.IsNullOrEmpty(userId))
            {
                await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"user_{userId}");
                if (Context.User.IsInRole("Admin"))
                    await Groups.RemoveFromGroupAsync(Context.ConnectionId, "admins");
            }
            await base.OnDisconnectedAsync(exception);
        }
    }
}
