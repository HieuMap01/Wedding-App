'use client';

import { useState, FormEvent } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
    const { register } = useAuth();
    const router = useRouter();
    const [form, setForm] = useState({
        email: '',
        password: '',
        fullName: '',
        phone: '',
        address: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await register(form);
            router.push('/couple');
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Đăng ký thất bại. Vui lòng kiểm tra lại thông tin.');
        } finally {
            setLoading(false);
        }
    };

    const update = (field: string, value: string) =>
        setForm((prev) => ({ ...prev, [field]: value }));

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 py-12">
            <div className="w-full max-w-[480px]">
                <div className="text-center mb-8">
                    <Link href="/" className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary text-white font-bold text-xl mb-4 shadow-sm">
                        W
                    </Link>
                    <h1 className="text-2xl font-bold text-slate-900 font-display">Tạo tài khoản</h1>
                    <p className="text-slate-500 mt-2 text-sm">Bắt đầu thiết kế thiệp cưới hoàn toàn miễn phí</p>
                </div>

                <div className="card p-8 bg-white shadow-sm border border-slate-200 rounded-xl">
                    {error && (
                        <div className="mb-6 p-4 rounded-lg bg-red-50 text-red-700 border border-red-100 text-sm">
                            <span className="font-semibold">Lỗi: </span>{error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-slate-700">Họ và tên</label>
                            <input
                                type="text"
                                className="input-field"
                                placeholder="Tên để hiển thị"
                                value={form.fullName}
                                onChange={(e) => update('fullName', e.target.value)}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-slate-700">Email đăng nhập</label>
                            <input
                                type="email"
                                className="input-field"
                                placeholder="name@example.com"
                                value={form.email}
                                onChange={(e) => update('email', e.target.value)}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-slate-700">Mật khẩu</label>
                            <input
                                type="password"
                                className="input-field"
                                placeholder="Tối thiểu 6 ký tự"
                                value={form.password}
                                onChange={(e) => update('password', e.target.value)}
                                required
                                minLength={6}
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-slate-700">Số điện thoại <span className="text-slate-400 font-normal ml-1">tùy chọn</span></label>
                                <input
                                    type="tel"
                                    className="input-field"
                                    placeholder="090..."
                                    value={form.phone}
                                    onChange={(e) => update('phone', e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-slate-700">Địa chỉ <span className="text-slate-400 font-normal ml-1">tùy chọn</span></label>
                                <input
                                    type="text"
                                    className="input-field"
                                    placeholder="Hà Nội"
                                    value={form.address}
                                    onChange={(e) => update('address', e.target.value)}
                                />
                            </div>
                        </div>

                        <button type="submit" className="btn-primary w-full mt-4" disabled={loading}>
                            {loading ? 'Đang tạo tài khoản...' : 'Tạo tài khoản'}
                        </button>
                    </form>
                </div>

                <p className="text-center text-slate-500 text-sm mt-8">
                    Đã có tài khoản?{' '}
                    <Link href="/login" className="text-primary hover:text-primary-hover font-semibold">
                        Đăng nhập
                    </Link>
                </p>
            </div>
        </div>
    );
}
