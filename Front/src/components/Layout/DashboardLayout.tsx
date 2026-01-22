import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ShoppingCart, Package, Users, LogOut, Menu, Shield, ArrowDownCircle, Warehouse as WarehouseIcon, RefreshCw, TrendingUp } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/lib/utils';
import { useState } from 'react';

const DashboardLayout = () => {
    const { user, logout } = useAuthStore();
    const location = useLocation();
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const { hasPermission } = useAuthStore();

    // Define items with required permissions
    const navItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/' }, // Visible to all
        { icon: ShoppingCart, label: 'Sales (POS)', path: '/pos', permission: 'Permissions.Products.View' },
        { icon: Package, label: 'Products', path: '/products', permission: 'Permissions.Products.View' },
        { icon: WarehouseIcon, label: 'Warehouses', path: '/warehouses', permission: 'Permissions.Stock.View' },
        { icon: ArrowDownCircle, label: 'Stock Ops', path: '/warehouse', permission: 'Permissions.Stock.View' },
        { icon: RefreshCw, label: 'Stock Log', path: '/stock-movements', permission: 'Permissions.Stock.View' },
        { icon: TrendingUp, label: 'Reports', path: '/reports', permission: 'Permissions.Stock.View' },
        { icon: Users, label: 'Customers', path: '/customers', permission: 'Permissions.Customers.View' },
        { icon: Shield, label: 'Users', path: '/users', permission: 'Permissions.Users.View' },
        { icon: Shield, label: 'Roles', path: '/roles', permission: 'Permissions.Users.View' },
    ];

    const filteredNavItems = navItems.filter(item =>
        !item.permission || hasPermission(item.permission)
    );

    return (
        <div className="min-h-screen bg-[var(--c1-bg)] flex flex-col font-sans text-[#333]">
            {/* Classic 1C Toolbar Header */}
            <header className="h-10 bg-gradient-to-b from-[#FFF9C4] to-[#F9E79F] border-b border-[var(--c1-border)] flex items-center px-2 justify-between select-none">
                <div className="flex items-center gap-2">
                    <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-1 hover:bg-[#F9E79F] border border-transparent hover:border-orange-300 rounded-[2px]">
                        <Menu className="h-4 w-4 text-gray-800" />
                    </button>
                    <div className="flex items-center gap-2 border-l border-gray-300 pl-3 ml-1">
                        <span className="font-bold text-gray-900 text-[14px]">Nova ERP: Enterprise</span>
                    </div>
                </div>

                <div className="flex items-center gap-3 text-xs">
                    <span className="text-gray-600">User: <b>{user?.email}</b></span>
                    <div className="h-4 w-px bg-gray-400 mx-1"></div>
                    <button onClick={handleLogout} className="hover:bg-red-100 px-2 py-0.5 border border-transparent hover:border-red-300 rounded-[2px] transition-colors text-red-700 flex items-center gap-1">
                        <LogOut className="h-3 w-3" /> Exit
                    </button>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden relative">
                {/* 1C Sidebar */}
                <aside
                    className={cn(
                        "bg-[#F2F2F2] border-r border-[#A0A0A0] w-60 flex flex-col transition-all duration-150 absolute inset-y-0 left-0 z-10 md:relative",
                        !isSidebarOpen && "w-0 border-none overflow-hidden"
                    )}
                >
                    <div className="flex flex-col py-2">
                        {filteredNavItems.map((item) => {
                            const isActive = location.pathname === item.path;
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={cn(
                                        "flex items-center gap-3 px-3 py-1.5 text-[13px] border-y border-transparent transition-colors mx-1 rounded-[1px]",
                                        isActive
                                            ? "bg-[#FAE95D] border-[#EACF00] text-black font-semibold"
                                            : "text-gray-700 hover:bg-[#E0E0E0]"
                                    )}
                                >
                                    <item.icon className="h-4 w-4 opacity-80" />
                                    {item.label}
                                </Link>
                            );
                        })}
                    </div>

                    <div className="mt-auto p-2 border-t border-gray-300 bg-[#E8E8E8]">
                        <p className="text-[11px] text-gray-500 text-center">v2.0.1 (Stable)</p>
                    </div>
                </aside>

                {/* Main Content Area (Work Area) */}
                <main className="flex-1 overflow-hidden bg-white relative flex flex-col">
                    {/* Tab Bar Simulation */}
                    <div className="h-8 bg-[#F0F0F0] border-b border-gray-300 flex items-end px-2 gap-1">
                        <div className="px-4 py-1.5 bg-white border-t border-x border-gray-300 rounded-t-[3px] text-xs font-bold text-gray-700 relative -mb-px">
                            {navItems.find(i => i.path === location.pathname)?.label || 'Dashboard'}
                        </div>
                    </div>

                    <div className="flex-1 overflow-auto p-2 bg-[#FAF9F5]">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
