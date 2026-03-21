'use client';

import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const coupleNav = [
    { href: '/couple', label: 'Bảng điều khiển', icon: '📊' },
    { href: '/couple/edit', label: 'Chỉnh sửa thiệp', icon: '✏️' },
    { href: '/couple/qr', label: 'Mã QR & Link', icon: '📱' },
    { href: '/couple/rsvp', label: 'Khách mời', icon: '👥' },
    { href: '/couple/wishes', label: 'Lời chúc', icon: '💌' },
];

export default function CoupleLayout({ children }: { children: React.ReactNode }) {
    const { user, loading, logout, isCouple } = useAuth();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const pathname = usePathname();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) router.push('/login');
        if (!loading && user && !isCouple) router.push('/admin');
    }, [loading, user, isCouple, router]);

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
            <header className="md:hidden h-16 bg-white border-b border-slate-100 flex items-center justify-between px-6 fixed top-0 left-0 right-0 z-50">
                <Link href="/couple" className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-primary text-white rounded-md flex justify-center items-center font-bold text-sm">W</div>
                    <span className="font-display font-semibold text-slate-900 tracking-tight text-lg">WeddingApp</span>
                </Link>
                <button 
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="p-2 text-slate-500 hover:text-slate-900"
                >
                    {isMobileMenuOpen ? '✕' : '☰'}
                </button>
            </header>

            {/* Overlay */}
            {isMobileMenuOpen && (
                <div 
                    className="fixed inset-0 bg-black/20 z-40 md:hidden backdrop-blur-[2px] transition-opacity"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`w-64 bg-white border-r border-slate-200 flex flex-col fixed top-0 bottom-0 left-0 z-40 transition-transform duration-300 h-screen ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
                <div className="h-16 hidden md:flex items-center border-b border-slate-100 px-6">
                    <Link href="/couple" className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-primary text-white rounded-md flex justify-center items-center font-bold text-sm">
                            W
                        </div>
                        <span className="font-display font-semibold text-lg text-slate-900 tracking-tight">
                            WeddingApp
                        </span>
                    </Link>
                </div>

                <nav className="flex-1 p-4 space-y-1 overflow-y-auto mt-16 md:mt-0">
                    {coupleNav.map((item) => {
                        const active = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${active
                                    ? 'bg-rose-50 text-primary'
                                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                                    }`}
                            >
                                <span>{item.icon}</span>
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-slate-100">
                    <div className="px-3 py-2 mb-2">
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Tài khoản</p>
                        <p className="text-sm font-medium text-slate-900 truncate mt-1">{user.email}</p>
                    </div>
                    <button
                        onClick={logout}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-500 hover:text-red-600 hover:bg-red-50 w-full transition-colors"
                    >
                        <span>🚪</span>
                        Đăng xuất
                    </button>
                </div>
            </aside>

            {/* Main content */}
            <main className="flex-1 md:ml-64 overflow-auto pt-16 md:pt-0">
                <div className="p-4 md:p-8 max-w-6xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
