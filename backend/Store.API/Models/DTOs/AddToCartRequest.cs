using System.ComponentModel.DataAnnotations;

namespace Store.API.Models.DTOs
{
    public class AddToCartRequest
    {
        [Required]
        public int ProjectId { get; set; }
    }
}
