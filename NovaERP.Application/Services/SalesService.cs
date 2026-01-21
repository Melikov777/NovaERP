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
            foreach (var item in dto.SaleItems)
            {
                var product = await _unitOfWork.Products.GetByIdAsync(item.ProductId, cancellationToken);
                if (product == null)
                    throw new KeyNotFoundException($"Product with ID {item.ProductId} not found");

                if (!product.IsActive)
                    throw new InvalidOperationException($"Product {product.Name} is not active");

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
            foreach (var itemDto in dto.SaleItems)
            {
                var product = await _unitOfWork.Products.GetByIdAsync(itemDto.ProductId, cancellationToken);
                if (product == null) continue;

                var lineTotal = (itemDto.UnitPrice * itemDto.Quantity) - itemDto.DiscountAmount;
                totalAmount += lineTotal;

                var saleItem = new SaleItem
                {
                    ProductId = itemDto.ProductId,
                    Quantity = itemDto.Quantity,
                    UnitPrice = itemDto.UnitPrice,
                    DiscountAmount = itemDto.DiscountAmount,
                    LineTotal = lineTotal,
                    CreatedAt = DateTime.UtcNow
                };

                sale.SaleItems.Add(saleItem);

                product.StockQuantity -= itemDto.Quantity;
                product.UpdatedAt = DateTime.UtcNow;
                await _unitOfWork.Products.UpdateAsync(product, cancellationToken);
            }

            sale.TotalAmount = totalAmount;
            sale.FinalAmount = totalAmount - dto.DiscountAmount;

            await _unitOfWork.Sales.AddAsync(sale, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);
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
