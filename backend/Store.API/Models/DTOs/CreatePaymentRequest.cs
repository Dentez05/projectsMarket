using System.ComponentModel.DataAnnotations;

namespace Store.API.Models.DTOs
{
    public class CreatePaymentRequest
    {
        [Required]
        public int OrderId { get; set; }
    }
}