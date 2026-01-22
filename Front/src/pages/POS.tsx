import { useEffect, useState } from 'react';
import { ShoppingCart, Trash2, CheckCircle, LayoutGrid } from 'lucide-react';
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
                return { ...item, quantity: newQty };
            }
            return item;
        }));
    };

    const removeFromCart = (productId: number) => {
        setCart(prev => prev.filter(item => item.product.id !== productId));
    };

    const subtotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    const tax = subtotal * 0.1;
    const total = subtotal + tax;

    const handleCheckout = async () => {
        if (!selectedCustomer) return alert('Please select a customer');
        if (cart.length === 0) return alert('Cart is empty');

        setProcessing(true);
        try {
            const payload = {
                customerId: selectedCustomer.id,
                discountAmount: 0,
                notes: "POS Sale",
                saleItems: cart.map(item => ({
                    productId: item.product.id,
                    quantity: item.quantity,
                    unitPrice: item.product.price,
                    discountAmount: 0
                }))
            };

            await api.post('/sales', payload);
            setCart([]);
            alert('Sale registered successfully.');
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
        <div className="flex h-[calc(100vh-8rem)] gap-2 font-sans select-none">
            {/* Left: Product Catalog */}
            <div className="flex-1 flex flex-col bg-white border border-[var(--c1-border)]">
                {/* Toolbar */}
                <div className="h-10 px-3 border-b border-[var(--c1-border)] bg-[var(--c1-header-bg)] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <LayoutGrid className="h-4 w-4 text-gray-600" />
                        <span className="font-bold text-[14px] text-gray-800">Product Catalog</span>
                    </div>
                    <input
                        placeholder="Search products..."
                        className="input-1c w-64"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {/* Product Grid */}
                <div className="flex-1 overflow-auto p-2 bg-[var(--c1-bg)]">
                    <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">
                        {loading ? (
                            <p className="col-span-full text-center p-4 text-gray-500">Loading catalog...</p>
                        ) : filteredProducts.length === 0 ? (
                            <p className="col-span-full text-center p-4 text-gray-500">No products found</p>
                        ) : (
                            filteredProducts.map(product => (
                                <button
                                    key={product.id}
                                    className={cn(
                                        "flex flex-col items-center justify-between p-2 bg-white border border-[var(--c1-border-light)]",
                                        "hover:border-blue-400 hover:bg-blue-50 transition-all h-24 active:scale-95"
                                    )}
                                    onClick={() => addToCart(product)}
                                >
                                    <div className="text-[12px] text-gray-800 font-medium text-center line-clamp-2 w-full">
                                        {product.name}
                                    </div>
                                    <div className="mt-1 w-full flex justify-between items-end border-t border-gray-100 pt-1">
                                        <span className="text-[10px] text-gray-400">Stk: {product.stockQuantity}</span>
                                        <span className="font-bold text-[13px] text-blue-700">{formatCurrency(product.price)}</span>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Right: Receipt / Cart */}
            <div className="w-[420px] flex flex-col bg-white border border-[var(--c1-border)]">
                {/* Cart Header */}
                <div className="h-10 px-3 border-b border-[var(--c1-border)] bg-[#EBF5FB] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <ShoppingCart className="h-4 w-4 text-blue-600" />
                        <span className="font-bold text-[14px] text-gray-800">Current Receipt</span>
                    </div>
                    <span className="text-[11px] text-gray-500">#{String(Date.now()).slice(-6)}</span>
                </div>

                {/* Customer Select */}
                <div className="px-3 py-2 border-b border-[var(--c1-border-light)] bg-gray-50">
                    <label className="text-[11px] font-semibold text-gray-500 uppercase">Client / Counterparty</label>
                    <select
                        className="input-1c w-full mt-1"
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
                    <table className="w-full text-[13px]">
                        <thead className="bg-[#EBF5FB] sticky top-0">
                            <tr className="border-b border-[var(--c1-border)]">
                                <th className="px-2 py-1.5 text-left font-semibold text-gray-700">Item</th>
                                <th className="px-2 py-1.5 text-center font-semibold text-gray-700 w-20">Qty</th>
                                <th className="px-2 py-1.5 text-right font-semibold text-gray-700 w-20">Total</th>
                                <th className="px-1 py-1.5 w-8"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {cart.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="p-8 text-center text-gray-400 italic">
                                        Select products to add to cart...
                                    </td>
                                </tr>
                            ) : (
                                cart.map((item, idx) => (
                                    <tr
                                        key={item.product.id}
                                        className={cn(
                                            "border-b border-[var(--c1-border-light)] hover:bg-[var(--c1-active-item)]",
                                            idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                                        )}
                                    >
                                        <td className="px-2 py-2">
                                            <div className="font-medium text-gray-800 truncate max-w-[140px]">{item.product.name}</div>
                                            <div className="text-[10px] text-gray-500">@{formatCurrency(item.product.price)}</div>
                                        </td>
                                        <td className="px-2 py-2 text-center">
                                            <div className="inline-flex items-center border border-[var(--c1-border-light)] bg-white">
                                                <button
                                                    onClick={() => updateQuantity(item.product.id, -1)}
                                                    className="px-2 py-0.5 hover:bg-gray-100 text-gray-600 border-r border-[var(--c1-border-light)]"
                                                >
                                                    -
                                                </button>
                                                <span className="px-3 font-mono text-center min-w-[32px]">{item.quantity}</span>
                                                <button
                                                    onClick={() => updateQuantity(item.product.id, 1)}
                                                    className="px-2 py-0.5 hover:bg-gray-100 text-gray-600 border-l border-[var(--c1-border-light)]"
                                                >
                                                    +
                                                </button>
                                            </div>
                                        </td>
                                        <td className="px-2 py-2 text-right font-semibold text-gray-800">
                                            {formatCurrency(item.product.price * item.quantity)}
                                        </td>
                                        <td className="px-1 py-2 text-center">
                                            <button
                                                onClick={() => removeFromCart(item.product.id)}
                                                className="p-1 text-red-500 hover:bg-red-50 border border-transparent hover:border-red-200"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Totals & Checkout */}
                <div className="p-3 bg-gray-50 border-t border-[var(--c1-border)] space-y-2">
                    <div className="flex justify-between text-[13px]">
                        <span className="text-gray-600">Subtotal:</span>
                        <span className="font-semibold">{formatCurrency(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-[13px]">
                        <span className="text-gray-600">Tax (10%):</span>
                        <span className="font-semibold">{formatCurrency(tax)}</span>
                    </div>

                    <div className="flex justify-between items-center bg-blue-50 p-2 border border-blue-200">
                        <span className="text-[15px] font-bold text-gray-800">TOTAL:</span>
                        <span className="text-[18px] font-bold text-blue-700">{formatCurrency(total)}</span>
                    </div>

                    <button
                        className={cn(
                            "w-full h-11 text-[14px] font-bold flex items-center justify-center gap-2",
                            cart.length === 0 || processing
                                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                : "bg-green-600 hover:bg-green-700 text-white"
                        )}
                        disabled={cart.length === 0 || processing}
                        onClick={handleCheckout}
                    >
                        {processing ? (
                            'Processing...'
                        ) : (
                            <>
                                <CheckCircle className="h-5 w-5" /> PROCESS PAYMENT
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default POS;
