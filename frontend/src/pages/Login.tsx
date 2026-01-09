import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Lock, LogIn, User } from 'lucide-react';
import { api } from '../lib/api';

export default function Login() {
    const { register, handleSubmit } = useForm();
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const onSubmit = async (data: any) => {
        try {
            const formData = new URLSearchParams();
            formData.append('username', data.username);
            formData.append('password', data.password);

            const res = await api.post('/auth/token', formData, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            });
            localStorage.setItem('token', res.data.access_token);
            navigate('/admin');
        } catch (e) {
            setError('Invalid credentials');
        }
    };

    return (
        <div className="max-w-md mx-auto mt-20">
            <div className="glass-panel p-8">
                <div className="flex justify-center mb-6">
                    <div className="bg-blue-100 p-4 rounded-full">
                        <Lock className="text-blue-600" size={32} />
                    </div>
                </div>
                <h2 className="text-2xl font-bold text-center mb-8 text-slate-800">Admin Access</h2>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium mb-2 text-slate-700">Username</label>
                        <div className="relative">
                            <User className="absolute left-3 top-3 text-slate-500" size={18} />
                            <input
                                {...register('username')}
                                className="glass-input w-full pl-10"
                                placeholder="admin"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2 text-slate-700">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 text-slate-500" size={18} />
                            <input
                                type="password"
                                {...register('password')}
                                className="glass-input w-full pl-10"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    {error && <p className="text-red-400 text-sm text-center">{error}</p>}

                    <button type="submit" className="glass-button w-full flex justify-center gap-2">
                        <LogIn size={18} />
                        Login
                    </button>

                    <div className="text-center text-xs text-slate-400 mt-4 bg-blue-50/50 p-2 rounded border border-blue-100">
                        <p>Demo Credentials:</p>
                        <p>Username: <span className="font-mono font-medium text-slate-600">admin</span></p>
                        <p>Password: <span className="font-mono font-medium text-slate-600">password123</span></p>
                    </div>
                </form>
            </div>
        </div>
    );
}
