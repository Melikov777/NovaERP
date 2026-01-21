using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NovaERP.Application.DTOs;
using NovaERP.Application.Services;
using System.Security.Claims;

namespace NovaERP.WebAPI.Controllers;


[ApiController]
[Route("api/[controller]")]
[Authorize]
public class SalesController : ControllerBase
{
    private readonly ISalesService _salesService;

    public SalesController(ISalesService salesService)
    {
        _salesService = salesService;
    }

    [HttpGet]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<ActionResult<IEnumerable<SaleDto>>> GetSales(CancellationToken cancellationToken)
    {
        var sales = await _salesService.GetAllSalesAsync(cancellationToken);
        return Ok(sales);
    }

    [HttpGet("{id}")]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<ActionResult<SaleDto>> GetSale(int id, CancellationToken cancellationToken)
    {
        var sale = await _salesService.GetSaleByIdAsync(id, cancellationToken);
        if (sale == null)
            return NotFound();

        return Ok(sale);
    }

    [HttpPost]
    public async Task<ActionResult<SaleReceiptDto>> ProcessSale([FromBody] CreateSaleDto dto, CancellationToken cancellationToken)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
            return Unauthorized();

        try
        {
            var receipt = await _salesService.ProcessSaleAsync(dto, userId, cancellationToken);
            return CreatedAtAction(nameof(GetSale), new { id = receipt.SaleId }, receipt);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}

