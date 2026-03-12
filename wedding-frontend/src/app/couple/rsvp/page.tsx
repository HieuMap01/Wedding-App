'use client';

import { useEffect, useState } from 'react';
import { weddingApi, interactionApi, RsvpResponse } from '@/lib/api';

export default function RsvpPage() {
    const [rsvps, setRsvps] = useState<RsvpResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);

    useEffect(() => {
        loadRsvps(page);
    }, [page]);

    const loadRsvps = async (currentPage: number) => {
        try {
            setLoading(true);
            const wRes = await weddingApi.getMine();
            const rRes = await interactionApi.getMyRsvps(wRes.data.id, currentPage, 10);
            setRsvps(rRes.data.content);
            setTotalPages(rRes.data.totalPages);
            setTotalElements(rRes.data.totalElements);
        } catch {
            // no wedding yet
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="flex justify-center p-12 text-slate-400">Đang tải danh sách khách...</div>;
    }

    const attending = rsvps.filter(r => r.attendance === 'ATTENDING');
    const notAttending = rsvps.filter(r => r.attendance === 'NOT_ATTENDING');

    return (
        <div className="animate-fade-in-up">
            <h1 className="font-display text-3xl font-bold text-slate-900 mb-2 flex items-center gap-3">
                <span className="text-primary">👥</span> Danh sách khách mời
            </h1>
            <p className="text-slate-500 mb-8 flex items-center gap-4 text-sm font-medium">
                <span>Tổng: <b className="text-slate-900">{totalElements}</b></span>
            </p>

            {rsvps.length === 0 ? (
                <div className="card p-12 text-center text-slate-500 border border-dashed border-slate-300">
                    <span className="text-4xl block mb-3">📭</span>
                    Chưa có khách mời nào phản hồi RSVP.
                </div>
            ) : (
                <div className="card overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200">
                                    <th className="p-4 font-semibold text-slate-600 text-sm w-16">STT</th>
                                    <th className="p-4 font-semibold text-slate-600 text-sm">Tên khách</th>
                                    <th className="p-4 font-semibold text-slate-600 text-sm">Số điện thoại</th>
                                    <th className="p-4 font-semibold text-slate-600 text-sm">Xác nhận</th>
                                    <th className="p-4 font-semibold text-slate-600 text-sm">Ghi chú / Lời chúc</th>
                                    <th className="p-4 font-semibold text-slate-600 text-sm text-right">Thời gian</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {rsvps.map((rsvp, i) => (
                                    <tr key={rsvp.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="p-4 text-slate-400 text-sm">{i + 1}</td>
                                        <td className="p-4 font-medium text-slate-900">{rsvp.guestName}</td>
                                        <td className="p-4 text-slate-500 font-mono text-sm">{rsvp.guestPhone || '—'}</td>
                                        <td className="p-4">
                                            {rsvp.attendance === 'ATTENDING' ? (
                                                <span className="inline-flex items-center px-2.5 py-1 rounded text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                    ✅ Tham dự
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-2.5 py-1 rounded text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                                                    ❌ Không đến
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-4 text-slate-600 text-sm max-w-[200px] truncate" title={rsvp.wishes}>
                                            {rsvp.wishes || '—'}
                                        </td>
                                        <td className="p-4 text-slate-500 text-sm text-right">
                                            {new Date(rsvp.createdAt).toLocaleString('vi-VN')}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {totalPages > 1 && (
                        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 bg-slate-50">
                            <button
                                onClick={() => setPage(p => Math.max(0, p - 1))}
                                disabled={page === 0}
                                className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Trang trước
                            </button>
                            <span className="text-sm text-slate-600">
                                Trang <span className="font-medium text-slate-900">{page + 1}</span> / {totalPages}
                            </span>
                            <button
                                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                                disabled={page >= totalPages - 1}
                                className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Trang sau
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
