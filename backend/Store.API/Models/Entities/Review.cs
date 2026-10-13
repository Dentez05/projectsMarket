using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Store.API.Models.Entities
{
    [Table("reviews")]
    public class Review
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        public int ProjectId { get; set; }

        public Project Project { get; set; } = null!;

        public int UserId { get; set; }

        [Required]
        [MaxLength(100)]
        public string UserName { get; set; } = null!;

        [Range(1, 5)]
        public int Rating { get; set; }

        [MaxLength(2000)]
        public string Comment { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? UpdatedAt { get; set; }
    }
}
