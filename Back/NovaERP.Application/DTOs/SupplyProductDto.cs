using System;
using System.ComponentModel.DataAnnotations;

namespace NovaERP.Application.DTOs;

public class SupplyProductDto
{
    [Required]
    public int ProductId { get; set; }
    
    [Required]
    [Range(1, int.MaxValue)]
    public int Quantity { get; set; }
    
    [Required]
    [Range(0, double.MaxValue)]
    public decimal CostPrice { get; set; }
}
