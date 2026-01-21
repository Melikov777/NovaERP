import axios from 'axios';

// Create separate instance for public vs protected API calls if needed, 
// but typically one instance with interceptors is enough.

export const api = axios.create({
    baseURL: 'http://localhost:5000/api', // Direct backend URL for now or relative if proxy works
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            // Clear token and redirect to login if authentication fails
            localStorage.removeItem('token');
            // Optimally, use a global navigation method or event to redirect
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);
