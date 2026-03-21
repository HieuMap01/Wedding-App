"use client";

import { useState, useRef, useEffect, useCallback, RefObject } from "react";
import { motion, AnimatePresence } from "framer-motion";

// --- Constants ---

const INTERACTION_EVENTS = [
  "click",
  "touchstart",
  "mousedown",
  "keydown",
] as const;

const LABEL_TIMEOUT_MS = 8000;
const DEFAULT_VOLUME = 0.15;
const MUSIC_NOTES = ["🎵", "🎶", "🎼"] as const;

// Tailwind cannot detect dynamically constructed class names (e.g. `h-${n}`).
// We must use full static class strings for each bar so they survive tree-shaking.
const BARS = [
  {
    height: "h-3",
    delay: "animate-[music-bar_0.8s_ease-in-out_0s_infinite_alternate]",
  },
  {
    height: "h-4",
    delay: "animate-[music-bar_0.8s_ease-in-out_0.2s_infinite_alternate]",
  },
  {
    height: "h-2",
    delay: "animate-[music-bar_0.8s_ease-in-out_0.4s_infinite_alternate]",
  },
  {
    height: "h-3",
    delay: "animate-[music-bar_0.8s_ease-in-out_0.1s_infinite_alternate]",
  },
] as const;

// --- Types ---

interface MusicPlayerProps {
  url: string;
  autoPlayTrigger?: boolean;
}

// --- Helper Utilities ---

function sendYoutubeCommand(
  command: string,
  args: (string | number | boolean)[] = []
) {
  const iframe = document.getElementById("youtube-player") as HTMLIFrameElement;
  iframe?.contentWindow?.postMessage(
    JSON.stringify({ event: "command", func: command, args }),
    "*"
  );
}

function parseYoutubeId(url: string): string | null {
  const ytRegex =
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
  return url?.match(ytRegex)?.[1] ?? null;
}

// --- Sub-Components ---

function PlayPauseIcon({ isPlaying }: { isPlaying: boolean }) {
  if (!isPlaying) {
    return (
      <svg className="w-5 h-5 ml-1" fill="currentColor" viewBox="0 0 24 24">
        <path d="M8 5v14l11-7z" />
      </svg>
    );
  }
  return (
    <motion.div
      initial={{ scale: 0.8 }}
      animate={{ scale: 1.1 }}
      transition={{ repeat: Infinity, duration: 0.6, repeatType: "reverse" }}
      className="flex items-center justify-center gap-0.5 h-full"
    >
      {BARS.map((bar, i) => (
        <span
          key={i}
          className={`w-1 ${bar.height} bg-white rounded-full ${bar.delay}`}
        />
      ))}
    </motion.div>
  );
}

function FloatingNotes({ isPlaying }: { isPlaying: boolean }) {
  if (!isPlaying) return null;
  return (
    <>
      {MUSIC_NOTES.map((note, i) => (
        <span
          key={i}
          className="absolute left-[10%] top-[12%] text-xl pointer-events-none music-note-float z-[-1]"
          style={
            {
              animationDelay: `${i * 0.6}s`,
              "--note-x": `${i % 2 === 0 ? 20 : -20}px`,
            } as React.CSSProperties
          }
        >
          {note}
        </span>
      ))}
    </>
  );
}

function AudioSource({
  isYoutube,
  youtubeId,
  url,
  audioRef,
}: {
  isYoutube: boolean;
  youtubeId: string | null;
  url: string;
  audioRef: RefObject<HTMLAudioElement | null>;
}) {
  if (isYoutube) {
    return (
      <div className="hidden">
        <iframe
          id="youtube-player"
          width="0"
          height="0"
          src={`https://www.youtube.com/embed/${youtubeId}?enablejsapi=1&autoplay=0&loop=1&playlist=${youtubeId}&mute=1`}
          allow="accelerometer; autoplay; encrypted-media"
        />
      </div>
    );
  }
  return <audio ref={audioRef} src={url} loop />;
}

