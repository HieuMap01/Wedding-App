'use client';

import { useEffect, useState } from 'react';
import { adminApi, WeddingResponse } from '@/lib/api';
import Link from 'next/link';

export default function CouplesListPage() {
    const [weddings, setWeddings] = useState<WeddingResponse[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        adminApi.getAllWeddings().then(res => {
            setWeddings(res.data);
            setLoading(false);
        }).catch(() => setLoading(false));
    }, []);

    if (loading) return <div className="flex justify-center p-12 text-slate-400">Đang tải dữ liệu...</div>;

    return (
        <div className="animate-fade-in-up">
            <div className="flex items-center justify-between mb-8">
                <h1 className="font-display text-3xl font-bold text-slate-900 flex items-center gap-3">
                    <span className="text-sky-500">👫</span> Danh sách thiệp cưới
                </h1>
                <span className="text-sm font-medium text-slate-500 bg-white border border-slate-200 px-3 py-1.5 rounded-full shadow-sm">
                    Tổng cộng: <b className="text-slate-900">{weddings.length}</b>
                </span>
            </div>

            {weddings.length === 0 ? (
                <div className="card p-12 text-center text-slate-500 border border-dashed border-slate-300">
                    Chưa có cặp đôi nào tạo thiệp trên hệ thống.
                </div>
            ) : (
                <div className="card overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200">
                                    <th className="p-4 font-semibold text-slate-600 text-sm">ID</th>
                                    <th className="p-4 font-semibold text-slate-600 text-sm">Chú rể</th>
                                    <th className="p-4 font-semibold text-slate-600 text-sm">Cô dâu</th>
                                    <th className="p-4 font-semibold text-slate-600 text-sm">Đường dẫn</th>
                                    <th className="p-4 font-semibold text-slate-600 text-sm">Trạng thái Thiệp</th>
                                    <th className="p-4 font-semibold text-slate-600 text-sm">Trạng thái TK</th>
                                    <th className="p-4 font-semibold text-slate-600 text-sm">Ngày tạo</th>
                                    <th className="p-4 font-semibold text-slate-600 text-sm text-right">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {weddings.map((w) => (
                                    <tr key={w.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="p-4 text-slate-500 text-sm font-mono">#{w.id}</td>
                                        <td className="p-4 font-medium text-slate-900">{w.groomName || '—'}</td>
                                        <td className="p-4 font-medium text-slate-900">{w.brideName || '—'}</td>
                                        <td className="p-4">
                                            <code className="text-sky-600 bg-sky-50 px-1.5 py-0.5 rounded font-mono text-sm">/{w.slug}</code>
                                        </td>
                                        <td className="p-4">
                                            {w.isPublished ? (
                                                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                    ✅ Đã xuất bản
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-semibold bg-slate-100 text-slate-500 border border-slate-200">
                                                    📝 Nháp
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-4">
                                            {w.isActive ? (
                                                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                                                    🟢 Hoạt động
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                                                    🚫 Đã khóa
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-4 text-slate-500 text-sm">
                                            {w.createdAt ? new Date(w.createdAt).toLocaleDateString('vi-VN') : '—'}
                                        </td>
                                        <td className="p-4 text-right flex items-center justify-end gap-2">
                                            <button 
                                                onClick={async () => {
                                                    const action = w.isActive ? 'vô hiệu hóa' : 'kích hoạt lại';
                                                    if (!confirm(`Bạn có chắc chắn muốn ${action} tài khoản này?`)) return;
                                                    try {
                                                        const newStatus = !w.isActive;
                                                        // Toggle both IAM and Wedding Core status
                                                        await adminApi.updateCoupleStatus(w.coupleUserId, newStatus);
                                                        await adminApi.toggleWeddingStatus(w.id, newStatus);
                                                        
                                                        // Refresh list
                                                        const res = await adminApi.getAllWeddings();
                                                        setWeddings(res.data);
                                                        
                                                        alert(`Đã ${action} thành công!`);
                                                    } catch (err: any) {
                                                        alert('Lỗi: ' + err.message);
                                                    }
                                                }} 
                                                className={`inline-flex items-center justify-center px-3 py-1.5 border rounded-md text-sm font-medium transition-colors ${
                                                    w.isActive 
                                                    ? "border-rose-200 text-rose-700 bg-rose-50 hover:bg-rose-100" 
                                                    : "border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100"
                                                }`}
                                            >
                                                {w.isActive ? 'Khóa' : 'Mở khóa'}
                                            </button>
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
