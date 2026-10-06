using System.ComponentModel.DataAnnotations;

namespace Store.API.Models.Entities
{
    public class SupportMessage
    {
        public int Id { get; set; }

        public int TicketId { get; set; }

        public SupportTicket? Ticket { get; set; }

        public int SenderId { get; set; }

        [MaxLength(10)]
        public string SenderRole { get; set; } = "User";

        [MaxLength(100)]
        public string SenderName { get; set; } = "";

        [MaxLength(4000)]
        public string Body { get; set; } = "";

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
