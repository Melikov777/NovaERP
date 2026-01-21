import { useEffect, useState } from 'react';
import { Search, ShoppingCart, Trash2, Plus, Minus, CheckCircle, User, CreditCard, LayoutGrid } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent } from '@/components/ui/Card';
import api from '@/lib/axios';
import { Product, Customer } from '@/types';
import { formatCurrency, cn } from '@/lib/utils';

interface CartItem {
    product: Product;
    quantity: number;
}

const POS = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [prodRes, custRes] = await Promise.all([
                    api.get<Product[]>('/products'),
                    api.get<Customer[]>('/customers')
                ]);
                setProducts(prodRes.data);
                setCustomers(custRes.data);
                if (custRes.data.length > 0) setSelectedCustomer(custRes.data[0]);
            } catch (error) {
                console.error('Failed to fetch data', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const addToCart = (product: Product) => {
        setCart(prev => {
            const existing = prev.find(item => item.product.id === product.id);
            if (existing) {
                return prev.map(item =>
                    item.product.id === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }
            return [...prev, { product, quantity: 1 }];
        });
    };

    const updateQuantity = (productId: number, delta: number) => {
        setCart(prev => prev.map(item => {
            if (item.product.id === productId) {
                const newQty = Math.max(1, item.quantity + delta);
                // Optional: Check stock limits here
                return { ...item, quantity: newQty };
            }
            return item;
        }));
    };

    const removeFromCart = (productId: number) => {
        setCart(prev => prev.filter(item => item.product.id !== productId));
    };

    const subtotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    const tax = subtotal * 0.1; // 10% tax example
    const total = subtotal + tax;

    const handleCheckout = async () => {
        if (!selectedCustomer) return alert('Please select a customer');
        if (cart.length === 0) return alert('Cart is empty');

        setProcessing(true);
        try {
            const payload = {
                customerId: selectedCustomer.id,
                discountAmount: 0,
                notes: "POS Sale (1C Interface)",
                saleItems: cart.map(item => ({
                    productId: item.product.id,
                    quantity: item.quantity,
                    unitPrice: item.product.price,
                    discountAmount: 0
                }))
            };

            await api.post('/sales', payload);
            setCart([]);
            alert('Cashier: Sale registered successfully.');
        } catch (error) {
            console.error('Checkout failed', error);
            alert('Error: Register failed. Verify stock levels.');
        } finally {
            setProcessing(false);
        }
    };

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex h-[calc(100vh-8rem)] gap-2 font-sans">
            {/* Left: Product Selector */}
            <div className="flex-1 flex flex-col bg-white border border-gray-300 rounded-sm shadow-sm">
                <div className="p-2 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <LayoutGrid className="h-5 w-5 text-gray-500" />
                        <h2 className="font-bold text-gray-700">Nomenclature (Products)</h2>
                    </div>
                    <Input
                        placeholder="Search product code/name..."
                        className="w-64 h-8 rounded-sm bg-white border-gray-300"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex-1 overflow-auto p-2 bg-gray-100">
                    <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                        {loading ? (
                            <p className="col-span-full text-center p-4">Loading catalog...</p>
                        ) : (
                            filteredProducts.map(product => (
                                <button
                                    key={product.id}
                                    className="flex flex-col items-center justify-between p-2 bg-white border border-gray-300 rounded-sm shadow-sm hover:border-yellow-500 hover:ring-2 hover:ring-yellow-200 transition-all h-24 active:scale-95"
                                    onClick={() => addToCart(product)}
                                >
                                    <div className="text-xs text-gray-800 font-medium text-center line-clamp-2 w-full">{product.name}</div>
                                    <div className="mt-1 w-full flex justify-between items-end border-t border-gray-100 pt-1">
                                        <span className="text-[10px] text-gray-400">Stock: {product.stockQuantity}</span>
                                        <span className="font-bold text-sm text-blue-700">{formatCurrency(product.price)}</span>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Right: Receipt / Cart */}
            <div className="w-[450px] flex flex-col bg-white border border-gray-300 rounded-sm shadow-sm">
                <div className="p-2 border-b border-gray-200 bg-yellow-50 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="bg-yellow-400 p-1 rounded-sm">
                            <ShoppingCart className="h-4 w-4 text-black" />
                        </div>
                        <h2 className="font-bold text-gray-800">Current Receipt</h2>
                    </div>
                    <div className="text-xs text-gray-500">#{Math.floor(Math.random() * 10000)}</div>
                </div>

                {/* Customer Select */}
                <div className="p-2 border-b border-gray-200 bg-gray-50">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Client / Counterparty</label>
                    <select
                        className="w-full mt-1 text-sm p-1.5 rounded-sm border border-gray-300 bg-white focus:ring-yellow-500 focus:border-yellow-500"
                        value={selectedCustomer?.id || ''}
                        onChange={(e) => setSelectedCustomer(customers.find(c => c.id === Number(e.target.value)) || null)}
                    >
                        {customers.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
                </div>

                {/* Cart Items Table */}
                <div className="flex-1 overflow-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-100 sticky top-0 text-gray-600 text-xs">
                            <tr className="border-b border-gray-200">
                                <th className="px-2 py-1.5 font-semibold">Item</th>
                                <th className="px-2 py-1.5 font-semibold text-center w-20">Qty</th>
                                <th className="px-2 py-1.5 font-semibold text-right w-20">Total</th>
                                <th className="px-1 py-1.5 w-8"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {cart.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="p-8 text-center text-gray-400 italic">
                                        Scan items or select from catalog...
                                    </td>
                                </tr>
                            ) : (
                                cart.map(item => (
                                    <tr key={item.product.id} className="hover:bg-blue-50">
                                        <td className="px-2 py-2">
                                            <div className="font-medium text-gray-800 truncate max-w-[150px]">{item.product.name}</div>
                                            <div className="text-[10px] text-gray-500">@{formatCurrency(item.product.price)}</div>
                                        </td>
                                        <td className="px-2 py-2 text-center">
                                            <div className="inline-flex items-center border border-gray-300 rounded-sm bg-white">
                                                <button onClick={() => updateQuantity(item.product.id, -1)} className="px-1 hover:bg-gray-100 text-gray-600">-</button>
                                                <span className="px-2 font-mono text-center min-w-[30px]">{item.quantity}</span>
                                                <button onClick={() => updateQuantity(item.product.id, 1)} className="px-1 hover:bg-gray-100 text-gray-600">+</button>
                                            </div>
                                        </td>
                                        <td className="px-2 py-2 text-right font-semibold text-gray-800">
                                            {formatCurrency(item.product.price * item.quantity)}
                                        </td>
                                        <td className="px-1 py-2 text-center text-red-500 cursor-pointer hover:bg-red-50" onClick={() => removeFromCart(item.product.id)}>
                                            <Trash2 className="h-4 w-4" />
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Totals & Actions */}
                <div className="p-4 bg-gray-50 border-t border-gray-300 space-y-3">
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">Subtotal:</span>
                        <span className="font-bold">{formatCurrency(subtotal)}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">Tax (10%):</span>
                        <span className="font-bold">{formatCurrency(tax)}</span>
                    </div>

                    <div className="flex justify-between items-center bg-yellow-100 p-2 border border-yellow-300 rounded-sm">
                        <span className="text-lg font-bold text-gray-800">TOTAL:</span>
                        <span className="text-xl font-bold text-black">{formatCurrency(total)}</span>
                    </div>

                    <Button
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-bold h-12 text-lg rounded-sm shadow-sm flex items-center justify-center gap-2"
                        disabled={cart.length === 0 || processing}
                        onClick={handleCheckout}
                    >
                        {processing ? (
                            'Processing...'
                        ) : (
                            <>
                                <CheckCircle className="h-6 w-6" /> PROCESS PAYMENT
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default POS;
