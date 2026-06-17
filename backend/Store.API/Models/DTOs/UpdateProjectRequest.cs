using System.ComponentModel.DataAnnotations;

namespace Store.API.Models.DTOs
{
    public class UpdateProjectRequest
    {
        [MaxLength(200, ErrorMessage = "Название не может быть длиннее 200 символов")]
        public string Title { get; set; } = null!;

        public string Description { get; set; } = null!;

        [Range(0, double.MaxValue, ErrorMessage = "Цена не может быть отрицательной")]
        public decimal? Price { get; set; }

        public int? CategoryId { get; set; }

        [MaxLength(20)]
        public string Status { get; set; } = null!;
    }
}