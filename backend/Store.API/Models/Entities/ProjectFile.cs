using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Store.API.Models.Entities
{
    [Table("project_files")]
    public class ProjectFile
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [Required]
        public int ProjectId { get; set; }

        [Required]
        [MaxLength(100)]
        public string FileType { get; set; } = null!; // "source_code", "documentation", "screenshot"

        [Required]
        [MaxLength(500)]
        public string FilePath { get; set; } = null!;

        [MaxLength(200)]
        public string? OriginalFileName { get; set; }

        public long FileSize { get; set; }

        public DateTime UploadedAt { get; set; } = DateTime.UtcNow;

        [ForeignKey("ProjectId")]
        public Project Project { get; set; } = null!;
    }
}