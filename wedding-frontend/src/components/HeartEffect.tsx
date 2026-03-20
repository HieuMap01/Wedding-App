'use client';

import { useState, useEffect, useCallback } from 'react';

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

    const addHeart = useCallback((x: number, y: number) => {
        const id = Date.now() + Math.random();
        const newHeart: Heart = {
            id,
            x: x + (Math.random() * 60 - 30),
            y: y + (Math.random() * 60 - 30),
            size: Math.random() * 25 + 20,
            color: colors[Math.floor(Math.random() * colors.length)],
            rotation: Math.random() * 60 - 30
        };

        setHearts((prev) => [...prev.slice(-6), newHeart]); // Cap at 6 hearts (was 10)

        // Cleanup after animation
        setTimeout(() => {
            setHearts((prev) => prev.filter((h) => h.id !== id));
        }, 1200);
    }, []);

    useEffect(() => {
        let lastSpawn = 0;

        const handleInteraction = (e: MouseEvent | TouchEvent) => {
            let x, y;
            if ('touches' in e && e.touches.length > 0) {
                x = e.touches[0].clientX;
                y = e.touches[0].clientY;
            } else if ('clientX' in e) {
                x = e.clientX;
                y = e.clientY;
            }

            if (x !== undefined && y !== undefined) {
                addHeart(x, y);
            }
        };

        const throttledMove = (e: MouseEvent | TouchEvent) => {
            const now = Date.now();
            if (now - lastSpawn > 600) { // Increased throttle from 400ms to 600ms
                handleInteraction(e);
                lastSpawn = now;
            }
        };

        window.addEventListener('mousedown', handleInteraction as EventListener);
        window.addEventListener('touchstart', handleInteraction as EventListener, { passive: true });
        window.addEventListener('mousemove', throttledMove as EventListener);
        window.addEventListener('touchmove', throttledMove as EventListener, { passive: true });

        return () => {
            window.removeEventListener('mousedown', handleInteraction as EventListener);
            window.removeEventListener('touchstart', handleInteraction as EventListener);
            window.removeEventListener('mousemove', throttledMove as EventListener);
            window.removeEventListener('touchmove', throttledMove as EventListener);
        };
    }, [addHeart]);

    return (
        <>
            <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
                {hearts.map((heart) => (
                    <div
                        key={heart.id}
                        className="absolute heart-float select-none drop-shadow-[0_0_8px_rgba(225,29,72,0.4)]"
                        style={{
                            left: heart.x - heart.size / 2,
                            top: heart.y - heart.size / 2,
                            '--heart-drift': `${(Math.random() * 140 - 70)}px`,
                        } as React.CSSProperties}
                    >
                        <svg
                            width={heart.size}
                            height={heart.size}
                            viewBox="0 0 24 24"
                            fill={heart.color}
                        >
                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                        </svg>
                    </div>
                ))}
            </div>

            {/* CSS animation instead of framer-motion - GPU accelerated */}
            <style jsx>{`
                @keyframes heartFloat {
                    0% {
                        opacity: 0;
                        transform: scale(0.2) translateY(0) translateX(0) rotate(0deg);
                    }
                    15% {
                        opacity: 1;
                        transform: scale(1.2) translateY(-40px) translateX(calc(var(--heart-drift) * 0.3)) rotate(5deg);
                    }
                    60% {
                        opacity: 0.8;
                        transform: scale(1) translateY(-150px) translateX(var(--heart-drift)) rotate(-5deg);
                    }
                    100% {
                        opacity: 0;
                        transform: scale(1.2) translateY(-250px) translateX(calc(var(--heart-drift) * 0.8)) rotate(10deg);
                    }
                }
                .heart-float {
                    animation: heartFloat 1.2s cubic-bezier(0.23, 1, 0.32, 1) forwards;
                    will-change: transform, opacity;
                }
            `}</style>
        </>
    );
}
