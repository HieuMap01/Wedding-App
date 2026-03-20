'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

interface WelcomeOverlayProps {
    groomName: string;
    brideName: string;
    onOpen: () => void;
    primaryColor: string;
}

export default function WelcomeOverlay({ groomName, brideName, onOpen, primaryColor }: WelcomeOverlayProps) {
    // Generate petals with deterministic values (no useState/useEffect needed)
    const petals = Array.from({ length: 10 }).map((_, i) => ({
        id: i,
        x: (i * 9.1 + 3) % 100,  // Spread evenly
        delay: (i * 0.7) % 5,
        duration: 18 + (i * 3) % 15,
        size: 14 + (i * 2.5) % 16,
    }));

    return (
        <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.1, filter: 'blur(20px)' }}
            transition={{ duration: 1.5, ease: [0.19, 1, 0.22, 1] }}
            className="fixed inset-0 z-[1000] flex items-center justify-center bg-[#f7f3f0]"
        >
            {/* Falling Petals - Pure CSS animations (GPU accelerated, no React re-renders) */}
            <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
                {petals.map((petal) => (
                    <div
                        key={petal.id}
                        className="absolute petal-fall"
                        style={{
                            left: `${petal.x}%`,
                            width: petal.size,
                            height: petal.size,
                            animationDuration: `${petal.duration}s`,
                            animationDelay: `${petal.delay}s`,
                        }}
                    >
                        <svg viewBox="0 0 24 24" fill="#fbcfe8" className="w-full h-full opacity-40 drop-shadow-sm">
                            <path d="M12,2C12,2 10,4.5 10,7C10,12 15,14 15,18C15,21 12,22 12,22C12,22 9,21 9,18C9,14 14,12 14,7C14,4.5 12,2 12,2Z" />
                        </svg>
                    </div>
                ))}
            </div>

            {/* Main Invitation Card Container */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
                className="relative w-full h-full sm:h-auto sm:w-[94vw] max-w-[1100px] aspect-none sm:aspect-[2/1] bg-white sm:shadow-[0_60px_100px_rgba(0,0,0,0.08)] overflow-hidden flex items-center justify-center p-6 sm:p-16"
            >
                {/* User Floral Background Image - optimized with next/image */}
                <Image 
                    src="/images/welcome-bg.png"
                    alt="Welcome background"
                    fill
                    className="object-cover sm:object-center"
                    priority
                    sizes="(max-width: 640px) 100vw, 94vw"
                    quality={80}
                />
                
                {/* Content Box */}
                <div className="relative z-20 flex flex-col items-center justify-center text-center w-full max-w-[80%] lg:max-w-[60%]">
                    

                    {/* Header Text */}
                    <div className="mb-6 sm:mb-10">
                        <span className="text-[10px] sm:text-xs uppercase tracking-[0.6em] text-[#8a7a5f] font-medium opacity-80">
                            OUR WEDDING
                        </span>
                    </div>

                    {/* Names with Modern Script Font */}
                    <div className="space-y-4 sm:space-y-6 lg:space-y-8 mb-10 sm:mb-14">
                        <h1 className="text-4xl sm:text-6xl lg:text-7xl text-[#1a2a4a] leading-tight font-dancing" style={{ fontFamily: 'var(--font-dancing), cursive' }}>
                            {groomName}
                        </h1>
                        <div className="flex items-center justify-center gap-4 sm:gap-6">
                            <div className="h-px w-8 sm:w-16 bg-[#c19a6b]/20" />
                            <span className="text-xl sm:text-2xl text-[#c19a6b] font-dancing italic">&amp;</span>
                            <div className="h-px w-8 sm:w-16 bg-[#c19a6b]/20" />
                        </div>
                        <h1 className="text-4xl sm:text-6xl lg:text-7xl text-[#1a2a4a] leading-tight font-dancing" style={{ fontFamily: 'var(--font-dancing), cursive' }}>
                            {brideName}
                        </h1>
                    </div>

                    {/* Pill-Shaped Wax Seal Button */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.8, duration: 1 }}
                        className="flex flex-col items-center gap-4"
                    >
                        <button
                            onClick={onOpen}
                            className="group relative flex items-center gap-3 px-8 sm:px-10 py-3 sm:py-4 bg-gradient-to-r from-[#c19a6b] via-[#d4af37] to-[#c19a6b] rounded-full shadow-[0_10px_25px_rgba(193,154,107,0.4)] hover:shadow-[0_15px_30px_rgba(193,154,107,0.6)] transition-all duration-500 hover:scale-105 active:scale-95 text-white"
                        >
                            {/* Inner Wax Texture Effect */}
                            <div className="absolute inset-[2px] rounded-full border border-white/20 pointer-events-none" />
                            
                            <svg viewBox="0 0 24 24" className="w-5 h-5 sm:w-6 sm:h-6 fill-white drop-shadow-md">
                                <path d="M20,4H4C2.9,4,2,4.9,2,6v12c0,1.1,0.9,2,2,2h16c1.1,0,2-0.9,2-2V6C22,4.9,21.1,4,20,4z M20,18H4V8l8,5l8-5V18z M12,11L4,6h16L12,11z" />
                            </svg>
                            
                            <span className="text-xs sm:text-sm font-bold tracking-[0.2em] uppercase drop-shadow-md">
                                Mở Thiệp Mời
                            </span>

                            {/* Outer Glow on Hover */}
                            <div className="absolute inset-0 rounded-full bg-white animate-pulse opacity-0 group-hover:opacity-10 transition-opacity" />
                        </button>

                        {/* Subtitle below button */}
                        <p className="text-[9px] sm:text-[10px] text-[#8a7a5f] italic opacity-60 tracking-wider font-serif">
                            Nhấn để khám phá hành trình hạnh phúc của chúng tôi
                        </p>
                    </motion.div>
                </div>
            </motion.div>

            {/* CSS Animations for petals - runs on GPU, zero JS overhead */}
            <style jsx>{`
                @keyframes petalFall {
                    0% {
                        transform: translateY(-50px) rotate(0deg) translateX(0);
                        opacity: 0;
                    }
                    10% {
                        opacity: 0.5;
                    }
                    50% {
                        opacity: 0.4;
                        transform: translateY(50vh) rotate(180deg) translateX(20px);
                    }
                    90% {
                        opacity: 0.1;
                    }
                    100% {
                        transform: translateY(110vh) rotate(360deg) translateX(-15px);
                        opacity: 0;
                    }
                }
                .petal-fall {
                    animation: petalFall linear infinite;
                    will-change: transform, opacity;
                }
            `}</style>
        </motion.div>
    );
}
