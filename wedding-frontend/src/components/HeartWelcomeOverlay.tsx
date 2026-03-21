"use client";

import { motion } from "framer-motion";
import HeartEffect from "./HeartEffect";

interface WelcomeOverlayProps {
  groomName: string;
  brideName: string;
  onOpen: () => void;
  primaryColor: string;
}

export default function HeartWelcomeOverlay({
  groomName,
  brideName,
  onOpen,
  primaryColor,
}: WelcomeOverlayProps) {
  // Floating hearts with deterministic positions
  const hearts = Array.from({ length: 18 }).map((_, i) => ({
    id: i,
    x: (i * 5.6 + 2) % 100,
    y: (i * 7.3 + 10) % 80,
    delay: (i * 0.4) % 4,
    duration: 6 + ((i * 1.7) % 8),
    size: 12 + ((i * 3.2) % 20),
    opacity: 0.08 + ((i * 0.015) % 0.15),
  }));

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.05, filter: "blur(16px)" }}
      transition={{ duration: 1.2, ease: [0.19, 1, 0.22, 1] }}
      className="fixed inset-0 z-[1000] flex items-center justify-center"
      style={{ background: "#fdf8f0" }}
    >
      {/* Heart pattern background */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `url("data:image/svg+xml,${encodeURIComponent(
            `<svg xmlns='http://www.w3.org/2000/svg' width='300' height='300' viewBox='0 0 300 300'>` +
              `<defs><path id='h' d='M10 6.5C10 3.5 8 2 6 2S2 3.5 2 6.5C2 11 6 13 10 17c4-4 8-6 8-10.5C18 3.5 16 2 14 2S10 3.5 10 6.5z'/></defs>` +
              `<g fill='${primaryColor}' opacity='1'>` +
              `<use href='#h' transform='translate(25,30) scale(1.2) rotate(10,10,10)'/>` +
              `<use href='#h' transform='translate(180,15) scale(0.9) rotate(-12,10,10)'/>` +
              `<use href='#h' transform='translate(80,120) scale(1.0) rotate(18,10,10)'/>` +
              `<use href='#h' transform='translate(220,140) scale(1.3) rotate(-6,10,10)'/>` +
              `<use href='#h' transform='translate(40,230) scale(0.85) rotate(14,10,10)'/>` +
              `<use href='#h' transform='translate(170,250) scale(1.1) rotate(-10,10,10)'/>` +
              `</g></svg>`
          )}")`,
          backgroundSize: "300px 300px",
          backgroundRepeat: "repeat",
          opacity: 0.08,
        }}
      />

      {/* Floating hearts animation */}
      <HeartEffect />

      {/* Radial glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, rgba(253,242,244,0.9) 0%, transparent 70%)",
        }}
      />

      {/* Invitation Card */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-20 w-[90vw] max-w-[520px] bg-white/80 backdrop-blur-xl rounded-[32px] shadow-[0_30px_80px_rgba(196,30,58,0.12)] border border-amber-200/60 p-10 sm:p-14 text-center"
      >
        {/* Decorative top heart */}
        <div className="flex justify-center mb-6">
          <div className="w-10 h-10 flex items-center justify-center">
            <svg
              viewBox="0 0 24 24"
              className="w-8 h-8"
              style={{ fill: primaryColor, opacity: 0.7 }}
            >
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          </div>
        </div>

        {/* Subtitle */}
        <p
          className="text-[10px] sm:text-xs uppercase tracking-[0.5em] mb-8 font-medium"
          style={{ color: primaryColor, opacity: 0.6 }}
        >
          Save the Date
        </p>

        {/* Names */}
        <div className="space-y-3 sm:space-y-5 mb-10">
          <h1
            className="text-4xl sm:text-5xl lg:text-6xl leading-tight"
            style={{
              fontFamily: "var(--font-dancing), cursive",
              color: "#2d2d2d",
            }}
          >
            {groomName}
          </h1>
          <div className="flex items-center justify-center gap-4 my-3">
            <div
              className="h-px w-12 sm:w-20"
              style={{ background: `${primaryColor}30` }}
            />
            <div className="relative flex items-center justify-center w-20 h-16 sm:w-24 sm:h-20">
              <motion.svg
                viewBox="0 0 100 60"
                className="absolute inset-0 w-full h-full drop-shadow-sm z-0"
                initial={{ scale: 1.25 }}
                animate={{ scale: [1.25, 1.35, 1.25] }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                {/* Crossed Stems */}
                <path
                  d="M25,50 Q50,40 75,15"
                  fill="none"
                  stroke="#6ea35e"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
                <path
                  d="M75,50 Q50,40 25,15"
                  fill="none"
                  stroke="#6ea35e"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />

                {/* Leaves */}
                <path d="M40,35 Q35,30 35,35 Q35,40 40,35 Z" fill="#6ea35e" />
                <path d="M60,35 Q65,30 65,35 Q65,40 60,35 Z" fill="#6ea35e" />

                {/* Baby Flowers on Left Stem */}
                <circle
                  cx="75"
                  cy="15"
                  r="4"
                  fill="#ffffff"
                  stroke="#facc15"
                  strokeWidth="0.5"
                />
                <circle
                  cx="65"
                  cy="22"
                  r="3.5"
                  fill="#ffffff"
                  stroke="#facc15"
                  strokeWidth="0.5"
                />
                <circle
                  cx="58"
                  cy="14"
                  r="3"
                  fill="#ffffff"
                  stroke="#facc15"
                  strokeWidth="0.5"
                />
                <circle cx="82" cy="22" r="3" fill="#ffffff" />
                <circle cx="70" cy="8" r="3" fill="#ffffff" />

                {/* Baby Flowers on Right Stem */}
                <circle
                  cx="25"
                  cy="15"
                  r="4"
                  fill="#ffffff"
                  stroke="#facc15"
                  strokeWidth="0.5"
                />
                <circle
                  cx="35"
                  cy="22"
                  r="3.5"
                  fill="#ffffff"
                  stroke="#facc15"
                  strokeWidth="0.5"
                />
                <circle
                  cx="42"
                  cy="14"
                  r="3"
                  fill="#ffffff"
                  stroke="#facc15"
                  strokeWidth="0.5"
                />
                <circle cx="18" cy="22" r="3" fill="#ffffff" />
                <circle cx="30" cy="8" r="3" fill="#ffffff" />
              </motion.svg>
            </div>
            <div
              className="h-px w-12 sm:w-20"
              style={{ background: `${primaryColor}30` }}
            />
          </div>
          <h1
            className="text-4xl sm:text-5xl lg:text-6xl leading-tight"
            style={{
              fontFamily: "var(--font-dancing), cursive",
              color: "#2d2d2d",
            }}
          >
            {brideName}
          </h1>
        </div>

        {/* Open button */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          <button
            onClick={onOpen}
            className="group relative px-10 py-3.5 rounded-full font-bold text-xs sm:text-sm tracking-[0.2em] uppercase transition-all duration-500 hover:scale-105 hover:shadow-xl active:scale-95 bg-white/60 backdrop-blur-md border border-white"
            style={{
              color: primaryColor,
              boxShadow: `0 8px 32px rgba(0,0,0,0.06)`,
            }}
          >
            <div
              className="absolute inset-[2px] rounded-full border pointer-events-none"
              style={{ borderColor: `${primaryColor}20` }}
            />
            <span className="flex items-center justify-center gap-2.5">
              <svg
                viewBox="0 0 24 24"
                className="w-4 h-4"
                style={{ fill: primaryColor }}
              >
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
              Mở Thiệp Mời
            </span>
          </button>
          <p
            className="text-[9px] sm:text-[10px] italic tracking-wider mt-4"
            style={{ color: primaryColor, opacity: 0.5 }}
          >
            Nhấn để mở thiệp cưới của chúng tôi
          </p>
        </motion.div>
      </motion.div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes heartFloat {
          0%,
          100% {
            transform: translateY(0) scale(1) rotate(0deg);
          }
          25% {
            transform: translateY(-20px) scale(1.1) rotate(5deg);
          }
          50% {
            transform: translateY(-35px) scale(1) rotate(-3deg);
          }
          75% {
            transform: translateY(-15px) scale(1.05) rotate(2deg);
          }
        }
        .heart-float {
          animation: heartFloat ease-in-out infinite;
          will-change: transform;
        }
      `}</style>
    </motion.div>
  );
}
