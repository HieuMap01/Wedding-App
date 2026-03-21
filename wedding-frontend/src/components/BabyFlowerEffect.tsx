"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export const BabyFlowerSVG = () => (
  <svg
    viewBox="0 0 100 100"
    className="w-full h-full drop-shadow-sm opacity-90"
  >
    <circle cx="50" cy="50" r="10" fill="#facc15" /> {/* Yellow center */}
    <circle cx="50" cy="22" r="16" fill="#ffffff" /> {/* Petals */}
    <circle cx="50" cy="78" r="16" fill="#ffffff" />
    <circle cx="22" cy="50" r="16" fill="#ffffff" />
    <circle cx="78" cy="50" r="16" fill="#ffffff" />
    <circle cx="30" cy="30" r="16" fill="#ffffff" />
    <circle cx="70" cy="30" r="16" fill="#ffffff" />
    <circle cx="30" cy="70" r="16" fill="#ffffff" />
    <circle cx="70" cy="70" r="16" fill="#ffffff" />
  </svg>
);

interface FlowerItem {
  id: string;
  left: number;
  top: number;
  size: number;
  duration: number;
  delay: number;
  drift: number;
  rotation: number;
}

export default function BabyFlowerEffect() {
  const [flowers, setFlowers] = useState<FlowerItem[]>([]);

  useEffect(() => {
    const items: FlowerItem[] = [];

    // Generate Baby Flowers (Left and Right sides of the screen)
    for (let i = 0; i < 40; i++) {
      const isLeft = i % 2 === 0;
      items.push({
        id: `baby-${i}`,
        left: isLeft ? Math.random() * 12 + 1 : Math.random() * 12 + 87, // 1-13vw on left, 87-99vw on right
        top: Math.random() * 95 + 2, // 2-97vh
        size: Math.random() * 12 + 12, // 12-24px
        duration: Math.random() * 15 + 15,
        delay: Math.random() * 10,
        drift: (Math.random() - 0.5) * 30, // Drift slightly left/right
        rotation: Math.random() * 360,
      });
    }

    setFlowers(items);
  }, []);

  if (flowers.length === 0) return null;

  return (
    <div
      className="fixed inset-0 z-[40] pointer-events-none overflow-hidden"
      style={{ minHeight: "100%" }}
    >
      {flowers.map((fl) => (
        <motion.div
          key={fl.id}
          className="absolute"
          initial={{
            left: `${fl.left}vw`,
            top: `${fl.top}vh`,
            rotate: fl.rotation,
            scale: 0.8,
            opacity: 0,
          }}
          animate={{
            x: [0, fl.drift > 0 ? 15 : -15, 0],
            y: [0, -10, 10, 0],
            rotate: [
              fl.rotation,
              fl.rotation + 20,
              fl.rotation - 20,
              fl.rotation,
            ],
            scale: [0.8, 1, 0.9, 0.8],
            opacity: [0.3, 0.8, 0.3],
          }}
          transition={{
            duration: fl.duration,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut",
            delay: fl.delay,
          }}
          style={{
            width: fl.size,
            height: fl.size,
          }}
        >
          <BabyFlowerSVG />
        </motion.div>
      ))}
    </div>
  );
}
