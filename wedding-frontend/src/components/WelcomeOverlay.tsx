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
        const newPetals = Array.from({ length: 15 }).map((_, i) => ({
            id: i,
            x: Math.random() * 100,
            delay: Math.random() * 5,
            duration: 10 + Math.random() * 20,
            size: 15 + Math.random() * 20,
            rotation: Math.random() * 360,
        }));
        setPetals(newPetals);
    }, []);

    return (
        <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 1, ease: "easeInOut" }}
            className="fixed inset-0 z-[1000] flex items-center justify-center overflow-hidden bg-[#fbf8f5]"
        >
            {/* Floating Petals Background */}
            <div className="absolute inset-0 pointer-events-none">
                {petals.map((petal) => (
                    <motion.div
                        key={petal.id}
                        initial={{ y: -50, x: `${petal.x}%`, opacity: 0, rotate: petal.rotation }}
                        animate={{ 
                            y: '110vh', 
                            x: [`${petal.x}%`, `${petal.x + (Math.random() * 10 - 5)}%`, `${petal.x}%`],
                            opacity: [0, 0.6, 0.6, 0],
                            rotate: petal.rotation + 360
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
                        <svg viewBox="0 0 24 24" fill="#fecdd3" className="w-full h-full opacity-40">
                            <path d="M12,2C12,2 10,4.5 10,7C10,12 15,14 15,18C15,21 12,22 12,22C12,22 9,21 9,18C9,14 14,12 14,7C14,4.5 12,2 12,2Z" />
                        </svg>
                    </motion.div>
                ))}
            </div>

            {/* Content Card */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="relative z-10 w-[90%] max-w-[600px] aspect-[1.5/1] bg-white rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] overflow-hidden flex items-center justify-center p-8 md:p-12"
            >
                {/* User provided background image */}
                <div 
                    className="absolute inset-0 bg-cover bg-center pointer-events-none" 
                    style={{ backgroundImage: 'url("/images/welcome-bg.png")' }}
                />
                
                {/* Border matching the card aesthetic */}
                <div className="absolute inset-4 border border-[#e5d5c0] pointer-events-none opacity-50 rounded-lg" />

                <div className="relative z-20 text-center flex flex-col items-center justify-center w-full">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.5, duration: 1 }}
                    >
                        <span className="text-[10px] sm:text-xs uppercase tracking-[0.5em] text-[#9a8c73] mb-4 sm:mb-6 block font-medium">
                            OUR WEDDING
                        </span>
                        
                        <div className="flex flex-col items-center gap-1 sm:gap-2 mb-8 sm:mb-12">
                            <h1 className="text-3xl sm:text-5xl md:text-6xl text-[#3d3d3d] font-playfair pr-4" style={{ fontFamily: 'var(--font-playfair), serif' }}>
                                {groomName}
                            </h1>
                            <div className="text-2xl sm:text-3xl text-[#c19a6b] font-serif italic py-1">&amp;</div>
                            <h1 className="text-3xl sm:text-5xl md:text-6xl text-[#3d3d3d] font-playfair pl-4" style={{ fontFamily: 'var(--font-playfair), serif' }}>
                                {brideName}
                            </h1>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 1.2, type: "spring", stiffness: 100 }}
                    >
                        <button
                            onClick={onOpen}
                            className="group relative w-20 h-20 sm:w-28 sm:h-28 transition-transform duration-300 hover:scale-105 active:scale-95"
                        >
                            <div 
                                className="absolute inset-0 bg-contain bg-center bg-no-repeat drop-shadow-lg group-hover:drop-shadow-xl transition-all"
                                style={{ backgroundImage: 'url("/images/wax-seal.png")' }}
                            />
                            <div className="absolute -bottom-10 sm:-bottom-12 left-1/2 -translate-x-1/2 w-max text-[#9a8c73] text-[10px] sm:text-xs font-medium tracking-widest invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all uppercase">
                                Nhấp để mở thiệp
                            </div>
                        </button>
                    </motion.div>
                </div>
            </motion.div>

            {/* Simple footer for context */}
            <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.8 }}
                className="absolute bottom-10 text-[#c19a6b] text-[10px] uppercase tracking-[0.2em] font-medium opacity-60"
            >
                Khám phá hành trình hạnh phúc của chúng tôi
            </motion.p>
        </motion.div>
    );
}

