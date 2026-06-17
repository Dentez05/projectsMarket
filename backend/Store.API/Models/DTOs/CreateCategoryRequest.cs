using System.ComponentModel.DataAnnotations;

namespace Store.API.Models.DTOs
{
    public class CreateCategoryRequest
    {
        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = null!;

        [MaxLength(500)]
        public string Description { get; set; } = null!;
    }
}