'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Heart {
    id: number;
    x: number;
    y: number;
    size: number;
    color: string;
    rotation: number;
}

export default function HeartEffect() {
    const [hearts, setHearts] = useState<Heart[]>([]);

    const colors = ['#f43f5e', '#fb7185', '#fda4af', '#fecdd3', '#e11d48'];

    const addHeart = (x: number, y: number) => {
        const id = Date.now() + Math.random();
        const newHeart: Heart = {
            id,
            x: x + (Math.random() * 60 - 30),
            y: y + (Math.random() * 60 - 30),
            size: Math.random() * 25 + 20,
            color: colors[Math.floor(Math.random() * colors.length)],
            rotation: Math.random() * 60 - 30
        };

        setHearts((prev) => [...prev.slice(-30), newHeart]); // Cap at 30 hearts for performance

        // Cleanup after animation
        setTimeout(() => {
            setHearts((prev) => prev.filter((h) => h.id !== id));
        }, 1200);
    };

    const handleInteraction = (e: any) => {
        // Handle both mouse and touch events properly
        let x, y;
        if (e.touches && e.touches.length > 0) {
            x = e.touches[0].clientX;
            y = e.touches[0].clientY;
        } else {
            x = e.clientX;
            y = e.clientY;
        }
        
        if (x !== undefined && y !== undefined) {
            // Spawn multiple hearts for a more "party" effect
            for (let i = 0; i < 3; i++) {
                setTimeout(() => addHeart(x, y), i * 50);
            }
        }
    };

    useEffect(() => {
        let lastSpawn = 0;
        const throttleAdd = (e: any) => {
            const now = Date.now();
            if (now - lastSpawn > 100) { // Spawn every 100ms during move
                handleInteraction(e);
                lastSpawn = now;
            }
        };

        window.addEventListener('mousedown', handleInteraction);
        window.addEventListener('touchstart', handleInteraction, { passive: true });
        window.addEventListener('mousemove', throttleAdd);
        window.addEventListener('touchmove', throttleAdd, { passive: true });
        return () => {
            window.removeEventListener('mousedown', handleInteraction);
            window.removeEventListener('touchstart', handleInteraction);
            window.removeEventListener('mousemove', throttleAdd);
            window.removeEventListener('touchmove', throttleAdd);
        };
    }, []);

    return (
        <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
            <AnimatePresence mode="popLayout">
                {hearts.map((heart) => (
                    <motion.div
                        key={heart.id}
                        initial={{ opacity: 0, scale: 0.2, x: heart.x - heart.size / 2, y: heart.y - heart.size / 2, rotate: heart.rotation }}
                        animate={{ 
                            opacity: [0, 1, 0.8, 0], 
                            scale: [0.2, 1.2, 1, 1.2], 
                            y: heart.y - 250,
                            x: heart.x - heart.size / 2 + (Math.random() * 140 - 70),
                            rotate: heart.rotation + (Math.random() * 40 - 20)
                        }}
                        transition={{ duration: 1.2, ease: [0.23, 1, 0.32, 1] }}
                        className="absolute select-none drop-shadow-[0_0_8px_rgba(225,29,72,0.4)]"
                    >
                        <svg 
                            width={heart.size} 
                            height={heart.size} 
                            viewBox="0 0 24 24" 
                            fill={heart.color}
                        >
                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                        </svg>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
}
