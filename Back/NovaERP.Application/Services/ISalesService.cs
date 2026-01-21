using NovaERP.Application.DTOs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace NovaERP.Application.Services;

public interface ISalesService
{
    Task<SaleReceiptDto> ProcessSaleAsync(CreateSaleDto dto, string userId, CancellationToken cancellationToken = default);
    Task<IEnumerable<SaleDto>> GetAllSalesAsync(CancellationToken cancellationToken = default);
    Task<SaleDto?> GetSaleByIdAsync(int id, CancellationToken cancellationToken = default);
}

