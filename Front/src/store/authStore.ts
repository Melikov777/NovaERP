import { create } from 'zustand';
import { AuthResponse, LoginDto } from '@/types';
import api from '@/lib/axios';

interface AuthState {
    user: AuthResponse | null;
    isAuthenticated: boolean;
    permissions: string[];
    login: (data: LoginDto) => Promise<void>;
    logout: () => void;
    checkAuth: () => void;
    hasPermission: (permission: string) => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
    user: null,
    isAuthenticated: false,
    permissions: [],
    login: async (credentials) => {
        const { data } = await api.post<AuthResponse>('/auth/login', credentials);
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data));
        set({ user: data, isAuthenticated: true, permissions: data.permissions || [] });
    },
    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        set({ user: null, isAuthenticated: false, permissions: [] });
    },
    checkAuth: () => {
        const userStr = localStorage.getItem('user');
        const token = localStorage.getItem('token');
        if (userStr && token) {
            const user = JSON.parse(userStr);
            set({ user, isAuthenticated: true, permissions: user.permissions || [] });
        }
    },
    hasPermission: (permission: string) => {
        const { permissions } = get();
        return permissions.includes(permission);
    }
}));
