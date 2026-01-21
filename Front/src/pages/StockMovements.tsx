import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { ArrowDownCircle, ArrowUpCircle, RefreshCw } from 'lucide-react';
import api from '@/lib/axios';
import { formatCurrency, cn } from '@/lib/utils';
import { useState } from 'react';

interface StockMovementDto {
    id: number;
    productId: number;
    productName: string;
    warehouseId: number;
    warehouseName: string;
    type: string;
    quantity: number;
    costAtTime: number;
    note: string;
    createdAt: string;
    createdBy: string;
}

const StockMovements = () => {
    const [searchParams] = useSearchParams();
    const productId = searchParams.get('productId');

    const { data: movements = [], isLoading } = useQuery({
        queryKey: ['stock-movements', productId],
        queryFn: async () => {
            const params = productId ? { productId } : {};
            const res = await api.get<StockMovementDto[]>('/warehouses/movements', { params });
            return res.data;
        }
    });

    return (
        <div className="flex flex-col h-full font-sans">
            <h1 className="text-lg font-bold text-gray-700 mb-4 px-2 border-l-4 border-yellow-400">
                Stock Movements Log (Hərəkət Jurnalı)
            </h1>

            <div className="flex-1 overflow-auto border border-gray-300 bg-white rounded-sm shadow-sm">
                <table className="w-full text-sm text-left border-collapse">
                    <thead className="bg-[#fffbea] sticky top-0 z-10 text-gray-700 font-semibold">
                        <tr className="border-b border-gray-300">
                            <th className="px-4 py-2 w-24">Date</th>
                            <th className="px-4 py-2">Product</th>
                            <th className="px-4 py-2">Warehouse</th>
                            <th className="px-4 py-2 w-24 text-center">Type</th>
                            <th className="px-4 py-2 w-24 text-right">Qty</th>
                            <th className="px-4 py-2 w-24 text-right">Cost</th>
                            <th className="px-4 py-2">Note</th>
                            <th className="px-4 py-2 w-32">User</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {isLoading ? (
                            <tr><td colSpan={8} className="p-8 text-center text-gray-500">Loading log...</td></tr>
                        ) : (
                            movements.map((m) => (
                                <tr key={m.id} className="hover:bg-blue-50">
                                    <td className="px-4 py-1.5 text-gray-600">{new Date(m.createdAt).toLocaleDateString()}</td>
                                    <td className="px-4 py-1.5 font-medium text-gray-800">{m.productName}</td>
                                    <td className="px-4 py-1.5 text-gray-600">{m.warehouseName}</td>
                                    <td className="px-4 py-1.5 text-center">
                                        <span className={cn(
                                            "px-2 py-0.5 rounded textxs font-bold border",
                                            m.type === 'In' ? "bg-green-100 text-green-700 border-green-200" :
                                                m.type === 'Out' ? "bg-red-100 text-red-700 border-red-200" :
                                                    "bg-blue-100 text-blue-700 border-blue-200"
                                        )}>
                                            {m.type}
                                        </span>
                                    </td>
                                    <td className="px-4 py-1.5 text-right font-bold">{m.quantity}</td>
                                    <td className="px-4 py-1.5 text-right text-gray-500">{formatCurrency(m.costAtTime)}</td>
                                    <td className="px-4 py-1.5 text-gray-500 italic">{m.note}</td>
                                    <td className="px-4 py-1.5 text-gray-500 text-xs">{m.createdBy}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default StockMovements;
