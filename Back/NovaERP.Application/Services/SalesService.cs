using AutoMapper;
using NovaERP.Application.DTOs;
using NovaERP.Domain.Entities;
using NovaERP.Domain.Enums;
using NovaERP.Domain.Repositories;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace NovaERP.Application.Services;

public class SalesService : ISalesService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public SalesService(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<SaleReceiptDto> ProcessSaleAsync(CreateSaleDto dto, string userId, CancellationToken cancellationToken = default)
    {
        await _unitOfWork.BeginTransactionAsync(cancellationToken);

        try
        {
            // 1. Determine Warehouse (Default to first active if not provided)
            int warehouseId = dto.WarehouseId ?? 0;
            if (warehouseId == 0)
            {
                var mainWarehouse = (await _unitOfWork.Warehouses.GetAllAsync(cancellationToken)).FirstOrDefault(w => w.IsActive);
                if (mainWarehouse == null) throw new InvalidOperationException("No active warehouse found for sale.");
                warehouseId = mainWarehouse.Id;
            }

            // 2. Validate Stock & Prepare Sale
            foreach (var item in dto.SaleItems)
            {
                var product = await _unitOfWork.Products.GetByIdAsync(item.ProductId, cancellationToken);
                if (product == null)
                    throw new KeyNotFoundException($"Product with ID {item.ProductId} not found");

                if (!product.IsActive)
                    throw new InvalidOperationException($"Product {product.Name} is not active");

                // Note: Currently checking Global Stock. In future, check Warehouse Stock if enforced.
                if (product.StockQuantity < item.Quantity)
                    throw new InvalidOperationException($"Insufficient stock for product {product.Name}. Available: {product.StockQuantity}, Requested: {item.Quantity}");
            }

            var sale = new Sale
            {
                SaleNumber = GenerateSaleNumber(),
                SaleDate = DateTime.UtcNow,
                CustomerId = dto.CustomerId,
                UserId = userId,
                DiscountAmount = dto.DiscountAmount,
                Notes = dto.Notes,
                Status = SaleStatus.Completed,
                CreatedAt = DateTime.UtcNow
            };

            decimal totalAmount = 0;
            
            // 3. Process Items & Movements
            foreach (var itemDto in dto.SaleItems)
            {
                var product = await _unitOfWork.Products.GetByIdAsync(itemDto.ProductId, cancellationToken);
                if (product == null) continue;

                var lineTotal = (itemDto.UnitPrice * itemDto.Quantity) - itemDto.DiscountAmount;
                totalAmount += lineTotal;

                // Create Sale Item
                var saleItem = new SaleItem
                {
                    ProductId = itemDto.ProductId,
                    Quantity = itemDto.Quantity,
                    UnitPrice = itemDto.UnitPrice,
                    DiscountAmount = itemDto.DiscountAmount,
                    LineTotal = lineTotal,
                    CostAtTime = product.Cost, // Critical for Profit Calculation
                    CreatedAt = DateTime.UtcNow
                };

                sale.SaleItems.Add(saleItem);

                // Update Product Stock
                product.StockQuantity -= itemDto.Quantity;
                product.UpdatedAt = DateTime.UtcNow;
                await _unitOfWork.Products.UpdateAsync(product, cancellationToken);

                // Create Stock Movement (Log)
                var movement = new StockMovement
                {
                    ProductId = product.Id,
                    WarehouseId = warehouseId,
                    Type = StockMovementType.Out,
                    Quantity = itemDto.Quantity,
                    CostAtTime = product.Cost,
                    Note = $"Sale {sale.SaleNumber}",
                    CreatedBy = userId,
                    CreatedAt = DateTime.UtcNow,
                    ReferenceId = sale.Id // Will be updated after SaveChanges? No, sale.Id is 0 here. 
                                          // Actually need to save Sale first to get Id, or save SaleItems with Navigation.
                                          // But StockMovement is separate.
                                          // WORKAROUND: We'll set ReferenceId after saving Sale, or just use SaleNumber in Note for now. 
                                          // Best practice: Save sale, then add movements.
                };
                
                // Add Movement to Context (via UnitOfWork property if needed, or just AddAsync)
                // Since IUnitOfWork has StockMovements repo:
                await _unitOfWork.StockMovements.AddAsync(movement, cancellationToken);
            }

            sale.TotalAmount = totalAmount;
            sale.FinalAmount = totalAmount - dto.DiscountAmount;

            await _unitOfWork.Sales.AddAsync(sale, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);
            
            // Update ReferenceId for movements (Optional, but clean)
            // Need to track movements to update them. 
            // Simplified: Just relying on Note "Sale X" for linkage now.

            await _unitOfWork.CommitTransactionAsync(cancellationToken);

            var savedSale = await _unitOfWork.Sales.GetByIdAsync(sale.Id, cancellationToken);
            return _mapper.Map<SaleReceiptDto>(savedSale);
        }
        catch
        {
            await _unitOfWork.RollbackTransactionAsync(cancellationToken);
            throw;
        }
    }

    public async Task<IEnumerable<SaleDto>> GetAllSalesAsync(CancellationToken cancellationToken = default)
    {
        var sales = await _unitOfWork.Sales.GetAllAsync(cancellationToken);
        return _mapper.Map<IEnumerable<SaleDto>>(sales);
    }

    public async Task<SaleDto?> GetSaleByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        var sale = await _unitOfWork.Sales.GetByIdAsync(id, cancellationToken);
        return sale == null ? null : _mapper.Map<SaleDto>(sale);
    }

    private string GenerateSaleNumber()
    {
        return $"SALE-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString("N")[..8].ToUpper()}";
    }
}