function HintLabel({ visible }: { visible: boolean }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          className="absolute left-[64px] top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur px-3 py-1.5 rounded-lg shadow-xl border border-rose-100 whitespace-nowrap pointer-events-none z-10"
        >
          <span className="text-xs font-bold text-rose-600">
            Bật nhạc nền 🎵
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function VolumeSlider({
  volume,
  isVisible,
  onChange,
}: {
  volume: number;
  isVisible: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div
      className={`flex-1 px-3 transition-opacity duration-300 ${
        isVisible ? "opacity-100 delay-150" : "opacity-0"
      }`}
    >
      <input
        type="range"
        min="0"
        max="1"
        step="0.01"
        value={volume}
        onChange={onChange}
        title="Âm lượng"
        className="w-full h-1.5 bg-rose-100 rounded-lg appearance-none cursor-pointer accent-rose-500 shadow-inner"
      />
    </div>
  );
}

// --- Custom Hook ---

function useAutoplay(
  audioRef: RefObject<HTMLAudioElement | null>,
  isYoutube: boolean,
  url: string,
  youtubeId: string | null,
  volume: number,
  autoPlayTrigger?: boolean
) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showLabel, setShowLabel] = useState(true);

  // Refs to always have latest values without re-creating callbacks
  const volumeRef = useRef(volume);
  volumeRef.current = volume;

  const isPlayingRef = useRef(isPlaying);
  isPlayingRef.current = isPlaying;

  const playAudio = useCallback(() => {
    if (audioRef.current && !isYoutube) {
      audioRef.current.volume = volumeRef.current;
      audioRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
          setShowLabel(false);
        })
        .catch((err) => console.error("Play failed:", err));
    }

    if (isYoutube && youtubeId) {
      sendYoutubeCommand("playVideo");
      sendYoutubeCommand("unMute");
      sendYoutubeCommand("setVolume", [Math.round(volumeRef.current * 100)]);
      setIsPlaying(true);
      setShowLabel(false);
    }
  }, [audioRef, isYoutube, youtubeId]);

  const handleInteraction = useCallback(
    function interactionHandler() {
      playAudio();
      INTERACTION_EVENTS.forEach((event) => {
        window.removeEventListener(event, interactionHandler);
      });
    },
    [playAudio]
  );

  // Hide label after timeout
  useEffect(() => {
    const timer = setTimeout(() => setShowLabel(false), LABEL_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, [url]);

  // Register interaction listeners & attempt autoplay
  useEffect(() => {
    INTERACTION_EVENTS.forEach((event) => {
      window.addEventListener(event, handleInteraction, { once: true });
    });

    if (!isYoutube && url && audioRef.current) {
      audioRef.current.volume = volumeRef.current;
      audioRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
          setShowLabel(false);
        })
        .catch(() => setIsPlaying(false));
    }

    return () => {
      INTERACTION_EVENTS.forEach((event) => {
        window.removeEventListener(event, handleInteraction);
      });
    };
  }, [handleInteraction, isYoutube, url, audioRef]);

  // External trigger from parent
  useEffect(() => {
    if (autoPlayTrigger) handleInteraction();
  }, [autoPlayTrigger, handleInteraction]);

  // Resume playback when user returns to the tab.
  // Browsers pause YouTube iframes and may suspend audio in background tabs.
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!isPlayingRef.current) return;

      if (document.visibilityState === "visible") {
        if (isYoutube) {
          sendYoutubeCommand("playVideo");
          sendYoutubeCommand("unMute");
          sendYoutubeCommand("setVolume", [
            Math.round(volumeRef.current * 100),
          ]);
        } else if (audioRef.current?.paused) {
          audioRef.current.play().catch(() => {});
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isYoutube, audioRef]);

  // togglePlay uses functional setState so it doesn't depend on `isPlaying`,
  // avoiding unnecessary re-creation of the callback.
  const togglePlay = useCallback(() => {
    setIsPlaying((prev) => {
      if (isYoutube) {
        sendYoutubeCommand(prev ? "pauseVideo" : "playVideo");
      } else if (audioRef.current) {
        if (prev) audioRef.current.pause();
        else audioRef.current.play();
      }
      return !prev;
    });
  }, [isYoutube, audioRef]);

  return { isPlaying, showLabel, togglePlay };
}

// --- Main Component ---

export default function MusicPlayer({
  url,
  autoPlayTrigger = false,
}: MusicPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [volume, setVolume] = useState(DEFAULT_VOLUME);
  const [isHovered, setIsHovered] = useState(false);

  const youtubeId = parseYoutubeId(url);
  const isYoutube = !!youtubeId;

  const { isPlaying, showLabel, togglePlay } = useAutoplay(
    audioRef,
    isYoutube,
    url,
    youtubeId,
    volume,
    autoPlayTrigger
  );

  const handleVolumeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newVolume = parseFloat(e.target.value);
      setVolume(newVolume);

      if (isYoutube) {
        sendYoutubeCommand("setVolume", [Math.round(newVolume * 100)]);
      } else if (audioRef.current) {
        audioRef.current.volume = newVolume;
      }
    },
    [isYoutube]
  );

  if (!url) return null;

  return (
    <div className="fixed bottom-6 left-6 z-[100]">
      <AudioSource
        isYoutube={isYoutube}
        youtubeId={youtubeId}
        url={url}
        audioRef={audioRef}
      />

      <div
        className="relative group flex items-center"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <HintLabel visible={showLabel} />

        <div
          className={`flex items-center overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] bg-white/95 backdrop-blur shadow-2xl rounded-full border-2 ${
            isPlaying ? "border-rose-100" : "border-rose-100 opacity-90"
          } ${isHovered ? "w-40" : "w-12"}`}
          style={{ height: "48px" }}
        >
          <button
            onClick={togglePlay}
            className={`shrink-0 w-11 h-11 rounded-full flex items-center justify-center transition-all duration-500 hover:scale-105 ${
              isPlaying
                ? "bg-rose-500 text-white animate-pulse shadow-md"
                : "bg-white text-rose-500"
            }`}
          >
            <div className="relative w-6 h-6 flex items-center justify-center">
              <PlayPauseIcon isPlaying={isPlaying} />
            </div>
          </button>

          <VolumeSlider
            volume={volume}
            isVisible={isHovered}
            onChange={handleVolumeChange}
          />
        </div>

        <FloatingNotes isPlaying={isPlaying} />
      </div>

      <style jsx global>{`
        @keyframes music-bar {
          0% {
            height: 20%;
          }
          100% {
            height: 100%;
          }
        }
        @keyframes noteFloat {
          0% {
            opacity: 0;
            transform: translateY(0) translateX(0) scale(0.5);
          }
          50% {
            opacity: 1;
            transform: translateY(-30px) translateX(var(--note-x)) scale(1);
          }
          100% {
            opacity: 0;
            transform: translateY(-80px) translateX(var(--note-x)) scale(0.8);
          }
        }
        .music-note-float {
          animation: noteFloat 2s ease-out infinite;
          will-change: transform, opacity;
        }
      `}</style>
    </div>
  );
}
