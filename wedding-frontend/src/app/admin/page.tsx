'use client';

import { useEffect, useState } from 'react';
import { adminApi, WeddingResponse } from '@/lib/api';
import Link from 'next/link';

export default function AdminDashboard() {
    const [stats, setStats] = useState<{ totalCouples: number; totalUsers: number } | null>(null);
    const [weddings, setWeddings] = useState<WeddingResponse[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [sRes, wRes] = await Promise.all([
                adminApi.getStats(),
                adminApi.getAllWeddings(),
            ]);
            setStats(sRes.data);
            setWeddings(wRes.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="animate-pulse space-y-8">
                <div className="h-10 bg-slate-200 w-1/3 rounded-lg"></div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="card p-6 h-32 bg-slate-100 rounded-xl"></div>
                    ))}
                </div>

                <div className="h-8 bg-slate-200 w-1/4 rounded-lg mb-4"></div>
                <div className="card h-64 bg-slate-100 rounded-xl"></div>
            </div>
        );
    }

    return (
        <div className="animate-fade-in-up">
            <h1 className="font-display text-3xl font-bold text-slate-900 mb-8 flex items-center gap-3">
                <span className="text-sky-500">🛡️</span> Bảng tổng quan quản trị
            </h1>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div className="card p-6 border-l-4 border-l-sky-500">
                    <p className="text-sm font-medium text-slate-500 mb-1">Tổng cặp đôi</p>
                    <p className="text-4xl font-display font-bold text-slate-900">{stats?.totalCouples || 0}</p>
                </div>
                <div className="card p-6 border-l-4 border-l-rose-500">
                    <p className="text-sm font-medium text-slate-500 mb-1">Tổng người dùng</p>
                    <p className="text-4xl font-display font-bold text-slate-900">{stats?.totalUsers || 0}</p>
                </div>
                <div className="card p-6 border-l-4 border-l-emerald-500">
                    <p className="text-sm font-medium text-slate-500 mb-1">Tổng thiệp cưới</p>
                    <p className="text-4xl font-display font-bold text-slate-900">{weddings.length}</p>
                </div>
            </div>

            {/* Recent weddings */}
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-slate-900">Danh sách thiệp cưới mới nhất</h2>
            </div>

            {weddings.length === 0 ? (
                <div className="card p-12 text-center text-slate-500 border border-dashed border-slate-300">
                    <div className="text-4xl mb-3">📭</div>
                    Hệ thống chưa có thẻ thiệp cưới nào.
                </div>
            ) : (
                <div className="card overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200">
                                    <th className="p-4 font-semibold text-slate-600 text-sm">ID</th>
                                    <th className="p-4 font-semibold text-slate-600 text-sm">Cặp đôi</th>
                                    <th className="p-4 font-semibold text-slate-600 text-sm">Link (Slug)</th>
                                    <th className="p-4 font-semibold text-slate-600 text-sm">Trạng thái</th>
                                    <th className="p-4 font-semibold text-slate-600 text-sm">Ngày tạo</th>
                                    <th className="p-4 font-semibold text-slate-600 text-sm text-right">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {weddings.map((w) => (
                                    <tr key={w.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="p-4 text-slate-500 text-sm font-mono">#{w.id}</td>
                                        <td className="p-4">
                                            <div className="font-semibold text-slate-900">{w.groomName} & {w.brideName}</div>
                                        </td>
                                        <td className="p-4 text-slate-500 text-sm">/{w.slug}</td>
                                        <td className="p-4">
                                            {w.isPublished ? (
                                                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                    Đã xuất bản
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                                                    Bản nháp
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-4 text-slate-500 text-sm">
                                            {new Date(w.createdAt).toLocaleDateString('vi-VN')}
                                        </td>
                                        <td className="p-4 text-right">
                                            <Link href={`/admin/couples/${w.id}`} className="inline-flex items-center justify-center px-3 py-1.5 border border-slate-200 rounded-md text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 hover:text-sky-600 transition-colors">
                                                Chi tiết
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
