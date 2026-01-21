import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';
import { DollarSign, ShoppingBag, TrendingUp, Package } from 'lucide-react';
import api from '@/lib/axios';
import { formatCurrency } from '@/lib/utils';


interface DashboardStats {
    totalSales: number;
    totalProfit: number;
    totalOrders: number;
    stockValue: number;
}

interface SalesReportItem {
    date: string;
    revenue: number;
    profit: number;
    orderCount: number;
}

const Reports = () => {
    // KPI Data
    const { data: stats, isLoading: statsLoading } = useQuery({
        queryKey: ['dashboard-stats'],
        queryFn: async () => {
            const res = await api.get<DashboardStats>('/reports/dashboard');
            return res.data;
        }
    });

    // Chart Data
    const { data: salesData = [], isLoading: chartLoading } = useQuery({
        queryKey: ['sales-report'],
        queryFn: async () => {
            const res = await api.get<SalesReportItem[]>('/reports/sales');
            return res.data;
        }
    });

    if (statsLoading || chartLoading) return <div className="p-8 text-center">Loading Analytics...</div>;

    const cards = [
        { title: 'Total Revenue', value: formatCurrency(stats?.totalSales || 0), icon: DollarSign, color: 'text-green-600', bg: 'bg-green-100' },
        { title: 'Total Profit', value: formatCurrency(stats?.totalProfit || 0), icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-100' },
        { title: 'Total Orders', value: stats?.totalOrders, icon: ShoppingBag, color: 'text-purple-600', bg: 'bg-purple-100' },
        { title: 'Stock Value', value: formatCurrency(stats?.stockValue || 0), icon: Package, color: 'text-orange-600', bg: 'bg-orange-100' },
    ];

    return (
        <div className="flex flex-col h-full font-sans space-y-6">
            <h1 className="text-xl font-bold text-gray-800 px-2 border-l-4 border-yellow-400">Reports & Analytics</h1>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {cards.map((card, idx) => (
                    <div key={idx} className="bg-white p-6 rounded shadow-sm border border-gray-200 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">{card.title}</p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">{card.value}</p>
                        </div>
                        <div className={`p-3 rounded-full ${card.bg}`}>
                            <card.icon className={`h-6 w-6 ${card.color}`} />
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-[400px]">
                {/* Sales Chart */}
                <div className="bg-white p-6 rounded shadow-sm border border-gray-200 flex flex-col">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Sales Trend (Revenue)</h3>
                    <div className="flex-1 w-full min-h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={salesData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                                <YAxis tick={{ fontSize: 12 }} />
                                <Tooltip
                                    formatter={(value: number | undefined) => formatCurrency(value || 0)}
                                    contentStyle={{ borderRadius: '4px', border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
                                />
                                <Bar dataKey="revenue" fill="#fbbf24" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Placeholder for Profit or Top Products */}
                <div className="bg-white p-6 rounded shadow-sm border border-gray-200">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Profit Analysis</h3>
                    <div className="flex items-center justify-center h-full text-gray-400">
                        Top Products Table Coming Soon
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Reports;
