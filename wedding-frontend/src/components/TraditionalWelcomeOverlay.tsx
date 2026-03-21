'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

interface WelcomeOverlayProps {
    groomName: string;
    brideName: string;
    onOpen: () => void;
    primaryColor: string;
}

export default function TraditionalWelcomeOverlay({ groomName, brideName, onOpen, primaryColor }: WelcomeOverlayProps) {
    return (
        <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.05, filter: 'blur(10px)' }}
            transition={{ duration: 1.2, ease: [0.19, 1, 0.22, 1] }}
            className="fixed inset-0 z-[1000] flex items-center justify-center bg-[#5c0000]"
        >
            {/* Traditional Background Image - Double Dragons on sides */}
            <div className="absolute inset-0 z-0">
                <Image 
                    src="/images/traditional-bg.png"
                    alt="Traditional background"
                    fill
                    className="object-contain object-center opacity-40 scale-110 md:scale-100"
                    priority
                    sizes="100vw"
                    quality={90}
                />
            </div>
            
            <div className="absolute inset-0 bg-[#5c0000]/60 z-10" />

            {/* Content Box */}
            <div className="relative z-20 flex flex-col items-center justify-center text-center w-full max-w-[90%] md:max-w-[60%]">
                
                {/* Traditional Hỷ Symbol (SVG) or Motif */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1, delay: 0.2 }}
                    className="mb-8"
                >
                    <div className="w-20 h-20 md:w-28 md:h-28 rounded-full border-2 border-[#d4af37]/30 flex items-center justify-center bg-[#d4af37]/5 backdrop-blur-sm">
                        <span className="text-[#d4af37] text-4xl md:text-5xl font-serif">囍</span>
                    </div>
                </motion.div>

                {/* Names with Serif Font */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className="mb-10"
                >
                    <h1 className="text-4xl md:text-6xl text-[#f3e5ab] mb-4 font-serif italic" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
                        {groomName}
                    </h1>
                    <div className="flex items-center justify-center gap-4 my-2">
                        <div className="h-px w-12 bg-[#d4af37]/40" />
                        <span className="text-[#d4af37] text-2xl font-serif italic">&amp;</span>
                        <div className="h-px w-12 bg-[#d4af37]/40" />
                    </div>
                    <h1 className="text-4xl md:text-6xl text-[#f3e5ab] font-serif italic" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
                        {brideName}
                    </h1>
                </motion.div>

                {/* Date / Invitaiton Text */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.8 }}
                    transition={{ delay: 1, duration: 1 }}
                    className="mb-12"
                >
                    <p className="text-[#f3e5ab]/80 text-sm tracking-[0.3em] font-serif uppercase">
                        Trân trọng kính mời
                    </p>
                </motion.div>

                {/* The "Mở thiệp" Button */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1.5, duration: 0.8 }}
                >
                    <button
                        onClick={onOpen}
                        className="group relative px-10 py-4 bg-gradient-to-r from-[#8a6e2f] via-[#d4af37] to-[#8a6e2f] rounded-full shadow-[0_10px_30px_rgba(0,0,0,0.4)] hover:shadow-[0_15px_40px_rgba(212,175,55,0.4)] transition-all duration-500 hover:scale-105 active:scale-95 text-white"
                    >
                        <div className="absolute inset-[2px] rounded-full border border-white/20 pointer-events-none" />
                        <span className="relative z-10 text-sm md:text-base font-bold tracking-[0.2em] uppercase text-[#3d0000]">
                            Mở Thiệp
                        </span>
                        
                        {/* Glow effect */}
                        <div className="absolute inset-0 rounded-full bg-white opacity-0 group-hover:opacity-20 transition-opacity animate-pulse" />
                    </button>
                    
                    <p className="mt-6 text-[10px] md:text-xs text-[#f3e5ab]/60 italic font-serif tracking-wider">
                        Nhấn để xem thiệp mời và âm nhạc
                    </p>
                </motion.div>
            </div>

            {/* Background elements (floating motifs) */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-20">
                {[...Array(6)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute text-[#d4af37] text-2xl"
                        initial={{ 
                            x: Math.random() * 100 + "%", 
                            y: Math.random() * 100 + "%",
                            opacity: 0 
                        }}
                        animate={{ 
                            y: [null, "-100vh"],
                            opacity: [0, 0.5, 0],
                            rotate: 360
                        }}
                        transition={{ 
                            duration: 15 + Math.random() * 10, 
                            repeat: Infinity, 
                            delay: Math.random() * 10,
                            ease: "linear"
                        }}
                    >
                        ☁️
                    </motion.div>
                ))}
            </div>
        </motion.div>
    );
}
