'use client';

import { useState, useEffect, useRef, FormEvent } from 'react';
import { WeddingResponse, getImageUrl, interactionApi } from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Locale, useTranslation } from '@/lib/i18n';
import { getLunarDateString } from '@/lib/lunar';
import Image from 'next/image';
import Countdown from '@/components/Countdown';
import MusicPlayer from '@/components/MusicPlayer';
import TraditionalWelcomeOverlay from '@/components/TraditionalWelcomeOverlay';
import HeartEffect from '@/components/HeartEffect';

// Lazy Map component
function LazyMap({ src, title, height = 'h-96' }: { src: string; title: string; height?: string }) {
    const ref = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.disconnect();
                }
            },
            { rootMargin: '200px' }
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    return (
        <div ref={ref} className={`${height} w-full rounded-2xl overflow-hidden bg-gray-100`}>
            {isVisible ? (
                <iframe title={title} width="100%" height="100%" style={{ border: 0 }} src={src} allowFullScreen loading="lazy" />
            ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <svg className="w-8 h-8 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                </div>
            )}
        </div>
    );
}

interface TemplateProps {
    wedding: WeddingResponse;
    locale: Locale;
}

export default function Template2({ wedding, locale }: TemplateProps) {
    const t = useTranslation(locale);
    const [showWelcome, setShowWelcome] = useState(true);
    const [startMusic, setStartMusic] = useState(false);
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

    // Helper to generate VietQR URL
    const getVietQrUrl = (bankName: string | undefined, accountNumber: string | undefined, holder: string | undefined) => {
        if (!bankName || !accountNumber) return null;
        const bankId = bankName.includes(' - ') ? bankName.split(' - ')[0] : bankName;
        const cleanAccountNumber = accountNumber.replace(/[\s.·•-]/g, '');
        return `https://img.vietqr.io/image/${bankId}-${cleanAccountNumber}-compact.jpg?amount=0&addInfo=Chuc%20mung%20hanh%20phuc&accountName=${encodeURIComponent(holder || '')}`;
    };

    const primaryColor = '#8b0000'; // Deep Red
    const secondaryColor = '#d4af37'; // Gold
    const weddingDate = wedding.weddingDate ? new Date(wedding.weddingDate) : null;
    const lunarDateStr = weddingDate ? getLunarDateString(weddingDate) : '';

    // Auto-advance gallery
    useEffect(() => {
        if (!wedding?.images || wedding.images.length <= 1) return;
        const interval = setInterval(() => {
            setCurrentImageIndex(prev => (prev + 1) % wedding.images!.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [wedding]);

    const handleRsvp = async (e: FormEvent) => {
        e.preventDefault();
        const phoneRegex = /^(0|84)(3|5|7|8|9)([0-9]{8})$/;
        if (rsvpForm.guestPhone && !phoneRegex.test(rsvpForm.guestPhone.replace(/\s/g, ''))) {
            setRsvpMessage('❌ Số điện thoại không hợp lệ. Vui lòng kiểm tra lại.');
            return;
        }

        setRsvpSending(true);
        setRsvpMessage('');
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

    return (
        <div className="wedding-template-2 min-h-screen font-serif bg-[#fdfaf5]" style={{ '--color-primary': primaryColor, '--color-secondary': secondaryColor, fontFamily: 'var(--font-playfair), serif' } as React.CSSProperties}>
            <AnimatePresence>
                {showWelcome && (
                    <TraditionalWelcomeOverlay 
                        groomName={wedding.groomName} 
                        brideName={wedding.brideName} 
                        primaryColor={primaryColor}
                        onOpen={() => {
                            setShowWelcome(false);
                            setStartMusic(true);
                        }}
                    />
                )}
            </AnimatePresence>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: showWelcome ? 0 : 1 }}
                transition={{ duration: 1.2 }}
                className={showWelcome ? 'h-screen overflow-hidden' : ''}
            >
                {/* Traditional Hero Header */}
                <header className="relative bg-[#fdfaf5] overflow-hidden border-b-[6px] border-[#8b0000]">
                    {/* Top Decorative Bar with masked dragon pattern */}
                    <div className="h-20 md:h-24 bg-[#700000] relative overflow-hidden border-b-2 border-[#d4af37]/30 shadow-md">
                        <div className="absolute inset-0 opacity-70 mix-blend-overlay">
                            <Image src="/images/traditional-bg.png" alt="" fill className="object-cover" />
                        </div>
                    </div>

                    {/* Main Hero Section */}
                    <div className="py-16 md:py-24 relative flex flex-col items-center">
                        {/* Hero Background Elements */}
                        <div className="absolute inset-0 z-0">
                            {/* Full background - Faded/White */}
                            <div className="absolute inset-0 opacity-[0.05] bg-white">
                                <Image src="/images/traditional-bg.png" alt="Background" fill className="object-cover desaturate contrast-125" />
                            </div>
                        </div>

                        {/* Subtle Silk Texture */}
                        <div className="absolute inset-0 opacity-[0.03] pointer-events-none z-1" style={{ backgroundImage: 'radial-gradient(#700000 0.5px, transparent 0.5px)', backgroundSize: '32px 32px' }} />

                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 1 }}
                            className="relative z-10 w-full max-w-6xl px-4 md:px-12"
                        >
                            <div className="flex flex-row items-center justify-center gap-2 md:gap-0 h-48 md:h-96 relative">
                                {/* Middle Red Strip - Centered behind avatars & symbol (Full Width) */}
                                <div className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 w-screen h-8 sm:h-12 md:h-24 bg-[#700000] border-y-2 border-[#d4af37]/20 shadow-lg overflow-hidden z-0">
                                    <div className="absolute inset-0 opacity-60 mix-blend-overlay">
                                        <Image src="/images/traditional-bg.png" alt="" fill className="object-cover" />
                                    </div>
                                </div>
                                {/* Groom Column */}
                                <div className="flex-1 flex flex-col items-center text-center relative z-10">
                                    <div className="relative">
                                        <div className="w-24 h-24 sm:w-40 sm:h-40 md:w-72 md:h-72 rounded-full border-[4px] md:border-[10px] border-white shadow-2xl overflow-hidden relative z-10 ring-1 ring-black/5">
                                            <Image 
                                                src={wedding.groomImageUrl ? getImageUrl(wedding.groomImageUrl) : "/images/placeholder-groom.jpg"} 
                                                alt="Groom" 
                                                fill 
                                                className="object-cover" 
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Central Symbol Column */}
                                <div className="px-2 md:px-8 flex items-center justify-center relative min-w-[70px] sm:min-w-[120px] md:min-w-[200px] z-20">
                                    <div className="text-[#d4af37] text-5xl sm:text-7xl md:text-[11rem] font-bold select-none leading-none filter drop-shadow-[0_4px_10px_rgba(0,0,0,0.3)]">
                                        <span className="relative inline-block px-1 md:px-4 py-1" style={{ textShadow: '2px 2px 0 #fff, -2px -2px 0 #fff, 2px -2px 0 #fff, -2px 2px 0 #fff, 4px 4px 15px rgba(255,255,255,0.4)' }}>
                                            囍
                                        </span>
                                    </div>
                                </div>

                                {/* Bride Column */}
                                <div className="flex-1 flex flex-col items-center text-center relative z-10">
                                    <div className="relative">
                                        <div className="w-24 h-24 sm:w-40 sm:h-40 md:w-72 md:h-72 rounded-full border-[4px] md:border-[10px] border-white shadow-2xl overflow-hidden relative z-10 ring-1 ring-black/5">
                                            <Image 
                                                src={wedding.brideImageUrl ? getImageUrl(wedding.brideImageUrl) : "/images/placeholder-bride.jpg"} 
                                                alt="Bride" 
                                                fill 
                                                className="object-cover" 
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Position Labels and Names (Aligned with Avatars) */}
                            <div className="flex flex-row items-center justify-center mt-8 md:mt-12 max-w-5xl mx-auto px-4">
                                <div className="flex-1 text-center space-y-2">
                                    <p className="text-gray-500 uppercase tracking-[0.2em] text-[10px] md:text-xs font-semibold">
                                        {wedding.groomPosition || 'Trưởng Nam'}
                                    </p>
                                    <h2 className="text-4xl md:text-7xl text-[#700000] font-normal" style={{ fontFamily: 'var(--font-dancing), cursive' }}>
                                        {wedding.groomName}
                                    </h2>
                                </div>
                                
                                {/* Central spacer matching the "囍" symbol's width */}
                                <div className="px-2 md:px-8 min-w-[70px] sm:min-w-[120px] md:min-w-[200px]" />

                                <div className="flex-1 text-center space-y-2">
                                    <p className="text-gray-500 uppercase tracking-[0.2em] text-[10px] md:text-xs font-semibold">
                                        {wedding.bridePosition || 'Út Nữ'}
                                    </p>
                                    <h2 className="text-4xl md:text-7xl text-[#700000] font-normal" style={{ fontFamily: 'var(--font-dancing), cursive' }}>
                                        {wedding.brideName}
                                    </h2>
                                </div>
                            </div>

                            <div className="text-center mt-12">
                                <p className="text-[#8b0000]/40 uppercase tracking-[0.5em] text-[10px] font-bold mb-8">
                                    Trân trọng kính mời
                                </p>
                                
                                {weddingDate && (
                                    <div className="inline-block border-y border-[#8b0000]/10 py-6 px-12">
                                        <p className="text-xl md:text-2xl text-[#8b0000] font-bold tracking-wide">
                                            {weddingDate.toLocaleDateString('vi-VN', { weekday: 'long' })}, {weddingDate.toLocaleDateString('vi-VN')}
                                        </p>
                                        <p className="text-sm text-[#8a6e2f] italic mt-2 font-medium">
                                            (Tức ngày {lunarDateStr})
                                        </p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                </header>

                {/* Ceremony Info Section */}
                <section className="py-24 px-6 relative overflow-hidden">
                    <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'url("/images/traditional-bg.png")', backgroundSize: '400px', backgroundRepeat: 'repeat' }} />
                    <div className="max-w-4xl mx-auto relative z-10">
                        <motion.div 
                            className="bg-white/80 backdrop-blur-sm border-2 border-[#8b0000]/10 p-10 md:p-16 rounded-[40px] shadow-sm relative overflow-hidden"
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 1 }}
                        >
                            {/* Decorative corner */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-[#8b0000]/5 rounded-bl-[100px]" />
                            
                            <h3 className="text-3xl font-bold text-[#8b0000] text-center mb-16 relative">
                                THÔNG TIN LỄ CƯỚI
                                <div className="w-20 h-1 bg-[#d4af37] mx-auto mt-4" />
                            </h3>

                            <div className="grid md:grid-cols-2 gap-16 relative">
                                {/* Groom's Side */}
                                <div className="space-y-6 text-center md:text-left border-b md:border-b-0 md:border-r border-[#8b0000]/10 pb-10 md:pb-0 md:pr-10">
                                    <div>
                                        <p className="text-[#8a6e2f] uppercase tracking-widest text-[10px] font-bold mb-2">Nhà Trai</p>
                                        <div className="text-gray-700 leading-relaxed font-medium">
                                            {(wedding.groomFatherName || wedding.groomMotherName) && (
                                                <p className="text-lg text-[#8b0000] font-bold mb-2"> Ông bà: {wedding.groomFatherName} {wedding.groomFatherName && wedding.groomMotherName && '&'} {wedding.groomMotherName}</p>
                                            )}
                                            <p className="text-sm italic opacity-70 mb-4">
                                                {wedding.groomHouseNote}
                                            </p>
                                            <p className="text-gray-600 border-t border-[#8b0000]/5 pt-4">{wedding.groomHouseAddress}</p>
                                        </div>
                                    </div>
                                    {wedding.groomHouseAddress && (
                                        <div className="pt-4">
                                            <LazyMap title="Groom Map" height="h-48" src={`https://maps.google.com/maps?width=100%&height=400&hl=en&q=${encodeURIComponent(wedding.groomHouseAddress)}&ie=UTF8&t=&z=15&iwloc=B&output=embed`} />
                                        </div>
                                    )}
                                </div>

                                {/* Bride's Side */}
                                <div className="space-y-6 text-center md:text-left">
                                    <div>
                                        <p className="text-[#8a6e2f] uppercase tracking-widest text-[10px] font-bold mb-2">Nhà Gái</p>
                                        <div className="text-gray-700 leading-relaxed font-medium">
                                            {(wedding.brideFatherName || wedding.brideMotherName) && (
                                                <p className="text-lg text-[#8b0000] font-bold mb-2">Ông bà: {wedding.brideFatherName} {wedding.brideFatherName && wedding.brideMotherName && '&'} {wedding.brideMotherName}</p>
                                            )}
                                            <p className="text-sm italic opacity-70 mb-4">
                                                {wedding.brideHouseNote}
                                            </p>
                                            <p className="text-gray-600 border-t border-[#8b0000]/5 pt-4">{wedding.brideHouseAddress}</p>
                                        </div>
                                    </div>
                                    {wedding.brideHouseAddress && (
                                        <div className="pt-4">
                                            <LazyMap title="Bride Map" height="h-48" src={`https://maps.google.com/maps?width=100%&height=400&hl=en&q=${encodeURIComponent(wedding.brideHouseAddress)}&ie=UTF8&t=&z=15&iwloc=B&output=embed`} />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* Countdown Timer - Premium Style */}
                <section className="py-20 bg-[#8b0000] relative overflow-hidden text-center">
                    {/* Background Texture */}
                    <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'url("/images/traditional-bg.png")', backgroundSize: 'cover', backgroundPosition: 'center' }} />
                    
                    <div className="relative z-10 max-w-4xl mx-auto px-6">
                        <h4 className="text-sm uppercase tracking-[0.4em] font-bold mb-8 text-[#f3e5ab]">Ngày vui sẽ bắt đầu sau</h4>
                        <div className="countdown-premium">
                            <Countdown 
                                targetDate={wedding.weddingDate} 
                                primaryColor="#8b0000" 
                                labels={{
                                    days: t.days,
                                    hours: t.hours,
                                    minutes: t.minutes,
                                    seconds: t.seconds
                                }}
                            />
                        </div>
                    </div>

                    <style jsx global>{`
                        .countdown-premium .countdown-box {
                            background: white !important;
                            color: #8b0000 !important;
                            border-radius: 12px;
                            box-shadow: 0 10px 25px rgba(0,0,0,0.2);
                        }
                        .countdown-premium .countdown-label {
                            color: #f3e5ab !important;
                            font-weight: bold;
                        }
                    `}</style>
                </section>

                {/* Love Story Timeline - Moved here */}
                {wedding.loveStoryEvents && wedding.loveStoryEvents.length > 0 && (
                    <section id="timeline" className="py-24 px-6 relative overflow-hidden border-y border-[#8b0000]/5">
                        <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#8b0000 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
                        <div className="max-w-5xl mx-auto relative z-10">
                            <motion.h2 
                                className="text-3xl md:text-5xl font-bold text-center mb-20 text-[#8b0000]" 
                                initial={{ opacity: 0, y: 20 }} 
                                whileInView={{ opacity: 1, y: 0 }} 
                                viewport={{ once: true }} 
                                transition={{ duration: 0.8 }}
                            >
                                HÀNH TRÌNH YÊU THƯƠNG
                                <div className="w-16 h-1 bg-[#d4af37] mx-auto mt-4" />
                            </motion.h2>

                            <div className="relative">
                                {/* Vertical center line */}
                                <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-0.5 bg-[#8b0000]/10 hidden md:block" />
                                
                                <div className="space-y-16">
                                    {wedding.loveStoryEvents.map((event, idx) => (
                                        <div key={event.id} className={`flex flex-col md:flex-row items-center gap-8 md:gap-0 ${idx % 2 !== 0 ? 'md:flex-row-reverse' : ''}`}>
                                            {/* Photo */}
                                            <motion.div 
                                                className="w-full md:w-1/2 px-4 md:px-12"
                                                initial={{ opacity: 0, x: idx % 2 === 0 ? -30 : 30 }}
                                                whileInView={{ opacity: 1, x: 0 }}
                                                viewport={{ once: true }}
                                                transition={{ duration: 0.8 }}
                                            >
                                                <div className="aspect-video md:aspect-[4/3] rounded-3xl overflow-hidden shadow-xl border-4 border-white">
                                                    <Image src={getImageUrl(event.imageUrl)} alt={event.title} width={600} height={450} className="w-full h-full object-cover" />
                                                </div>
                                            </motion.div>

                                            {/* Center Dot */}
                                            <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-white border-2 border-[#8b0000]/20 items-center justify-center z-10">
                                                <div className="w-4 h-4 rounded-full bg-[#d4af37]" />
                                            </div>

                                            {/* Content */}
                                            <motion.div 
                                                className={`w-full md:w-1/2 px-4 md:px-12 text-center ${idx % 2 === 0 ? 'md:text-left' : 'md:text-right'}`}
                                                initial={{ opacity: 0, x: idx % 2 === 0 ? 30 : -30 }}
                                                whileInView={{ opacity: 1, x: 0 }}
                                                viewport={{ once: true }}
                                                transition={{ duration: 0.8 }}
                                            >
                                                <span className="text-[#d4af37] font-bold tracking-widest text-sm block mb-3">{event.eventDate}</span>
                                                <h3 className="text-2xl font-bold text-[#8b0000] mb-4" style={{ fontFamily: 'var(--font-playfair), serif' }}>{event.title}</h3>
                                                <p className="text-gray-600 leading-relaxed italic">{event.description}</p>
                                            </motion.div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>
                )}

                {/* Gallery Section - Auto-scrolling Carousel */}
                {wedding.images && wedding.images.length > 0 && (
                    <section id="gallery" className="py-24 relative overflow-hidden">
                        <div className="max-w-4xl mx-auto px-6 relative z-10">
                            <motion.h2 className="text-3xl md:text-5xl font-bold text-center mb-16 text-[#8b0000]" initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
                                ALBUM ẢNH CƯỚI
                                <div className="w-16 h-1 bg-[#d4af37] mx-auto mt-4" />
                            </motion.h2>

                            <div className="relative aspect-[4/5] md:aspect-video rounded-[40px] overflow-hidden shadow-2xl border-[8px] border-white group">
                                <AnimatePresence mode="wait">
                                    <motion.div 
                                        key={currentImageIndex}
                                        initial={{ opacity: 0, x: 50 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -50 }}
                                        transition={{ duration: 0.8, ease: "easeInOut" }}
                                        className="absolute inset-0 cursor-zoom-in"
                                        onClick={() => setIsLightboxOpen(true)}
                                    >
                                        <div className="absolute inset-0 z-0 bg-[#8b0000]/5 flex items-center justify-center">
                                            {/* Blurred Background */}
                                            <Image 
                                                src={getImageUrl(wedding.images[currentImageIndex].imageUrl)} 
                                                alt="" 
                                                fill 
                                                className="object-cover blur-2xl opacity-20 scale-110" 
                                            />
                                            {/* Top Layer Image */}
                                            <div className="relative w-full h-full z-10 flex items-center justify-center p-4">
                                                <Image 
                                                    src={getImageUrl(wedding.images[currentImageIndex].imageUrl)} 
                                                    alt="Wedding Gallery" 
                                                    fill 
                                                    className="object-contain" 
                                                    sizes="(max-width: 768px) 100vw, 800px"
                                                />
                                            </div>
                                        </div>
                                    </motion.div>
                                </AnimatePresence>
                                
                                {/* Navigation dots */}
                                <div className="absolute inset-x-0 bottom-6 flex justify-center gap-2 z-10">
                                    {wedding.images.map((_, idx) => (
                                        <button 
                                            key={idx}
                                            onClick={() => setCurrentImageIndex(idx)}
                                            className={`w-2.5 h-2.5 rounded-full transition-all ${idx === currentImageIndex ? 'bg-[#8b0000] w-6' : 'bg-white/50 hover:bg-white'}`}
                                        />
                                    ))}
                                </div>
                                
                                {/* Navigation arrows */}
                                <button onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(prev => prev === 0 ? wedding.images!.length - 1 : prev - 1); }} className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/20 hover:bg-white/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all z-10 backdrop-blur-sm">←</button>
                                <button onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(prev => (prev + 1) % wedding.images!.length); }} className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/20 hover:bg-white/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all z-10 backdrop-blur-sm">→</button>
                            </div>
                        </div>

                        {/* Fullscreen Lightbox */}
                        <AnimatePresence>
                            {isLightboxOpen && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[200] bg-black/98 flex items-center justify-center p-4" onClick={() => setIsLightboxOpen(false)}>
                                    <button className="absolute top-6 right-6 text-white/50 text-5xl hover:text-white transition-all transform hover:rotate-90" onClick={() => setIsLightboxOpen(false)}>×</button>
                                    <motion.div key={currentImageIndex} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative max-w-full max-h-full" onClick={(e) => e.stopPropagation()}>
                                        <Image src={getImageUrl(wedding.images![currentImageIndex].imageUrl)} alt="Full view" width={1600} height={1200} className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl" />
                                    </motion.div>
                                    <div className="absolute inset-x-0 bottom-10 flex justify-center gap-10">
                                        <button onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(prev => prev === 0 ? wedding.images!.length - 1 : prev - 1); }} className="w-14 h-14 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-all">←</button>
                                        <button onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(prev => (prev + 1) % wedding.images!.length); }} className="w-14 h-14 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-all">→</button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </section>
                )}

                {/* Party Info & Map */}
                <section className="py-24 border-y-2 border-[#8b0000]/5 relative overflow-hidden">
                    <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'url("/images/traditional-bg.png")', backgroundSize: '600px', backgroundPosition: 'bottom right', backgroundRepeat: 'no-repeat' }} />
                    <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
                        <h3 className="text-3xl font-bold text-[#8b0000] mb-12">
                            THÔNG TIN TIỆC CƯỚI
                            <div className="w-16 h-1 bg-[#d4af37] mx-auto mt-4" />
                        </h3>
                        
                        <div className="bg-white p-10 md:p-16 rounded-[40px] shadow-sm border border-orange-100 flex flex-col items-center">
                            <span className="text-5xl mb-6">🏰</span>
                            <h4 className="text-2xl font-bold text-[#8b0000] mb-4 uppercase">{wedding.venueName || 'Địa điểm đãi tiệc'}</h4>
                            <p className="text-gray-600 mb-10 max-w-lg">{wedding.venueAddress || 'Chưa cập nhật địa chỉ'}</p>
                            
                            <div className="w-full">
                                <LazyMap title="Party Venue" src={`https://maps.google.com/maps?width=100%&height=400&hl=en&q=${encodeURIComponent((wedding.venueAddress || '') + (wedding.venueName ? ', ' + wedding.venueName : ''))}&ie=UTF8&t=&z=15&iwloc=B&output=embed`} />
                            </div>
                        </div>

                        {/* Mừng cưới / Donation QR Section */}
                        {(wedding.groomBankAccountNumber || wedding.brideBankAccountNumber) && (
                            <div className="mt-24">
                                <h3 className="text-3xl font-bold text-[#8b0000] mb-4 uppercase tracking-widest">🧧 Mừng cưới</h3>
                                <p className="text-[#8a6e2f] italic mb-12">Sự hiện diện của quý vị là niềm hạnh phúc lớn nhất cho gia đình chúng tôi!</p>
                                
                                <div className="grid md:grid-cols-2 gap-10">
                                    {wedding.groomBankAccountNumber && (
                                        <motion.div 
                                            className="bg-white p-8 rounded-[40px] shadow-sm border border-red-50 flex flex-col items-center"
                                            initial={{ opacity: 0, x: -30 }}
                                            whileInView={{ opacity: 1, x: 0 }}
                                            viewport={{ once: true }}
                                        >
                                            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center text-2xl mb-4">🤵</div>
                                            <h4 className="text-lg font-bold text-[#8b0000] mb-6 uppercase tracking-widest">Chú Rể {wedding.groomName}</h4>
                                            <div className="w-56 h-56 bg-white rounded-2xl p-4 border-2 border-slate-100 mb-6 shadow-inner flex items-center justify-center">
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img 
                                                    src={getVietQrUrl(wedding.groomBankName, wedding.groomBankAccountNumber, wedding.groomBankAccountHolder) || ''}
                                                    className="max-w-full max-h-full object-contain" 
                                                    alt="Groom VietQR" 
                                                    onError={(e) => {
                                                        const target = e.currentTarget;
                                                        target.style.display = 'none';
                                                    }}
                                                />
                                            </div>
                                            <p className="text-sm font-bold text-gray-700 uppercase tracking-wider">{wedding.groomBankAccountHolder}</p>
                                            <p className="text-xs text-gray-400 mt-1 font-sans">{wedding.groomBankName} • {wedding.groomBankAccountNumber}</p>
                                        </motion.div>
                                    )}

                                    {wedding.brideBankAccountNumber && (
                                        <motion.div 
                                            className="bg-white p-8 rounded-[40px] shadow-sm border border-red-50 flex flex-col items-center"
                                            initial={{ opacity: 0, x: 30 }}
                                            whileInView={{ opacity: 1, x: 0 }}
                                            viewport={{ once: true }}
                                        >
                                            <div className="w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center text-2xl mb-4">👰</div>
                                            <h4 className="text-lg font-bold text-[#8b0000] mb-6 uppercase tracking-widest">Cô Dâu {wedding.brideName}</h4>
                                            <div className="w-56 h-56 bg-white rounded-2xl p-4 border-2 border-slate-100 mb-6 shadow-inner flex items-center justify-center">
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img 
                                                    src={getVietQrUrl(wedding.brideBankName, wedding.brideBankAccountNumber, wedding.brideBankAccountHolder) || ''}
                                                    className="max-w-full max-h-full object-contain" 
                                                    alt="Bride VietQR" 
                                                    onError={(e) => {
                                                        const target = e.currentTarget;
                                                        target.style.display = 'none';
                                                    }}
                                                />
                                            </div>
                                            <p className="text-sm font-bold text-gray-700 uppercase tracking-wider">{wedding.brideBankAccountHolder}</p>
                                            <p className="text-xs text-gray-400 mt-1 font-sans">{wedding.brideBankName} • {wedding.brideBankAccountNumber}</p>
                                        </motion.div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </section>

                {/* Sổ lưu bút / RSVP */}
                <section className="py-24 relative overflow-hidden">
                    <div className="max-w-2xl mx-auto px-6 text-center relative z-10">
                        <h3 className="text-3xl font-bold text-[#8b0000] mb-4">SỔ LƯU BÚT</h3>
                        <p className="text-[#8a6e2f] italic mb-12">Sự hiện diện của quý vị là niềm hạnh phúc của gia đình chúng tôi</p>

                        {rsvpSent ? (
                            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-[#fcf8f3] p-12 rounded-[40px] border border-[#d4af37]/20">
                                <span className="text-6xl block mb-6">🧧</span>
                                <p className="text-xl font-bold text-[#8b0000] mb-2">{rsvpMessage}</p>
                                <p className="text-gray-500 italic">Cảm ơn bạn đã gửi lời nhắn chúc mừng!</p>
                            </motion.div>
                        ) : (
                            <form onSubmit={handleRsvp} className="space-y-6 text-left bg-[#fcf8f3] p-8 md:p-12 rounded-[40px] border border-[#d4af37]/10 shadow-sm relative">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-[#8b0000] opacity-[0.02] rounded-bl-[100%]" />
                                
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-xs font-bold text-[#8a6e2f] uppercase tracking-wider mb-2">Họ & Tên</label>
                                        <input className="w-full bg-white border border-[#d4af37]/20 rounded-xl px-4 py-3 focus:outline-none focus:border-[#8b0000]/40 transition-all font-sans" value={rsvpForm.guestName} onChange={(e) => setRsvpForm(f => ({ ...f, guestName: e.target.value }))} required />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-[#8a6e2f] uppercase tracking-wider mb-2">Số điện thoại</label>
                                        <input className="w-full bg-white border border-[#d4af37]/20 rounded-xl px-4 py-3 focus:outline-none focus:border-[#8b0000]/40 transition-all font-sans" value={rsvpForm.guestPhone} onChange={(e) => setRsvpForm(f => ({ ...f, guestPhone: e.target.value }))} />
                                    </div>
                                </div>
                                
                                <div>
                                    <label className="block text-xs font-bold text-[#8a6e2f] uppercase tracking-wider mb-2">Lời chúc của bạn</label>
                                    <textarea className="w-full bg-white border border-[#d4af37]/20 rounded-xl px-4 py-3 min-h-[120px] focus:outline-none focus:border-[#8b0000]/40 transition-all font-sans" value={rsvpForm.wishes} onChange={(e) => setRsvpForm(f => ({ ...f, wishes: e.target.value }))} required />
                                </div>
                                
                                <div className="pb-4">
                                    <label className="block text-xs font-bold text-[#8a6e2f] uppercase tracking-wider mb-4">Xác nhận tham dự</label>
                                    <div className="flex gap-4">
                                        <label className={`flex-1 py-4 text-center rounded-2xl border-2 cursor-pointer transition-all ${rsvpForm.attendance === 'ATTENDING' ? 'border-[#8b0000] bg-[#8b0000]/5 text-[#8b0000]' : 'border-white bg-white text-gray-400 hover:border-[#d4af37]/20'}`}>
                                            <input type="radio" value="ATTENDING" checked={rsvpForm.attendance === 'ATTENDING'} onChange={(e) => setRsvpForm(f => ({ ...f, attendance: e.target.value }))} className="sr-only" />
                                            <span className="font-bold">Sẽ tham dự</span>
                                        </label>
                                        <label className={`flex-1 py-4 text-center rounded-2xl border-2 cursor-pointer transition-all ${rsvpForm.attendance === 'NOT_ATTENDING' ? 'border-[#8b0000] bg-[#8b0000]/5 text-[#8b0000]' : 'border-white bg-white text-gray-400 hover:border-[#d4af37]/20'}`}>
                                            <input type="radio" value="NOT_ATTENDING" checked={rsvpForm.attendance === 'NOT_ATTENDING'} onChange={(e) => setRsvpForm(f => ({ ...f, attendance: e.target.value }))} className="sr-only" />
                                            <span className="font-bold">Rất tiếc, vắng mặt</span>
                                        </label>
                                    </div>
                                </div>

                                <button type="submit" disabled={rsvpSending} className="w-full py-4 bg-[#8b0000] text-[#f3e5ab] font-bold rounded-2xl shadow-xl hover:shadow-[0_10px_30px_rgba(139,0,0,0.3)] transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 tracking-widest uppercase text-sm">
                                    {rsvpSending ? t.sending : 'Gửi lời chúc mừng'}
                                </button>
                            </form>
                        )}
                    </div>
                </section>

                {/* Footer */}
                <footer className="py-20 text-center bg-[#fcf8f3] border-t-[6px] border-[#8b0000]">
                    <div className="max-w-4xl mx-auto px-6">
                        <div className="w-16 h-16 rounded-full bg-[#8b0000] text-[#f3e5ab] flex items-center justify-center text-2xl font-bold mx-auto mb-6">囍</div>
                        <h5 className="text-2xl font-bold text-[#8b0000] mb-2">{wedding.groomName} & {wedding.brideName}</h5>
                        <p className="text-gray-500 text-sm tracking-widest">{weddingDate?.toLocaleDateString('vi-VN')} {lunarDateStr && `(${lunarDateStr})`}</p>
                        <div className="mt-10 pt-10 border-t border-[#8b0000]/5">
                            <p className="text-[10px] text-gray-400 uppercase tracking-[0.3em]">Cảm ơn vì đã tham dự cùng chúng tôi</p>
                        </div>
                    </div>
                </footer>

            </motion.div>

            <MusicPlayer url={wedding.musicUrl || ''} autoPlayTrigger={startMusic} />
            {!showWelcome && <HeartEffect />}
        </div>
    );
}
