'use client';

import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const adminNav = [
    { href: '/admin', label: 'Bảng điều khiển', icon: '📊' },
    { href: '/admin/couples', label: 'Danh sách cặp đôi', icon: '👫' },
    { href: '/admin/interactions', label: 'Lời chúc & RSVP', icon: '💌' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { user, loading, logout, isAdmin } = useAuth();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const pathname = usePathname();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) router.push('/login');
        if (!loading && user && !isAdmin) router.push('/couple');
    }, [loading, user, isAdmin, router]);

    // Close mobile menu when Route changes
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [pathname]);

    if (loading || !user) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-slate-500 font-medium text-lg">⏳ Đang tải...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
            {/* Mobile Header */}
            <header className="md:hidden h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-6 fixed top-0 left-0 right-0 z-50">
                <Link href="/" className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-sky-500 text-white rounded-md flex justify-center items-center font-bold text-sm">A</div>
                    <span className="font-display font-semibold text-white tracking-tight text-lg">Admin</span>
                </Link>
                <button 
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="p-2 text-slate-300 hover:text-white"
                >
                    {isMobileMenuOpen ? '✕' : '☰'}
                </button>
            </header>

            {/* Overlay */}
            {isMobileMenuOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm transition-opacity"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`w-64 bg-slate-900 border-r border-slate-800 flex flex-col text-slate-300 fixed md:sticky top-0 bottom-0 left-0 z-40 transition-transform duration-300 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
                <div className="h-16 hidden md:flex items-center border-b border-slate-800 px-6">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-sky-500 text-white rounded-md flex justify-center items-center font-bold text-sm">
                            A
                        </div>
                        <span className="font-display font-semibold text-lg text-white tracking-tight">
                            AdminPanel
                        </span>
                    </Link>
                </div>

                <nav className="flex-1 p-4 space-y-1 mt-16 md:mt-0">
                    {adminNav.map((item) => {
                        const active = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all hover:scale-[1.02] active:scale-[0.98] ${active
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
            <main className="flex-1 overflow-auto pt-16 md:pt-0">
                <div className="p-4 md:p-8 max-w-6xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
