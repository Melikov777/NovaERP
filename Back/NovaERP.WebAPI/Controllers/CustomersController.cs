using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NovaERP.Application.DTOs;
using NovaERP.Domain.Repositories;

namespace NovaERP.WebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class CustomersController : ControllerBase
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public CustomersController(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<CustomerDto>>> GetCustomers(CancellationToken cancellationToken)
    {
        var customers = await _unitOfWork.Customers.GetAllAsync(cancellationToken);
        var dtos = _mapper.Map<IEnumerable<CustomerDto>>(customers);
        return Ok(dtos);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<CustomerDto>> GetCustomer(int id, CancellationToken cancellationToken)
    {
        var customer = await _unitOfWork.Customers.GetByIdAsync(id, cancellationToken);
        if (customer == null) return NotFound();
        return Ok(_mapper.Map<CustomerDto>(customer));
    }

    [HttpPost]
    public async Task<ActionResult<CustomerDto>> CreateCustomer([FromBody] CreateCustomerDto dto, CancellationToken cancellationToken)
    {
        var customer = _mapper.Map<Domain.Entities.Customer>(dto);
        customer.CreatedAt = DateTime.UtcNow;
        
        await _unitOfWork.Customers.AddAsync(customer, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return CreatedAtAction(nameof(GetCustomer), new { id = customer.Id }, _mapper.Map<CustomerDto>(customer));
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<CustomerDto>> UpdateCustomer(int id, [FromBody] UpdateCustomerDto dto, CancellationToken cancellationToken)
    {
        if (id != dto.Id) return BadRequest();

        var customer = await _unitOfWork.Customers.GetByIdAsync(id, cancellationToken);
        if (customer == null) return NotFound();

        _mapper.Map(dto, customer);
        customer.UpdatedAt = DateTime.UtcNow;

        await _unitOfWork.Customers.UpdateAsync(customer, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Ok(_mapper.Map<CustomerDto>(customer));
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteCustomer(int id, CancellationToken cancellationToken)
    {
        var customer = await _unitOfWork.Customers.GetByIdAsync(id, cancellationToken);
        if (customer == null) return NotFound();

        // Optional: Check connection to Sales before delete, but for now we allow soft or hard delete depending on repo implementation. 
        // Assuming hard delete for now.
        await _unitOfWork.Customers.DeleteAsync(customer, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return NoContent();
    }
}
