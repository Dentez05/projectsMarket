using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace Store.API.Models.Entities
{
    [Table("projects")]
    public class Project
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [Required]
        [MaxLength(200)]
        public string Title { get; set; } = null!;

        [Required]
        public string Description { get; set; } = null!;

        public string FullDescription { get; set; } = string.Empty;

        [Required]
        [Column(TypeName = "decimal(10,2)")]
        public decimal Price { get; set; }

        [Required]
        public int CreatedByUserId { get; set; }

        [Required]
        [MaxLength(20)]
        public string Status { get; set; } = "Draft";

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }

        public int? CategoryId { get; set; }
        public Category Category { get; set; } = null!;

        [Column(TypeName = "jsonb")]
        public string Images { get; set; } = "[]";

        [Column(TypeName = "jsonb")]
        public string Technologies { get; set; } = "[]";

        public string? Demo { get; set; }

        public bool IsNew { get; set; } = false;
        public bool Popular { get; set; } = false;

        public ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
        public ICollection<CartItem> CartItems { get; set; } = new List<CartItem>();
        public ICollection<ProjectFile> ProjectFiles { get; set; } = new List<ProjectFile>();
    }
}
