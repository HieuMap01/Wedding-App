'use client';

import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';

const adminNav = [
    { href: '/admin', label: 'Bảng điều khiển', icon: '📊' },
    { href: '/admin/couples', label: 'Danh sách cặp đôi', icon: '👫' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { user, loading, logout, isAdmin } = useAuth();
    const pathname = usePathname();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) router.push('/login');
        if (!loading && user && !isAdmin) router.push('/couple');
    }, [loading, user, isAdmin, router]);

    if (loading || !user) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-slate-500 font-medium text-lg">⏳ Đang tải...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex bg-slate-50">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col text-slate-300">
                <div className="h-16 flex items-center border-b border-slate-800 px-6">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-sky-500 text-white rounded-md flex justify-center items-center font-bold text-sm">
                            A
                        </div>
                        <span className="font-display font-semibold text-lg text-white tracking-tight">
                            AdminPanel
                        </span>
                    </Link>
                </div>

                <nav className="flex-1 p-4 space-y-1">
                    {adminNav.map((item) => {
                        const active = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${active
                                        ? 'bg-sky-500/10 text-sky-400'
                                        : 'hover:bg-slate-800 hover:text-white'
                                    }`}
                            >
                                <span className={active ? 'opacity-100' : 'opacity-70'}>{item.icon}</span>
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-slate-800">
                    <div className="px-3 py-2 mb-2">
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tài khoản</p>
                        <p className="text-sm font-medium text-white truncate mt-1">{user.email}</p>
                    </div>
                    <button
                        onClick={logout}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-slate-800 w-full transition-colors"
                    >
                        <span>🚪</span>
                        Đăng xuất
                    </button>
                </div>
            </aside>

            {/* Main content */}
            <main className="flex-1 overflow-auto">
                <div className="p-8 max-w-6xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
