using Microsoft.EntityFrameworkCore.Storage;
using NovaERP.Domain.Repositories;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace NovaERP.Persistence.Repositories;

public class UnitOfWork : IUnitOfWork
{
    private readonly NovaERPDbContext _context;
    private IDbContextTransaction? _transaction;

    private IRepository<Domain.Entities.Product>? _products;
    private IRepository<Domain.Entities.Category>? _categories;
    private IRepository<Domain.Entities.Customer>? _customers;
    private IRepository<Domain.Entities.Sale>? _sales;
    private IRepository<Domain.Entities.SaleItem>? _saleItems;
    private IRepository<Domain.Entities.Warehouse>? _warehouses;
    private IRepository<Domain.Entities.StockMovement>? _stockMovements;

    public UnitOfWork(NovaERPDbContext context)
    {
        _context = context;
    }

    public IRepository<Domain.Entities.Product> Products
    {
        get
        {
            _products ??= new Repository<Domain.Entities.Product>(_context);
            return _products;
        }
    }

    public IRepository<Domain.Entities.Category> Categories
    {
        get
        {
            _categories ??= new Repository<Domain.Entities.Category>(_context);
            return _categories;
        }
    }

    public IRepository<Domain.Entities.Customer> Customers
    {
        get
        {
            _customers ??= new Repository<Domain.Entities.Customer>(_context);
            return _customers;
        }
    }

    public IRepository<Domain.Entities.Sale> Sales
    {
        get
        {
            _sales ??= new Repository<Domain.Entities.Sale>(_context);
            return _sales;
        }
    }

    public IRepository<Domain.Entities.SaleItem> SaleItems
    {
        get
        {
            _saleItems ??= new Repository<Domain.Entities.SaleItem>(_context);
            return _saleItems;
        }
    }

    public IRepository<Domain.Entities.Warehouse> Warehouses
    {
        get
        {
            _warehouses ??= new Repository<Domain.Entities.Warehouse>(_context);
            return _warehouses;
        }
    }

    public IRepository<Domain.Entities.StockMovement> StockMovements
    {
        get
        {
            _stockMovements ??= new Repository<Domain.Entities.StockMovement>(_context);
            return _stockMovements;
        }
    }

    public async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        return await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task BeginTransactionAsync(CancellationToken cancellationToken = default)
    {
        _transaction = await _context.Database.BeginTransactionAsync(cancellationToken);
    }

    public async Task CommitTransactionAsync(CancellationToken cancellationToken = default)
    {
        if (_transaction != null)
        {
            await _transaction.CommitAsync(cancellationToken);
            await _transaction.DisposeAsync();
            _transaction = null;
        }
    }

    public async Task RollbackTransactionAsync(CancellationToken cancellationToken = default)
    {
        if (_transaction != null)
        {
            await _transaction.RollbackAsync(cancellationToken);
            await _transaction.DisposeAsync();
            _transaction = null;
        }
    }

    public void Dispose()
    {
        _transaction?.Dispose();
        _context.Dispose();
    }
}
