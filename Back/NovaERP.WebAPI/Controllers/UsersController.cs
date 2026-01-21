using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NovaERP.Application.DTOs;

namespace NovaERP.WebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Policy = NovaERP.Domain.Constants.Permissions.Users.View)] // Basic access
public class UsersController : ControllerBase
{
    private readonly UserManager<IdentityUser> _userManager;
    private readonly RoleManager<IdentityRole> _roleManager;

    public UsersController(UserManager<IdentityUser> userManager, RoleManager<IdentityRole> roleManager)
    {
        _userManager = userManager;
        _roleManager = roleManager;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<UserDto>>> GetUsers()
    {
        var users = await _userManager.Users.ToListAsync();
        var userDtos = new List<UserDto>();

        foreach (var user in users)
        {
            var roles = await _userManager.GetRolesAsync(user);
            userDtos.Add(new UserDto
            {
                Id = user.Id,
                Email = user.Email!,
                Roles = roles.ToList()
            });
        }

        return Ok(userDtos);
    }

    [HttpPost]
    [Authorize(Policy = NovaERP.Domain.Constants.Permissions.Users.Manage)]
    public async Task<ActionResult<UserDto>> CreateUser([FromBody] RegisterUserDto dto)
    {
        var user = new IdentityUser { UserName = dto.Email, Email = dto.Email };
        var result = await _userManager.CreateAsync(user, dto.Password);

        if (!result.Succeeded)
        {
            return BadRequest(result.Errors);
        }

        // Ensure role exists
        if (!await _roleManager.RoleExistsAsync(dto.Role))
        {
            await _roleManager.CreateAsync(new IdentityRole(dto.Role));
        }

        await _userManager.AddToRoleAsync(user, dto.Role);

        return Ok(new UserDto
        {
            Id = user.Id,
            Email = user.Email!,
            Roles = new List<string> { dto.Role }
        });
    }

    [HttpDelete("{id}")]
    [Authorize(Policy = NovaERP.Domain.Constants.Permissions.Users.Manage)]
    public async Task<IActionResult> DeleteUser(string id)
    {
        var user = await _userManager.FindByIdAsync(id);
        if (user == null) return NotFound();

        // Prevent deleting self? (Optional safety)
        if (User.Identity?.Name == user.UserName)
        {
             return BadRequest("Cannot delete yourself.");
        }

        await _userManager.DeleteAsync(user);
        return NoContent();
    }
}
