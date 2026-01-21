import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Package, ArrowDownCircle, ExternalLink, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import api from '@/lib/axios';
import { Product } from '@/types';
import { formatCurrency, cn } from '@/lib/utils';
import { useState } from 'react';

// Zod Schema for Validation
const supplySchema = z.object({
    productId: z.string().min(1, "Product is required"),
    quantity: z.number().min(1, "Quantity must be at least 1"),
    costPrice: z.number().min(0, "Cost must be positive"),
});

type SupplyFormData = z.infer<typeof supplySchema>;

const Warehouse = () => {
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);

    // React Query: Fetch Products
    const { data: products = [], isLoading } = useQuery({
        queryKey: ['products'],
        queryFn: async () => {
            const res = await api.get<Product[]>('/products');
            return res.data;
        }
    });

    // React Hook Form
    const { register, handleSubmit, formState: { errors }, reset } = useForm<SupplyFormData>({
        resolver: zodResolver(supplySchema),
        defaultValues: {
            quantity: 1,
            costPrice: 0
        }
    });

    // React Query Mutation: Supply
    const mutation = useMutation({
        mutationFn: async (data: SupplyFormData) => {
            await api.post('/products/supply', {
                productId: Number(data.productId),
                quantity: data.quantity,
                costPrice: data.costPrice
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
            setIsModalOpen(false);
            reset();
            alert('Supply registered successfully!');
        },
        onError: () => {
            alert('Failed to register supply.');
        }
    });

    const onSubmit = (data: SupplyFormData) => {
        mutation.mutate(data);
    };

    // Calculate Total Inventory Value
    const totalValue = products.reduce((sum, p) => sum + (p.stockQuantity * p.cost), 0);
    const lowStockCount = products.filter(p => p.stockQuantity <= p.minStockLevel).length;

    return (
        <div className="flex flex-col h-full font-sans">
            <div className="flex justify-between items-center mb-4 bg-gray-50 p-2 border border-gray-200 rounded-sm">
                <div className="flex items-center gap-2">
                    <h1 className="text-lg font-bold text-gray-700 px-2 border-r border-gray-300">Warehouse Management</h1>
                    <Button onClick={() => setIsModalOpen(true)} size="sm" className="bg-yellow-400 text-black border border-yellow-500 hover:bg-yellow-500 rounded-sm h-8">
                        <ArrowDownCircle className="h-4 w-4 mr-1" /> New Supply (Mədaxil)
                    </Button>
                </div>
                <div className="flex items-center gap-4 text-sm">
                    <div className="flex flex-col items-end">
                        <span className="text-gray-500 text-xs uppercase">Total Value</span>
                        <span className="font-bold text-gray-800">{formatCurrency(totalValue)}</span>
                    </div>
                    <div className="flex flex-col items-end">
                        <span className="text-gray-500 text-xs uppercase">Low Stock</span>
                        <span className={cn("font-bold", lowStockCount > 0 ? "text-red-600" : "text-green-600")}>
                            {lowStockCount} Items
                        </span>
                    </div>
                </div>
            </div>

            {/* Stock Table */}
            <div className="flex-1 overflow-auto border border-gray-300 bg-white rounded-sm shadow-sm relative">
                <table className="w-full text-sm text-left border-collapse">
                    <thead className="bg-[#fffbea] sticky top-0 z-10 text-gray-700 font-semibold">
                        <tr className="border-b border-gray-300">
                            <th className="px-4 py-2 border-r border-gray-200 w-16">ID</th>
                            <th className="px-4 py-2 border-r border-gray-200">Product</th>
                            <th className="px-4 py-2 border-r border-gray-200 text-right w-32">Avg Cost</th>
                            <th className="px-4 py-2 border-r border-gray-200 text-right w-32">Sale Price</th>
                            <th className="px-4 py-2 border-r border-gray-200 text-center w-32">In Stock</th>
                            <th className="px-4 py-2 w-32 text-right">Total Value</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {isLoading ? (
                            <tr><td colSpan={6} className="p-8 text-center text-gray-500">Loading stock...</td></tr>
                        ) : (
                            products.map((p, index) => (
                                <tr key={p.id} className={cn("hover:bg-blue-50", index % 2 === 0 ? "bg-white" : "bg-gray-50")}>
                                    <td className="px-4 py-1.5 border-r border-gray-100 text-gray-500">{p.id}</td>
                                    <td className="px-4 py-1.5 border-r border-gray-100 font-medium text-gray-800">
                                        {p.name}
                                        {p.stockQuantity <= p.minStockLevel && (
                                            <span className="ml-2 text-[10px] bg-red-100 text-red-600 px-1 rounded border border-red-200">LOW</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-1.5 border-r border-gray-100 text-right text-gray-600">{formatCurrency(p.cost)}</td>
                                    <td className="px-4 py-1.5 border-r border-gray-100 text-right text-blue-700 font-semibold">{formatCurrency(p.price)}</td>
                                    <td className="px-4 py-1.5 border-r border-gray-100 text-center font-bold">{p.stockQuantity}</td>
                                    <td className="px-4 py-1.5 text-right font-mono text-gray-800">{formatCurrency(p.stockQuantity * p.cost)}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Supply Modal */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Register Supply (Mədaxil)">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="bg-yellow-50 p-3 text-xs text-gray-600 border border-yellow-200 rounded-sm mb-4">
                        Register new stock arrival. This will increase quantity and update the last cost price.
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-bold text-gray-700">Product</label>
                        <select
                            {...register("productId")}
                            className="w-full h-10 border border-gray-300 rounded-sm px-2 text-sm focus:ring-yellow-500 focus:border-yellow-500"
                        >
                            <option value="">Select Product...</option>
                            {products.map(p => (
                                <option key={p.id} value={p.id}>{p.name} (Cur: {p.stockQuantity})</option>
                            ))}
                        </select>
                        {errors.productId && <p className="text-red-500 text-xs">{errors.productId.message}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-sm font-bold text-gray-700">Quantity</label>
                            <Input
                                type="number"
                                {...register("quantity", { valueAsNumber: true })}
                                className="rounded-sm border-gray-300"
                            />
                            {errors.quantity && <p className="text-red-500 text-xs">{errors.quantity.message}</p>}
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-bold text-gray-700">Cost per Unit</label>
                            <Input
                                type="number" step="0.01"
                                {...register("costPrice", { valueAsNumber: true })}
                                className="rounded-sm border-gray-300"
                            />
                            {errors.costPrice && <p className="text-red-500 text-xs">{errors.costPrice.message}</p>}
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end gap-2 border-t border-gray-100">
                        <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                        <Button type="submit" disabled={mutation.isPending} className="bg-green-600 hover:bg-green-700 text-white">
                            {mutation.isPending ? 'Processing...' : 'Post Document'}
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Warehouse;
