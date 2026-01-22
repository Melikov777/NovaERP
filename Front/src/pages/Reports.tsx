import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';
import { DollarSign, Package } from 'lucide-react';
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

    const handleExport = () => {
        if (!salesData.length) return;

        const headers = ['Date', 'Revenue', 'Profit', 'Orders'];
        const rows = salesData.map(item => [
            item.date,
            item.revenue,
            item.profit,
            item.orderCount
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `sales_report_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (statsLoading || chartLoading) return <div className="p-4 text-xs text-gray-500">Loading Enterprise Analytics...</div>;

    const cards = [
        { title: 'Total Revenue', value: formatCurrency(stats?.totalSales || 0), color: 'text-green-700', border: 'border-l-4 border-green-500' },
        { title: 'Total Profit', value: formatCurrency(stats?.totalProfit || 0), color: 'text-blue-700', border: 'border-l-4 border-blue-500' },
        { title: 'Total Orders', value: stats?.totalOrders, color: 'text-purple-700', border: 'border-l-4 border-purple-500' },
        { title: 'Stock Value', value: formatCurrency(stats?.stockValue || 0), color: 'text-orange-700', border: 'border-l-4 border-orange-500' },
    ];

    return (
        <div className="flex flex-col h-full gap-2 font-sans select-none">
            {/* Enterprise Toolbar */}
            <div className="flex justify-between items-center bg-[#F2F2F2] p-1.5 border border-[var(--c1-border)] rounded-[2px] shadow-sm">
                <div className="flex items-center gap-2">
                    <h1 className="text-[14px] font-bold text-gray-800 px-2">Reports Center</h1>
                    <div className="h-4 w-px bg-gray-400 mx-1"></div>
                    <span className="text-[12px] text-gray-500">Overview & KPIs</span>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={handleExport} className="btn-1c flex items-center gap-1">
                        <DollarSign className="h-3.5 w-3.5 text-green-600" /> Export CSV
                    </button>
                    <button className="btn-1c">Print</button>
                </div>
            </div>

            {/* KPI Row */}
            <div className="grid grid-cols-4 gap-2">
                {cards.map((card, idx) => (
                    <div key={idx} className={`bg-white p-2 border border-[var(--c1-border)] shadow-sm ${card.border}`}>
                        <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">{card.title}</p>
                        <p className={`text-[18px] font-bold ${card.color}`}>{card.value}</p>
                    </div>
                ))}
            </div>

            {/* Charts Row */}
            <div className="flex-1 grid grid-cols-2 gap-2 min-h-0">
                {/* Sales Chart Panel */}
                <div className="bg-white border border-[var(--c1-border)] flex flex-col p-2 shadow-sm">
                    <div className="flex justify-between items-center mb-2 border-b border-gray-100 pb-1">
                        <h3 className="text-[13px] font-bold text-gray-800">Revenue Trend (30 Days)</h3>
                        <div className="flex gap-1">
                            <div className="w-3 h-3 bg-yellow-400 rounded-[1px]"></div>
                            <span className="text-[10px] text-gray-500">Sales</span>
                        </div>
                    </div>
                    <div className="flex-1 w-full min-h-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={salesData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#6B7280' }} axisLine={{ stroke: '#E5E7EB' }} />
                                <YAxis tick={{ fontSize: 10, fill: '#6B7280' }} axisLine={false} />
                                <Tooltip
                                    cursor={{ fill: '#F3F4F6' }}
                                    formatter={(value: any) => [formatCurrency(Number(value) || 0), 'Revenue']}
                                    contentStyle={{
                                        borderRadius: '2px',
                                        border: '1px solid #E5E7EB',
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                                        fontSize: '12px',
                                        padding: '4px 8px'
                                    }}
                                />
                                <Bar dataKey="revenue" fill="#F59E0B" radius={[2, 2, 0, 0]} maxBarSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Profit/Table Panel */}
                <div className="bg-white border border-[var(--c1-border)] flex flex-col p-2 shadow-sm relative overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
                        <Package className="w-32 h-32" />
                    </div>
                    <h3 className="text-[13px] font-bold text-gray-800 border-b border-gray-100 pb-1 mb-2">Profit Analysis</h3>
                    <div className="flex-1 flex flex-col justify-center items-center text-gray-400 text-xs">
                        <p>Detailed profit breakdown table enabled in PRO version.</p>
                        <button className="mt-2 btn-1c text-gray-600">Request Access</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Reports;
