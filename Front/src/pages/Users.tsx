import { useEffect, useState } from 'react';
import { Plus, Search, Trash2, User, Shield } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import api from '@/lib/axios';
import { cn } from '@/lib/utils'; // Keep cn
// We will add User type to index.ts shortly, defining locally for now to avoid errors if viewed before update.
// Actually, better to import. I will update types/index.ts in next step.
// For now I will assume it exists.

interface UserDto {
    id: string;
    email: string;
    roles: string[];
}

const Users = () => {
    const [users, setUsers] = useState<UserDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        role: 'User'
    });

    const fetchUsers = async () => {
        try {
            const response = await api.get<UserDto[]>('/users');
            setUsers(response.data);
        } catch (error) {
            console.error('Failed to fetch users', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/users', formData);
            setIsModalOpen(false);
            setFormData({ email: '', password: '', role: 'User' });
            fetchUsers();
            alert('User created successfully!');
        } catch (error) {
            console.error('Failed to create user', error);
            alert('Error creating user.');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this user?')) return;
        try {
            await api.delete(`/users/${id}`);
            fetchUsers();
        } catch (error) {
            console.error('Failed to delete user', error);
        }
    };

    return (
        <div className="flex flex-col h-full font-sans">
            <div className="flex justify-between items-center mb-4 bg-gray-50 p-2 border border-gray-200 rounded-sm">
                <div className="flex items-center gap-2">
                    <h1 className="text-lg font-bold text-gray-700 px-2 border-r border-gray-300">Administration: Users</h1>
                    <Button onClick={() => setIsModalOpen(true)} size="sm" className="bg-yellow-400 text-black border border-yellow-500 hover:bg-yellow-500 rounded-sm h-8">
                        <Plus className="h-4 w-4 mr-1" /> Add Employee
                    </Button>
                </div>
            </div>

            <div className="flex-1 overflow-auto border border-gray-300 bg-white rounded-sm shadow-sm relative">
                <table className="w-full text-sm text-left border-collapse">
                    <thead className="bg-[#fffbea] sticky top-0 z-10 text-gray-700 font-semibold">
                        <tr className="border-b border-gray-300">
                            <th className="px-4 py-2 border-r border-gray-200">Email / Username</th>
                            <th className="px-4 py-2 border-r border-gray-200 w-32">Roles</th>
                            <th className="px-4 py-2 w-24 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {users.map((user, index) => (
                            <tr key={user.id} className={cn("hover:bg-blue-50", index % 2 === 0 ? "bg-white" : "bg-gray-50")}>
                                <td className="px-4 py-2 border-r border-gray-100 flex items-center gap-2">
                                    <User className="h-4 w-4 text-gray-400" />
                                    {user.email}
                                </td>
                                <td className="px-4 py-2 border-r border-gray-100">
                                    {user.roles.map(r => (
                                        <span key={r} className="inline-block bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs border border-gray-300 mr-1">
                                            {r}
                                        </span>
                                    ))}
                                </td>
                                <td className="px-4 py-2 text-center">
                                    <button onClick={() => handleDelete(user.id)} className="text-red-600 hover:bg-red-50 p-1 rounded">
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Register New Employee">
                <form onSubmit={handleCreate} className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-sm font-semibold text-gray-700">Email</label>
                        <Input
                            type="email"
                            required
                            value={formData.email}
                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-sm font-semibold text-gray-700">Password</label>
                        <Input
                            type="password"
                            required
                            minLength={6}
                            value={formData.password}
                            onChange={e => setFormData({ ...formData, password: e.target.value })}
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-sm font-semibold text-gray-700">Role</label>
                        <select
                            className="w-full h-10 border border-gray-300 rounded-sm px-3"
                            value={formData.role}
                            onChange={e => setFormData({ ...formData, role: e.target.value })}
                        >
                            <option value="SuperAdmin">SuperAdmin</option>
                            <option value="Admin">Admin</option>
                            <option value="Manager">Manager</option>
                            <option value="SalesWorker">Sales Worker</option>
                            <option value="WarehouseWorker">Warehouse Worker</option>
                            <option value="Accountant">Accountant</option>
                            <option value="User">User</option>
                        </select>
                    </div>
                    <div className="pt-4 flex justify-end gap-2 border-t border-gray-100 mt-4">
                        <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                        <Button type="submit" className="bg-yellow-400 text-black hover:bg-yellow-500">Register User</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Users;
