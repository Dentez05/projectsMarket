using System.ComponentModel.DataAnnotations;

namespace Store.API.Models.Entities
{
    public class SupportTicket
    {
        public int Id { get; set; }

        public int UserId { get; set; }

        [MaxLength(100)]
        public string UserName { get; set; } = "";

        [MaxLength(256)]
        public string UserEmail { get; set; } = "";

        [MaxLength(200)]
        public string Subject { get; set; } = "";

        [MaxLength(4000)]
        public string Message { get; set; } = "";

        [MaxLength(20)]
        public string Status { get; set; } = "Open";

        [MaxLength(4000)]
        public string? AdminReply { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? RepliedAt { get; set; }
    }
}
