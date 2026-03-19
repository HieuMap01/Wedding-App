'use client';

import { useState, useEffect } from 'react';

interface CountdownProps {
    targetDate: string;
}

export default function Countdown({ targetDate }: CountdownProps) {
    const [timeLeft, setTimeLeft] = useState<{
        days: number;
        hours: number;
        minutes: number;
        seconds: number;
    } | null>(null);

    useEffect(() => {
        const calculateTimeLeft = () => {
            const difference = +new Date(targetDate) - +new Date();
            
            if (difference > 0) {
                setTimeLeft({
                    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                    minutes: Math.floor((difference / 1000 / 60) % 60),
                    seconds: Math.floor((difference / 1000) % 60),
                });
            } else {
                setTimeLeft(null);
            }
        };

        calculateTimeLeft();
        const timer = setInterval(calculateTimeLeft, 1000);

        return () => clearInterval(timer);
    }, [targetDate]);

    if (!timeLeft) return null;

    return (
        <div className="flex justify-center gap-4 md:gap-8 mt-10">
            {[
                { label: 'Ngày', value: timeLeft.days },
                { label: 'Giờ', value: timeLeft.hours },
                { label: 'Phút', value: timeLeft.minutes },
                { label: 'Giây', value: timeLeft.seconds },
            ].map((item, idx) => (
                <div key={idx} className="flex flex-col items-center">
                    <div className="w-16 h-16 md:w-20 md:h-20 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl flex items-center justify-center mb-2 shadow-xl">
                        <span className="text-2xl md:text-3xl font-display font-bold text-white drop-shadow-md">
                            {item.value.toString().padStart(2, '0')}
                        </span>
                    </div>
                    <span className="text-[10px] md:text-xs uppercase tracking-widest font-bold text-white/80 drop-shadow-sm">
                        {item.label}
                    </span>
                </div>
            ))}
        </div>
    );
}
