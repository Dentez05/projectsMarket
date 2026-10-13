using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;

namespace Store.API.Email
{
    // Реальная отправка через SMTP (MailKit). Включается конфигом Email__Provider=smtp.
    public class SmtpEmailService : IEmailService
    {
        private readonly IConfiguration _configuration;
        private readonly ILogger<SmtpEmailService> _logger;

        public SmtpEmailService(IConfiguration configuration, ILogger<SmtpEmailService> logger)
        {
            _configuration = configuration;
            _logger = logger;
        }

        public async Task SendAsync(string to, string subject, string htmlBody)
        {
            var host = _configuration["Smtp:Host"];
            if (string.IsNullOrWhiteSpace(host))
                throw new InvalidOperationException("Smtp:Host не задан (переменная Smtp__Host)");

            var message = new MimeMessage();
            message.From.Add(new MailboxAddress(
                _configuration["Email:From"] ?? "ProjectMarket",
                _configuration["Email:From"] ?? "noreply@projectsmarket.local"));
            message.To.Add(MailboxAddress.Parse(to));
            message.Subject = subject;
            message.Body = new BodyBuilder { HtmlBody = htmlBody }.ToMessageBody();

            var port = int.TryParse(_configuration["Smtp:Port"], out var p) ? p : 587;
            var user = _configuration["Smtp:User"];
            var password = _configuration["Smtp:Password"];

            using var client = new SmtpClient();
            await client.ConnectAsync(host, port, SecureSocketOptions.Auto);
            if (!string.IsNullOrEmpty(user))
                await client.AuthenticateAsync(user, password);
            await client.SendAsync(message);
            await client.DisconnectAsync(true);

            _logger.LogInformation("Письмо «{Subject}» отправлено на {To}", subject, to);
        }
    }
}
