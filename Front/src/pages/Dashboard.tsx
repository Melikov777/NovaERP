import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { DollarSign, Package, ShoppingCart, Users } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import api from "@/lib/axios";
import { Sale, Product, Customer } from "@/types";

const Dashboard = () => {
    const [stats, setStats] = useState([
        { title: "Total Revenue", value: 0, icon: DollarSign, trend: "0%", color: "text-green-600" },
        { title: "Sales", value: 0, icon: ShoppingCart, trend: "0", color: "text-blue-600" },
        { title: "Products", value: 0, icon: Package, trend: "0", color: "text-indigo-600" },
        { title: "Customers", value: 0, icon: Users, trend: "0", color: "text-orange-600" },
    ]);

    const [recentSales, setRecentSales] = useState<Sale[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // Fetch all data in parallel
                const [salesRes, productsRes, customersRes] = await Promise.all([
                    api.get<Sale[]>('/sales'),
                    api.get<Product[]>('/products'),
                    api.get<Customer[]>('/customers')
                ]);

                const sales = salesRes.data;
                const products = productsRes.data;
                const customers = customersRes.data;

                // Calculate Stats
                const totalRevenue = sales.reduce((sum, sale) => sum + sale.finalAmount, 0);
                const totalSales = sales.length;
                const totalProducts = products.length;
                const totalCustomers = customers.length;

                // Update Stats State
                setStats([
                    { title: "Total Revenue", value: totalRevenue, icon: DollarSign, trend: "+20.1%", color: "text-green-600" },
                    { title: "Sales", value: totalSales, icon: ShoppingCart, trend: "+12%", color: "text-blue-600" },
                    { title: "Products", value: totalProducts, icon: Package, trend: "+4", color: "text-indigo-600" },
                    { title: "Customers", value: totalCustomers, icon: Users, trend: "+10%", color: "text-orange-600" },
                ]);

                // Get Recent Sales (Last 5)
                const sortedSales = [...sales].sort((a, b) => new Date(b.saleDate).getTime() - new Date(a.saleDate).getTime());
                setRecentSales(sortedSales.slice(0, 5));

            } catch (error) {
                console.error("Failed to fetch dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (loading) {
        return <div className="p-8 text-center">Loading dashboard data...</div>;
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Dashboard</h2>
                <div className="flex items-center space-x-2">
                    <span className="text-sm text-slate-500">Last updated: Just now</span>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat, index) => (
                    <Card key={index} className="hover:shadow-lg transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-slate-600">
                                {stat.title}
                            </CardTitle>
                            <stat.icon className={`h-4 w-4 ${stat.color}`} />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                                {typeof stat.value === 'number' && stat.title.includes('Revenue')
                                    ? formatCurrency(stat.value)
                                    : stat.value}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                <span className="text-green-500 font-medium">{stat.trend}</span> from last month
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Sales Overview</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[200px] flex items-center justify-center text-slate-500 border border-dashed rounded-lg bg-slate-50">
                            Chart visualization coming soon
                        </div>
                    </CardContent>
                </Card>
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Recent Sales</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-8">
                            {recentSales.length === 0 ? (
                                <p className="text-sm text-slate-500">No sales found.</p>
                            ) : (
                                recentSales.map((sale) => (
                                    <div key={sale.id} className="flex items-center">
                                        <div className="h-9 w-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs uppercase">
                                            {sale.customerName?.substring(0, 2) || 'CS'}
                                        </div>
                                        <div className="ml-4 space-y-1">
                                            <p className="text-sm font-medium leading-none truncate w-[120px]">
                                                {sale.customerName || 'Unknown Customer'}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {new Date(sale.saleDate).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div className="ml-auto font-medium text-green-600">
                                            +{formatCurrency(sale.finalAmount)}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default Dashboard;
