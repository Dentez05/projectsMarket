namespace Store.API.Models.DTOs
{
    public class ProjectResponse
    {
        public int Id { get; set; }
        public string Title { get; set; } = null!;
        public string Description { get; set; } = null!;
        public string FullDescription { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public int CreatedByUserId { get; set; }
        public string Status { get; set; } = null!;
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public int? CategoryId { get; set; }
        public string CategoryName { get; set; } = null!;
        public List<string> Images { get; set; } = new();
        public List<string> Technologies { get; set; } = new();
        public string? Demo { get; set; }
        public bool IsNew { get; set; }
        public bool Popular { get; set; }
        public List<string> PreviewImages { get; set; } = new();
    }
}
