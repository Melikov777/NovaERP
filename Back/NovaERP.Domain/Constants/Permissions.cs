namespace NovaERP.Domain.Constants;

public static class Permissions
{
    public static class Products
    {
        public const string View = "Permissions.Products.View";
        public const string Create = "Permissions.Products.Create";
        public const string Edit = "Permissions.Products.Edit";
        public const string Delete = "Permissions.Products.Delete";
    }
    public static class Customers
    {
        public const string View = "Permissions.Customers.View";
        public const string Create = "Permissions.Customers.Create";
        public const string Edit = "Permissions.Customers.Edit";
        public const string Delete = "Permissions.Customers.Delete";
    }
    public static class Stock
    {
        public const string View = "Permissions.Stock.View";
        public const string Supply = "Permissions.Stock.Supply"; // Mədaxil
    }
    public static class Users
    {
        public const string View = "Permissions.Users.View";
        public const string Manage = "Permissions.Users.Manage";
    }

    public static List<string> GeneratePermissionsForModule(string module)
    {
        return new List<string>
        {
            $"Permissions.{module}.View",
            $"Permissions.{module}.Create",
            $"Permissions.{module}.Edit",
            $"Permissions.{module}.Delete",
        };
    }

    public static List<string> GetAllPermissions()
    {
        var allPermissions = new List<string>();
        // Reflection could be used here, but manual list is safer/faster for now
        allPermissions.Add(Products.View); allPermissions.Add(Products.Create); allPermissions.Add(Products.Edit); allPermissions.Add(Products.Delete);
        allPermissions.Add(Customers.View); allPermissions.Add(Customers.Create); allPermissions.Add(Customers.Edit); allPermissions.Add(Customers.Delete);
        allPermissions.Add(Stock.View); allPermissions.Add(Stock.Supply);
        allPermissions.Add(Users.View); allPermissions.Add(Users.Manage);
        return allPermissions;
    }
}
