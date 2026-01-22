import { Routes, Route, Navigate } from 'react-router-dom';
import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
import POS from '@/pages/POS';
import Products from '@/pages/Products';
import Warehouse from '@/pages/Warehouse'; // Renaming to Stock Operations?
import Warehouses from '@/pages/Warehouses';
import StockMovements from '@/pages/StockMovements';
import Reports from '@/pages/Reports';
import Customers from '@/pages/Customers';
import UsersPage from '@/pages/Users';
import RolesPage from '@/pages/Roles';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import PermissionGuard from '@/components/Auth/PermissionGuard';
import { useAuthStore } from '@/store/authStore';
import { useEffect } from 'react';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const { isAuthenticated } = useAuthStore();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }
    return <>{children}</>;
};

function App() {
    const checkAuth = useAuthStore((state) => state.checkAuth);

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    return (
        <Routes>
            <Route path="/login" element={<Login />} />

            <Route path="/" element={
                <ProtectedRoute>
                    <DashboardLayout />
                </ProtectedRoute>
            }>
                <Route index element={<Dashboard />} />
                <Route path="pos" element={<POS />} />
                <Route path="products" element={
                    <PermissionGuard permission="Permissions.Products.View">
                        <Products />
                    </PermissionGuard>
                } />
                <Route path="warehouse" element={
                    <PermissionGuard permission="Permissions.Stock.View">
                        <Warehouse />
                    </PermissionGuard>
                } />
                <Route path="warehouses" element={
                    <PermissionGuard permission="Permissions.Stock.View">
                        <Warehouses />
                    </PermissionGuard>
                } />
                <Route path="stock-movements" element={
                    <PermissionGuard permission="Permissions.Stock.View">
                        <StockMovements />
                    </PermissionGuard>
                } />
                <Route path="reports" element={
                    <PermissionGuard permission="Permissions.Stock.View">
                        <Reports />
                    </PermissionGuard>
                } />
                <Route path="customers" element={
                    <PermissionGuard permission="Permissions.Customers.View">
                        <Customers />
                    </PermissionGuard>
                } />
                <Route path="users" element={
                    <PermissionGuard permission="Permissions.Users.View">
                        <UsersPage />
                    </PermissionGuard>
                } />
                <Route path="roles" element={
                    <PermissionGuard permission="Permissions.Users.View">
                        <RolesPage />
                    </PermissionGuard>
                } />
            </Route>
        </Routes>
    );
}

export default App;
