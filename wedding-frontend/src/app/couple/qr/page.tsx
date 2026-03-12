'use client';

import { useEffect, useState } from 'react';
import { weddingApi } from '@/lib/api';
import toast from 'react-hot-toast';

export default function QrCodePage() {
    const [qrCodeBase64, setQrCodeBase64] = useState<string | null>(null);
    const [publicUrl, setPublicUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchQrData();
    }, []);

    const fetchQrData = async () => {
        try {
            setLoading(true);
            const [qrRes, weddingRes] = await Promise.all([
                weddingApi.getQrCode(),
                weddingApi.getMine()
            ]);

            setQrCodeBase64(qrRes.data);

            // Set public url based on slug
            const frontendUrl = window.location.origin + '/wedding/' + weddingRes.data.slug;
            setPublicUrl(frontendUrl);
        } catch (error: any) {
            console.error('Error fetching QR data:', error);
            const errorMessage = error.response?.data?.message || 'Không thể tải mã QR. Vui lòng đảm bảo thiệp cưới của bạn đã được xuất bản.';
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const downloadQrCode = () => {
        if (!qrCodeBase64) return;

        const a = document.createElement('a');
        a.href = qrCodeBase64;
        a.download = 'wedding-qr-code.png';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        toast.success('Đã tải mã QR xuống thiết bị');
    };

    const copyToClipboard = () => {
        if (!publicUrl) return;
        navigator.clipboard.writeText(publicUrl);
        toast.success('Đã sao chép đường liên kết');
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 font-display">Mã QR & Liên Kết</h1>
                <p className="text-slate-500 mt-1">Gửi thiệp của bạn dễ dàng hơn thông qua sao chép đường liên kết hoặc đưa mã QR Code cho khách khứa.</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 md:p-8 flex flex-col md:flex-row gap-8 items-center md:items-start">

                    {/* QR Code Section */}
                    <div className="flex-shrink-0 flex flex-col items-center">
                        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex flex-col items-center">
                            {qrCodeBase64 ? (
                                <>
                                    <img
                                        src={qrCodeBase64}
                                        alt="Wedding QR Code"
                                        className="w-48 h-48 md:w-56 md:h-56 object-contain rounded-lg shadow-sm bg-white"
                                    />
                                    <p className="text-sm text-slate-500 mt-4 text-center">Quét mã để truy cập Thiệp Cưới</p>
                                </>
                            ) : (
                                <div className="w-48 h-48 md:w-56 md:h-56 flex items-center justify-center bg-slate-100 rounded-lg text-slate-400">
                                    <span className="text-center px-4">QR Code chưa sẵn sàng.<br />Vui lòng xuất bản thiệp.</span>
                                </div>
                            )}
                        </div>

                        <button
                            onClick={downloadQrCode}
                            disabled={!qrCodeBase64}
                            className="mt-6 flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-lg font-medium hover:bg-rose-500 focus:ring-4 focus:ring-rose-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-full justify-center"
                        >
                            <svg xmlns="http://www.w3.org/2001/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            Tải Tranh QR Xuống
                        </button>
                    </div>

                    {/* Link Section */}
                    <div className="flex-1 w-full flex flex-col justify-center pt-2 md:pt-6">
                        <h3 className="text-lg font-bold text-slate-900 mb-2">Đường Dẫn Truy Cập Nhanh</h3>
                        <p className="text-sm text-slate-500 mb-6">Bạn có thể gửi trực tiếp liên kết này qua tin nhắn để mời bạn bè, người thân vào dự thiệp cưới.</p>

                        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-4 break-all">
                            <span className="text-slate-800 font-medium font-mono text-sm md:text-base">
                                {publicUrl || 'Chưa thiết lập tên miền'}
                            </span>
                        </div>

                        <button
                            onClick={copyToClipboard}
                            disabled={!publicUrl}
                            className="flex items-center gap-2 px-6 py-2.5 bg-white border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 focus:ring-4 focus:ring-slate-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-fit"
                        >
                            <svg xmlns="http://www.w3.org/2001/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                            </svg>
                            Sao chép Liên Kết
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
}
