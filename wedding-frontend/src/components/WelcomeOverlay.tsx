'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

interface WelcomeOverlayProps {
    groomName: string;
    brideName: string;
    onOpen: () => void;
    primaryColor: string;
}

interface Petal {
    id: number;
    x: number;
    delay: number;
    duration: number;
    size: number;
    rotation: number;
}

export default function WelcomeOverlay({ groomName, brideName, onOpen, primaryColor }: WelcomeOverlayProps) {
    const [petals, setPetals] = useState<Petal[]>([]);

    useEffect(() => {
        const newPetals = Array.from({ length: 15 }).map((_, i) => ({
            id: i,
            x: Math.random() * 100,
            delay: Math.random() * 5,
            duration: 20 + Math.random() * 20,
            size: 10 + Math.random() * 20,
            rotation: Math.random() * 360,
        }));
        setPetals(newPetals);
    }, []);

    return (
        <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.1, filter: 'blur(20px)' }}
            transition={{ duration: 1.5, ease: [0.19, 1, 0.22, 1] }}
            className="fixed inset-0 z-[1000] flex items-center justify-center bg-[#faf7f2] font-serif"
        >
            {/* Full Screen Background Texture */}
            <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/cream-paper.png")' }} />

            {/* Falling Petals */}
            <div className="absolute inset-0 pointer-events-none z-10">
                {petals.map((petal) => (
                    <motion.div
                        key={petal.id}
                        initial={{ y: -50, x: `${petal.x}%`, opacity: 0, rotate: petal.rotation }}
                        animate={{ 
                            y: '110vh', 
                            x: [`${petal.x}%`, `${petal.x + 8}%`, `${petal.x - 4}%`, `${petal.x}%`],
                            opacity: [0, 0.4, 0.3, 0],
                            rotate: petal.rotation + 720
                        }}
                        transition={{ 
                            duration: petal.duration, 
                            repeat: Infinity, 
                            delay: petal.delay,
                            ease: "linear"
                        }}
                        className="absolute"
                        style={{ width: petal.size, height: petal.size }}
                    >
                        <svg viewBox="0 0 24 24" fill={primaryColor} className="w-full h-full opacity-30">
                            <path d="M12,2C12,2 10,4.5 10,7C10,12 15,14 15,18C15,21 12,22 12,22C12,22 9,21 9,18C9,14 14,12 14,7C14,4.5 12,2 12,2Z" />
                        </svg>
                    </motion.div>
                ))}
            </div>

            {/* Main Invitation Container */}
            <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 2, ease: [0.16, 1, 0.3, 1] }}
                className="relative w-full h-full sm:h-auto sm:w-[90vw] max-w-[1200px] aspect-none sm:aspect-[1.6/1] md:aspect-[1.8/1] lg:aspect-[2/1] bg-white sm:rounded-[30px] shadow-[0_50px_120px_rgba(0,0,0,0.15)] overflow-hidden flex items-center justify-center p-6 sm:p-12 lg:p-20"
            >
                {/* User Floral Background Image - Using bg-cover with careful positioning */}
                <div 
                    className="absolute inset-0 bg-cover bg-center sm:bg-top lg:bg-center" 
                    style={{ backgroundImage: 'url("/images/welcome-bg.png")' }}
                />
                
                {/* Layered Gradient to Soften Background if needed */}
                <div className="absolute inset-0 bg-white/5 pointer-events-none" />

                {/* Content Box */}
                <div className="relative z-20 flex flex-col items-center justify-center text-center space-y-8 sm:space-y-10 lg:space-y-14 w-full max-w-[85%] lg:max-w-[70%]">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1, duration: 1.2 }}
                        className="flex flex-col items-center gap-3 sm:gap-4"
                    >
                        <span className="text-[10px] sm:text-xs lg:text-sm uppercase tracking-[0.8em] text-[#8a7a5f] font-semibold opacity-70">
                            Wedding Invitation
                        </span>
                        <div className="h-px w-12 lg:w-20 bg-gradient-to-r from-transparent via-[#c19a6b]/50 to-transparent" />
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.5, duration: 2 }}
                        className="space-y-6 sm:space-y-8 lg:space-y-10"
                    >
                        <h1 className="text-5xl sm:text-7xl lg:text-8xl text-[#2d2d2d] leading-[1.2] font-script" style={{ fontFamily: 'var(--font-great-vibes), cursive' }}>
                            {groomName}
                        </h1>
                        <div className="flex items-center justify-center gap-6 lg:gap-12">
                            <div className="h-[1px] flex-1 max-w-[100px] bg-gradient-to-r from-transparent to-[#c19a6b]/40" />
                            <span className="text-2xl sm:text-3xl lg:text-4xl text-[#c19a6b] font-serif italic font-light">&amp;</span>
                            <div className="h-[1px] flex-1 max-w-[100px] bg-gradient-to-l from-transparent to-[#c19a6b]/40" />
                        </div>
                        <h1 className="text-5xl sm:text-7xl lg:text-8xl text-[#2d2d2d] leading-[1.2] font-script" style={{ fontFamily: 'var(--font-great-vibes), cursive' }}>
                            {brideName}
                        </h1>
                    </motion.div>

                    {/* CSS-Native Wax Seal Button */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 2.2, duration: 1 }}
                        className="pt-4 lg:pt-8"
                    >
                        <button
                            onClick={onOpen}
                            className="group relative flex flex-col items-center gap-6"
                        >
                            <div className="relative w-20 h-20 sm:w-24 lg:w-28 lg:h-28">
                                <div className="absolute inset-0 bg-gradient-to-br from-[#d4af37] via-[#f9f295] to-[#b8860b] rounded-full shadow-[0_15px_30px_rgba(184,134,11,0.4),inset_0_2px_5px_rgba(255,255,255,0.5)] transition-transform duration-500 group-hover:scale-110 group-active:scale-95" />
                                <div className="absolute inset-[4px] rounded-full border border-[#b8860b]/30 pointer-events-none" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <svg viewBox="0 0 24 24" className="w-8 h-8 lg:w-12 lg:h-12 text-[#5c4033] opacity-60 group-hover:scale-110 transition-transform duration-500" fill="currentColor">
                                        <path d="M20,4H4C2.9,4,2,4.9,2,6v12c0,1.1,0.9,2,2,2h16c1.1,0,2-0.9,2-2V6C22,4.9,21.1,4,20,4z M20,18H4V8l8,5l8-5V18z M12,11L4,6h16L12,11z" />
                                    </svg>
                                </div>
                                <div className="absolute inset-0 bg-[#d4af37] rounded-full animate-ping opacity-10 pointer-events-none group-hover:opacity-30" />
                            </div>

                            <div className="overflow-hidden h-6 w-max">
                                <span className="text-[10px] sm:text-xs lg:text-sm uppercase tracking-[0.5em] text-[#8a7a5f] font-bold block transform translate-y-full group-hover:translate-y-0 transition-transform duration-500">
                                    Mở Thiệp Cưới
                                </span>
                            </div>
                        </button>
                    </motion.div>
                </div>

                {/* Decorative Frame Lines */}
                <div className="absolute inset-6 lg:inset-10 border border-[#c19a6b]/10 rounded-[20px] pointer-events-none" />
            </motion.div>

            {/* Background Music Hint */}
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                transition={{ delay: 3 }}
                className="absolute bottom-8 right-8 flex items-center gap-3 text-[#c19a6b]"
            >
                <div className="w-8 h-[1px] bg-current" />
                <span className="text-[9px] uppercase tracking-widest font-semibold">Music will play automatically</span>
            </motion.div>
        </motion.div>
    );
}


