using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace NovaERP.Persistence;

public class NovaERPDbContextFactory : IDesignTimeDbContextFactory<NovaERPDbContext>
{
    public NovaERPDbContext CreateDbContext(string[] args)
    {
        var basePath = GetBasePath();

        var configurationBuilder = new ConfigurationBuilder()
            .SetBasePath(basePath)
            .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
            .AddJsonFile("appsettings.Development.json", optional: true, reloadOnChange: true)
            .AddEnvironmentVariables();

        var configuration = configurationBuilder.Build();

        var connectionString = configuration.GetConnectionString("DefaultConnection");

        if (string.IsNullOrEmpty(connectionString))
        {
            connectionString = Environment.GetEnvironmentVariable("ConnectionStrings__DefaultConnection");
        }

        if (string.IsNullOrEmpty(connectionString))
        {
            throw new InvalidOperationException(
                $"Could not find connection string 'DefaultConnection'. " +
                $"Searched in: {Path.Combine(basePath, "appsettings.json")}. " +
                $"Current directory: {Directory.GetCurrentDirectory()}. " +
                $"Base path: {basePath}");
        }

        var optionsBuilder = new DbContextOptionsBuilder<NovaERPDbContext>();
        optionsBuilder.UseNpgsql(connectionString);

        return new NovaERPDbContext(optionsBuilder.Options);
    }

    private string GetBasePath()
    {
        var assemblyLocation = typeof(NovaERPDbContextFactory).Assembly.Location;
        var assemblyDir = Path.GetDirectoryName(assemblyLocation)!;

        var persistenceProjectDir = Path.GetFullPath(Path.Combine(assemblyDir, "..", "..", "..", ".."));
        var solutionRoot = Path.GetDirectoryName(persistenceProjectDir);
        var webApiPath = Path.Combine(solutionRoot!, "ModernERP.WebAPI");

        var webApiBinPath = Path.Combine(webApiPath, "bin", "Debug", "net8.0");
        if (Directory.Exists(webApiBinPath) && File.Exists(Path.Combine(webApiBinPath, "appsettings.json")))
        {
            return webApiBinPath;
        }

        if (Directory.Exists(webApiPath) && File.Exists(Path.Combine(webApiPath, "appsettings.json")))
        {
            return webApiPath;
        }

        var baseDirectory = AppContext.BaseDirectory;
        if (File.Exists(Path.Combine(baseDirectory, "appsettings.json")))
        {
            return baseDirectory;
        }

        var currentDir = Directory.GetCurrentDirectory();
        var webApiFromCurrent = Path.Combine(currentDir, "ModernERP.WebAPI");
        if (Directory.Exists(webApiFromCurrent) && File.Exists(Path.Combine(webApiFromCurrent, "appsettings.json")))
        {
            return webApiFromCurrent;
        }

        var searchDir = currentDir;
        for (int i = 0; i < 6; i++)
        {
            var testPath = Path.Combine(searchDir, "ModernERP.WebAPI");
            if (Directory.Exists(testPath) && File.Exists(Path.Combine(testPath, "appsettings.json")))
            {
                return testPath;
            }
            var parent = Path.GetDirectoryName(searchDir);
            if (parent == null || parent == searchDir) break;
            searchDir = parent;
        }

        throw new DirectoryNotFoundException(
            $"Could not find ModernERP.WebAPI directory with appsettings.json. " +
            $"BaseDirectory: {baseDirectory}, " +
            $"Assembly location: {assemblyLocation}, " +
            $"Current directory: {currentDir}, " +
            $"Calculated WebAPI bin path: {webApiBinPath}");
    }
}
