using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace NovaERP.Domain.Repositories;

public interface IUnitOfWork : IDisposable
{
    IRepository<Entities.Product> Products { get; }
    IRepository<Entities.Category> Categories { get; }
    IRepository<Entities.Customer> Customers { get; }
    IRepository<Entities.Sale> Sales { get; }
    IRepository<Entities.SaleItem> SaleItems { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
    Task BeginTransactionAsync(CancellationToken cancellationToken = default);
    Task CommitTransactionAsync(CancellationToken cancellationToken = default);
    Task RollbackTransactionAsync(CancellationToken cancellationToken = default);
}
