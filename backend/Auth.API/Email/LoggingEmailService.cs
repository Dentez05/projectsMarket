namespace Auth.API.Email
{
    // Заглушка: письмо пишется в лог контейнера вместо реальной отправки.
    // Включается конфигом Email__Provider=log (по умолчанию).
    public class LoggingEmailService : IEmailService
    {
        private readonly ILogger<LoggingEmailService> _logger;

        public LoggingEmailService(ILogger<LoggingEmailService> logger)
        {
            _logger = logger;
        }

        public Task SendAsync(string to, string subject, string htmlBody)
        {
            _logger.LogInformation(
                "===== EMAIL (заглушка, Email:Provider=log) =====\nКому: {To}\nТема: {Subject}\n{Body}\n===== КОНЕЦ EMAIL =====",
                to, subject, htmlBody);
            return Task.CompletedTask;
        }
    }
}
