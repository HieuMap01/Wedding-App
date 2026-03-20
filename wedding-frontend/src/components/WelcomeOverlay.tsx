'use client';

import { motion, AnimatePresence } from 'framer-motion';
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
        const newPetals = Array.from({ length: 20 }).map((_, i) => ({
            id: i,
            x: Math.random() * 100,
            delay: Math.random() * 8,
            duration: 15 + Math.random() * 25,
            size: 10 + Math.random() * 25,
            rotation: Math.random() * 360,
        }));
        setPetals(newPetals);
    }, []);

    return (
        <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.05, filter: 'blur(10px)' }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
            className="fixed inset-0 z-[1000] flex items-center justify-center overflow-hidden bg-[#faf7f2]"
        >
            {/* Background Texture Overlay */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/paper-fibers.png")' }} />

            {/* Floating Petals Background */}
            <div className="absolute inset-0 pointer-events-none">
                {petals.map((petal) => (
                    <motion.div
                        key={petal.id}
                        initial={{ y: -50, x: `${petal.x}%`, opacity: 0, rotate: petal.rotation }}
                        animate={{ 
                            y: '110vh', 
                            x: [`${petal.x}%`, `${petal.x + 10}%`, `${petal.x - 5}%`, `${petal.x}%`],
                            opacity: [0, 0.4, 0.4, 0],
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
                        <svg viewBox="0 0 24 24" fill={primaryColor} className="w-full h-full opacity-30 drop-shadow-sm">
                            <path d="M12,2C12,2 10,4.5 10,7C10,12 15,14 15,18C15,21 12,22 12,22C12,22 9,21 9,18C9,14 14,12 14,7C14,4.5 12,2 12,2Z" />
                        </svg>
                    </motion.div>
                ))}
            </div>

            {/* Content Container */}
            <div className="relative z-10 w-full max-w-4xl px-4 flex flex-col items-center">
                <motion.div
                    initial={{ opacity: 0, y: 40, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
                    className="relative w-full max-w-[650px] aspect-[1.6/1] md:aspect-[1.7/1] bg-white rounded-2xl shadow-[0_30px_100px_rgba(0,0,0,0.12),0_10px_30px_rgba(0,0,0,0.08)] overflow-hidden flex flex-col items-center justify-center p-6 sm:p-12 border border-white/50"
                >
                    {/* Background Image with Layering */}
                    <div 
                        className="absolute inset-0 bg-cover bg-center transition-transform duration-[10s] hover:scale-105" 
                        style={{ backgroundImage: 'url("/images/welcome-bg.png")' }}
                    />
                    
                    {/* Subtle Overlay to improve text contrast if needed */}
                    <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-white/10 pointer-events-none" />

                    {/* Decorative Frame */}
                    <div className="absolute inset-4 sm:inset-6 border border-[#c19a6b]/20 pointer-events-none rounded-xl" />
                    <div className="absolute inset-5 sm:inset-7 border border-[#c19a6b]/10 pointer-events-none rounded-lg" />

                    {/* Text Content */}
                    <div className="relative z-20 text-center flex flex-col items-center justify-center w-full mt-4 sm:mt-0">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.6, duration: 1 }}
                            className="space-y-6 sm:space-y-10"
                        >
                            <span className="text-[9px] sm:text-xs uppercase tracking-[0.6em] text-[#8a7a5f] font-semibold block mb-2 opacity-80">
                                OUR WEDDING
                            </span>
                            
                            <div className="flex flex-col items-center">
                                <h2 className="text-3xl sm:text-5xl md:text-6xl text-[#2a2a2a] leading-tight font-playfair tracking-tight" style={{ fontFamily: 'var(--font-playfair), serif' }}>
                                    {groomName}
                                </h2>
                                <div className="text-xl sm:text-2xl text-[#c19a6b] font-serif italic my-3 sm:my-5 relative">
                                    <span className="w-8 sm:w-12 h-px bg-[#c19a6b]/30 absolute -left-10 sm:-left-16 top-1/2" />
                                    &amp;
                                    <span className="w-8 sm:w-12 h-px bg-[#c19a6b]/30 absolute -right-10 sm:-right-16 top-1/2" />
                                </div>
                                <h2 className="text-3xl sm:text-5xl md:text-6xl text-[#2a2a2a] leading-tight font-playfair tracking-tight" style={{ fontFamily: 'var(--font-playfair), serif' }}>
                                    {brideName}
                                </h2>
                            </div>
                        </motion.div>

                        {/* Wax Seal Button */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 1.4, type: "spring", damping: 12 }}
                            className="mt-10 sm:mt-16"
                        >
                            <button
                                onClick={onOpen}
                                className="group relative w-20 h-20 sm:w-28 sm:h-28 transition-all duration-500 hover:scale-110 active:scale-95"
                            >
                                {/* Wax Seal with Multiply blend mode to hide white background */}
                                <div 
                                    className="absolute inset-0 bg-contain bg-center bg-no-repeat drop-shadow-[0_8px_15px_rgba(0,0,0,0.2)] transition-all mix-blend-multiply"
                                    style={{ backgroundImage: 'url("/images/wax-seal.png")' }}
                                />
                                
                                {/* Pulsing Ring around the seal */}
                                <div className="absolute inset-0 rounded-full border-2 border-[#c19a6b]/0 group-hover:border-[#c19a6b]/40 group-hover:scale-125 transition-all duration-1000 animate-ping opacity-0 group-hover:opacity-100" />
                                
                                <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 w-max text-[#8a7a5f] text-[9px] sm:text-[10px] font-bold tracking-[0.3em] uppercase opacity-0 group-hover:opacity-100 transition-all duration-300">
                                    Mở Thiệp
                                </div>
                            </button>
                        </motion.div>
                    </div>
                </motion.div>

                {/* Decorative Bottom Hint */}
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 2.2 }}
                    className="mt-12 flex flex-col items-center gap-4 opacity-40 hover:opacity-100 transition-opacity cursor-default"
                >
                    <div className="w-px h-12 bg-gradient-to-b from-[#c19a6b] to-transparent" />
                    <p className="text-[#8a7a5f] text-[10px] uppercase tracking-[0.4em] font-medium">
                        Hành trình hạnh phúc
                    </p>
                </motion.div>
            </div>
            
            {/* Corner Decorative Elements (Optional, using CSS) */}
            <div className="absolute top-0 left-0 w-32 h-32 border-l border-t border-[#c19a6b]/20 m-10 pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-32 h-32 border-r border-b border-[#c19a6b]/20 m-10 pointer-events-none" />
        </motion.div>
    );
}

