namespace Store.API.Models.DTOs
{
    public class OrderResponse
    {
        public int Id { get; set; }
        public string OrderNumber { get; set; } = null!;
        public decimal TotalAmount { get; set; }
        public string Status { get; set; } = null!;
        public DateTime CreatedAt { get; set; }
        public string PaymentId { get; set; } = null!;
        public string UserName { get; set; } = string.Empty;
        public string UserEmail { get; set; } = string.Empty;
        public List<OrderItemResponse> Items { get; set; } = new();
    }
}
