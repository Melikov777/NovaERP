using AutoMapper;
using NovaERP.Application.DTOs;
using NovaERP.Domain.Repositories;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace NovaERP.Application.Services;

public class InventoryService : IInventoryService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public InventoryService(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<IEnumerable<ProductDto>> GetAllProductsAsync(CancellationToken cancellationToken = default)
    {
        var products = await _unitOfWork.Products.GetAllAsync(cancellationToken);
        return _mapper.Map<IEnumerable<ProductDto>>(products);
    }

    public async Task<ProductDto?> GetProductByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        var product = await _unitOfWork.Products.GetByIdAsync(id, cancellationToken);
        return product == null ? null : _mapper.Map<ProductDto>(product);
    }

    public async Task<ProductDto> CreateProductAsync(CreateProductDto dto, CancellationToken cancellationToken = default)
    {
        var product = _mapper.Map<Domain.Entities.Product>(dto);
        product.CreatedAt = DateTime.UtcNow;

        await _unitOfWork.Products.AddAsync(product, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return _mapper.Map<ProductDto>(product);
    }

    public async Task<ProductDto> UpdateProductAsync(UpdateProductDto dto, CancellationToken cancellationToken = default)
    {
        var product = await _unitOfWork.Products.GetByIdAsync(dto.Id, cancellationToken);
        if (product == null)
            throw new KeyNotFoundException($"Product with ID {dto.Id} not found");

        _mapper.Map(dto, product);
        product.UpdatedAt = DateTime.UtcNow;

        await _unitOfWork.Products.UpdateAsync(product, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return _mapper.Map<ProductDto>(product);
    }

    public async Task DeleteProductAsync(int id, CancellationToken cancellationToken = default)
    {
        var product = await _unitOfWork.Products.GetByIdAsync(id, cancellationToken);
        if (product == null)
            throw new KeyNotFoundException($"Product with ID {id} not found");

        await _unitOfWork.Products.DeleteAsync(product, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }

    public async Task<bool> CheckStockAvailabilityAsync(int productId, int quantity, CancellationToken cancellationToken = default)
    {
        var product = await _unitOfWork.Products.GetByIdAsync(productId, cancellationToken);
        if (product == null || !product.IsActive)
            return false;

        return product.StockQuantity >= quantity;
    }
    // Warehouse Management
    public async Task<IEnumerable<WarehouseDto>> GetAllWarehousesAsync(CancellationToken cancellationToken = default)
    {
        var warehouses = await _unitOfWork.Warehouses.GetAllAsync(cancellationToken);
        return _mapper.Map<IEnumerable<WarehouseDto>>(warehouses);
    }

    public async Task<WarehouseDto> CreateWarehouseAsync(CreateWarehouseDto dto, CancellationToken cancellationToken = default)
    {
        var warehouse = _mapper.Map<Domain.Entities.Warehouse>(dto);
        warehouse.CreatedAt = DateTime.UtcNow;
        
        await _unitOfWork.Warehouses.AddAsync(warehouse, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return _mapper.Map<WarehouseDto>(warehouse);
    }

    // Advanced Stock Management
    public async Task ProcessStockMovementAsync(CreateStockMovementDto dto, string userId, CancellationToken cancellationToken = default)
    {
        var product = await _unitOfWork.Products.GetByIdAsync(dto.ProductId, cancellationToken);
        if (product == null) throw new KeyNotFoundException("Product not found");

        var warehouse = await _unitOfWork.Warehouses.GetByIdAsync(dto.WarehouseId, cancellationToken);
        if (warehouse == null) throw new KeyNotFoundException("Warehouse not found");

        // Business Rule: Prevent Negative Stock on OUT
        if (dto.Type == Domain.Entities.StockMovementType.Out)
        {
            // TODO: check stock specific to warehouse if tracking stock per warehouse. 
            // For MVP global stock check:
            if (product.StockQuantity < dto.Quantity)
            {
                throw new InvalidOperationException($"Insufficient stock. Current: {product.StockQuantity}, Requested: {dto.Quantity}");
            }
        }

        var movement = new Domain.Entities.StockMovement
        {
            ProductId = dto.ProductId,
            WarehouseId = dto.WarehouseId,
            Type = dto.Type,
            Quantity = dto.Quantity,
            CostAtTime = dto.Cost > 0 ? dto.Cost : product.Cost,
            Note = dto.Note,
            CreatedBy = userId,
            CreatedAt = DateTime.UtcNow
        };

        // Update Product Stock Global (Simple MVP approach)
        switch (dto.Type)
        {
            case Domain.Entities.StockMovementType.In:
                product.StockQuantity += dto.Quantity;
                product.Cost = dto.Cost > 0 ? dto.Cost : product.Cost; // Update latest cost
                break;
            case Domain.Entities.StockMovementType.Out:
                product.StockQuantity -= dto.Quantity;
                break;
            case Domain.Entities.StockMovementType.Adjust:
                product.StockQuantity = dto.Quantity; // Reset to this value
                break;
        }

        product.UpdatedAt = DateTime.UtcNow;

        await _unitOfWork.StockMovements.AddAsync(movement, cancellationToken);
        await _unitOfWork.Products.UpdateAsync(product, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }

    public async Task<IEnumerable<StockMovementDto>> GetStockMovementsAsync(int? productId, int? warehouseId, CancellationToken cancellationToken = default)
    {
        // This requires a custom repository method for filtering, using generic GetAll for now
        var movements = await _unitOfWork.StockMovements.GetAllAsync(cancellationToken);
        
        // In-memory filter (optimize with repository method later)
        if (productId.HasValue) movements = movements.Where(m => m.ProductId == productId.Value);
        if (warehouseId.HasValue) movements = movements.Where(m => m.WarehouseId == warehouseId.Value);
        
        return _mapper.Map<IEnumerable<StockMovementDto>>(movements);
    }
}
