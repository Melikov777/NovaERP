import { useEffect, useState } from 'react';
import { Shield, Users, ChevronRight } from 'lucide-react';
import { DataPageLayout } from '@/components/Layout/DataPageLayout';
import api from '@/lib/axios';
import { cn } from '@/lib/utils';

interface RoleDto {
    name: string;
    permissions: string[];
    userCount?: number;
}

// Sample permission categories for display
const permissionCategories: Record<string, string[]> = {
    'Products': ['Products.View', 'Products.Create', 'Products.Edit', 'Products.Delete'],
    'Users': ['Users.View', 'Users.Manage'],
    'Sales': ['Sales.View', 'Sales.Create'],
    'Reports': ['Reports.View', 'Reports.Export'],
    'Inventory': ['Inventory.View', 'Inventory.Manage'],
};

const Roles = () => {
    const [roles, setRoles] = useState<RoleDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRole, setSelectedRole] = useState<RoleDto | null>(null);

    const fetchRoles = async () => {
        try {
            // Note: This endpoint may not exist yet - using mock data for now
            const response = await api.get<RoleDto[]>('/roles');
            setRoles(response.data);
        } catch (error) {
            console.error('Failed to fetch roles, using default roles', error);
            // Fallback to default roles if endpoint doesn't exist
            setRoles([
                { name: 'SuperAdmin', permissions: Object.values(permissionCategories).flat(), userCount: 1 },
                { name: 'Manager', permissions: ['Products.View', 'Products.Create', 'Products.Edit', 'Sales.View', 'Sales.Create', 'Reports.View'], userCount: 2 },
                { name: 'SalesWorker', permissions: ['Products.View', 'Sales.View', 'Sales.Create'], userCount: 5 },
                { name: 'WarehouseWorker', permissions: ['Products.View', 'Inventory.View', 'Inventory.Manage'], userCount: 3 },
                { name: 'Accountant', permissions: ['Reports.View', 'Reports.Export', 'Sales.View'], userCount: 2 },
                { name: 'User', permissions: ['Products.View'], userCount: 10 },
            ]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRoles();
    }, []);

    const filteredRoles = roles.filter(r =>
        r.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const hasPermission = (role: RoleDto, permission: string) => {
        return role.permissions.includes(permission);
    };

    return (
        <DataPageLayout
            title="Administration: Roles & Permissions"
            searchValue={searchTerm}
            onSearchChange={setSearchTerm}
            actions={<></>}
        >
            <div className="flex h-full">
                {/* Roles List */}
                <div className="w-64 border-r border-[var(--c1-border)] overflow-auto">
                    <div className="bg-[#EBF5FB] px-3 py-2 border-b border-[var(--c1-border-light)] font-semibold text-[12px] text-gray-700">
                        System Roles
                    </div>
                    {loading ? (
                        <div className="p-4 text-center text-gray-500 text-[13px]">Loading...</div>
                    ) : (
                        filteredRoles.map((role) => (
                            <div
                                key={role.name}
                                onClick={() => setSelectedRole(role)}
                                className={cn(
                                    "flex items-center gap-2 px-3 py-2 cursor-pointer text-[13px] border-b border-[var(--c1-border-light)]",
                                    selectedRole?.name === role.name
                                        ? "bg-[var(--c1-active-item)] border-l-2 border-l-blue-500"
                                        : "hover:bg-gray-50"
                                )}
                            >
                                <Shield className="h-4 w-4 text-blue-500" />
                                <span className="flex-1 font-medium">{role.name}</span>
                                <span className="text-[11px] text-gray-400 flex items-center gap-1">
                                    <Users className="h-3 w-3" />
                                    {role.userCount || 0}
                                </span>
                                <ChevronRight className="h-4 w-4 text-gray-300" />
                            </div>
                        ))
                    )}
                </div>

                {/* Permissions Matrix */}
                <div className="flex-1 overflow-auto">
                    {selectedRole ? (
                        <div className="p-4">
                            <div className="flex items-center gap-2 mb-4">
                                <Shield className="h-5 w-5 text-blue-500" />
                                <h2 className="text-[16px] font-bold text-gray-800">{selectedRole.name}</h2>
                                <span className="text-[12px] text-gray-500 ml-2">
                                    ({selectedRole.permissions.length} permissions)
                                </span>
                            </div>

                            <div className="border border-[var(--c1-border)] rounded-[2px] overflow-hidden">
                                <table className="w-full text-[13px]">
                                    <thead className="bg-[#EBF5FB]">
                                        <tr>
                                            <th className="px-3 py-2 text-left font-semibold border-b border-[var(--c1-border)]">
                                                Permission
                                            </th>
                                            <th className="px-3 py-2 text-center font-semibold border-b border-[var(--c1-border)] w-24">
                                                Granted
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {Object.entries(permissionCategories).map(([category, perms]) => (
                                            <>
                                                <tr key={`cat-${category}`} className="bg-gray-50">
                                                    <td colSpan={2} className="px-3 py-1.5 font-semibold text-gray-700 border-b border-[var(--c1-border-light)]">
                                                        {category}
                                                    </td>
                                                </tr>
                                                {perms.map((perm, idx) => (
                                                    <tr
                                                        key={perm}
                                                        className={cn(
                                                            "border-b border-[var(--c1-border-light)]",
                                                            idx % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                                                        )}
                                                    >
                                                        <td className="px-3 py-1.5 pl-6 text-gray-600">
                                                            {perm.split('.')[1]}
                                                        </td>
                                                        <td className="px-3 py-1.5 text-center">
                                                            {hasPermission(selectedRole, perm) ? (
                                                                <span className="inline-block w-5 h-5 bg-green-100 border border-green-300 rounded-sm text-green-600 leading-5">
                                                                    ✓
                                                                </span>
                                                            ) : (
                                                                <span className="inline-block w-5 h-5 bg-gray-100 border border-gray-200 rounded-sm text-gray-300 leading-5">
                                                                    ✗
                                                                </span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400">
                            <Shield className="h-12 w-12 mb-2 opacity-50" />
                            <p className="text-[14px]">Select a role to view permissions</p>
                        </div>
                    )}
                </div>
            </div>
        </DataPageLayout>
    );
};

export default Roles;
