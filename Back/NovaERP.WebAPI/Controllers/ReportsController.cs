using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NovaERP.Application.DTOs;
using NovaERP.Domain.Constants;
using NovaERP.Persistence;

namespace NovaERP.WebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Policy = Permissions.Stock.View)] // Or a new Reports.View permission
public class ReportsController : ControllerBase
{
    private readonly NovaERPDbContext _context;

    public ReportsController(NovaERPDbContext context)
    {
        _context = context;
    }

    [HttpGet("dashboard")]
    public async Task<ActionResult<DashboardStatsDto>> GetDashboardStats([FromQuery] DateTime? startDate, [FromQuery] DateTime? endDate)
    {
        var start = startDate?.ToUniversalTime() ?? DateTime.MinValue;
        var end = endDate?.ToUniversalTime() ?? DateTime.MaxValue;

        // Sales query
        var salesQuery = _context.Sales
            .Include(s => s.SaleItems)
            .Where(s => s.SaleDate >= start && s.SaleDate <= end && s.Status == Domain.Enums.SaleStatus.Completed);

        var totalSales = await salesQuery.SumAsync(s => s.TotalAmount);
        var totalOrders = await salesQuery.CountAsync();

        // Calculate Profit (Revenue - CostAtTime)
        var totalCost = await _context.SaleItems
            .Where(si => si.Sale.SaleDate >= start && si.Sale.SaleDate <= end && si.Sale.Status == Domain.Enums.SaleStatus.Completed)
            .SumAsync(si => si.CostAtTime * si.Quantity);

        var totalProfit = totalSales - totalCost;

        // Stock Value (Current)
        var stockValue = await _context.Products
            .Where(p => p.IsActive)
            .SumAsync(p => p.StockQuantity * p.Cost);

        return Ok(new DashboardStatsDto
        {
            TotalSales = totalSales,
            TotalProfit = totalProfit,
            TotalOrders = totalOrders,
            StockValue = stockValue
        });
    }

    [HttpGet("sales")]
    public async Task<ActionResult<IEnumerable<SalesReportItemDto>>> GetSalesReport([FromQuery] DateTime? startDate, [FromQuery] DateTime? endDate)
    {
        var start = startDate?.ToUniversalTime() ?? DateTime.UtcNow.AddDays(-30);
        var end = endDate?.ToUniversalTime() ?? DateTime.UtcNow;

        var salesData = await _context.Sales
            .Include(s => s.SaleItems)
            .Where(s => s.SaleDate >= start && s.SaleDate <= end && s.Status == Domain.Enums.SaleStatus.Completed)
            .GroupBy(s => s.SaleDate.Date)
            .Select(g => new
            {
                Date = g.Key,
                Revenue = g.Sum(s => s.TotalAmount),
                OrderCount = g.Count()
            })
            .OrderBy(x => x.Date)
            .ToListAsync();
        
        var result = salesData.Select(d => new SalesReportItemDto
        {
            Date = d.Date.ToString("yyyy-MM-dd"),
            Revenue = d.Revenue,
            OrderCount = d.OrderCount,
            Profit = 0 // Profit requires complex grouping or memory processing, skipping for MVP chart optimization
        }).ToList();

        return Ok(result);
    }
}
