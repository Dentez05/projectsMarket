using System.ComponentModel.DataAnnotations;

namespace Store.API.Models.DTOs
{
    public class CreateSupportTicketRequest
    {
        [Required(ErrorMessage = "Укажите тему")]
        [MaxLength(200, ErrorMessage = "Тема не длиннее 200 символов")]
        public string Subject { get; set; } = "";

        [Required(ErrorMessage = "Опишите проблему")]
        [MinLength(10, ErrorMessage = "Сообщение не короче 10 символов")]
        [MaxLength(4000, ErrorMessage = "Сообщение не длиннее 4000 символов")]
        public string Message { get; set; } = "";
    }

    public class SendMessageRequest
    {
        [Required(ErrorMessage = "Введите сообщение")]
        [MinLength(1, ErrorMessage = "Введите сообщение")]
        [MaxLength(4000, ErrorMessage = "Сообщение не длиннее 4000 символов")]
        public string Body { get; set; } = "";
    }

    public class SupportMessageResponse
    {
        public int Id { get; set; }
        public int TicketId { get; set; }
        public int SenderId { get; set; }
        public string SenderRole { get; set; } = "";
        public string SenderName { get; set; } = "";
        public string Body { get; set; } = "";
        public DateTime CreatedAt { get; set; }
    }

    public class SupportTicketResponse
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string UserName { get; set; } = "";
        public string UserEmail { get; set; } = "";
        public string Subject { get; set; } = "";
        public string Message { get; set; } = "";
        public string Status { get; set; } = "";
        public DateTime CreatedAt { get; set; }
        public DateTime LastMessageAt { get; set; }
        public int UnreadCount { get; set; }
        public List<SupportMessageResponse>? Messages { get; set; }
    }
}
