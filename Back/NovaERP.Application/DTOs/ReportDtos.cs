namespace NovaERP.Application.DTOs;

public class DashboardStatsDto
{
    public decimal TotalSales { get; set; }
    public decimal TotalProfit { get; set; }
    public int TotalOrders { get; set; }
    public decimal StockValue { get; set; }
}

public class SalesReportItemDto
{
    public string Date { get; set; } = string.Empty;
    public decimal Revenue { get; set; }
    public decimal Profit { get; set; }
    public int OrderCount { get; set; }
}
