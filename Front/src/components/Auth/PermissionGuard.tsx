import { useAuthStore } from '@/store/authStore';
import { Navigate } from 'react-router-dom';

interface PermissionGuardProps {
    permission: string;
    children: React.ReactNode;
}

const PermissionGuard = ({ permission, children }: PermissionGuardProps) => {
    const { hasPermission } = useAuthStore();

    if (!hasPermission(permission)) {
        return <div className="p-4 text-red-500 bg-red-50 border border-red-200 rounded">Access Denied: Missing Permission '{permission}'</div>;
    }

    return <>{children}</>;
};

export default PermissionGuard;
