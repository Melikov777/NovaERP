using System.ComponentModel.DataAnnotations;

namespace NovaERP.Domain.Entities;

public class Warehouse : BaseEntity
{
    [Required]
    public string Name { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
}

public enum StockMovementType
{
    In = 10,      // Mədaxil (Purchase, Return In)
    Out = 20,     // Məxaric (Sale, Waste)
    Adjust = 30   // Korreksiya
}

public class StockMovement : BaseEntity
{
    public int ProductId { get; set; }
    public Product? Product { get; set; }

    public int WarehouseId { get; set; }
    public Warehouse? Warehouse { get; set; }

    public StockMovementType Type { get; set; }
    
    public int Quantity { get; set; } // Always positive. Logic determines sign based on Type.
    public decimal CostAtTime { get; set; } // Cost price at the moment of movement

    public string Note { get; set; } = string.Empty;
    public string CreatedBy { get; set; } = string.Empty;
    
    // Optional: Link to Sale or Supply document
    public int? ReferenceId { get; set; }
}
