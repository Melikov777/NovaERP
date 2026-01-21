import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Lock, User } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const navigate = useNavigate();
    const { login } = useAuthStore();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        try {
            await login({ email, password });
            navigate('/');
        } catch (err) {
            setError('Auth failed. Check credentials.');
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center font-sans">
            <div className="w-full max-w-sm bg-white border border-gray-300 shadow-lg rounded-sm overflow-hidden">
                {/* 1C Header Strip */}
                <div className="h-1 bg-yellow-400 w-full mb-6"></div>

                <div className="px-8 pb-8">
                    <div className="text-center mb-8">
                        <div className="mx-auto w-12 h-12 bg-red-600 rounded-md flex items-center justify-center text-white font-bold text-xl mb-4 shadow-sm">
                            1C
                        </div>
                        <h1 className="text-xl font-bold text-gray-800">Nova ERP</h1>
                        <p className="text-sm text-gray-500 mt-1">Enterprise Resource Planning</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <div className="p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-sm">
                                {error}
                            </div>
                        )}

                        <div className="space-y-1">
                            <label className="text-xs font-semibold uppercase text-gray-500 tracking-wider">Username / Email</label>
                            <div className="relative">
                                <User className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                <Input
                                    type="email"
                                    placeholder="admin@test.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="pl-9 h-10 rounded-sm border-gray-300 focus:border-yellow-500 focus:ring-yellow-500/20"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-semibold uppercase text-gray-500 tracking-wider">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                <Input
                                    type="password"
                                    placeholder="••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="pl-9 h-10 rounded-sm border-gray-300 focus:border-yellow-500 focus:ring-yellow-500/20"
                                    required
                                />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-semibold h-10 rounded-sm border border-yellow-500 shadow-sm transition-colors"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Connecting...' : 'Enter System'}
                        </Button>
                    </form>

                    <div className="mt-6 text-center text-xs text-gray-400">
                        © 2026 NovaERP System v2.0
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
