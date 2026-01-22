import { useEffect, useState } from 'react';
import { Plus, Trash2, User, Lock, Unlock, Key } from 'lucide-react';
import { DataPageLayout } from '@/components/Layout/DataPageLayout';
import { Drawer } from '@/components/ui/Drawer';
import api from '@/lib/axios';
import { cn } from '@/lib/utils';

interface UserDto {
    id: string;
    email: string;
    roles: string[];
    isLocked?: boolean;
}

const Users = () => {
    const [users, setUsers] = useState<UserDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);


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
            setIsDrawerOpen(false);
            setFormData({ email: '', password: '', role: 'User' });
            fetchUsers();
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

    const handleLockToggle = async (user: UserDto) => {
        try {
            await api.post(`/users/${user.id}/lock`, { lock: !user.isLocked });
            fetchUsers();
        } catch (error) {
            console.error('Failed to toggle lock', error);
        }
    };

    const handleResetPassword = async (user: UserDto) => {
        const newPassword = prompt('Enter new password (min 6 chars):');
        if (!newPassword || newPassword.length < 6) return;
        try {
            await api.post(`/users/${user.id}/reset-password`, { newPassword });
            alert('Password reset successfully');
        } catch (error) {
            console.error('Failed to reset password', error);
        }
    };

    const filteredUsers = users.filter(u =>
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const openAddDrawer = () => {
        setFormData({ email: '', password: '', role: 'User' });
        setIsDrawerOpen(true);
    };

    const toolbarActions = (
        <>
            <button onClick={openAddDrawer} className="btn-1c-primary flex items-center gap-1">
                <Plus className="h-4 w-4" /> Add User
            </button>
        </>
    );

    return (
        <DataPageLayout
            title="Administration: Users"
            searchValue={searchTerm}
            onSearchChange={setSearchTerm}

            actions={toolbarActions}
        >
            {/* Data Grid */}
            <div className="flex-1 overflow-auto border border-[var(--c1-border)] bg-white">
                <table className="w-full text-[13px] border-collapse">
                    <thead className="bg-[#EBF5FB] sticky top-0 z-10">
                        <tr className="border-b border-[var(--c1-border)]">
                            <th className="px-3 py-2 text-left font-semibold border-r border-[var(--c1-border-light)]">
                                Email / Username
                            </th>
                            <th className="px-3 py-2 text-left font-semibold border-r border-[var(--c1-border-light)] w-48">
                                Roles
                            </th>
                            <th className="px-3 py-2 text-left font-semibold border-r border-[var(--c1-border-light)] w-24">
                                Status
                            </th>
                            <th className="px-3 py-2 text-center font-semibold w-32">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={4} className="px-3 py-8 text-center text-gray-500">
                                    Loading users...
                                </td>
                            </tr>
                        ) : filteredUsers.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-3 py-8 text-center text-gray-500">
                                    No users found
                                </td>
                            </tr>
                        ) : (
                            filteredUsers.map((user, index) => (
                                <tr
                                    key={user.id}
                                    className={cn(
                                        "border-b border-[var(--c1-border-light)] hover:bg-[var(--c1-active-item)]",
                                        index % 2 === 0 ? "bg-white" : "bg-gray-50"
                                    )}
                                >
                                    <td className="px-3 py-2 border-r border-[var(--c1-border-light)]">
                                        <div className="flex items-center gap-2">
                                            <User className="h-4 w-4 text-gray-400" />
                                            <span>{user.email}</span>
                                        </div>
                                    </td>
                                    <td className="px-3 py-2 border-r border-[var(--c1-border-light)]">
                                        <div className="flex flex-wrap gap-1">
                                            {user.roles.map(r => (
                                                <span
                                                    key={r}
                                                    className="inline-block bg-blue-50 text-blue-700 px-2 py-0.5 text-xs border border-blue-200"
                                                >
                                                    {r}
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-3 py-2 border-r border-[var(--c1-border-light)]">
                                        <span className={cn(
                                            "px-2 py-0.5 text-xs border",
                                            user.isLocked
                                                ? "bg-red-50 text-red-700 border-red-200"
                                                : "bg-green-50 text-green-700 border-green-200"
                                        )}>
                                            {user.isLocked ? 'Locked' : 'Active'}
                                        </span>
                                    </td>
                                    <td className="px-3 py-2 text-center">
                                        <div className="flex justify-center gap-1">
                                            <button
                                                onClick={() => handleLockToggle(user)}
                                                className="p-1 hover:bg-gray-100 border border-transparent hover:border-gray-300"
                                                title={user.isLocked ? 'Unlock user' : 'Lock user'}
                                            >
                                                {user.isLocked
                                                    ? <Unlock className="h-4 w-4 text-green-600" />
                                                    : <Lock className="h-4 w-4 text-orange-500" />
                                                }
                                            </button>
                                            <button
                                                onClick={() => handleResetPassword(user)}
                                                className="p-1 hover:bg-gray-100 border border-transparent hover:border-gray-300"
                                                title="Reset password"
                                            >
                                                <Key className="h-4 w-4 text-blue-500" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(user.id)}
                                                className="p-1 hover:bg-red-50 border border-transparent hover:border-red-300"
                                                title="Delete user"
                                            >
                                                <Trash2 className="h-4 w-4 text-red-500" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Status Bar */}
            <div className="h-6 bg-[var(--c1-header-bg)] border-t border-[var(--c1-border)] flex items-center px-3 text-[11px] text-gray-600">
                <span>Total: {filteredUsers.length} user(s)</span>
            </div>

            {/* Add User Drawer */}
            <Drawer
                isOpen={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
                title="Register New User"
                width="400px"
            >
                <form onSubmit={handleCreate} className="flex flex-col h-full">
                    <div className="flex-1 space-y-4 p-4">
                        <div>
                            <label className="block text-[12px] font-semibold text-gray-700 mb-1">
                                Email *
                            </label>
                            <input
                                type="email"
                                required
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                className="input-1c w-full"
                                placeholder="user@company.com"
                            />
                        </div>
                        <div>
                            <label className="block text-[12px] font-semibold text-gray-700 mb-1">
                                Password *
                            </label>
                            <input
                                type="password"
                                required
                                minLength={6}
                                value={formData.password}
                                onChange={e => setFormData({ ...formData, password: e.target.value })}
                                className="input-1c w-full"
                                placeholder="Minimum 6 characters"
                            />
                        </div>
                        <div>
                            <label className="block text-[12px] font-semibold text-gray-700 mb-1">
                                Role *
                            </label>
                            <select
                                className="input-1c w-full"
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
                    </div>

                    {/* Drawer Footer */}
                    <div className="border-t border-[var(--c1-border)] p-3 bg-gray-50 flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={() => setIsDrawerOpen(false)}
                            className="btn-1c"
                        >
                            Cancel
                        </button>
                        <button type="submit" className="btn-1c-primary">
                            Register User
                        </button>
                    </div>
                </form>
            </Drawer>
        </DataPageLayout>
    );
};

export default Users;
