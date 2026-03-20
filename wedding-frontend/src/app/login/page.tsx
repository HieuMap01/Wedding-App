'use client';

import { useState, FormEvent } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const { login } = useAuth();
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login(email, password);
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            if (user.role === 'SUPER_ADMIN') {
                router.push('/admin');
            } else {
                router.push('/couple');
            }
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Đăng nhập thất bại. Vui lòng kiểm tra email và mật khẩu.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="w-full max-w-[400px]">
                <div className="text-center mb-8">
                    <Link href="/" className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary text-white font-bold text-xl mb-4 shadow-sm">
                        W
                    </Link>
                    <h1 className="text-2xl font-bold text-slate-900 font-display">Đăng nhập tài khoản</h1>
                    <p className="text-slate-500 mt-2 text-sm">Điền thông tin để quản lý thiệp cưới</p>
                </div>

                <div className="card p-8 bg-white shadow-sm border border-slate-200 rounded-xl">
                    {error && (
                        <div className="mb-6 p-4 rounded-lg bg-red-50 text-red-700 border border-red-100 text-sm">
                            <span className="font-semibold">Lỗi: </span>{error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-slate-700">Email cá nhân</label>
                            <input
                                type="email"
                                className="input-field"
                                placeholder="name@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                            <div className="flex justify-between items-center">
                                <label className="block text-sm font-medium text-slate-700">Mật khẩu</label>
                                <Link href="/forgot-password" virtual-link="true" className="text-xs font-semibold text-primary hover:text-primary-hover">Quên mật khẩu?</Link>
                            </div>
                            <input
                                type="password"
                                className="input-field"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />

                        <button type="submit" className="btn-primary w-full mt-2" disabled={loading}>
                            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                        </button>
                    </form>
                </div>

                <p className="text-center text-slate-500 text-sm mt-8">
                    Chưa có tài khoản?{' '}
                    <Link href="/register" className="text-primary hover:text-primary-hover font-semibold">
                        Đăng ký ngay
                    </Link>
                </p>
            </div>
        </div>
    );
}
