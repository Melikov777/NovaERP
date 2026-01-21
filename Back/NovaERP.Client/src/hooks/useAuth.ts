import { useAuthStore } from '@/store/useAuthStore';
import { authApi } from '@/api/auth';
import { LoginDto } from '@/types';
import { useState } from 'react';

export const useAuth = () => {
    const store = useAuthStore();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const login = async (data: LoginDto) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await authApi.login(data);
            store.login(response.token, response.email, response.roles);
            return true;
        } catch (err: any) {
            setError(err.response?.data?.message || 'Login failed');
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    return {
        ...store,
        login,
        isLoading,
        error,
    };
};
