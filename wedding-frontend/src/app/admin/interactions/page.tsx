'use client';

import { useEffect, useState } from 'react';
import { adminApi, WeddingResponse, StatsResponse } from '@/lib/api';
import Link from 'next/link';

interface WeddingWithStats extends WeddingResponse {
    stats?: StatsResponse;
}

export default function AdminInteractionsPage() {
    const [weddings, setWeddings] = useState<WeddingWithStats[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const wRes = await adminApi.getAllWeddings();
            const weddingsData = wRes.data;
            
            // Load stats for each wedding
            const weddingsWithStats = await Promise.all(
                weddingsData.map(async (w) => {
                    try {
                        const sRes = await adminApi.getWeddingStats(w.id);
                        return { ...w, stats: sRes.data };
                    } catch {
                        return w;
                    }
                })
            );
            
            setWeddings(weddingsWithStats);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="flex justify-center p-12 text-slate-400">Đang tải dữ liệu tương tác...</div>;

    return (
        <div className="animate-fade-in-up">
            <div className="flex items-center justify-between mb-8">
                <h1 className="font-display text-3xl font-bold text-slate-900 flex items-center gap-3">
                    <span className="text-rose-500">💌</span> Quản lý tương tác
                </h1>
                <p className="text-slate-500 text-sm">Xem tổng quan RSVP và lời chúc của tất cả thiệp cưới</p>
            </div>

            <div className="grid gap-6">
                {weddings.map((w) => (
                    <div key={w.id} className="card p-6 border border-slate-200 hover:border-sky-300 transition-all group shadow-sm bg-white overflow-hidden relative">
                        {/* Decorative background icon */}
                        <div className="absolute -right-4 -bottom-4 text-7xl opacity-5 transition-transform group-hover:scale-110 group-hover:opacity-10 pointer-events-none">
                            {w.stats?.totalRsvps && w.stats.totalRsvps > 0 ? '📝' : '💌'}
                        </div>
                        
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <h2 className="text-xl font-bold text-slate-900">{w.groomName} & {w.brideName}</h2>
                                    {w.isPublished ? (
                                        <span className="text-[10px] bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded-full border border-emerald-100 font-bold uppercase">LIVE</span>
                                    ) : (
                                        <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full border border-slate-200 font-bold uppercase">DRAFT</span>
                                    )}
                                </div>
                                <p className="text-slate-500 text-sm font-mono truncate max-w-xs transition-colors group-hover:text-sky-600">/{w.slug}</p>
                            </div>

                            <div className="flex flex-wrap items-center gap-4 md:gap-8">
                                <div className="text-center">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter mb-0.5">Truy cập</p>
                                    <p className="text-xl font-display font-bold text-slate-900">{w.stats?.totalVisits || 0}</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter mb-0.5">RSVP</p>
                                    <p className="text-xl font-display font-bold text-sky-600">{w.stats?.totalRsvps || 0}</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter mb-0.5">Tham dự</p>
                                    <p className="text-xl font-display font-bold text-emerald-500">{w.stats?.attendingCount || 0}</p>
                                </div>
                                
                                <Link 
                                    href={`/admin/couples/${w.id}`}
                                    className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-bold shadow-lg shadow-slate-200 hover:bg-sky-600 hover:shadow-sky-100 transition-all active:scale-95"
                                >
                                    Xem chi tiết →
                                </Link>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {weddings.length === 0 && (
                <div className="card p-20 text-center border-2 border-dashed border-slate-200">
                    <p className="text-slate-400 font-medium font-display">Chưa có thiệp cưới nào trên hệ thống.</p>
                </div>
            )}
        </div>
    );
}
