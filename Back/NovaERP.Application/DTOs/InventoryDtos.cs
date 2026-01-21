using System.ComponentModel.DataAnnotations;
using NovaERP.Domain.Entities;

namespace NovaERP.Application.DTOs;

public class WarehouseDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public bool IsActive { get; set; }
}

public class CreateWarehouseDto
{
    [Required]
    public string Name { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
}

public class UpdateWarehouseDto : CreateWarehouseDto
{
    public bool IsActive { get; set; }
}

public class StockMovementDto
{
    public int Id { get; set; }
    public int ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public int WarehouseId { get; set; }
    public string WarehouseName { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty; // In, Out, Adjust
    public int Quantity { get; set; }
    public decimal CostAtTime { get; set; }
    public string Note { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public string CreatedBy { get; set; } = string.Empty;
}

public class CreateStockMovementDto
{
    [Required]
    public int ProductId { get; set; }
    [Required]
    public int WarehouseId { get; set; }
    [Required]
    public StockMovementType Type { get; set; }
    [Required]
    [Range(1, int.MaxValue)]
    public int Quantity { get; set; }
    public decimal Cost { get; set; } // Optional, for In/Adjust
    public string Note { get; set; } = string.Empty;
}
