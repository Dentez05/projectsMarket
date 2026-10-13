using System.ComponentModel.DataAnnotations;

namespace Store.API.Models.DTOs
{
    public class ReviewResponse
    {
        public int Id { get; set; }
        public int ProjectId { get; set; }
        public int UserId { get; set; }
        public string UserName { get; set; } = null!;
        public int Rating { get; set; }
        public string Comment { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
    }

    public class CreateReviewRequest
    {
        [Range(1, 5, ErrorMessage = "Оценка должна быть от 1 до 5")]
        public int Rating { get; set; }

        [MaxLength(2000, ErrorMessage = "Комментарий не длиннее 2000 символов")]
        public string? Comment { get; set; }
    }
}
