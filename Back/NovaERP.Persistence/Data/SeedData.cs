using Microsoft.AspNetCore.Identity;
using NovaERP.Domain.Constants;
using NovaERP.Domain.Entities;
using System.Security.Claims;

namespace NovaERP.Persistence.Data;

public static class SeedData
{
    public static async Task SeedAsync(
        NovaERPDbContext context,
        UserManager<IdentityUser> userManager,
        RoleManager<IdentityRole> roleManager)
    {
        // 1. Seed Roles
        var roles = new[] { "SuperAdmin", "Admin", "Manager", "WarehouseWorker", "SalesWorker", "Accountant", "User" };
        foreach (var role in roles)
        {
            if (!await roleManager.RoleExistsAsync(role))
            {
                await roleManager.CreateAsync(new IdentityRole(role));
            }
        }

        // 2. Seed SuperAdmin Permissions (All Permissions)
        var superAdminRole = await roleManager.FindByNameAsync("SuperAdmin");
        var allPermissions = Permissions.GetAllPermissions();
        var currentClaims = await roleManager.GetClaimsAsync(superAdminRole!);
        
        foreach (var permission in allPermissions)
        {
            if (!currentClaims.Any(c => c.Type == "Permission" && c.Value == permission))
            {
                await roleManager.AddClaimAsync(superAdminRole!, new Claim("Permission", permission));
            }
        }

        // 3. Seed SuperAdmin User
        var adminUser = await userManager.FindByNameAsync("admin");
        if (adminUser == null)
        {
            var user = new IdentityUser
            {
                UserName = "admin",
                Email = "admin@novaerp.com",
                EmailConfirmed = true
            };

            var result = await userManager.CreateAsync(user, "Admin123!");
            if (result.Succeeded)
            {
                await userManager.AddToRoleAsync(user, "SuperAdmin");
            }
        }
        else
        {
            // Ensure Admin has correct credentials if already exists
            adminUser.Email = "admin@novaerp.com";
            adminUser.EmailConfirmed = true;
            await userManager.UpdateAsync(adminUser);
            
            // Reset Password
            var token = await userManager.GeneratePasswordResetTokenAsync(adminUser);
            await userManager.ResetPasswordAsync(adminUser, token, "Admin123!");
            
            if (!await userManager.IsInRoleAsync(adminUser, "SuperAdmin"))
            {
                await userManager.AddToRoleAsync(adminUser, "SuperAdmin");
            }
        }

        // 4. Default Data
        if (!context.Categories.Any())
        {
            var categories = new List<Category>
            {
                new Category { Name = "Electronics" },
                new Category { Name = "Computers" },
                new Category { Name = "Smartphones" },
                new Category { Name = "Accessories" },
                new Category { Name = "Office Supplies" }
            };
            context.Categories.AddRange(categories);
            await context.SaveChangesAsync();
        }

        if (!context.Warehouses.Any())
        {
            var warehouses = new List<Warehouse>
            {
                new Warehouse { Name = "Main Warehouse", Address = "Baku, Center", IsActive = true },
                new Warehouse { Name = "Baku Mall Branch", Address = "Baku Mall, 3rd Floor", IsActive = true }
            };
            context.Warehouses.AddRange(warehouses);
            await context.SaveChangesAsync();
        }

        if (!context.Products.Any())
        {
            var catId = context.Categories.First().Id;
            var products = new List<Product>();
            for (int i = 1; i <= 10; i++)
            {
                products.Add(new Product 
                { 
                    Name = $"Product {i}", 
                    SKU = $"SKU-{1000+i}", 
                    Price = 100 * i, 
                    Cost = 80 * i, 
                    StockQuantity = 0, // Stock managed by movements
                    MinStockLevel = 5,
                    IsActive = true,
                    CategoryId = catId,
                    Description = $"Description for Product {i}"
                });
            }
            context.Products.AddRange(products);
            await context.SaveChangesAsync();
        }

        if (!context.Customers.Any())
        {
            var customers = new List<Customer>
            {
                new Customer { Name = "Walk-in Customer", Phone = "000-000-0000", Email = "guest@nova.com", IsActive = true },
                new Customer { Name = "Corporate Client Ltd", Phone = "012-111-2222", Email = "corp@client.com", Address = "Business City", IsActive = true },
                new Customer { Name = "Loyal Customer", Phone = "050-555-4433", Email = "loyal@gmail.com", IsActive = true }
            };
            context.Customers.AddRange(customers);
            await context.SaveChangesAsync();
        }
    }
}
