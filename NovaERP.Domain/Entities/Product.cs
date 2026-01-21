using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace NovaERP.Domain.Entities;

public class Product:BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? SKU { get; set; }
    public decimal Price { get; set; }
    public decimal Cost { get; set; }
    public int StockQuantity { get; set; }
    public int MinStockLevel { get; set; } = 0;
    public bool IsActive { get; set; } = true;

    public int CategoryId { get; set; }

    public virtual Category Category { get; set; } = null!;
    public virtual ICollection<SaleItem> SaleItems { get; set; } = new List<SaleItem>();
}
