using NovaERP.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using NovaERP.Application.DTOs;


namespace NovaERP.Application.DTOs;

public class SaleDto
{
    public int Id { get; set; }
    public string SaleNumber { get; set; } = string.Empty;
    public DateTime SaleDate { get; set; }
    public decimal TotalAmount { get; set; }
    public decimal DiscountAmount { get; set; }
    public decimal FinalAmount { get; set; }
    public SaleStatus Status { get; set; }
    public string? Notes { get; set; }
    public int CustomerId { get; set; }
    public string? CustomerName { get; set; }
    public List<SaleItemDto> SaleItems { get; set; } = new();
}
