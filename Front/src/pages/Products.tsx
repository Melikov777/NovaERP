import { useEffect, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Drawer } from '@/components/ui/Drawer';
import { DataPageLayout } from '@/components/Layout/DataPageLayout';
import api from '@/lib/axios';
import { Product } from '@/types';
import { formatCurrency, cn } from '@/lib/utils';

const Products = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        cost: '',
        stockQuantity: '',
        categoryId: 1 // Default to 1 for now
    });

    const fetchProducts = async () => {
        try {
            const response = await api.get<Product[]>('/products');
            setProducts(response.data);
        } catch (error) {
            console.error('Failed to fetch products', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/products', {
                ...formData,
                price: parseFloat(formData.price),
                cost: parseFloat(formData.cost),
                stockQuantity: parseInt(formData.stockQuantity),
                minStockLevel: 5,
                isActive: true
            });
            setIsDrawerOpen(false);
            setFormData({ name: '', price: '', cost: '', stockQuantity: '', categoryId: 1 });
            fetchProducts();
        } catch (error) {
            console.error('Failed to create product', error);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this product?')) return;
        try {
            await api.delete(`/products/${id}`);
            fetchProducts();
        } catch (error) {
            console.error('Failed to delete product', error);
        }
    };

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <>
            <DataPageLayout
                title="Products List"
                searchValue={searchTerm}
                onSearchChange={setSearchTerm}
                onAdd={() => setIsDrawerOpen(true)}
                addLabel="New Product"
            >
                <table className="w-full text-[12px] text-left border-collapse select-text">
                    <thead className="bg-gray-100 sticky top-0 z-10 text-gray-700 font-semibold shadow-sm">
                        <tr>
                            <th className="px-3 py-2 border border-blue-200 border-t-0 border-l-0 bg-[#EBF5FB]">Product Name</th>
                            <th className="px-3 py-2 border border-blue-200 border-t-0 bg-[#EBF5FB] w-32">Price</th>
                            <th className="px-3 py-2 border border-blue-200 border-t-0 bg-[#EBF5FB] w-32">Cost</th>
                            <th className="px-3 py-2 border border-blue-200 border-t-0 bg-[#EBF5FB] w-24">Stock</th>
                            <th className="px-3 py-2 border border-blue-200 border-t-0 bg-[#EBF5FB] w-16 text-center">...</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {loading ? (
                            <tr><td colSpan={5} className="p-4 text-center text-gray-500">Loading data...</td></tr>
                        ) : filteredProducts.length === 0 ? (
                            <tr><td colSpan={5} className="p-4 text-center text-gray-500">No records found.</td></tr>
                        ) : (
                            filteredProducts.map((product, idx) => (
                                <tr key={product.id} className={cn("hover:bg-[#FFF9C4] group cursor-default transition-colors", idx % 2 === 0 ? "bg-white" : "bg-[#F9FAFB]")}>
                                    <td className="px-3 py-1.5 border-r border-gray-200 flex items-center gap-2">
                                        <div className="w-4 h-4 rounded-sm bg-blue-50 border border-blue-200 flex items-center justify-center text-[9px] text-blue-600 font-bold">P</div>
                                        {product.name}
                                    </td>
                                    <td className="px-3 py-1.5 border-r border-gray-200 font-mono text-gray-700">{formatCurrency(product.price)}</td>
                                    <td className="px-3 py-1.5 border-r border-gray-200 font-mono text-gray-500">{formatCurrency(product.cost)}</td>
                                    <td className="px-3 py-1.5 border-r border-gray-200">
                                        <span className={cn(
                                            "inline-block w-8 text-center rounded-[2px] text-[11px] font-bold border",
                                            product.stockQuantity < 5 ? "bg-red-50 text-red-600 border-red-200" : "bg-green-50 text-green-700 border-green-200"
                                        )}>
                                            {product.stockQuantity}
                                        </span>
                                    </td>
                                    <td className="px-2 py-1.5 text-center">
                                        <button onClick={(e) => { e.stopPropagation(); handleDelete(product.id); }} className="text-gray-300 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </DataPageLayout>

            <Drawer title="New Product Card" isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)}>
                <form onSubmit={handleCreate} className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-[12px] font-bold text-gray-600">Product Name</label>
                        <Input
                            required
                            className="input-1c w-full"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-[12px] font-bold text-gray-600">Price (Sell)</label>
                            <Input
                                type="number"
                                required
                                min="0" step="0.01"
                                className="input-1c w-full bg-yellow-50"
                                value={formData.price}
                                onChange={e => setFormData({ ...formData, price: e.target.value })}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[12px] font-bold text-gray-600">Cost (Buy)</label>
                            <Input
                                type="number"
                                required
                                min="0" step="0.01"
                                className="input-1c w-full"
                                value={formData.cost}
                                onChange={e => setFormData({ ...formData, cost: e.target.value })}
                            />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <label className="text-[12px] font-bold text-gray-600">Initial Stock</label>
                        <Input
                            type="number"
                            required
                            min="0"
                            className="input-1c w-full"
                            value={formData.stockQuantity}
                            onChange={e => setFormData({ ...formData, stockQuantity: e.target.value })}
                        />
                    </div>

                    <div className="pt-6 border-t border-gray-100 flex justify-end gap-2">
                        <div className="flex-1"></div>
                        <Button type="button" variant="ghost" onClick={() => setIsDrawerOpen(false)} className="text-gray-500 hover:text-gray-800">Cancel</Button>
                        <Button type="submit" className="btn-1c-primary">Save & Close</Button>
                    </div>
                </form>
            </Drawer>
        </>
    );
};

export default Products;
