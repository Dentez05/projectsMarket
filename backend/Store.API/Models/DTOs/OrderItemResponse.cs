namespace Store.API.Models.DTOs
{
    public class OrderItemResponse
    {
        public int ProjectId { get; set; }
        public string Title { get; set; } = null!;
        public decimal Price { get; set; }
    }
}
