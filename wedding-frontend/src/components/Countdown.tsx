'use client';

import { useState, useEffect } from 'react';

interface CountdownProps {
    targetDate: string;
    primaryColor?: string;
    labels?: {
        days: string;
        hours: string;
        minutes: string;
        seconds: string;
    };
}

export default function Countdown({ 
    targetDate, 
    primaryColor = '#E91E63',
    labels = { days: 'Ngày', hours: 'Giờ', minutes: 'Phút', seconds: 'Giây' }
}: CountdownProps) {
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
        <div className="flex justify-center gap-3 md:gap-6 mt-8">
            {[
                { label: labels.days, value: timeLeft.days },
                { label: labels.hours, value: timeLeft.hours },
                { label: labels.minutes, value: timeLeft.minutes },
                { label: labels.seconds, value: timeLeft.seconds },
            ].map((item, idx) => (
                <div key={idx} className="flex flex-col items-center">
                    <div className="w-14 h-14 md:w-20 md:h-20 bg-gray-900/90 rounded-2xl flex items-center justify-center mb-2 shadow-2xl relative overflow-hidden border border-white/10 backdrop-blur-md">
                        <span className="text-xl md:text-3xl font-display font-bold text-white relative z-10">
                            {item.value.toString().padStart(2, '0')}
                        </span>
                        <div className="absolute inset-0 opacity-20 bg-gradient-to-tr from-white/20 to-transparent" />
                    </div>
                    <span className="text-[10px] md:text-xs uppercase tracking-[0.2em] font-black" style={{ color: primaryColor }}>
                        {item.label}
                    </span>
                </div>
            ))}
        </div>
    );
}
