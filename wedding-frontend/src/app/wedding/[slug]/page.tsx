'use client';

import { useEffect, useState } from 'react';
import { weddingApi, interactionApi, WeddingResponse } from '@/lib/api';
import { useParams } from 'next/navigation';
import { Locale, useTranslation } from '@/lib/i18n';
import Template1 from '@/components/templates/Template1';
import Template2 from '@/components/templates/Template2';

export default function GuestWeddingPage() {
    const params = useParams();
    const slug = params.slug as string;

    const [wedding, setWedding] = useState<WeddingResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [locale, setLocale] = useState<Locale>('vi');
    const t = useTranslation(locale);

    useEffect(() => {
        loadWedding();
    }, [slug]);

    const loadWedding = async () => {
        try {
            const res = await weddingApi.getPublic(slug);
            setWedding(res.data);
            try {
                await interactionApi.recordVisit(res.data.id);
            } catch { /* ignore */ }
        } catch {
            setError('Không tìm thấy thiệp cưới hoặc thiệp chưa được xuất bản.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-white">
                {/* Hero Skeleton mimicking Template1 layout */}
                <div className="h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden bg-slate-50">
                    <div className="w-24 h-4 bg-slate-200 animate-pulse rounded-full mb-6"></div>
                    <div className="w-64 h-16 bg-slate-200 animate-pulse rounded-2xl mb-4"></div>
                    <div className="w-20 h-8 bg-slate-200 animate-pulse rounded-full mb-4"></div>
                    <div className="w-48 h-16 bg-slate-200 animate-pulse rounded-2xl"></div>
                    <div className="absolute top-10 right-10 w-32 h-32 bg-slate-100 rounded-full animate-pulse"></div>
                    <div className="absolute bottom-10 left-10 w-40 h-40 bg-slate-100 rounded-full animate-pulse"></div>
                </div>
                <div className="py-20 max-w-4xl mx-auto px-6">
                    <div className="h-1 bg-slate-100 w-full mb-12 rounded-full"></div>
                    <div className="grid grid-cols-4 gap-4">
                        {[1, 2, 3, 4].map(i => <div key={i} className="aspect-square bg-slate-50 animate-pulse rounded-2xl"></div>)}
                    </div>
                </div>
            </div>
        );
    }

    if (error || !wedding) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: '#faf8f5' }}>
                <div className="text-center">
                    <span className="text-6xl block mb-4">💔</span>
                    <p className="text-gray-500">{t.notFound}</p>
                </div>
            </div>
        );
    }

    // Dynamic template mapping
    const renderTemplate = () => {
        switch (wedding.templateCode) {
            case 'template2':
                return <Template2 wedding={wedding} locale={locale} />;
            case 'template1':
            default:
                return <Template1 wedding={wedding} locale={locale} />;
        }
    };

    return (
        <>
            {/* Language Switcher (Global) */}
            <div className="fixed top-4 right-4 z-50">
                <button
                    onClick={() => setLocale(locale === 'vi' ? 'en' : 'vi')}
                    className="w-10 h-10 rounded-full shadow-lg flex items-center justify-center font-bold text-sm bg-white hover:bg-slate-50 transition-colors"
                >
                    {locale === 'vi' ? '🇻🇳' : '🇬🇧'}
                </button>
            </div>

            {renderTemplate()}
        </>
    );
}
