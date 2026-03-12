'use client';

import { useEffect, useState } from 'react';
import { weddingApi, interactionApi, WeddingResponse, StatsResponse } from '@/lib/api';
import Link from 'next/link';

export default function CoupleDashboard() {
    const [wedding, setWedding] = useState<WeddingResponse | null>(null);
    const [stats, setStats] = useState<StatsResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [noWedding, setNoWedding] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const wRes = await weddingApi.getMine();
            setWedding(wRes.data);
            
            // Fetch stats separately to avoid hiding wedding if stats fail
            try {
                const sRes = await interactionApi.getMyStats(wRes.data.id);
                setStats(sRes.data);
            } catch (err) {
                console.error("Failed to load statistics:", err);
                // Stats failure is non-fatal for showing the wedding
            }
        } catch (err) {
            console.error("Failed to load wedding:", err);
            setNoWedding(true);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="animate-pulse space-y-8">
                <div className="flex justify-between">
                    <div className="space-y-4 w-1/2">
                        <div className="h-10 bg-slate-200 w-2/3 rounded-lg"></div>
                        <div className="h-5 bg-slate-200 w-1/2 rounded-lg"></div>
                    </div>
                    <div className="h-8 bg-slate-200 w-32 rounded-lg"></div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="card p-5 h-24 bg-slate-100 rounded-xl"></div>
                    ))}
                </div>

                <div className="grid sm:grid-cols-3 gap-5">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="card p-6 h-40 bg-slate-100 rounded-xl"></div>
                    ))}
                </div>
            </div>
        );
    }

    if (noWedding) {
        return (
            <div className="card p-12 text-center max-w-2xl mx-auto mt-10">
                <div className="w-16 h-16 bg-rose-50 text-primary text-3xl rounded-full flex items-center justify-center mx-auto mb-6">
                    💒
                </div>
                <h2 className="font-display text-2xl font-bold text-slate-900 mb-2">Chưa có thiệp cưới</h2>
                <p className="text-slate-500 mb-8">Bạn chưa tạo mẫu thiệp cưới nào. Bắt đầu thiết kế ngay để gửi cho bạn bè!</p>
                <Link href="/couple/edit" className="btn-primary px-8">
                    Tạo thiệp cưới mới
                </Link>
            </div>
        );
    }

    const publicUrl = wedding?.slug ? `${window.location.origin}/wedding/${wedding.slug}` : '';

    return (
        <div className="animate-fade-in-up">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="font-display text-3xl font-bold text-slate-900 mb-1">
                        Bảng điều khiển
                    </h1>
                    <p className="text-slate-500 text-sm">
                        Thiệp cưới của <span className="font-semibold text-slate-900">{wedding?.groomName}</span> & <span className="font-semibold text-slate-900">{wedding?.brideName}</span>
                    </p>
                </div>
                <div>
                    {wedding?.isPublished ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            Đang hoạt động (Đã xuất bản)
                        </span>
                    ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-100">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                            Bản nháp
                        </span>
                    )}
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="card p-5">
                    <p className="text-sm font-medium text-slate-500 mb-1">Lượt truy cập</p>
                    <p className="text-3xl font-display font-bold text-slate-900">{stats?.totalVisits || 0}</p>
                </div>
                <div className="card p-5">
                    <p className="text-sm font-medium text-slate-500 mb-1">Tổng khách RSVP</p>
                    <p className="text-3xl font-display font-bold text-slate-900">{stats?.totalRsvps || 0}</p>
                </div>
                <div className="card p-5">
                    <p className="text-sm font-medium text-slate-500 mb-1">Sẽ tham dự</p>
                    <p className="text-3xl font-display font-bold text-emerald-500">{stats?.attendingCount || 0}</p>
                </div>
                <div className="card p-5">
                    <p className="text-sm font-medium text-slate-500 mb-1">Không đến</p>
                    <p className="text-3xl font-display font-bold text-slate-400">{stats?.notAttendingCount || 0}</p>
                </div>
            </div>

            {/* Public URL */}
            {wedding?.isPublished && publicUrl && (
                <div className="card p-6 mb-8 border-primary/20 bg-rose-50/30">
                    <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                        🔗 Đường dẫn thiệp cưới của bạn
                    </h3>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <input
                            type="text"
                            readOnly
                            value={publicUrl}
                            className="input-field flex-1 font-mono text-sm bg-white"
                        />
                        <button
                            onClick={() => navigator.clipboard.writeText(publicUrl)}
                            className="btn-primary whitespace-nowrap"
                        >
                            Sao chép link
                        </button>
                    </div>
                </div>
            )}

            {/* Quick actions */}
            <div className="grid sm:grid-cols-3 gap-5">
                <Link href="/couple/edit" className="card p-6 hover:shadow-md transition-shadow group cursor-pointer border-transparent hover:border-slate-300">
                    <div className="w-10 h-10 bg-slate-100 text-slate-600 rounded-lg flex items-center justify-center text-xl mb-4 group-hover:bg-primary group-hover:text-white transition-colors">
                        ✏️
                    </div>
                    <h3 className="font-bold text-slate-900 mb-1 group-hover:text-primary transition-colors">Chỉnh sửa thiệp</h3>
                    <p className="text-sm text-slate-500 leading-relaxed">Cập nhật nội dung, ảnh bìa, câu chuyện và màu sắc chủ đạo.</p>
                </Link>
                <Link href="/couple/rsvp" className="card p-6 hover:shadow-md transition-shadow group cursor-pointer border-transparent hover:border-slate-300">
                    <div className="w-10 h-10 bg-slate-100 text-slate-600 rounded-lg flex items-center justify-center text-xl mb-4 group-hover:bg-primary group-hover:text-white transition-colors">
                        👥
                    </div>
                    <h3 className="font-bold text-slate-900 mb-1 group-hover:text-primary transition-colors">Khách mời RSVP</h3>
                    <p className="text-sm text-slate-500 leading-relaxed">Quản lý danh sách khách xác nhận tham dự tiệc cưới của bạn.</p>
                </Link>
                <Link href="/couple/wishes" className="card p-6 hover:shadow-md transition-shadow group cursor-pointer border-transparent hover:border-slate-300">
                    <div className="w-10 h-10 bg-slate-100 text-slate-600 rounded-lg flex items-center justify-center text-xl mb-4 group-hover:bg-primary group-hover:text-white transition-colors">
                        💌
                    </div>
                    <h3 className="font-bold text-slate-900 mb-1 group-hover:text-primary transition-colors">Lời chúc phúc</h3>
                    <p className="text-sm text-slate-500 leading-relaxed">Đọc và quản lý những lời chúc yêu thương từ bạn bè và người thân.</p>
                </Link>
            </div>
        </div>
    );
}
