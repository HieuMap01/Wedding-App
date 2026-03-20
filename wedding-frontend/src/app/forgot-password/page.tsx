'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { API_BASE } from '@/lib/api';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setLoading(true);

        try {
            const res = await fetch(`${API_BASE}/iam/auth/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            const data = await res.json();
            if (res.ok) {
                setMessage(data.message || 'Một liên kết khôi phục đã được gửi đến email của bạn.');
            } else {
                setError(data.message || 'Đã xảy ra lỗi. Vui lòng thử lại.');
            }
        } catch {
            setError('Lỗi kết nối máy chủ.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="w-full max-w-[400px]">
                <div className="text-center mb-8">
                    <Link href="/login" className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary text-white font-bold text-xl mb-4 shadow-sm">
                        W
                    </Link>
                    <h1 className="text-2xl font-bold text-slate-900 font-display">Quên mật khẩu?</h1>
                    <p className="text-slate-500 mt-2 text-sm">Nhập email của bạn để nhận liên kết khôi phục</p>
                </div>

                <div className="card p-8 bg-white shadow-sm border border-slate-200 rounded-xl">
                    {message && (
                        <div className="mb-6 p-4 rounded-lg bg-green-50 text-green-700 border border-green-100 text-sm">
                            {message}
                        </div>
                    )}
                    {error && (
                        <div className="mb-6 p-4 rounded-lg bg-red-50 text-red-700 border border-red-100 text-sm">
                            {error}
                        </div>
                    )}

                    {!message && (
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

                            <button type="submit" className="btn-primary w-full mt-2" disabled={loading}>
                                {loading ? 'Đang gửi...' : 'Gửi yêu cầu'}
                            </button>
                        </form>
                    )}

                    <div className="text-center mt-6">
                        <Link href="/login" className="text-sm font-medium text-slate-500 hover:text-primary transition-colors">
                            ← Quay lại đăng nhập
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
