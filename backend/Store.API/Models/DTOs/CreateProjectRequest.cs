using System.ComponentModel.DataAnnotations;

namespace Store.API.Models.DTOs
{
    public class CreateProjectRequest
    {
        [Required(ErrorMessage = "Название обязательно")]
        [MaxLength(200, ErrorMessage = "Название не может быть длиннее 200 символов")]
        public string Title { get; set; } = null!;

        [Required(ErrorMessage = "Описание обязательно")]
        public string Description { get; set; } = null!;

        public string FullDescription { get; set; } = string.Empty;

        [Required(ErrorMessage = "Цена обязательна")]
        [Range(0, double.MaxValue, ErrorMessage = "Цена не может быть отрицательной")]
        public decimal Price { get; set; }

        public int? CategoryId { get; set; }
        public List<string> Images { get; set; } = new();
        public List<string> Technologies { get; set; } = new();
        public List<string> PreviewImages { get; set; } = new();
        public string? Demo { get; set; }
        public bool IsNew { get; set; } = false;
        public bool Popular { get; set; } = false;
    }
}
