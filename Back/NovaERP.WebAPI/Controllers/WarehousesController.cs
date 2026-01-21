using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NovaERP.Application.DTOs;
using NovaERP.Application.Services;
using NovaERP.Domain.Constants;
using System.Security.Claims;

namespace NovaERP.WebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class WarehousesController : ControllerBase
{
    private readonly IInventoryService _inventoryService;

    public WarehousesController(IInventoryService inventoryService)
    {
        _inventoryService = inventoryService;
    }

    [HttpGet]
    [Authorize(Policy = Permissions.Stock.View)]
    public async Task<ActionResult<IEnumerable<WarehouseDto>>> GetWarehouses()
    {
        var warehouses = await _inventoryService.GetAllWarehousesAsync();
        return Ok(warehouses);
    }

    [HttpPost]
    [Authorize(Policy = Permissions.Stock.Supply)] // Or create a dedicated Warehouse.Manage permission
    public async Task<ActionResult<WarehouseDto>> CreateWarehouse([FromBody] CreateWarehouseDto dto)
    {
        var warehouse = await _inventoryService.CreateWarehouseAsync(dto);
        return CreatedAtAction(nameof(GetWarehouses), new { id = warehouse.Id }, warehouse);
    }

    [HttpPost("movement")]
    [Authorize(Policy = Permissions.Stock.Supply)]
    public async Task<IActionResult> CreateMovement([FromBody] CreateStockMovementDto dto)
    {
        try
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "system";
            await _inventoryService.ProcessStockMovementAsync(dto, userId);
            return Ok(new { Message = "Stock movement processed successfully" });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message); // Negative stock error
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ex.Message);
        }
    }

    [HttpGet("movements")]
    [Authorize(Policy = Permissions.Stock.View)]
    public async Task<ActionResult<IEnumerable<StockMovementDto>>> GetMovements([FromQuery] int? productId, [FromQuery] int? warehouseId)
    {
        var movements = await _inventoryService.GetStockMovementsAsync(productId, warehouseId);
        return Ok(movements);
    }
}
