'use client';

import { useEffect, useState } from 'react';
import { adminApi, WeddingResponse, StatsResponse, RsvpResponse, WishResponse } from '@/lib/api';
import { useParams } from 'next/navigation';

export default function CoupleDetailPage() {
    const params = useParams();
    const weddingId = Number(params.id);

    const [wedding, setWedding] = useState<WeddingResponse | null>(null);
    const [stats, setStats] = useState<StatsResponse | null>(null);
    const [rsvps, setRsvps] = useState<RsvpResponse[]>([]);
    const [wishes, setWishes] = useState<WishResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'rsvp' | 'wishes'>('rsvp');

    const [rsvpPage, setRsvpPage] = useState(0);
    const [wishPage, setWishPage] = useState(0);
    const [rsvpPageData, setRsvpPageData] = useState({ totalPages: 0, totalElements: 0 });
    const [wishPageData, setWishPageData] = useState({ totalPages: 0, totalElements: 0 });

    useEffect(() => {
        loadData();
    }, [weddingId, rsvpPage, wishPage]);

    const loadData = async () => {
        try {
            setLoading(true);
            const [wRes, sRes, rRes, wishRes] = await Promise.all([
                adminApi.getWeddingById(weddingId),
                adminApi.getWeddingStats(weddingId),
                adminApi.getWeddingRsvps(weddingId, rsvpPage, 10),
                adminApi.getWeddingWishes(weddingId, wishPage, 10),
            ]);
            setWedding(wRes.data);
            setStats(sRes.data);
            setRsvps(rRes.data.content);
            setWishes(wishRes.data.content);
            setRsvpPageData({ totalPages: rRes.data.totalPages, totalElements: rRes.data.totalElements });
            setWishPageData({ totalPages: wishRes.data.totalPages, totalElements: wishRes.data.totalElements });
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="flex justify-center p-12 text-slate-400">Đang tải dữ liệu...</div>;
    if (!wedding) return <div className="card p-12 text-center text-slate-500 max-w-2xl mx-auto my-10">Không tìm thấy thông tin cặp đôi này.</div>;

    return (
        <div className="max-w-6xl animate-fade-in-up pb-10">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="font-display text-3xl font-bold text-slate-900 mb-1 flex items-center gap-2">
                        <span>💍</span> {wedding.groomName} & {wedding.brideName}
                    </h1>
                    <div className="flex flex-wrap items-center gap-3 text-sm mt-2">
                        <span className="text-slate-500">Đường dẫn: <code className="text-sky-600 bg-sky-50 px-1.5 py-0.5 rounded font-mono">/{wedding.slug}</code></span>
                        <span className="text-slate-300">|</span>
                        {wedding.isPublished ? (
                            <span className="inline-flex items-center gap-1.5 text-emerald-700 font-semibold">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Đã xuất bản
                            </span>
                        ) : (
                            <span className="inline-flex items-center gap-1.5 text-slate-500 font-medium">
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span> Nháp
                            </span>
                        )}
                    </div>
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
                    <p className="text-sm font-medium text-slate-500 mb-1">Tham dự</p>
                    <p className="text-3xl font-display font-bold text-emerald-500">{stats?.attendingCount || 0}</p>
                </div>
                <div className="card p-5">
                    <p className="text-sm font-medium text-slate-500 mb-1">Không đến</p>
                    <p className="text-3xl font-display font-bold text-rose-500">{stats?.notAttendingCount || 0}</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6 border-b border-slate-200">
                <button
                    onClick={() => setActiveTab('rsvp')}
                    className={`px-5 py-3 text-sm font-bold transition-all border-b-2 ${activeTab === 'rsvp'
                        ? 'border-sky-500 text-sky-600'
                        : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                        }`}
                >
                    👥 Danh sách khách mời ({rsvpPageData.totalElements})
                </button>
                <button
                    onClick={() => setActiveTab('wishes')}
                    className={`px-5 py-3 text-sm font-bold transition-all border-b-2 ${activeTab === 'wishes'
                        ? 'border-sky-500 text-sky-600'
                        : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                        }`}
                >
                    💌 Lời chúc ({wishPageData.totalElements})
                </button>
            </div>

            {/* RSVP Table */}
            {activeTab === 'rsvp' && (
                rsvps.length === 0 ? (
                    <div className="card p-12 text-center text-slate-500 border border-dashed border-slate-300">
                        Chưa có khách mời nào đăng ký RSVP.
                    </div>
                ) : (
                    <div className="card overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-200">
                                        <th className="p-4 font-semibold text-slate-600 text-sm">STT</th>
                                        <th className="p-4 font-semibold text-slate-600 text-sm">Tên khách</th>
                                        <th className="p-4 font-semibold text-slate-600 text-sm">Số điện thoại</th>
                                        <th className="p-4 font-semibold text-slate-600 text-sm">Trạng thái</th>
                                        <th className="p-4 font-semibold text-slate-600 text-sm max-w-xs">Ghi chú</th>
                                        <th className="p-4 font-semibold text-slate-600 text-sm text-right">Ngày gửi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {rsvps.map((r, i) => (
                                        <tr key={r.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="p-4 text-slate-400 text-sm">{i + 1}</td>
                                            <td className="p-4 font-medium text-slate-900">{r.guestName}</td>
                                            <td className="p-4 text-slate-500 font-mono text-sm">{r.guestPhone || '—'}</td>
                                            <td className="p-4">
                                                {r.attendance === 'ATTENDING' ? (
                                                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                        ✅ Tham dự
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                                                        ❌ Không đến
                                                    </span>
                                                )}
                                            </td>
                                            <td className="p-4 text-slate-600 text-sm max-w-xs truncate" title={r.wishes || ''}>
                                                {r.wishes || '—'}
                                            </td>
                                            <td className="p-4 text-slate-500 text-sm text-right">
                                                {new Date(r.createdAt).toLocaleString('vi-VN')}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {rsvpPageData.totalPages > 1 && (
                            <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 bg-slate-50">
                                <button
                                    onClick={() => setRsvpPage(p => Math.max(0, p - 1))}
                                    disabled={rsvpPage === 0}
                                    className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Trang trước
                                </button>
                                <span className="text-sm text-slate-600">
                                    Trang <span className="font-medium text-slate-900">{rsvpPage + 1}</span> / {rsvpPageData.totalPages}
                                </span>
                                <button
                                    onClick={() => setRsvpPage(p => Math.min(rsvpPageData.totalPages - 1, p + 1))}
                                    disabled={rsvpPage >= rsvpPageData.totalPages - 1}
                                    className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Trang sau
                                </button>
                            </div>
                        )}
                    </div>
                )
            )}

            {/* Wishes */}
            {activeTab === 'wishes' && (
                wishes.length === 0 ? (
                    <div className="card p-12 text-center text-slate-500 border border-dashed border-slate-300">
                        Chưa có lời chúc nào.
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {wishes.map((w) => (
                            <div key={w.id} className="card p-6 border border-slate-100">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-full flex justify-center items-center text-xl font-bold font-display text-white bg-gradient-to-br from-sky-400 to-sky-600 shrink-0 shadow-sm">
                                        {w.guestName.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="font-bold text-slate-900">{w.guestName}</span>
                                            <span className="text-xs text-slate-400 bg-slate-50 px-2 py-1 rounded-full border border-slate-100">
                                                {new Date(w.createdAt).toLocaleString('vi-VN')}
                                            </span>
                                        </div>
                                        <p className="text-slate-700 leading-relaxed text-sm bg-slate-50 p-4 rounded-lg rounded-tl-none border border-slate-100">
                                            {w.wishes}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {wishPageData.totalPages > 1 && (
                            <div className="flex items-center justify-between px-6 py-4 mt-4 border border-slate-200 bg-white rounded-xl shadow-sm">
                                <button
                                    onClick={() => setWishPage(p => Math.max(0, p - 1))}
                                    disabled={wishPage === 0}
                                    className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-50 border border-slate-300 rounded-md hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Trang trước
                                </button>
                                <span className="text-sm text-slate-600">
                                    Trang <span className="font-medium text-slate-900">{wishPage + 1}</span> / {wishPageData.totalPages}
                                </span>
                                <button
                                    onClick={() => setWishPage(p => Math.min(wishPageData.totalPages - 1, p + 1))}
                                    disabled={wishPage >= wishPageData.totalPages - 1}
                                    className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-50 border border-slate-300 rounded-md hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Trang sau
                                </button>
                            </div>
                        )}
                    </div>
                )
            )}
        </div>
    );
}
