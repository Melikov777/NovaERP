import { Outlet, Navigate, Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';
import { LayoutDashboard, Package, LogOut } from 'lucide-react';
import { cn } from '@/utils/cn';
import { Button } from '@/components/Button';

export const DashboardLayout = () => {
    const { isAuthenticated, logout, user } = useAuthStore();
    const location = useLocation();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    const navItems = [
        { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/products', label: 'Products', icon: Package },
    ];

    return (
        <div className="flex min-h-screen bg-gray-100">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r">
                <div className="h-16 flex items-center px-6 border-b">
                    <span className="text-xl font-bold text-primary">NovaERP</span>
                </div>
                <nav className="p-4 space-y-2">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                to={item.href}
                                className={cn(
                                    "flex items-center gap-3 px-4 py-2 rounded-md text-sm font-medium transition-colors",
                                    isActive
                                        ? "bg-primary text-primary-foreground"
                                        : "text-muted-foreground hover:bg-gray-100 hover:text-foreground"
                                )}
                            >
                                <Icon className="w-4 h-4" />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>
                <div className="absolute bottom-0 w-64 p-4 border-t bg-white">
                    <div className="flex items-center justify-between mb-4">
                        <div className="text-sm">
                            <p className="font-medium">{user?.email}</p>
                            <p className="text-xs text-muted-foreground capitalize">{user?.roles[0]}</p>
                        </div>
                    </div>
                    <Button variant="outline" className="w-full" onClick={logout}>
                        <LogOut className="w-4 h-4 mr-2" />
                        Logout
                    </Button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto">
                <div className="p-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};
