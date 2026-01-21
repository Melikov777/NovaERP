using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace NovaERP.Application.DTOs;

public class CreateSaleDto
{
    public int CustomerId { get; set; }
    public int? WarehouseId { get; set; } // Optional, defaults to Main if null
    public decimal DiscountAmount { get; set; } = 0;
    public string? Notes { get; set; }
    public List<CreateSaleItemDto> SaleItems { get; set; } = new();
}

public class CreateSaleItemDto
{
    public int ProductId { get; set; }
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal DiscountAmount { get; set; } = 0;
}

