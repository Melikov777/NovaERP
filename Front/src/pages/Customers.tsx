import { useEffect, useState } from 'react';
import { Plus, Search, Trash2, Edit, Save, X, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import api from '@/lib/axios';
import { Customer } from '@/types';
import { cn } from '@/lib/utils';

// 1C Style Table Component
const Customers = () => {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Modal & Form State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        isActive: true
    });

    const fetchCustomers = async () => {
        setLoading(true);
        try {
            const response = await api.get<Customer[]>('/customers');
            setCustomers(response.data);
        } catch (error) {
            console.error('Failed to fetch customers', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCustomers();
    }, []);

    const openCreate = () => {
        setEditingId(null);
        setFormData({ name: '', email: '', phone: '', address: '', isActive: true });
        setIsModalOpen(true);
    };

    const openEdit = (customer: Customer) => {
        setEditingId(customer.id);
        setFormData({
            name: customer.name,
            email: customer.email || '',
            phone: customer.phone || '',
            address: customer.address || '',
            isActive: customer.isActive
        });
        setIsModalOpen(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingId) {
                // Update
                await api.put(`/customers/${editingId}`, { id: editingId, ...formData });
            } else {
                // Create
                await api.post('/customers', formData);
            }
            setIsModalOpen(false);
            fetchCustomers();
        } catch (error) {
            console.error('Failed to save customer', error);
            alert('Failed to save operation.');
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Delete this customer? This action cannot be undone.')) return;
        try {
            await api.delete(`/customers/${id}`);
            fetchCustomers();
        } catch (error) {
            console.error('Failed to delete', error);
            alert('Could not delete customer. Check if they have active sales.');
        }
    };

    const filteredCustomers = customers.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex flex-col h-full font-sans">
            {/* Toolbar */}
            <div className="flex justify-between items-center mb-4 bg-gray-50 p-2 border border-gray-200 rounded-sm">
                <div className="flex items-center gap-2">
                    <h1 className="text-lg font-bold text-gray-700 px-2 border-r border-gray-300">Customers</h1>
                    <Button onClick={openCreate} size="sm" className="bg-yellow-400 text-black border border-yellow-500 hover:bg-yellow-500 rounded-sm h-8">
                        <Plus className="h-4 w-4 mr-1" /> Create
                    </Button>
                    <Button onClick={fetchCustomers} size="sm" variant="outline" className="h-8 rounded-sm bg-white">
                        <RefreshCw className="h-4 w-4 mr-1" /> Refresh
                    </Button>
                </div>
                <div className="flex items-center">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-gray-400" />
                        <Input
                            placeholder="Filter list..."
                            className="pl-8 h-8 w-64 rounded-sm border-gray-300 text-sm focus:ring-yellow-500/50"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Dense 1C Style Table */}
            <div className="flex-1 overflow-auto border border-gray-300 bg-white rounded-sm shadow-sm relative">
                <table className="w-full text-sm text-left border-collapse">
                    <thead className="bg-[#fffbea] sticky top-0 z-10 text-gray-700 font-semibold">
                        <tr className="border-b border-gray-300">
                            <th className="px-4 py-2 border-r border-gray-200 w-16">ID</th>
                            <th className="px-4 py-2 border-r border-gray-200">Name</th>
                            <th className="px-4 py-2 border-r border-gray-200">Contact Info</th>
                            <th className="px-4 py-2 border-r border-gray-200 w-24 text-center">Status</th>
                            <th className="px-4 py-2 w-32 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loading ? (
                            <tr><td colSpan={5} className="p-8 text-center text-gray-500">Loading data...</td></tr>
                        ) : filteredCustomers.length === 0 ? (
                            <tr><td colSpan={5} className="p-8 text-center text-gray-500">No customers found.</td></tr>
                        ) : (
                            filteredCustomers.map((customer, index) => (
                                <tr
                                    key={customer.id}
                                    className={cn(
                                        "hover:bg-blue-50 transition-colors group cursor-default",
                                        index % 2 === 0 ? "bg-white" : "bg-gray-50"
                                    )}
                                >
                                    <td className="px-4 py-1.5 border-r border-gray-100 text-gray-500">{customer.id}</td>
                                    <td className="px-4 py-1.5 border-r border-gray-100 font-medium text-gray-800">{customer.name}</td>
                                    <td className="px-4 py-1.5 border-r border-gray-100 text-gray-600">
                                        {customer.email && <div className="flex items-center gap-1"><span className="text-gray-400 text-xs">✉</span> {customer.email}</div>}
                                        {customer.phone && <div className="flex items-center gap-1"><span className="text-gray-400 text-xs">📞</span> {customer.phone}</div>}
                                    </td>
                                    <td className="px-4 py-1.5 border-r border-gray-100 text-center">
                                        {customer.isActive ? (
                                            <span className="text-[10px] uppercase font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-sm border border-green-200">Active</span>
                                        ) : (
                                            <span className="text-[10px] uppercase font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded-sm border border-red-200">Inactive</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-1.5 text-center">
                                        <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => openEdit(customer)} className="p-1 hover:bg-yellow-200 rounded text-blue-600" title="Edit">
                                                <Edit className="h-4 w-4" />
                                            </button>
                                            <button onClick={() => handleDelete(customer.id)} className="p-1 hover:bg-red-100 rounded text-red-600" title="Delete">
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingId ? `Edit Customer #${editingId}` : "New Customer Card"}
                className="max-w-xl"
            >
                <form onSubmit={handleSave} className="space-y-4">
                    <div className="bg-yellow-50 p-4 border border-yellow-200 mb-4 rounded-sm text-sm text-gray-700">
                        Please fill in the customer details correctly. Name is mandatory.
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        <div className="space-y-1">
                            <label className="text-sm font-semibold text-gray-700">Full Name <span className="text-red-500">*</span></label>
                            <Input
                                required
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                className="rounded-sm border-gray-300"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-sm font-semibold text-gray-700">Email Address</label>
                                <Input
                                    type="email"
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    className="rounded-sm border-gray-300"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-semibold text-gray-700">Phone Object</label>
                                <Input
                                    value={formData.phone}
                                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                    className="rounded-sm border-gray-300"
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-semibold text-gray-700">Physical Address</label>
                            <Input
                                value={formData.address}
                                onChange={e => setFormData({ ...formData, address: e.target.value })}
                                className="rounded-sm border-gray-300"
                            />
                        </div>

                        <div className="flex items-center gap-2 pt-2">
                            <input
                                type="checkbox"
                                id="active"
                                checked={formData.isActive}
                                onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                                className="rounded border-gray-300 text-yellow-500 focus:ring-yellow-500"
                            />
                            <label htmlFor="active" className="text-sm text-gray-700 select-none">Record is Active</label>
                        </div>
                    </div>

                    <div className="pt-6 flex justify-end gap-2 border-t border-gray-100 mt-4">
                        <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:bg-gray-100">Cancel</Button>
                        <Button type="submit" className="bg-yellow-400 text-black hover:bg-yellow-500 border border-yellow-500">
                            <Save className="h-4 w-4 mr-2" /> Save & Close
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Customers;
