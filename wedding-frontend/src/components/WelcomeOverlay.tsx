'use client';

import { motion } from 'framer-motion';

interface WelcomeOverlayProps {
    groomName: string;
    brideName: string;
    onOpen: () => void;
    primaryColor: string;
}

export default function WelcomeOverlay({ groomName, brideName, onOpen, primaryColor }: WelcomeOverlayProps) {
    return (
        <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="fixed inset-0 z-[1000] flex flex-col items-center justify-center bg-white"
        >
            <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
                <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full blur-3xl" style={{ background: primaryColor }} />
                <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full blur-3xl opacity-60" style={{ background: primaryColor }} />
            </div>

            <div className="relative z-10 text-center px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.8 }}
                >
                    <span className="text-sm uppercase tracking-[0.3em] text-slate-400 mb-6 block">Our Wedding</span>
                    <h1 className="text-4xl sm:text-6xl font-bold text-slate-800 mb-4" style={{ fontFamily: 'var(--font-display)' }}>
                        {groomName}
                    </h1>
                    <div className="text-3xl my-2" style={{ color: primaryColor }}>&amp;</div>
                    <h1 className="text-4xl sm:text-6xl font-bold text-slate-800 mb-12" style={{ fontFamily: 'var(--font-display)' }}>
                        {brideName}
                    </h1>
                </motion.div>

                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onOpen}
                    className="group relative px-10 py-4 bg-slate-900 text-white rounded-full font-bold overflow-hidden shadow-2xl transition-all"
                >
                    <div className="absolute inset-0 transition-transform duration-500 bg-gradient-to-r from-rose-500 to-primary opacity-0 group-hover:opacity-100" />
                    <span className="relative z-10 flex items-center gap-2">
                        📩 Mở Thiệp Mời
                    </span>
                </motion.button>
                
                <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.2 }}
                    className="mt-8 text-slate-400 text-xs italic"
                >
                    Nhấn để khám phá hành trình hạnh phúc của chúng tôi
                </motion.p>
            </div>
        </motion.div>
    );
}
