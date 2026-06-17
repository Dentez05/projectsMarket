namespace Store.API.Models.DTOs
{
    public class CartResponse
    {
        public List<CartItemResponse> Items { get; set; } = new();
        public decimal TotalPrice => Items.Sum(i => i.Price);
        public int Count => Items.Count;
    }
}
