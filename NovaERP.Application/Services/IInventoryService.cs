using NovaERP.Application.DTOs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace NovaERP.Application.Services;

public interface IInventoryService
{
    Task<IEnumerable<ProductDto>> GetAllProductsAsync(CancellationToken cancellationToken = default);
    Task<ProductDto?> GetProductByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<ProductDto> CreateProductAsync(CreateProductDto dto, CancellationToken cancellationToken = default);
    Task<ProductDto> UpdateProductAsync(UpdateProductDto dto, CancellationToken cancellationToken = default);
    Task DeleteProductAsync(int id, CancellationToken cancellationToken = default);
    Task<bool> CheckStockAvailabilityAsync(int productId, int quantity, CancellationToken cancellationToken = default);
}
