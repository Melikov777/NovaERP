import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
    token: string | null;
    user: {
        email: string;
        roles: string[];
    } | null;
    isAuthenticated: boolean;
    login: (token: string, email: string, roles: string[]) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            token: null,
            user: null,
            isAuthenticated: false,
            login: (token, email, roles) => {
                localStorage.setItem('token', token);
                set({
                    token,
                    user: { email, roles },
                    isAuthenticated: true
                });
            },
            logout: () => {
                localStorage.removeItem('token');
                set({
                    token: null,
                    user: null,
                    isAuthenticated: false
                });
            },
        }),
        {
            name: 'auth-storage',
            partialize: (state) => ({
                token: state.token,
                user: state.user,
                isAuthenticated: state.isAuthenticated
            }),
        }
    )
);
