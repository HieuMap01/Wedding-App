'use client';

import { useEffect, useState, FormEvent } from 'react';
import { weddingApi, interactionApi, WeddingResponse, API_BASE, getImageUrl } from '@/lib/api';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Locale, useTranslation } from '@/lib/i18n';
import { getLunarDateString } from '@/lib/lunar';
import Countdown from '@/components/Countdown';
import MusicPlayer from '@/components/MusicPlayer';

export default function GuestWeddingPage() {
    const params = useParams();
    const slug = params.slug as string;

    const [wedding, setWedding] = useState<WeddingResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // RSVP form
    const [rsvpForm, setRsvpForm] = useState({
        guestName: '',
        guestPhone: '',
        wishes: '',
        attendance: 'ATTENDING',
    });
    const [rsvpSent, setRsvpSent] = useState(false);
    const [rsvpSending, setRsvpSending] = useState(false);
    const [rsvpMessage, setRsvpMessage] = useState('');
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);

    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [locale, setLocale] = useState<Locale>('vi');
    const t = useTranslation(locale);

    // Auto-advance gallery
    useEffect(() => {
        if (!wedding?.images || wedding.images.length <= 1) return;
        const interval = setInterval(() => {
            setCurrentImageIndex(prev => (prev + 1) % wedding.images!.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [wedding]);

    useEffect(() => {
        loadWedding();
    }, [slug]);

    const [showGroomMap, setShowGroomMap] = useState(false);
    const [showBrideMap, setShowBrideMap] = useState(false);
    const [showVenueMap, setShowVenueMap] = useState(false);

    const loadWedding = async () => {
        try {
            const res = await weddingApi.getPublic(slug);
            setWedding(res.data);
            // Record visit
            try {
                await interactionApi.recordVisit(res.data.id);
            } catch { /* ignore */ }
        } catch {
            setError('Không tìm thấy thiệp cưới hoặc thiệp chưa được xuất bản.');
        } finally {
            setLoading(false);
        }
    };

    const handleRsvp = async (e: FormEvent) => {
        e.preventDefault();
        if (!wedding) return;
        setRsvpSending(true);
        try {
            await interactionApi.submitRsvp(wedding.id, rsvpForm);
            setRsvpSent(true);
            setRsvpMessage(t.successRsvp);
        } catch (err: unknown) {
            setRsvpMessage('❌ ' + (err instanceof Error ? err.message : 'Error'));
        } finally {
            setRsvpSending(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-6" style={{ background: '#faf8f5' }}>
                <div className="text-xl text-gray-500 mb-8 flex items-center gap-2">
                    <span className="animate-spin text-2xl">💍</span> {t.loading}
                </div>
                
                {/* Debug info for troubleshooting iOS */}
                <div className="mt-12 p-4 bg-slate-100 rounded-lg text-[10px] font-mono text-slate-400 max-w-xs break-all">
                    <p className="font-bold mb-1 uppercase text-slate-500">System Debug Info:</p>
                    <p>Slug: {slug}</p>
                    <p>API_BASE: "{API_BASE}"</p>
                    <p>Status: Loading...</p>
                    {error && <p className="text-red-400 mt-2">Error: {error}</p>}
                    <p className="mt-2 text-slate-300 italic">* Nếu bị kẹt quá lâu, hãy chụp ảnh màn hình này gửi cho mình.</p>
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

    const primaryColor = wedding.primaryColor || '#E91E63';
    const secondaryColor = wedding.secondaryColor || '#FF5722';
    const weddingDate = wedding.weddingDate ? new Date(wedding.weddingDate) : null;
    const lunarDateStr = weddingDate ? getLunarDateString(weddingDate) : '';

    return (
        <div className="wedding-theme min-h-screen" style={{ '--color-primary': primaryColor, '--color-secondary': secondaryColor } as React.CSSProperties}>
            {/* Language Switcher */}
            <div className="fixed top-4 right-4 z-50">
                <button
                    onClick={() => setLocale(locale === 'vi' ? 'en' : 'vi')}
                    className="w-10 h-10 rounded-full shadow-lg flex items-center justify-center font-bold text-sm bg-white hover:bg-slate-50 transition-colors"
                    aria-label="Toggle language"
                >
                    {locale === 'vi' ? '🇻🇳' : '🇬🇧'}
                </button>
            </div>

            {/* Hero */}
            <section className="min-h-screen flex flex-col items-center justify-center text-center px-6 relative overflow-hidden">
                {/* Decorative circles */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full opacity-10" style={{ background: primaryColor }} />
                    <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full opacity-10" style={{ background: secondaryColor }} />
                    <div className="absolute top-1/4 left-1/4 w-4 h-4 rounded-full opacity-30" style={{ background: primaryColor }} />
                    <div className="absolute top-1/3 right-1/3 w-3 h-3 rounded-full opacity-20" style={{ background: secondaryColor }} />
                </div>

                <motion.div
                    className="relative z-10"
                    initial={{ opacity: 0, y: 40, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
                >
                    <p className="text-sm uppercase tracking-[0.3em] mb-4" style={{ color: primaryColor }}>
                        {t.gettingMarried}
                    </p>
                    <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold mb-4" style={{ fontFamily: 'var(--font-display)', color: '#2d2d2d' }}>
                        {wedding.groomName}
                    </h1>
                    <div className="text-3xl my-2" style={{ color: primaryColor }}>&amp;</div>
                    <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold mb-8" style={{ fontFamily: 'var(--font-display)', color: '#2d2d2d' }}>
                        {wedding.brideName}
                    </h1>

                    {weddingDate && (
                        <div className="flex flex-col items-center gap-2">
                            <div className="flex items-center justify-center gap-4 sm:gap-8 text-sm" style={{ color: '#666' }}>
                                <div className="text-center">
                                    <p className="text-2xl sm:text-3xl font-bold" style={{ color: primaryColor }}>{weddingDate.getDate()}</p>
                                    <p className="text-[10px] sm:text-xs uppercase tracking-wider">
                                        {t.month} {weddingDate.getMonth() + 1}
                                    </p>
                                </div>
                                <div className="w-px h-10 sm:h-12" style={{ background: primaryColor, opacity: 0.3 }} />
                                <div className="text-center">
                                    <p className="text-2xl sm:text-3xl font-bold" style={{ color: primaryColor }}>{weddingDate.getFullYear()}</p>
                                    <p className="text-[10px] sm:text-xs uppercase tracking-wider">
                                        {weddingDate.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                            </div>
                            <p className="text-sm italic font-medium opacity-80" style={{ color: primaryColor }}>
                                {lunarDateStr}
                            </p>
                            
                            <div className="mt-8 scale-90 sm:scale-100">
                                <Countdown 
                                    targetDate={wedding.weddingDate} 
                                    primaryColor={primaryColor} 
                                    labels={{
                                        days: t.days,
                                        hours: t.hours,
                                        minutes: t.minutes,
                                        seconds: t.seconds
                                    }}
                                />
                            </div>
                        </div>
                    )}

                    <div className="mt-10">
                        <a href="#story" className="inline-block animate-bounce" style={{ color: primaryColor }}>
                            <svg className="w-6 h-6 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                            </svg>
                        </a>
                    </div>
                </motion.div>
            </section>

            {/* Gallery Carousel */}
            {wedding.images && wedding.images.length > 0 && (
                <section id="gallery" className="py-24 px-6 max-w-6xl mx-auto overflow-hidden">
                    <motion.h2 
                        className="text-4xl font-bold text-center mb-16" 
                        style={{ fontFamily: 'var(--font-display)', color: '#2d2d2d' }}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                    >
                        {t.galleryTitle}
                    </motion.h2>

                    {/* Main Featured Image with Reveal Effect */}
                    <div className="relative group">
                        <motion.div 
                            className="relative w-full max-w-4xl mx-auto rounded-3xl overflow-hidden shadow-2xl mb-12 group flex items-center justify-center bg-gray-100 cursor-zoom-in"
                            initial={{ opacity: 0, scale: 0.95, y: 30 }}
                            whileInView={{ opacity: 1, scale: 1, y: 0 }}
                            viewport={{ once: true, margin: "-50px" }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            onClick={() => setIsLightboxOpen(true)}
                        >
                            <AnimatePresence mode="wait">
                                <motion.img
                                    key={currentImageIndex}
                                    src={getImageUrl(wedding.images[currentImageIndex].imageUrl)}
                                    alt="Wedding main gallery"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.5 }}
                                    className="max-w-full max-h-[80vh] w-auto h-auto object-contain transition-transform duration-1000 group-hover:scale-105"
                                />
                            </AnimatePresence>
                            {/* Controls */}
                            <div className="absolute inset-0 flex items-center justify-between px-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button 
                                    onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(prev => prev === 0 ? wedding.images!.length - 1 : prev - 1); }} 
                                    className="bg-white/90 hover:bg-white text-gray-800 p-3 rounded-full shadow-lg backdrop-blur-sm transition-all transform hover:scale-110"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                                </button>
                                <button 
                                    onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(prev => (prev + 1) % wedding.images!.length); }} 
                                    className="bg-white/90 hover:bg-white text-gray-800 p-3 rounded-full shadow-lg backdrop-blur-sm transition-all transform hover:scale-110"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                </button>
                            </div>
                        </motion.div>
                    </div>

                    {/* Thumbnails row with Staggered reveal */}
                    {wedding.images.length > 1 && (
                        <motion.div 
                            className="flex gap-4 overflow-x-auto pb-6 px-4 snap-x justify-center scrollbar-hide"
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            variants={{
                                visible: { transition: { staggerChildren: 0.1 } }
                            }}
                        >
                            {wedding.images.map((img, idx) => (
                                <motion.button
                                    key={img.id}
                                    onClick={() => setCurrentImageIndex(idx)}
                                    variants={{
                                        hidden: { opacity: 0, scale: 0.5, y: 20 },
                                        visible: { opacity: 1, scale: 1, y: 0 }
                                    }}
                                    className={`relative flex-shrink-0 w-24 md:w-32 aspect-square rounded-xl overflow-hidden transition-all duration-300 snap-center bg-gray-100 ${currentImageIndex === idx ? 'ring-4 ring-offset-2 scale-110 shadow-lg z-10' : 'opacity-40 hover:opacity-100 scale-90'}`}
                                    style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
                                >
                                    <img src={getImageUrl(img.imageUrl)} alt="thumb" className="w-full h-full object-contain" />
                                </motion.button>
                            ))}
                        </motion.div>
                    )}

                    {/* Lightbox Overlay */}
                    <AnimatePresence>
                        {isLightboxOpen && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="fixed inset-0 z-[200] bg-black/95 flex items-center justify-center p-4 md:p-10"
                                onClick={() => setIsLightboxOpen(false)}
                            >
                                <button 
                                    className="absolute top-6 right-6 text-white text-4xl hover:scale-110 transition-transform"
                                    onClick={() => setIsLightboxOpen(false)}
                                >
                                    ✕
                                </button>
                                <motion.img
                                    key={currentImageIndex}
                                    src={getImageUrl(wedding.images[currentImageIndex].imageUrl)}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ type: "spring", damping: 25, stiffness: 200 }}
                                    className="max-w-full max-h-full object-contain rounded-lg"
                                    onClick={(e) => e.stopPropagation()}
                                />
                                {/* Lightbox Navigation */}
                                <div className="absolute inset-x-0 bottom-10 flex justify-center gap-6">
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(prev => prev === 0 ? wedding.images!.length - 1 : prev - 1); }}
                                        className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center backdrop-blur-md"
                                    >
                                        ←
                                    </button>
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(prev => (prev + 1) % wedding.images!.length); }}
                                        className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center backdrop-blur-md"
                                    >
                                        →
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </section>
            )}

            {/* Love Story */}
            {wedding.loveStory && (
                <motion.section
                    id="story"
                    className="py-20 px-6"
                    style={{ background: 'white' }}
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.8 }}
                >
                    <div className="max-w-3xl mx-auto text-center">
                        <p className="text-sm uppercase tracking-[0.2em] mb-4" style={{ color: primaryColor }}>{t.loveStorySub}</p>
                        <h2 className="text-3xl font-bold mb-8" style={{ fontFamily: 'var(--font-display)', color: '#2d2d2d' }}>
                            {t.loveStoryTitle}
                        </h2>
                        <div className="text-gray-600 leading-relaxed whitespace-pre-line text-lg">
                            {wedding.loveStory}
                        </div>
                    </div>
                </motion.section>
            )}

            {/* Venue & Map */}
            {(wedding.venueName || wedding.venueAddress || wedding.groomHouseAddress || wedding.brideHouseAddress) && (
                <motion.section
                    className="py-20 px-6"
                    style={{ background: '#f5f0eb' }}
                    initial={{ opacity: 0, scale: 0.98, y: 40 }}
                    whileInView={{ opacity: 1, scale: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                >
                    <div className="max-w-5xl mx-auto text-center">
                        <p className="text-sm uppercase tracking-[0.2em] mb-4" style={{ color: primaryColor }}>{t.locationSub}</p>
                        <h2 className="text-3xl font-bold mb-10" style={{ fontFamily: 'var(--font-display)', color: '#2d2d2d' }}>
                            {t.locationTitle}
                        </h2>

                        {!wedding.groomHouseAddress && !wedding.brideHouseAddress ? (
                            <motion.div 
                                className="mb-12 max-w-4xl mx-auto"
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.8 }}
                            >
                                {wedding.venueName && <p className="text-2xl font-semibold text-gray-800 mb-2">{wedding.venueName}</p>}
                                {wedding.venueAddress && <p className="text-gray-600 mb-6">{wedding.venueAddress}</p>}
                                {(wedding.venueAddress || wedding.venueName) && (
                                    <div className="rounded-2xl overflow-hidden shadow-xl h-96 border-4 border-white bg-white relative flex items-center justify-center">
                                        {!showVenueMap ? (
                                            <div className="flex flex-col items-center">
                                                <div className="text-4xl mb-4">📍</div>
                                                <button 
                                                    onClick={() => setShowVenueMap(true)}
                                                    className="px-6 py-2 bg-slate-900 text-white rounded-full text-sm font-bold shadow-lg hover:bg-sky-600 transition-all"
                                                >
                                                    {t.viewMap}
                                                </button>
                                            </div>
                                        ) : (
                                            <iframe
                                                title="Venue Map"
                                                width="100%"
                                                height="100%"
                                                style={{ border: 0 }}
                                                src={`https://maps.google.com/maps?width=100%&height=400&hl=en&q=${encodeURIComponent((wedding.venueAddress || '') + (wedding.venueName ? ', ' + wedding.venueName : ''))}&ie=UTF8&t=&z=15&iwloc=B&output=embed`}
                                                allowFullScreen
                                            />
                                        )}
                                    </div>
                                )}
                            </motion.div>
                        ) : (
                            <motion.div 
                                className="grid md:grid-cols-2 gap-10 text-left"
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true, margin: "-100px" }}
                                variants={{
                                    visible: { transition: { staggerChildren: 0.3 } }
                                }}
                            >
                                {/* Groom House */}
                                {wedding.groomHouseAddress && (
                                    <motion.div 
                                        variants={{
                                            hidden: { opacity: 0, x: -50 },
                                            visible: { opacity: 1, x: 0 }
                                        }}
                                        transition={{ duration: 0.8, ease: "easeOut" }}
                                        className="bg-white p-6 rounded-3xl shadow-lg border border-gray-100 relative overflow-hidden transform transition-transform hover:-translate-y-1 hover:shadow-xl"
                                    >
                                        <div className="absolute top-0 left-0 w-full h-2 bg-blue-500"></div>
                                        <div className="flex items-center gap-3 mb-4 mt-2">
                                            <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-2xl">🤵</div>
                                            <div>
                                                <h3 className="text-xl font-bold text-gray-800">{t.groomHouse}</h3>
                                                {wedding.groomHouseName && <p className="text-blue-600 font-medium text-sm">{wedding.groomHouseName}</p>}
                                            </div>
                                        </div>
                                        <div className="flex gap-2 mb-6 items-start">
                                            <span className="text-gray-400 mt-1">📍</span>
                                            <p className="text-gray-600 text-sm leading-relaxed">{wedding.groomHouseAddress}</p>
                                        </div>
                                        <div className="rounded-xl overflow-hidden shadow-inner h-64 w-full bg-slate-50 relative flex items-center justify-center border border-slate-100">
                                            {!showGroomMap ? (
                                                <button 
                                                    onClick={() => setShowGroomMap(true)}
                                                    className="px-4 py-1.5 bg-white border border-slate-200 text-slate-800 rounded-full text-xs font-bold shadow-sm hover:border-sky-300 transition-all"
                                                >
                                                    {t.viewMap}
                                                </button>
                                            ) : (
                                                <iframe
                                                    title="Groom Map"
                                                    width="100%"
                                                    height="100%"
                                                    style={{ border: 0 }}
                                                    src={`https://maps.google.com/maps?width=100%&height=400&hl=en&q=${encodeURIComponent(
                                                        wedding.groomHouseLat && wedding.groomHouseLng
                                                            ? `${wedding.groomHouseLat},${wedding.groomHouseLng}`
                                                            : (wedding.groomHouseAddress || '') + (wedding.groomHouseName ? ', ' + wedding.groomHouseName : '')
                                                    )}&ie=UTF8&t=&z=15&iwloc=B&output=embed`}
                                                    allowFullScreen
                                                />
                                            )}
                                        </div>
                                    </motion.div>
                                )}

                                {/* Bride House */}
                                {wedding.brideHouseAddress && (
                                    <motion.div 
                                        variants={{
                                            hidden: { opacity: 0, x: 50 },
                                            visible: { opacity: 1, x: 0 }
                                        }}
                                        transition={{ duration: 0.8, ease: "easeOut" }}
                                        className="bg-white p-6 rounded-3xl shadow-lg border border-gray-100 relative overflow-hidden transform transition-transform hover:-translate-y-1 hover:shadow-xl"
                                    >
                                        <div className="absolute top-0 left-0 w-full h-2 bg-rose-400"></div>
                                        <div className="flex items-center gap-3 mb-4 mt-2">
                                            <div className="w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center text-2xl">👰</div>
                                            <div>
                                                <h3 className="text-xl font-bold text-gray-800">{t.brideHouse}</h3>
                                                {wedding.brideHouseName && <p className="text-rose-600 font-medium text-sm">{wedding.brideHouseName}</p>}
                                            </div>
                                        </div>
                                        <div className="flex gap-2 mb-6 items-start">
                                            <span className="text-gray-400 mt-1">📍</span>
                                            <p className="text-gray-600 text-sm leading-relaxed">{wedding.brideHouseAddress}</p>
                                        </div>
                                        <div className="rounded-xl overflow-hidden shadow-inner h-64 w-full bg-slate-50 relative flex items-center justify-center border border-slate-100">
                                            {!showBrideMap ? (
                                                <button 
                                                    onClick={() => setShowBrideMap(true)}
                                                    className="px-4 py-1.5 bg-white border border-slate-200 text-slate-800 rounded-full text-xs font-bold shadow-sm hover:border-rose-300 transition-all"
                                                >
                                                    {t.viewMap}
                                                </button>
                                            ) : (
                                                <iframe
                                                    title="Bride Map"
                                                    width="100%"
                                                    height="100%"
                                                    style={{ border: 0 }}
                                                    src={`https://maps.google.com/maps?width=100%&height=400&hl=en&q=${encodeURIComponent(
                                                        wedding.brideHouseLat && wedding.brideHouseLng
                                                            ? `${wedding.brideHouseLat},${wedding.brideHouseLng}`
                                                            : (wedding.brideHouseAddress || '') + (wedding.brideHouseName ? ', ' + wedding.brideHouseName : '')
                                                    )}&ie=UTF8&t=&z=15&iwloc=B&output=embed`}
                                                    allowFullScreen
                                                />
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </motion.div>
                        )}
                    </div>
                </motion.section>
            )}

            {/* RSVP Section */}
            <motion.section
                className="py-20 px-6"
                style={{ background: 'white' }}
                initial={{ opacity: 0, y: 60 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 1 }}
            >
                <div className="max-w-lg mx-auto text-center">
                    <p className="text-sm uppercase tracking-[0.2em] mb-4" style={{ color: primaryColor }}>{t.rsvpSub}</p>
                    <h2 className="text-3xl font-bold mb-2" style={{ fontFamily: 'var(--font-display)', color: '#2d2d2d' }}>
                        {t.rsvpTitle}
                    </h2>
                    <p className="text-gray-500 mb-8">{t.rsvpDesc}</p>

                    {rsvpSent ? (
                        <div className="rounded-2xl p-8 text-center" style={{ background: '#f0fdf4', border: `1px solid ${primaryColor}30` }}>
                            <span className="text-5xl block mb-4">💐</span>
                            <p className="text-lg font-medium text-gray-700">{rsvpMessage}</p>
                        </div>
                    ) : (
                        <form onSubmit={handleRsvp} className="space-y-5 text-left">
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1.5">{t.formName}</label>
                                <input className="input-field" value={rsvpForm.guestName} onChange={(e) => setRsvpForm(f => ({ ...f, guestName: e.target.value }))} required placeholder={t.formNamePlaceholder} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1.5">{t.formPhone}</label>
                                <input className="input-field" value={rsvpForm.guestPhone} onChange={(e) => setRsvpForm(f => ({ ...f, guestPhone: e.target.value }))} placeholder={t.formPhonePlaceholder} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1.5">{t.formWishes}</label>
                                <textarea className="input-field min-h-[100px] resize-y" value={rsvpForm.wishes} onChange={(e) => setRsvpForm(f => ({ ...f, wishes: e.target.value }))} placeholder={t.formWishesPlaceholder} />
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-gray-600 mb-3">{t.formConfirm}</label>
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <label className={`flex-1 p-4 rounded-xl border-2 cursor-pointer transition-all text-center ${rsvpForm.attendance === 'ATTENDING' ? 'border-green-400 bg-green-50' : 'border-gray-200 hover:border-gray-300'
                                        }`}>
                                        <input type="radio" name="attendance" value="ATTENDING" checked={rsvpForm.attendance === 'ATTENDING'} onChange={(e) => setRsvpForm(f => ({ ...f, attendance: e.target.value }))} className="sr-only" />
                                        <span className="text-2xl block mb-1">🎉</span>
                                        <span className="text-sm font-medium text-gray-700">{t.attending}</span>
                                    </label>
                                    <label className={`flex-1 p-4 rounded-xl border-2 cursor-pointer transition-all text-center ${rsvpForm.attendance === 'NOT_ATTENDING' ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                                        }`}>
                                        <input type="radio" name="attendance" value="NOT_ATTENDING" checked={rsvpForm.attendance === 'NOT_ATTENDING'} onChange={(e) => setRsvpForm(f => ({ ...f, attendance: e.target.value }))} className="sr-only" />
                                        <span className="text-2xl block mb-1">😢</span>
                                        <span className="text-sm font-medium text-gray-700">{t.notAttending}</span>
                                    </label>
                                </div>
                            </div>

                            {rsvpMessage && (
                                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
                                    {rsvpMessage}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={rsvpSending}
                                className="w-full py-4 rounded-xl text-white font-semibold text-base transition-all hover:shadow-lg"
                                style={{ background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})` }}
                            >
                                {rsvpSending ? t.sending : t.sendButton}
                            </button>
                        </form>
                    )}
                </div>
            </motion.section>

            {/* Wedding Gift Section */}
            {(wedding.groomBankAccountNumber || wedding.brideBankAccountNumber) && (
                <motion.section
                    className="py-24 px-6"
                    style={{ background: '#faf8f5' }}
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.8 }}
                >
                    <div className="max-w-5xl mx-auto text-center">
                        <p className="text-sm uppercase tracking-[0.2em] mb-4" style={{ color: primaryColor }}>Gift</p>
                        <h2 className="text-4xl font-bold mb-4" style={{ fontFamily: 'var(--font-display)', color: '#2d2d2d' }}>
                            {t.giftTitle}
                        </h2>
                        <p className="text-gray-500 mb-16 text-base max-w-xl mx-auto">{t.giftDesc}</p>

                        <motion.div 
                            className="grid md:grid-cols-2 gap-10"
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, margin: "-100px" }}
                            variants={{
                                visible: { transition: { staggerChildren: 0.3 } }
                            }}
                        >
                            {/* Groom Bank */}
                            {wedding.groomBankAccountNumber && (
                                <motion.div 
                                    variants={{
                                        hidden: { opacity: 0, scale: 0.9, y: 30 },
                                        visible: { opacity: 1, scale: 1, y: 0 }
                                    }}
                                    transition={{ duration: 0.7 }}
                                    className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 flex flex-col items-center"
                                >
                                    <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                                        {t.groomBankTitle}
                                    </h3>
                                    <div className="bg-slate-50 p-4 rounded-2xl border-2 border-dashed border-slate-200 mb-8 w-full max-w-[240px]">
                                        <img 
                                            src={`https://img.vietqr.io/image/${wedding.groomBankName?.includes(' - ') ? wedding.groomBankName.split(' - ')[0] : (wedding.groomBankName || 'BANK')}-${wedding.groomBankAccountNumber}-compact.jpg?accountName=${encodeURIComponent(wedding.groomBankAccountHolder || '')}`}
                                            alt="Groom VietQR"
                                            className="w-full aspect-square object-contain rounded-lg shadow-sm"
                                        />
                                    </div>
                                    <div className="w-full text-left space-y-4">
                                        <div className="flex justify-between items-center border-b border-slate-50 pb-2">
                                            <span className="text-xs font-bold text-slate-400 uppercase">{t.giftBank}</span>
                                            <span className="font-bold text-slate-700">{wedding.groomBankName?.includes(' - ') ? wedding.groomBankName.split(' - ')[1] : wedding.groomBankName}</span>
                                        </div>
                                        <div className="flex justify-between items-center border-b border-slate-50 pb-2">
                                            <span className="text-xs font-bold text-slate-400 uppercase">{t.giftAccount}</span>
                                            <div className="flex items-center gap-2">
                                                <span className="font-mono font-bold text-lg" style={{ color: primaryColor }}>{wedding.groomBankAccountNumber}</span>
                                                <button onClick={() => { navigator.clipboard.writeText(wedding.groomBankAccountNumber || ''); alert('Copied!'); }} className="p-1 hover:text-sky-600 transition-colors">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
                                                </button>
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-center pb-2">
                                            <span className="text-xs font-bold text-slate-400 uppercase">{t.giftHolder}</span>
                                            <span className="font-bold text-slate-700 uppercase">{wedding.groomBankAccountHolder}</span>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* Bride Bank */}
                            {wedding.brideBankAccountNumber && (
                                <motion.div 
                                    variants={{
                                        hidden: { opacity: 0, scale: 0.9, y: 30 },
                                        visible: { opacity: 1, scale: 1, y: 0 }
                                    }}
                                    transition={{ duration: 0.7 }}
                                    className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 flex flex-col items-center"
                                >
                                    <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                                        {t.brideBankTitle}
                                    </h3>
                                    <div className="bg-slate-50 p-4 rounded-2xl border-2 border-dashed border-slate-200 mb-8 w-full max-w-[240px]">
                                        <img 
                                            src={`https://img.vietqr.io/image/${wedding.brideBankName?.includes(' - ') ? wedding.brideBankName.split(' - ')[0] : wedding.brideBankName}-${wedding.brideBankAccountNumber}-compact.jpg?accountName=${encodeURIComponent(wedding.brideBankAccountHolder || '')}`}
                                            alt="Bride VietQR"
                                            className="w-full aspect-square object-contain rounded-lg shadow-sm"
                                        />
                                    </div>
                                    <div className="w-full text-left space-y-4">
                                        <div className="flex justify-between items-center border-b border-slate-50 pb-2">
                                            <span className="text-xs font-bold text-slate-400 uppercase">{t.giftBank}</span>
                                            <span className="font-bold text-slate-700">{wedding.brideBankName?.includes(' - ') ? wedding.brideBankName.split(' - ')[1] : wedding.brideBankName}</span>
                                        </div>
                                        <div className="flex justify-between items-center border-b border-slate-50 pb-2">
                                            <span className="text-xs font-bold text-slate-400 uppercase">{t.giftAccount}</span>
                                            <div className="flex items-center gap-2">
                                                <span className="font-mono font-bold text-lg" style={{ color: primaryColor }}>{wedding.brideBankAccountNumber}</span>
                                                <button onClick={() => { navigator.clipboard.writeText(wedding.brideBankAccountNumber || ''); alert('Copied!'); }} className="p-1 hover:text-sky-600 transition-colors">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
                                                </button>
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-center pb-2">
                                            <span className="text-xs font-bold text-slate-400 uppercase">{t.giftHolder}</span>
                                            <span className="font-bold text-slate-700 uppercase">{wedding.brideBankAccountHolder}</span>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </motion.div>
                    </div>
                </motion.section>
            )}

            {/* Footer */}
            <footer className="py-8 text-center text-sm" style={{ background: '#f5f0eb', color: '#999' }}>
                <p style={{ fontFamily: 'var(--font-display)' }}>
                    {wedding.groomName} & {wedding.brideName}
                    {weddingDate && ` • ${weddingDate.toLocaleDateString('vi-VN')}`}
                    {lunarDateStr && ` (${lunarDateStr})`}
                </p>
                <p className="mt-2 text-xs">{t.poweredBy}</p>
            </footer>

            <MusicPlayer url={wedding.musicUrl || ''} />
        </div>
    );
}
