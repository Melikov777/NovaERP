using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace NovaERP.Domain.Entities;

public class SaleItem:BaseEntity
{
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal DiscountAmount { get; set; } = 0;
    public decimal LineTotal { get; set; }

    public int SaleId { get; set; }
    public int ProductId { get; set; }

    public virtual Sale Sale { get; set; } = null!;
    public virtual Product Product { get; set; } = null!;
}
