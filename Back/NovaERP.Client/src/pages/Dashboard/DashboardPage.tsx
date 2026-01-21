import { Card, CardHeader, CardTitle, CardContent } from '@/components/Card';
import { useProducts } from '@/hooks/useProducts';
import { Package, DollarSign, Activity } from 'lucide-react';

export default function DashboardPage() {
    const { data: products } = useProducts();

    const stats = [
        {
            title: "Total Products",
            value: products?.length || 0,
            icon: Package,
            description: "Active products in inventory"
        },
        {
            title: "Total Value",
            value: `$${products?.reduce((acc, p) => acc + (p.price * p.stockQuantity), 0).toFixed(2) || '0.00'}`,
            icon: DollarSign,
            description: "Estimated inventory value"
        },
        {
            title: "Low Stock",
            value: products?.filter(p => p.stockQuantity < p.minStockLevel).length || 0,
            icon: Activity,
            description: "Products below min stock level"
        }
    ];

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>

            <div className="grid gap-4 md:grid-cols-3">
                {stats.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <Card key={index}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    {stat.title}
                                </CardTitle>
                                <Icon className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stat.value}</div>
                                <p className="text-xs text-muted-foreground">
                                    {stat.description}
                                </p>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
