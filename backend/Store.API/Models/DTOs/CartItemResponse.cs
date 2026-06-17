namespace Store.API.Models.DTOs
{
    public class CartItemResponse
    {
        public int Id { get; set; }
        public int ProjectId { get; set; }
        public string Title { get; set; } = null!;
        public decimal Price { get; set; }
        public DateTime AddedAt { get; set; }
    }
}
