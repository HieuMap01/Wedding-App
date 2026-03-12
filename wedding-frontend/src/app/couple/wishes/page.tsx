'use client';

import { useEffect, useState } from 'react';
import { weddingApi, interactionApi, WishResponse } from '@/lib/api';

export default function WishesPage() {
    const [wishes, setWishes] = useState<WishResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);

    useEffect(() => {
        loadWishes(page);
    }, [page]);

    const loadWishes = async (currentPage: number) => {
        try {
            setLoading(true);
            const wRes = await weddingApi.getMine();
            const wishRes = await interactionApi.getMyWishes(wRes.data.id, currentPage, 10);
            setWishes(wishRes.data.content);
            setTotalPages(wishRes.data.totalPages);
            setTotalElements(wishRes.data.totalElements);
        } catch {
            // no wedding yet
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="flex justify-center p-12 text-slate-400">Đang tải lời chúc...</div>;
    }

    return (
        <div className="max-w-4xl animate-fade-in-up">
            <h1 className="font-display text-3xl font-bold text-slate-900 mb-2 flex items-center gap-3">
                <span className="text-rose-400">💌</span> Lời chúc phúc
            </h1>
            <p className="text-slate-500 mb-8 font-medium">Bạn đã nhận được <b className="text-slate-900">{totalElements}</b> lời chúc vô cùng ý nghĩa</p>

            {wishes.length === 0 ? (
                <div className="card p-12 text-center text-slate-500 border border-dashed border-slate-300">
                    <span className="text-4xl block mb-3">💭</span>
                    Chưa có lời chúc nào, hãy xuất bản thiệp và đón chờ nhé!
                </div>
            ) : (
                <div className="grid gap-4">
                    {wishes.map((wish) => (
                        <div key={wish.id} className="card p-6 border border-slate-100 hover:border-primary/20 transition-colors">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-full flex justify-center items-center text-xl font-bold font-display text-white bg-gradient-to-br from-rose-400 to-primary shrink-0 shadow-sm border border-rose-200">
                                    {wish.guestName.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="font-bold text-slate-900">{wish.guestName}</h3>
                                        <span className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded-full">
                                            {new Date(wish.createdAt).toLocaleString('vi-VN')}
                                        </span>
                                    </div>
                                    <div className="bg-slate-50 p-4 rounded-lg rounded-tl-none border border-slate-100 text-slate-700 leading-relaxed text-sm">
                                        {wish.wishes}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    {totalPages > 1 && (
                        <div className="flex items-center justify-between px-6 py-4 mt-2 border border-slate-200 bg-white rounded-xl shadow-sm">
                            <button
                                onClick={() => setPage(p => Math.max(0, p - 1))}
                                disabled={page === 0}
                                className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-50 border border-slate-300 rounded-md hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Trang trước
                            </button>
                            <span className="text-sm text-slate-600">
                                Trang <span className="font-medium text-slate-900">{page + 1}</span> / {totalPages}
                            </span>
                            <button
                                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                                disabled={page >= totalPages - 1}
                                className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-50 border border-slate-300 rounded-md hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
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
