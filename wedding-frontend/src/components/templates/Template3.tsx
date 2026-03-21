"use client";

import { useState, useEffect, useRef, FormEvent } from "react";
import { WeddingResponse, getImageUrl, interactionApi } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import { Locale, useTranslation } from "@/lib/i18n";
import { getLunarDateString } from "@/lib/lunar";
import Image from "next/image";
import Countdown from "@/components/Countdown";
import MusicPlayer from "@/components/MusicPlayer";
import HeartWelcomeOverlay from "@/components/HeartWelcomeOverlay";
import HeartEffect from "@/components/HeartEffect";

// Lazy Map component
function LazyMap({
  src,
  title,
  height = "h-96",
}: {
  src: string;
  title: string;
  height?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`${height} w-full rounded-2xl overflow-hidden bg-amber-50`}
    >
      {isVisible ? (
        <iframe
          title={title}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          src={src}
          allowFullScreen
          loading="lazy"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-amber-300">
          <svg
            className="w-8 h-8 animate-pulse"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        </div>
      )}
    </div>
  );
}

// Helper component for QR Reveal
function QrReveal({
  primaryColor,
  label,
  children,
}: {
  alt: string;
  primaryColor: string;
  label: string;
  children: React.ReactNode;
}) {
  const [isRevealed, setIsRevealed] = useState(false);

  return (
    <div className="w-full relative flex items-center justify-center">
      <AnimatePresence mode="wait">
        {!isRevealed ? (
          <motion.div
            key="hidden"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3 }}
            className="w-full h-full flex flex-col items-center justify-center gap-4 cursor-pointer rounded-xl transition-all group"
            onClick={() => setIsRevealed(true)}
          >
            <motion.div
              className="relative w-28 h-28 flex items-center justify-center mb-2"
              animate={{ scale: [1, 1.05, 1], y: [0, -5, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              {/* Decorative backgrounds */}
              <div className="absolute inset-0 bg-white/40 backdrop-blur-sm rounded-2xl border border-white/60 shadow-lg transform rotate-6 transition-transform group-hover:rotate-12 group-hover:scale-105" />
              <div className="absolute inset-0 bg-white/80 backdrop-blur-md rounded-2xl border border-white/80 shadow-sm flex items-center justify-center transform -rotate-3 transition-transform group-hover:rotate-0 group-hover:scale-105">
                <svg
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke={primaryColor}
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 12 20 22 4 22 4 12" />
                  <rect x="2" y="7" width="20" height="5" />
                  <line x1="12" y1="22" x2="12" y2="7" />
                  <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
                  <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
                </svg>
              </div>
              {/* Sparkle */}
              <motion.div
                className="absolute -top-2 -right-2 text-amber-500 text-xl"
                animate={{ scale: [1, 1.3, 1], opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                ✨
              </motion.div>
            </motion.div>
            <span
              className="text-sm font-semibold tracking-wider uppercase"
              style={{ color: primaryColor }}
            >
              {label}
            </span>
          </motion.div>
        ) : (
          <motion.div
            key="revealed"
            initial={{ opacity: 0, scale: 0.8, filter: "blur(10px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            transition={{ duration: 0.5, type: "spring" }}
            className="w-full h-full"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface TemplateProps {
  wedding: WeddingResponse;
  locale: Locale;
}

export default function Template3({ wedding, locale }: TemplateProps) {
  const t = useTranslation(locale);
  const [showWelcome, setShowWelcome] = useState(true);
  const [startMusic, setStartMusic] = useState(false);
  const [rsvpForm, setRsvpForm] = useState({
    guestName: "",
    guestPhone: "",
    wishes: "",
    attendance: "ATTENDING",
  });
  const [rsvpSent, setRsvpSent] = useState(false);
  const [rsvpSending, setRsvpSending] = useState(false);
  const [rsvpMessage, setRsvpMessage] = useState("");
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const primaryColor = "#c41e3a";
  const secondaryColor = "#d4af37";
  const accentColor = "#f0c75e";
  const weddingDate = wedding.weddingDate
    ? new Date(wedding.weddingDate)
    : null;
  const lunarDateStr = weddingDate ? getLunarDateString(weddingDate) : "";

  const [babyFlowers, setBabyFlowers] = useState<
    Array<{
      id: number;
      left: number;
      size: number;
      duration: number;
      delay: number;
      drift: number;
      center: string;
      petal: string;
    }>
  >([]);

  useEffect(() => {
    const bColors = [
      { center: "#D4B872", petal: "#F4F1EA" },
      { center: "#BA7F7F", petal: "#E8C4C4" },
      { center: "#7A8B99", petal: "#BDD0D9" },
      { center: "#8E7CC3", petal: "#D1C4E9" },
      { center: "#D99C6A", petal: "#F5E0C3" },
    ];
    setBabyFlowers(
      Array.from({ length: 12 }).map((_, i) => ({
        id: i,
        left: Math.random() * 96 + 2,
        size: Math.random() * 25 + 8,
        duration: Math.random() * 10 + 7,
        delay: Math.random() * 10,
        drift: (Math.random() - 0.5) * 80,
        center: bColors[Math.floor(Math.random() * bColors.length)].center,
        petal: bColors[Math.floor(Math.random() * bColors.length)].petal,
      }))
    );
  }, []);

  // Helper to generate VietQR URL
  const getVietQrUrl = (
    bankName: string | undefined,
    accountNumber: string | undefined,
    holder: string | undefined
  ) => {
    if (!bankName || !accountNumber) return null;
    const bankId = bankName.includes(" - ")
      ? bankName.split(" - ")[0]
      : bankName;
    const cleanAccountNumber = accountNumber.replace(/[\s.·•-]/g, "");
    return `https://img.vietqr.io/image/${bankId}-${cleanAccountNumber}-compact.jpg?amount=0&addInfo=Chuc%20mung%20hanh%20phuc&accountName=${encodeURIComponent(
      holder || ""
    )}`;
  };

  // Auto-advance gallery
  useEffect(() => {
    if (!wedding?.images || wedding.images.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % wedding.images!.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [wedding]);

  const handleRsvp = async (e: FormEvent) => {
    e.preventDefault();
    const phoneRegex = /^(0|84)(3|5|7|8|9)([0-9]{8})$/;
    if (
      rsvpForm.guestPhone &&
      !phoneRegex.test(rsvpForm.guestPhone.replace(/\s/g, ""))
    ) {
      setRsvpMessage("❌ Số điện thoại không hợp lệ. Vui lòng kiểm tra lại.");
      return;
    }

    setRsvpSending(true);
    setRsvpMessage("");
    try {
      await interactionApi.submitRsvp(wedding.id, rsvpForm);
      setRsvpSent(true);
      setRsvpMessage(t.successRsvp);
    } catch (err: unknown) {
      setRsvpMessage("❌ " + (err instanceof Error ? err.message : "Error"));
    } finally {
      setRsvpSending(false);
    }
  };

  return (
    <div
      className="wedding-template-3 min-h-screen bg-[#fdf8f0] relative"
      style={
        {
          "--color-primary": primaryColor,
          "--color-secondary": secondaryColor,
        } as React.CSSProperties
      }
    >
      {/* Full-screen heart pattern background */}
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage: 'url("/images/heart-bg.png")',
          backgroundSize: "500px",
          backgroundRepeat: "repeat",
          opacity: 0.03,
          scale: 3,
        }}
      />

      {/* Scattered tulips background */}
      {/* <RandomTulipsBg /> */}

      <AnimatePresence>
        {showWelcome && (
          <HeartWelcomeOverlay
            groomName={wedding.groomName}
            brideName={wedding.brideName}
            primaryColor={primaryColor}
            onOpen={() => {
              setShowWelcome(false);
              setStartMusic(true);
            }}
          />
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: showWelcome ? 0 : 1 }}
        transition={{ duration: 1 }}
        className={showWelcome ? "h-screen overflow-hidden" : ""}
      >
        {/* ═══════════════════════════════════════════════
                    HERO SECTION
                ═══════════════════════════════════════════════ */}
        <section className="relative py-24 md:py-36 flex flex-col items-center justify-center text-center px-6 overflow-hidden min-h-[100svh]">
          {/* Soft gradient blobs */}
          <div
            className="absolute -top-32 -right-32 w-96 h-96 rounded-full opacity-20 blur-3xl"
            style={{ background: accentColor }}
          />
          <div
            className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full opacity-15 blur-3xl"
            style={{ background: secondaryColor }}
          />
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full opacity-10 blur-3xl"
            style={{ background: primaryColor }}
          />

          <motion.div
            className="relative z-10"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
          >
            {/* Small decorative heart */}
            {/* <div className="flex justify-center mb-6">
                            <svg viewBox="0 0 24 24" className="w-6 h-6" style={{ fill: primaryColor, opacity: 0.5 }}>
                                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                            </svg>
                        </div> */}

            <p
              className="text-xs uppercase tracking-[0.4em] mb-6 font-semibold"
              style={{ color: primaryColor, opacity: 0.7 }}
            >
              {t.gettingMarried}
            </p>

            <h1
              className="text-5xl sm:text-7xl md:text-8xl mb-3 font-normal"
              style={{
                fontFamily: "var(--font-dancing), cursive",
                color: "#2d2d2d",
              }}
            >
              {wedding.groomName}
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
              className="text-5xl sm:text-7xl md:text-8xl mb-10 font-normal"
              style={{
                fontFamily: "var(--font-dancing), cursive",
                color: "#2d2d2d",
              }}
            >
              {wedding.brideName}
            </h1>

            {weddingDate && (
              <div className="flex flex-col items-center gap-3">
                <div className="inline-flex items-center gap-6 sm:gap-10 px-8 py-5 bg-white/40 backdrop-blur-md rounded-full border border-white/60 shadow-[0_8px_32px_rgba(0,0,0,0.08)]">
                  <div className="text-center">
                    <p
                      className="text-2xl sm:text-3xl font-bold"
                      style={{ color: primaryColor }}
                      suppressHydrationWarning
                    >
                      {weddingDate.getDate()}
                    </p>
                    <p
                      className="text-[10px] sm:text-xs uppercase tracking-wider text-gray-500"
                      suppressHydrationWarning
                    >
                      {t.month} {weddingDate.getMonth() + 1}
                    </p>
                  </div>
                  <div
                    className="w-px h-10"
                    style={{ background: `${primaryColor}25` }}
                  />
                  <div className="text-center">
                    <p
                      className="text-2xl sm:text-3xl font-bold"
                      style={{ color: primaryColor }}
                      suppressHydrationWarning
                    >
                      {weddingDate.getFullYear()}
                    </p>
                    <p
                      className="text-[10px] sm:text-xs uppercase tracking-wider text-gray-500"
                      suppressHydrationWarning
                    >
                      {weddingDate.toLocaleTimeString("vi-VN", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
                <p
                  className="text-sm italic font-medium"
                  style={{ color: primaryColor, opacity: 0.7 }}
                >
                  {lunarDateStr}
                </p>

                <div className="mt-6 scale-90 sm:scale-100">
                  <Countdown
                    targetDate={wedding.weddingDate}
                    primaryColor={primaryColor}
                    labels={{
                      days: t.days,
                      hours: t.hours,
                      minutes: t.minutes,
                      seconds: t.seconds,
                    }}
                  />
                </div>
              </div>
            )}
          </motion.div>
        </section>

        {/* ═══════════════════════════════════════════════
                    LOVE STORY TIMELINE
                ═══════════════════════════════════════════════ */}
        {wedding.loveStoryEvents && wedding.loveStoryEvents.length > 0 && (
          <section
            id="timeline"
            className="py-24 px-6 bg-[#fffdf8]/80 relative overflow-hidden"
          >
            <div className="max-w-5xl mx-auto relative z-10">
              <motion.div
                className="text-center mb-20"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              >
                <p
                  className="text-xs uppercase tracking-[0.3em] mb-3 font-semibold"
                  style={{ color: primaryColor, opacity: 0.6 }}
                >
                  Our Journey
                </p>
                <h2
                  className="text-4xl font-bold"
                  style={{
                    fontFamily: "var(--font-display)",
                    color: "#2d2d2d",
                  }}
                >
                  {t.timelineTitle}
                </h2>
                <div
                  className="w-16 h-1 mx-auto mt-4 rounded-full"
                  style={{
                    background: `linear-gradient(90deg, ${primaryColor}, ${secondaryColor})`,
                  }}
                />
              </motion.div>

              <div className="relative">
                {/* Center line */}
                <motion.div
                  className="absolute left-[20px] md:left-[calc(50%-1px)] top-0 bottom-0 w-0 block border-l-[2px] border-dashed origin-top"
                  style={{ borderColor: `${primaryColor}40` }}
                  initial={{ scaleY: 0 }}
                  whileInView={{ scaleY: 1 }}
                  viewport={{ once: true, margin: "0px" }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                />

                <div className="space-y-16">
                  {wedding.loveStoryEvents.map((event, idx) => (
                    <div
                      key={event.id}
                      className={`flex flex-col md:flex-row items-center gap-8 md:gap-0 ${
                        idx % 2 !== 0 ? "md:flex-row-reverse" : ""
                      }`}
                    >
                      {/* Photo */}
                      <motion.div
                        className="w-full md:w-1/2 pl-12 pr-4 md:px-12"
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                      >
                        {event.imageUrl && (
                          <div className="aspect-[4/3] rounded-3xl overflow-hidden shadow-xl border-4 border-white ring-1 ring-amber-100 group">
                            <Image
                              src={getImageUrl(event.imageUrl)}
                              alt={event.title}
                              width={600}
                              height={450}
                              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                          </div>
                        )}
                      </motion.div>

                      {/* Center Heart Dot */}
                      <motion.div
                        className="flex absolute left-[20px] md:left-1/2 -translate-x-1/2 w-8 h-8 md:w-10 md:h-10 rounded-full bg-white border-2 items-center justify-center z-10 shadow-sm"
                        style={{ borderColor: `${secondaryColor}50` }}
                        initial={{ scale: 0 }}
                        whileInView={{ scale: 1 }}
                        viewport={{ once: true, margin: "0px" }}
                        transition={{
                          type: "spring",
                          stiffness: 200,
                          damping: 10,
                          delay: 0.2,
                        }}
                      >
                        <motion.svg
                          viewBox="0 0 24 24"
                          className="w-3 h-3 md:w-4 md:h-4"
                          style={{ fill: primaryColor }}
                          animate={{ scale: [1, 1.25, 1] }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut",
                          }}
                        >
                          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                        </motion.svg>
                      </motion.div>

                      {/* Content */}
                      <motion.div
                        className={`w-full md:w-1/2 pl-12 pr-4 md:px-12 text-left ${
                          idx % 2 === 0 ? "md:text-left" : "md:text-right"
                        }`}
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                      >
                        <div
                          className="inline-block px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase mb-3"
                          style={{
                            background: `${primaryColor}10`,
                            color: primaryColor,
                          }}
                        >
                          {event.eventDate}
                        </div>
                        <h3
                          className="text-2xl font-bold text-gray-800 mb-3"
                          style={{
                            fontFamily: "var(--font-dancing)",
                            fontSize: "2rem",
                          }}
                        >
                          {event.title}
                        </h3>
                        <p className="text-gray-600 leading-relaxed italic whitespace-pre-line">
                          {event.description}
                        </p>
                      </motion.div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ═══════════════════════════════════════════════
                    GALLERY CAROUSEL
                ═══════════════════════════════════════════════ */}
        {wedding.images && wedding.images.length > 0 && (
          <section id="gallery" className="py-24 px-6 relative overflow-hidden">
            <div className="max-w-6xl mx-auto relative z-10">
              <motion.div
                className="text-center mb-16"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              >
                <p
                  className="text-xs uppercase tracking-[0.3em] mb-3 font-semibold"
                  style={{ color: primaryColor, opacity: 0.6 }}
                >
                  Memories
                </p>
                <h2
                  className="text-4xl font-bold"
                  style={{
                    fontFamily: "var(--font-display)",
                    color: "#2d2d2d",
                  }}
                >
                  {t.galleryTitle}
                </h2>
                <div
                  className="w-16 h-1 mx-auto mt-4 rounded-full"
                  style={{
                    background: `linear-gradient(90deg, ${primaryColor}, ${secondaryColor})`,
                  }}
                />
              </motion.div>

              {/* Mobile Carousel */}
              <div className="block md:hidden">
                {/* Main Image */}
                <div className="relative aspect-[4/5] rounded-[32px] overflow-hidden shadow-2xl border-[6px] border-white ring-1 ring-amber-100 group mb-6">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentImageIndex}
                      initial={{ opacity: 0, scale: 1 }}
                      animate={{ opacity: 1, scale: 1.05 }}
                      exit={{ opacity: 0, scale: 1 }}
                      transition={{ duration: 0.6, ease: "easeInOut" }}
                      className="absolute inset-0 cursor-zoom-in"
                      onClick={() => setIsLightboxOpen(true)}
                    >
                      <div className="absolute inset-0 z-0 bg-amber-50 flex items-center justify-center">
                        <Image
                          src={getImageUrl(
                            wedding.images[currentImageIndex].imageUrl
                          )}
                          alt=""
                          fill
                          className="object-cover blur-2xl opacity-20 scale-110"
                        />
                        <div className="relative w-full h-full z-10 flex items-center justify-center p-4">
                          <Image
                            src={getImageUrl(
                              wedding.images[currentImageIndex].imageUrl
                            )}
                            alt="Wedding Gallery"
                            fill
                            className="object-cover rounded-xl"
                            sizes="100vw"
                          />
                        </div>
                      </div>
                    </motion.div>
                  </AnimatePresence>

                  {/* Nav dots */}
                  <div className="absolute inset-x-0 bottom-4 flex justify-center gap-2 z-10">
                    {wedding.images.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentImageIndex(idx)}
                        className={`h-2.5 rounded-full transition-all duration-300 ${
                          idx === currentImageIndex
                            ? "w-7"
                            : "w-2.5 hover:bg-white"
                        }`}
                        style={{
                          background:
                            idx === currentImageIndex
                              ? primaryColor
                              : "rgba(255,255,255,0.5)",
                        }}
                      />
                    ))}
                  </div>

                  {/* Nav arrows */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentImageIndex((prev) =>
                        prev === 0 ? wedding.images!.length - 1 : prev - 1
                      );
                    }}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/30 hover:bg-white/50 text-white flex items-center justify-center opacity-70 group-hover:opacity-100 transition-all z-10 backdrop-blur-sm shadow-sm"
                  >
                    ←
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentImageIndex(
                        (prev) => (prev + 1) % wedding.images!.length
                      );
                    }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/30 hover:bg-white/50 text-white flex items-center justify-center opacity-70 group-hover:opacity-100 transition-all z-10 backdrop-blur-sm shadow-sm"
                  >
                    →
                  </button>
                </div>

                {/* Thumbnails */}
                {wedding.images.length > 1 && (
                  <motion.div
                    className="flex gap-1 overflow-x-auto pb-4 px-2 snap-x justify-center scrollbar-hide"
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={{
                      visible: { transition: { staggerChildren: 0.08 } },
                    }}
                  >
                    {wedding.images.map((img, idx) => (
                      <motion.button
                        key={img.id}
                        onClick={() => setCurrentImageIndex(idx)}
                        variants={{
                          hidden: { opacity: 0, scale: 0.5, y: 10 },
                          visible: { opacity: 1, scale: 0.8, y: 0 },
                        }}
                        className={`relative flex-shrink-0 w-20 aspect-square rounded-xl overflow-hidden transition-all duration-300 snap-center bg-amber-50 ${
                          currentImageIndex === idx
                            ? "ring-3 ring-offset-2 scale-110 shadow-lg z-10"
                            : "opacity-40 hover:opacity-100 scale-90"
                        }`}
                        style={
                          {
                            "--tw-ring-color": primaryColor,
                          } as React.CSSProperties
                        }
                      >
                        <Image
                          src={getImageUrl(img.imageUrl)}
                          alt="thumb"
                          width={80}
                          height={80}
                          className="w-full h-full object-cover"
                          sizes="80px"
                          loading="lazy"
                        />
                      </motion.button>
                    ))}
                  </motion.div>
                )}
              </div>

              {/* Desktop Masonry Grid */}
              <div className="hidden md:block md:columns-2 lg:columns-3 gap-6 space-y-6">
                {wedding.images.map((img, idx) => (
                  <motion.div
                    key={img.id}
                    className="relative rounded-[24px] overflow-hidden cursor-zoom-in break-inside-avoid shadow-lg ring-1 ring-black/5 group"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: (idx % 3) * 0.1 }}
                    onClick={() => {
                      setCurrentImageIndex(idx);
                      setIsLightboxOpen(true);
                    }}
                  >
                    <Image
                      src={getImageUrl(img.imageUrl)}
                      alt="gallery"
                      width={600}
                      height={800}
                      className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
                      sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                    />
                    <div className="absolute inset-0 transition-opacity duration-300 opacity-0 group-hover:opacity-100 bg-gradient-to-t from-black/60 via-black/10 to-transparent flex items-end justify-end p-6">
                      <div className="bg-white/20 backdrop-blur-md w-12 h-12 rounded-full flex items-center justify-center text-white transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 border border-white/30 shadow-lg">
                        <svg
                          className="w-5 h-5 drop-shadow-md"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
                          />
                        </svg>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Lightbox */}
              <AnimatePresence>
                {isLightboxOpen && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[200] bg-black/95 flex items-center justify-center p-4"
                    onClick={() => setIsLightboxOpen(false)}
                  >
                    <button
                      className="absolute top-6 right-6 text-white/60 text-5xl hover:text-white transition-all transform hover:rotate-90"
                      onClick={() => setIsLightboxOpen(false)}
                    >
                      ×
                    </button>
                    <motion.div
                      key={currentImageIndex}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="relative max-w-full max-h-full"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Image
                        src={getImageUrl(
                          wedding.images[currentImageIndex].imageUrl
                        )}
                        alt="Full view"
                        width={1600}
                        height={1200}
                        className="max-w-full max-h-[90vh] object-contain rounded-lg"
                        sizes="100vw"
                        priority
                      />
                    </motion.div>
                    <div className="absolute inset-x-0 bottom-10 flex justify-center gap-8">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setCurrentImageIndex((prev) =>
                            prev === 0 ? wedding.images!.length - 1 : prev - 1
                          );
                        }}
                        className="w-14 h-14 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all"
                      >
                        ←
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setCurrentImageIndex(
                            (prev) => (prev + 1) % wedding.images!.length
                          );
                        }}
                        className="w-14 h-14 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all"
                      >
                        →
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </section>
        )}

        {/* ═══════════════════════════════════════════════
                    LOVE STORY TEXT
                ═══════════════════════════════════════════════ */}
        {wedding.loveStory && (
          <motion.section
            id="story"
            className="py-20 px-6 bg-[#fffdf8]/80"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.8 }}
          >
            <div className="max-w-3xl mx-auto text-center">
              <p
                className="text-xs uppercase tracking-[0.3em] mb-3 font-semibold"
                style={{ color: primaryColor, opacity: 0.6 }}
              >
                {t.loveStorySub}
              </p>
              <h2
                className="text-3xl font-bold mb-8"
                style={{ fontFamily: "var(--font-display)", color: "#2d2d2d" }}
              >
                {t.loveStoryTitle}
              </h2>
              <div className="text-gray-600 leading-relaxed whitespace-pre-line text-lg">
                {wedding.loveStory}
              </div>
            </div>
          </motion.section>
        )}

        {/* ═══════════════════════════════════════════════
                    VENUE & MAP
                ═══════════════════════════════════════════════ */}
        {(wedding.venueName ||
          wedding.venueAddress ||
          wedding.groomHouseAddress ||
          wedding.brideHouseAddress) && (
          <motion.section
            className="py-24 px-6 relative overflow-hidden"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1 }}
          >
            <div className="max-w-5xl mx-auto text-center relative z-10">
              <p
                className="text-xs uppercase tracking-[0.3em] mb-3 font-semibold"
                style={{ color: primaryColor, opacity: 0.6 }}
              >
                {t.locationSub}
              </p>
              <h2
                className="text-3xl font-bold mb-12"
                style={{ fontFamily: "var(--font-display)", color: "#2d2d2d" }}
              >
                {t.locationTitle}
              </h2>
              <div
                className="w-16 h-1 mx-auto mb-12 rounded-full"
                style={{
                  background: `linear-gradient(90deg, ${primaryColor}, ${secondaryColor})`,
                }}
              />

              {!wedding.groomHouseAddress && !wedding.brideHouseAddress ? (
                <motion.div
                  className="mb-12 max-w-4xl mx-auto"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8 }}
                >
                  {wedding.venueName && (
                    <p className="text-2xl font-semibold text-gray-800 mb-2">
                      {wedding.venueName}
                    </p>
                  )}
                  {wedding.venueAddress && (
                    <p className="text-gray-600 mb-6">{wedding.venueAddress}</p>
                  )}
                  {(wedding.venueAddress || wedding.venueName) && (
                    <LazyMap
                      title="Venue Map"
                      src={`https://maps.google.com/maps?width=100%&height=400&hl=en&q=${encodeURIComponent(
                        (wedding.venueAddress || "") +
                          (wedding.venueName ? ", " + wedding.venueName : "")
                      )}&ie=UTF8&t=&z=15&iwloc=B&output=embed`}
                    />
                  )}
                </motion.div>
              ) : (
                <motion.div
                  className="grid md:grid-cols-2 gap-10 text-left"
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-100px" }}
                  variants={{
                    visible: { transition: { staggerChildren: 0.3 } },
                  }}
                >
                  {wedding.groomHouseAddress && (
                    <motion.div
                      variants={{
                        hidden: { opacity: 0, x: -40 },
                        visible: { opacity: 1, x: 0 },
                      }}
                      transition={{ duration: 0.8 }}
                      className="bg-white p-8 rounded-3xl shadow-lg border border-amber-100 relative overflow-hidden transform transition-transform hover:-translate-y-1 hover:shadow-xl"
                    >
                      <div
                        className="absolute top-0 left-0 w-full h-1.5 rounded-b-full"
                        style={{
                          background: `linear-gradient(90deg, ${primaryColor}, ${secondaryColor})`,
                        }}
                      />
                      <div className="flex items-center gap-3 mb-5 mt-2">
                        <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center text-2xl">
                          🤵
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-800">
                            {t.groomHouse}
                          </h3>
                          {wedding.groomHouseName && (
                            <p
                              className="text-sm font-medium"
                              style={{ color: primaryColor }}
                            >
                              {wedding.groomHouseName}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2 mb-6 items-start">
                        <span className="text-gray-400 mt-1">📍</span>
                        <p className="text-gray-600 text-sm leading-relaxed">
                          {wedding.groomHouseAddress}
                        </p>
                      </div>
                      <LazyMap
                        title="Groom Map"
                        height="h-52"
                        src={`https://maps.google.com/maps?width=100%&height=400&hl=en&q=${encodeURIComponent(
                          wedding.groomHouseLat && wedding.groomHouseLng
                            ? `${wedding.groomHouseLat},${wedding.groomHouseLng}`
                            : (wedding.groomHouseAddress || "") +
                                (wedding.groomHouseName
                                  ? ", " + wedding.groomHouseName
                                  : "")
                        )}&ie=UTF8&t=&z=15&iwloc=B&output=embed`}
                      />
                    </motion.div>
                  )}
                  {wedding.brideHouseAddress && (
                    <motion.div
                      variants={{
                        hidden: { opacity: 0, x: 40 },
                        visible: { opacity: 1, x: 0 },
                      }}
                      transition={{ duration: 0.8 }}
                      className="bg-white p-8 rounded-3xl shadow-lg border border-amber-100 relative overflow-hidden transform transition-transform hover:-translate-y-1 hover:shadow-xl"
                    >
                      <div
                        className="absolute top-0 left-0 w-full h-1.5 rounded-b-full"
                        style={{
                          background: `linear-gradient(90deg, ${secondaryColor}, ${primaryColor})`,
                        }}
                      />
                      <div className="flex items-center gap-3 mb-5 mt-2">
                        <div className="w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center text-2xl">
                          👰
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-800">
                            {t.brideHouse}
                          </h3>
                          {wedding.brideHouseName && (
                            <p
                              className="text-sm font-medium"
                              style={{ color: primaryColor }}
                            >
                              {wedding.brideHouseName}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2 mb-6 items-start">
                        <span className="text-gray-400 mt-1">📍</span>
                        <p className="text-gray-600 text-sm leading-relaxed">
                          {wedding.brideHouseAddress}
                        </p>
                      </div>
                      <LazyMap
                        title="Bride Map"
                        height="h-52"
                        src={`https://maps.google.com/maps?width=100%&height=400&hl=en&q=${encodeURIComponent(
                          wedding.brideHouseLat && wedding.brideHouseLng
                            ? `${wedding.brideHouseLat},${wedding.brideHouseLng}`
                            : (wedding.brideHouseAddress || "") +
                                (wedding.brideHouseName
                                  ? ", " + wedding.brideHouseName
                                  : "")
                        )}&ie=UTF8&t=&z=15&iwloc=B&output=embed`}
                      />
                    </motion.div>
                  )}
                </motion.div>
              )}
            </div>
          </motion.section>
        )}

        {/* ═══════════════════════════════════════════════
                    RSVP SECTION
                ═══════════════════════════════════════════════ */}
        <motion.section
          className="py-24 px-6 bg-[#fffdf8]/80 relative overflow-hidden"
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1 }}
        >
          <div className="max-w-lg mx-auto text-center relative z-10">
            <p
              className="text-xs uppercase tracking-[0.3em] mb-3 font-semibold"
              style={{ color: primaryColor, opacity: 0.6 }}
            >
              {t.rsvpSub}
            </p>
            <h2
              className="text-3xl font-bold mb-2"
              style={{ fontFamily: "var(--font-display)", color: "#2d2d2d" }}
            >
              {t.rsvpTitle}
            </h2>
            <div
              className="w-12 h-1 mx-auto mt-3 mb-4 rounded-full"
              style={{
                background: `linear-gradient(90deg, ${primaryColor}, ${secondaryColor})`,
              }}
            />
            <p className="text-gray-500 mb-10">{t.rsvpDesc}</p>

            {rsvpSent ? (
              <div className="rounded-3xl p-10 text-center bg-red-50/60 border border-red-100">
                <span className="text-5xl block mb-4">🧧</span>
                <p className="text-lg font-medium text-gray-700">
                  {rsvpMessage}
                </p>
              </div>
            ) : (
              <div className="bg-white/40 backdrop-blur-md rounded-[2.5rem] p-8 sm:p-12 border border-white/60 shadow-[0_8px_32px_rgba(0,0,0,0.06)] relative z-10">
                <form onSubmit={handleRsvp} className="space-y-5 text-left">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1.5">
                      {t.formName}
                    </label>
                    <input
                      className="w-full bg-[#fdf8f0] border border-amber-200 rounded-xl px-4 py-3.5 focus:outline-none focus:border-red-300 focus:ring-2 focus:ring-red-100 transition-all"
                      value={rsvpForm.guestName}
                      onChange={(e) =>
                        setRsvpForm((f) => ({
                          ...f,
                          guestName: e.target.value,
                        }))
                      }
                      required
                      placeholder={t.formNamePlaceholder}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1.5">
                      {t.formPhone}
                    </label>
                    <input
                      className="w-full bg-[#fdf8f0] border border-amber-200 rounded-xl px-4 py-3.5 focus:outline-none focus:border-red-300 focus:ring-2 focus:ring-red-100 transition-all"
                      value={rsvpForm.guestPhone}
                      onChange={(e) =>
                        setRsvpForm((f) => ({
                          ...f,
                          guestPhone: e.target.value,
                        }))
                      }
                      placeholder={t.formPhonePlaceholder}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1.5">
                      {t.formWishes}
                    </label>
                    <textarea
                      className="w-full bg-[#fdf8f0] border border-amber-200 rounded-xl px-4 py-3.5 min-h-[110px] resize-y focus:outline-none focus:border-red-300 focus:ring-2 focus:ring-red-100 transition-all"
                      value={rsvpForm.wishes}
                      onChange={(e) =>
                        setRsvpForm((f) => ({ ...f, wishes: e.target.value }))
                      }
                      placeholder={t.formWishesPlaceholder}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-3">
                      {t.formConfirm}
                    </label>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <label
                        className={`flex-1 p-4 rounded-2xl border-2 cursor-pointer transition-all text-center ${
                          rsvpForm.attendance === "ATTENDING"
                            ? "border-red-400 bg-red-50"
                            : "border-gray-100 hover:border-red-200"
                        }`}
                      >
                        <input
                          type="radio"
                          name="attendance"
                          value="ATTENDING"
                          checked={rsvpForm.attendance === "ATTENDING"}
                          onChange={(e) =>
                            setRsvpForm((f) => ({
                              ...f,
                              attendance: e.target.value,
                            }))
                          }
                          className="sr-only"
                        />
                        <span className="text-2xl block mb-1">🎊</span>
                        <span className="text-sm font-medium text-gray-700">
                          {t.attending}
                        </span>
                      </label>
                      <label
                        className={`flex-1 p-4 rounded-2xl border-2 cursor-pointer transition-all text-center ${
                          rsvpForm.attendance === "NOT_ATTENDING"
                            ? "border-red-300 bg-red-50"
                            : "border-gray-100 hover:border-gray-200"
                        }`}
                      >
                        <input
                          type="radio"
                          name="attendance"
                          value="NOT_ATTENDING"
                          checked={rsvpForm.attendance === "NOT_ATTENDING"}
                          onChange={(e) =>
                            setRsvpForm((f) => ({
                              ...f,
                              attendance: e.target.value,
                            }))
                          }
                          className="sr-only"
                        />
                        <span className="text-2xl block mb-1">😢</span>
                        <span className="text-sm font-medium text-gray-700">
                          {t.notAttending}
                        </span>
                      </label>
                    </div>
                  </div>
                  {rsvpMessage && (
                    <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
                      {rsvpMessage}
                    </div>
                  )}
                  <button
                    type="submit"
                    className="group w-full relative px-10 py-3.5 rounded-full font-bold text-xs sm:text-sm tracking-[0.2em] uppercase transition-all duration-500 hover:scale-105 hover:shadow-xl active:scale-95 bg-white/60 backdrop-blur-md border border-white"
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
                      {rsvpSending ? t.sending : t.sendButton}
                    </span>
                  </button>
                </form>
              </div>
            )}
          </div>
        </motion.section>

        {/* ═══════════════════════════════════════════════
                    WEDDING GIFT / BANK SECTION
                ═══════════════════════════════════════════════ */}
        {(wedding.groomBankAccountNumber || wedding.brideBankAccountNumber) && (
          <motion.section
            className="pt-16 pb-12 px-6 relative overflow-hidden"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.8 }}
          >
            <div className="max-w-5xl mx-auto text-center">
              <p
                className="text-xs uppercase tracking-[0.3em] mb-3 font-semibold"
                style={{ color: primaryColor, opacity: 0.6 }}
              >
                Gift
              </p>
              <h2
                className="text-4xl font-bold mb-4"
                style={{ fontFamily: "var(--font-display)", color: "#2d2d2d" }}
              >
                {t.giftTitle}
              </h2>
              <div
                className="w-16 h-1 mx-auto mt-3 mb-4 rounded-full"
                style={{
                  background: `linear-gradient(90deg, ${primaryColor}, ${secondaryColor})`,
                }}
              />
              <p className="text-gray-500 mb-16 text-base max-w-xl mx-auto">
                {t.giftDesc}
              </p>

              <QrReveal
                alt="Groom VietQR"
                primaryColor={primaryColor}
                label="Món quà iu thương 🥰"
              >
                <motion.div
                  className="grid md:grid-cols-2 gap-10"
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-100px" }}
                  variants={{
                    visible: { transition: { staggerChildren: 0.3 } },
                  }}
                >
                  {wedding.groomBankAccountNumber && (
                    <motion.div
                      variants={{
                        hidden: { opacity: 0, scale: 0.9, y: 30 },
                        visible: { opacity: 1, scale: 1, y: 0 },
                      }}
                      transition={{ duration: 0.7 }}
                      className="bg-white p-8 rounded-3xl shadow-xl border border-amber-100 flex flex-col items-center"
                    >
                      <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center text-2xl mb-4">
                        🤵
                      </div>
                      <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                        {t.groomBankTitle}
                      </h3>
                      <div className="bg-amber-50/50 p-4 rounded-2xl border-2 border-dashed border-amber-200 mb-8 w-full max-w-[240px]">
                        <Image
                          src={
                            getVietQrUrl(
                              wedding.groomBankName,
                              wedding.groomBankAccountNumber,
                              wedding.groomBankAccountHolder
                            ) || ""
                          }
                          alt="Groom VietQR"
                          className="w-full h-full object-contain rounded-lg shadow-sm"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                          width={450}
                          height={450}
                        />
                      </div>
                      <div className="w-full text-left space-y-4">
                        <div className="flex justify-between items-center border-b border-amber-50 pb-2">
                          <span className="text-xs font-bold text-gray-400 uppercase">
                            {t.giftBank}
                          </span>
                          <span className="font-bold text-gray-700">
                            {wedding.groomBankName?.includes(" - ")
                              ? wedding.groomBankName.split(" - ")[1]
                              : wedding.groomBankName}
                          </span>
                        </div>
                        <div className="flex justify-between items-center border-b border-amber-50 pb-2">
                          <span className="text-xs font-bold text-gray-400 uppercase">
                            {t.giftAccount}
                          </span>
                          <div className="flex items-center gap-2">
                            <span
                              className="font-mono font-bold text-lg"
                              style={{ color: primaryColor }}
                            >
                              {wedding.groomBankAccountNumber}
                            </span>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(
                                  wedding.groomBankAccountNumber || ""
                                );
                                alert("Copied!");
                              }}
                              className="p-1 hover:text-red-600 transition-colors"
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
                                />
                              </svg>
                            </button>
                          </div>
                        </div>
                        <div className="flex justify-between items-center pb-2">
                          <span className="text-xs font-bold text-gray-400 uppercase">
                            {t.giftHolder}
                          </span>
                          <span className="font-bold text-gray-700 uppercase">
                            {wedding.groomBankAccountHolder}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                  {wedding.brideBankAccountNumber && (
                    <motion.div
                      variants={{
                        hidden: { opacity: 0, scale: 0.9, y: 30 },
                        visible: { opacity: 1, scale: 1, y: 0 },
                      }}
                      transition={{ duration: 0.7 }}
                      className="bg-white p-8 rounded-3xl shadow-xl border border-amber-100 flex flex-col items-center"
                    >
                      <div className="w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center text-2xl mb-4">
                        👰
                      </div>
                      <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                        {t.brideBankTitle}
                      </h3>
                      <div className="bg-amber-50/50 p-4 rounded-2xl border-2 border-dashed border-amber-200 mb-8 w-full max-w-[240px]">
                        <Image
                          src={
                            getVietQrUrl(
                              wedding.brideBankName,
                              wedding.brideBankAccountNumber,
                              wedding.brideBankAccountHolder
                            ) || ""
                          }
                          alt="Groom VietQR"
                          className="w-full h-full object-contain rounded-lg shadow-sm"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                          width={450}
                          height={450}
                        />
                      </div>
                      <div className="w-full text-left space-y-4">
                        <div className="flex justify-between items-center border-b border-amber-50 pb-2">
                          <span className="text-xs font-bold text-gray-400 uppercase">
                            {t.giftBank}
                          </span>
                          <span className="font-bold text-gray-700">
                            {wedding.brideBankName?.includes(" - ")
                              ? wedding.brideBankName.split(" - ")[1]
                              : wedding.brideBankName}
                          </span>
                        </div>
                        <div className="flex justify-between items-center border-b border-amber-50 pb-2">
                          <span className="text-xs font-bold text-gray-400 uppercase">
                            {t.giftAccount}
                          </span>
                          <div className="flex items-center gap-2">
                            <span
                              className="font-mono font-bold text-lg"
                              style={{ color: primaryColor }}
                            >
                              {wedding.brideBankAccountNumber}
                            </span>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(
                                  wedding.brideBankAccountNumber || ""
                                );
                                alert("Copied!");
                              }}
                              className="p-1 hover:text-red-600 transition-colors"
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
                                />
                              </svg>
                            </button>
                          </div>
                        </div>
                        <div className="flex justify-between items-center pb-2">
                          <span className="text-xs font-bold text-gray-400 uppercase">
                            {t.giftHolder}
                          </span>
                          <span className="font-bold text-gray-700 uppercase">
                            {wedding.brideBankAccountHolder}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              </QrReveal>
            </div>
          </motion.section>
        )}

        {/* ═══════════════════════════════════════════════
                    FOOTER
                ═══════════════════════════════════════════════ */}
        <footer
          className="py-8 text-center relative overflow-hidden"
          style={{ background: "rgba(253,248,240,0.85)" }}
        >
          <div className="relative z-10">
            <div className="flex justify-center mb-4">
              <svg
                viewBox="0 0 24 24"
                className="w-6 h-6"
                style={{ fill: primaryColor, opacity: 0.4 }}
              >
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            </div>
            <p
              className="text-sm font-medium"
              style={{ fontFamily: "var(--font-display)", color: "#666" }}
            >
              {wedding.groomName} & {wedding.brideName}
              <br />
              {weddingDate && `${weddingDate.toLocaleDateString("vi-VN")}`}
              {lunarDateStr && ` (${lunarDateStr})`}
            </p>
            <p className="mt-2 text-xs text-gray-400">{t.poweredBy}</p>
          </div>
        </footer>
      </motion.div>

      {/* Ambient rising hearts */}
      <div className="fixed inset-0 pointer-events-none z-[1000] overflow-hidden">
        {babyFlowers.map((h) => (
          <div
            key={h.id}
            className="absolute rising-heart opacity-0"
            style={
              {
                left: `${h.left}%`,
                bottom: "-50px",
                width: h.size,
                height: h.size,
                animationDuration: `${h.duration}s`,
                animationDelay: `${h.delay}s`,
                "--drift": `${h.drift}px`,
              } as React.CSSProperties
            }
          >
            {/* <svg
              viewBox="0 0 24 24"
              fill={h.color}
              className="w-full h-full"
              style={{ opacity: 0.6 }}
            >
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg> */}
            <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm">
              <circle cx="50" cy="50" r="10" fill={h.center} />{" "}
              {/* Yellow center */}
              <circle cx="50" cy="22" r="16" fill={h.petal} /> {/* Petals */}
              <circle cx="50" cy="78" r="16" fill={h.petal} />
              <circle cx="22" cy="50" r="16" fill={h.petal} />
              <circle cx="78" cy="50" r="16" fill={h.petal} />
              <circle cx="30" cy="30" r="16" fill={h.petal} />
              <circle cx="70" cy="30" r="16" fill={h.petal} />
              <circle cx="30" cy="70" r="16" fill={h.petal} />
              <circle cx="70" cy="70" r="16" fill={h.petal} />
            </svg>
          </div>
        ))}
        <style jsx>{`
          @keyframes riseUp {
            0% {
              transform: translateY(0) translateX(0) rotate(0deg) scale(0.4);
              opacity: 0;
            }
            5% {
              opacity: 0.35;
              transform: translateY(-5vh) translateX(calc(var(--drift) * 0.1))
                rotate(5deg) scale(0.7);
            }
            30% {
              opacity: 0.6;
              transform: translateY(-30vh) translateX(calc(var(--drift) * -0.6))
                rotate(-8deg) scale(1);
            }
            60% {
              opacity: 0.5;
              transform: translateY(-60vh) translateX(calc(var(--drift) * 0.4))
                rotate(10deg) scale(0.9);
            }
            90% {
              opacity: 0.3;
              transform: translateY(-95vh) translateX(calc(var(--drift) * -0.3))
                rotate(-5deg) scale(0.6);
            }
            100% {
              opacity: 0;
              transform: translateY(-110vh) translateX(0) rotate(0deg)
                scale(0.4);
            }
          }
          .rising-heart {
            animation: riseUp linear infinite forwards;
            will-change: transform, opacity;
          }
        `}</style>
      </div>

      <MusicPlayer url={wedding.musicUrl || ""} autoPlayTrigger={startMusic} />
      {!showWelcome && <HeartEffect />}
    </div>
  );
}
