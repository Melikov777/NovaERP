import { useState } from 'react';
import { useProducts, useCreateProduct, useDeleteProduct } from '@/hooks/useProducts';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/Card';
import { Plus, Trash2, Search, Edit } from 'lucide-react';
import { CreateProductDto } from '@/types';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const productSchema = z.object({
    name: z.string().min(1, "Name is required"),
    sku: z.string().optional(),
    price: z.coerce.number().min(0),
    cost: z.coerce.number().min(0),
    stockQuantity: z.coerce.number().int().min(0),
    categoryId: z.coerce.number().int().min(1, "Category is required (Use 1 for now)"),
});

export default function ProductsPage() {
    const { data: products, isLoading } = useProducts();
    const deleteProduct = useDeleteProduct();
    const createProduct = useCreateProduct();
    const [isCreating, setIsCreating] = useState(false);
    const [search, setSearch] = useState('');

    const { register, handleSubmit, reset, formState: { errors } } = useForm<CreateProductDto>({
        resolver: zodResolver(productSchema),
        defaultValues: {
            isActive: true,
            categoryId: 1, // Defaulting for simple test
            minStockLevel: 10
        }
    });

    const onSubmit = (data: CreateProductDto) => {
        createProduct.mutate(data, {
            onSuccess: () => {
                setIsCreating(false);
                reset();
            }
        });
    };

    const filteredProducts = products?.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.sku?.toLowerCase().includes(search.toLowerCase())
    );

    if (isLoading) return <div>Loading products...</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Products</h1>
                <Button onClick={() => setIsCreating(!isCreating)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Product
                </Button>
            </div>

            {isCreating && (
                <Card>
                    <CardHeader>
                        <CardTitle>New Product</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Name</label>
                                    <Input {...register('name')} />
                                    {errors.name && <span className="text-xs text-destructive">{errors.name.message}</span>}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">SKU</label>
                                    <Input {...register('sku')} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Price</label>
                                    <Input type="number" step="0.01" {...register('price')} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Cost</label>
                                    <Input type="number" step="0.01" {...register('cost')} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Stock</label>
                                    <Input type="number" {...register('stockQuantity')} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Category ID</label>
                                    <Input type="number" {...register('categoryId')} />
                                </div>
                            </div>
                            <div className="flex justify-end gap-2">
                                <Button type="button" variant="outline" onClick={() => setIsCreating(false)}>Cancel</Button>
                                <Button type="submit">Create Product</Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            <div className="flex items-center gap-2 max-w-sm">
                <Search className="w-4 h-4 text-muted-foreground" />
                <Input
                    placeholder="Search products..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            <div className="border rounded-md">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b bg-muted/50">
                            <th className="p-4 text-left font-medium">Name</th>
                            <th className="p-4 text-left font-medium">SKU</th>
                            <th className="p-4 text-left font-medium">Price</th>
                            <th className="p-4 text-left font-medium">Stock</th>
                            <th className="p-4 text-right font-medium">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredProducts?.map((product) => (
                            <tr key={product.id} className="border-b last:border-0">
                                <td className="p-4 font-medium">{product.name}</td>
                                <td className="p-4 text-muted-foreground">{product.sku}</td>
                                <td className="p-4">${product.price.toFixed(2)}</td>
                                <td className="p-4">
                                    <span className={cn(
                                        "px-2 py-1 rounded-full text-xs font-medium",
                                        product.stockQuantity < product.minStockLevel
                                            ? "bg-red-100 text-red-700"
                                            : "bg-green-100 text-green-700"
                                    )}>
                                        {product.stockQuantity}
                                    </span>
                                </td>
                                <td className="p-4 text-right">
                                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => deleteProduct.mutate(product.id)}>
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </td>
                            </tr>
                        ))}
                        {filteredProducts?.length === 0 && (
                            <tr>
                                <td colSpan={5} className="p-8 text-center text-muted-foreground">
                                    No products found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
