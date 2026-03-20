'use client';

import { useState, FormEvent, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { API_BASE } from '@/lib/api';

function ResetPasswordForm() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get('token');

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!token) {
            setError('Mã xác thực không hợp lệ hoặc đã thiếu.');
        }
    }, [token]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        setMessage('');

        if (password !== confirmPassword) {
            setError('Mật khẩu xác nhận không khớp.');
            return;
        }

        if (password.length < 6) {
            setError('Mật khẩu phải có ít nhất 6 ký tự.');
            return;
        }

        setLoading(true);

        try {
            const res = await fetch(`${API_BASE}/iam/auth/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, newPassword: password }),
            });
            const data = await res.json();
            if (res.ok) {
                setMessage('Mật khẩu của bạn đã được cập nhật thành công.');
                setTimeout(() => router.push('/login'), 3000);
            } else {
                setError(data.message || 'Mã xác thực không hợp lệ hoặc đã hết hạn.');
            }
        } catch {
            setError('Lỗi kết nối máy chủ.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="card p-8 bg-white shadow-sm border border-slate-200 rounded-xl">
            {message && (
                <div className="mb-6 p-4 rounded-lg bg-green-50 text-green-700 border border-green-100 text-sm">
                    {message}
                    <p className="mt-2 text-xs opacity-70 italic">Đang chuyển hướng về trang đăng nhập...</p>
                </div>
            )}
            {error && (
                <div className="mb-6 p-4 rounded-lg bg-red-50 text-red-700 border border-red-100 text-sm">
                    {error}
                </div>
            )}

            {!message && token && (
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-700">Mật khẩu mới</label>
                        <input
                            type="password"
                            className="input-field"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-700">Xác nhận mật khẩu mới</label>
                        <input
                            type="password"
                            className="input-field"
                            placeholder="••••••••"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button type="submit" className="btn-primary w-full mt-2" disabled={loading}>
                        {loading ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}
                    </button>
                </form>
            )}

            <div className="text-center mt-6">
                <Link href="/login" className="text-sm font-medium text-slate-500 hover:text-primary transition-colors">
                    ← Quay lại đăng nhập
                </Link>
            </div>
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="w-full max-w-[400px]">
                <div className="text-center mb-8">
                    <Link href="/login" className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary text-white font-bold text-xl mb-4 shadow-sm">
                        W
                    </Link>
                    <h1 className="text-2xl font-bold text-slate-900 font-display">Đặt lại mật khẩu</h1>
                    <p className="text-slate-500 mt-2 text-sm">Tạo mật khẩu mới cho tài khoản của bạn</p>
                </div>

                <Suspense fallback={<div className="text-center text-slate-400">Đang tải...</div>}>
                    <ResetPasswordForm />
                </Suspense>
            </div>
        </div>
    );
}
