'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface MusicPlayerProps {
    url: string;
}

export default function MusicPlayer({ url }: MusicPlayerProps) {
    const [isPlaying, setIsPlaying] = useState(true); // Try to play by default
    const audioRef = useRef<HTMLAudioElement>(null);
    const [showLabel, setShowLabel] = useState(true);
    const [isYoutube, setIsYoutube] = useState(false);
    const [youtubeId, setYoutubeId] = useState<string | null>(null);

    useEffect(() => {
        const ytRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
        const match = url?.match(ytRegex);
        if (match) {
            setIsYoutube(true);
            setYoutubeId(match[1]);
        } else {
            setIsYoutube(false);
            setYoutubeId(null);
        }

        const timer = setTimeout(() => setShowLabel(false), 8000);
        return () => clearTimeout(timer);
    }, [url]);

    useEffect(() => {
        const handleInteraction = () => {
            console.log("User interaction detected, attempting to unlock audio...");
            if (audioRef.current) {
                audioRef.current.muted = false;
                audioRef.current.play().then(() => {
                    setIsPlaying(true);
                    setShowLabel(false);
                }).catch(err => {
                    console.error("Play failed after interaction:", err);
                });
            }
            
            if (isYoutube && youtubeId) {
                const iframe = document.getElementById('youtube-player') as HTMLIFrameElement;
                if (iframe && iframe.contentWindow) {
                    // Send unmute and play commands
                    iframe.contentWindow.postMessage(JSON.stringify({
                        event: 'command',
                        func: 'unMute',
                        args: []
                    }), '*');
                    iframe.contentWindow.postMessage(JSON.stringify({
                        event: 'command',
                        func: 'playVideo',
                        args: []
                    }), '*');
                }
                setIsPlaying(true);
                setShowLabel(false);
            }

            // Clean up
            ['click', 'touchstart', 'scroll', 'mousedown', 'keydown', 'wheel'].forEach(event => {
                window.removeEventListener(event, handleInteraction);
            });
        };

        ['click', 'touchstart', 'scroll', 'mousedown', 'keydown', 'wheel'].forEach(event => {
            window.addEventListener(event, handleInteraction, { once: true });
        });

        // Try Autoplay (may fail)
        if (!isYoutube && url && audioRef.current) {
            audioRef.current.play().then(() => {
                console.log("Autoplay successful");
                setIsPlaying(true);
                setShowLabel(false);
            }).catch(() => {
                console.log("Autoplay blocked, waiting for interaction");
                setIsPlaying(false);
            });
        }

        return () => {
            ['click', 'touchstart', 'scroll', 'mousedown', 'keydown', 'wheel'].forEach(event => {
                window.removeEventListener(event, handleInteraction);
            });
        };
    }, [isYoutube, url, youtubeId]);

    const togglePlay = () => {
        if (isYoutube) {
            const iframe = document.getElementById('youtube-player') as HTMLIFrameElement;
            if (iframe && iframe.contentWindow) {
                const command = isPlaying ? 'pauseVideo' : 'playVideo';
                iframe.contentWindow.postMessage(JSON.stringify({
                    event: 'command',
                    func: command,
                    args: []
                }), '*');
            }
            setIsPlaying(!isPlaying);
        } else if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
            } else {
                audioRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    if (!url) return null;

    return (
        <div className="fixed bottom-6 left-6 z-[100]">
            {isYoutube ? (
                <div className="hidden">
                    {/* Hidden YouTube player with autoplay */}
                    <iframe
                        id="youtube-player"
                        width="0"
                        height="0"
                        src={`https://www.youtube.com/embed/${youtubeId}?enablejsapi=1&autoplay=1&loop=1&playlist=${youtubeId}&mute=0`}
                        allow="accelerometer; autoplay; encrypted-media"
                    ></iframe>
                </div>
            ) : (
                <audio ref={audioRef} src={url} loop />
            )}
            
            <div className="relative group">
                <AnimatePresence>
                    {showLabel && (
                        <motion.div 
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            className="absolute left-16 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur px-3 py-1.5 rounded-lg shadow-xl border border-rose-100 whitespace-nowrap pointer-events-none"
                        >
                            <span className="text-xs font-bold text-rose-600">Bật nhạc nền 🎵</span>
                        </motion.div>
                    )}
                </AnimatePresence>

                <button
                    onClick={togglePlay}
                    className={`w-12 h-12 rounded-full flex items-center justify-center shadow-2xl transition-all duration-500 ${
                        isPlaying 
                        ? 'bg-rose-500 text-white animate-pulse' 
                        : 'bg-white text-rose-500 border-2 border-rose-100 scale-90 opacity-80'
                    }`}
                >
                    <div className="relative w-6 h-6">
                        {isPlaying ? (
                            <motion.div 
                                initial={{ scale: 0.8 }}
                                animate={{ scale: 1.1 }}
                                transition={{ repeat: Infinity, duration: 0.6, repeatType: 'reverse' }}
                                className="flex items-center justify-center gap-0.5 h-full"
                            >
                                <span className="w-1 h-3 bg-white rounded-full animate-[music-bar_0.8s_ease-in-out_infinite_alternate]"></span>
                                <span className="w-1 h-4 bg-white rounded-full animate-[music-bar_0.8s_ease-in-out_0.2s_infinite_alternate]"></span>
                                <span className="w-1 h-2 bg-white rounded-full animate-[music-bar_0.8s_ease-in-out_0.4s_infinite_alternate]"></span>
                                <span className="w-1 h-3 bg-white rounded-full animate-[music-bar_0.8s_ease-in-out_0.1s_infinite_alternate]"></span>
                            </motion.div>
                        ) : (
                            <svg className="w-6 h-6 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z" />
                            </svg>
                        )}
                    </div>
                </button>
                
                {/* Floating music notes when playing */}
                <AnimatePresence>
                    {isPlaying && [...Array(3)].map((_, i) => (
                        <motion.span
                            key={i}
                            initial={{ opacity: 0, y: 0, x: 0, scale: 0.5 }}
                            animate={{ 
                                opacity: [0, 1, 0], 
                                y: -60 - (i * 20), 
                                x: (i % 2 === 0 ? 20 : -20) + (Math.random() * 10),
                                scale: [0.5, 1, 0.8]
                            }}
                            transition={{ 
                                duration: 2, 
                                repeat: Infinity, 
                                delay: i * 0.6,
                                ease: "easeOut" 
                            }}
                            className="absolute top-0 right-0 text-xl pointer-events-none"
                        >
                            {['🎵', '🎶', '🎼'][i]}
                        </motion.span>
                    ))}
                </AnimatePresence>
            </div>
            
            <style jsx>{`
                @keyframes music-bar {
                    0% { height: 20%; }
                    100% { height: 100%; }
                }
            `}</style>
        </div>
    );
}
