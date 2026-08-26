"use client";

import React, { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { withBasePath } from "@/lib/utils/path";

export type KabuMood = "calm" | "explaining" | "smiling" | "pointing";
export type TamaMood = "base" | "confident" | "confused" | "shocked" | "excited" | "sulking";
export type CatMood = KabuMood | TamaMood;

interface CatAvatarProps {
  character: "kabu" | "tama";
  mood: CatMood;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  showBadge?: boolean;
}

const KABU_IMAGE_MAP: Record<KabuMood, string> = {
  calm: "/cats/kabu/calm.jpg",
  explaining: "/cats/kabu/explaining.jpg",
  smiling: "/cats/kabu/smiling.jpg",
  pointing: "/cats/kabu/pointing.jpg",
};

const TAMA_IMAGE_MAP: Record<TamaMood, string> = {
  base: "/cats/tama/base.jpg",
  confident: "/cats/tama/confident.jpg",
  confused: "/cats/tama/confused.jpg",
  shocked: "/cats/tama/shocked.jpg",
  excited: "/cats/tama/excited.jpg",
  sulking: "/cats/tama/sulking.jpg",
};

const SIZE_CLASSES = {
  sm: "w-20 h-20",
  md: "w-28 h-28 sm:w-36 sm:h-36",
  lg: "w-36 h-36 sm:w-48 sm:h-48",
  xl: "w-48 h-48 sm:w-60 sm:h-60",
};

export const CatAvatar: React.FC<CatAvatarProps> = ({
  character,
  mood,
  size = "md",
  className = "",
  showBadge = true,
}) => {
  const imageSrc = useMemo(() => {
    if (character === "kabu") {
      const src = KABU_IMAGE_MAP[mood as KabuMood] || KABU_IMAGE_MAP.calm;
      return withBasePath(src);
    } else {
      const src = TAMA_IMAGE_MAP[mood as TamaMood] || TAMA_IMAGE_MAP.base;
      return withBasePath(src);
    }
  }, [character, mood]);

  const name = character === "kabu" ? "カブ先生" : "タマ助手";
  const badgeColor =
    character === "kabu"
      ? "bg-amber-900/80 text-amber-200 border-amber-600/50"
      : "bg-pink-900/80 text-pink-200 border-pink-500/50";

  // Framer Motion animation variants per mood
  const motionVariants = useMemo(() => {
    switch (mood) {
      case "shocked":
        return {
          animate: {
            x: [0, -6, 6, -6, 6, -3, 3, 0],
            rotate: [0, -4, 4, -4, 4, 0],
            scale: [1, 1.1, 0.98, 1.05, 1],
            transition: { duration: 0.6, repeat: Infinity, repeatDelay: 2.5 },
          },
        };
      case "excited":
        return {
          animate: {
            y: [0, -16, 0, -8, 0],
            scale: [1, 1.06, 1, 1.03, 1],
            transition: { duration: 0.8, repeat: Infinity, repeatDelay: 2 },
          },
        };
      case "confident":
        return {
          animate: {
            y: [0, -6, 0],
            rotate: [0, 2, 0],
            transition: { duration: 2, repeat: Infinity, ease: "easeInOut" },
          },
        };
      case "confused":
        return {
          animate: {
            rotate: [0, -6, -2, -6, 0],
            transition: { duration: 2.5, repeat: Infinity, ease: "easeInOut" },
          },
        };
      case "sulking":
        return {
          animate: {
            y: [0, 4, 2, 4, 0],
            scale: [1, 0.98, 1],
            transition: { duration: 3, repeat: Infinity, ease: "easeInOut" },
          },
        };
      case "explaining":
        return {
          animate: {
            rotate: [0, 2, 0],
            y: [0, -3, 0],
            transition: { duration: 2, repeat: Infinity, ease: "easeInOut" },
          },
        };
      case "smiling":
        return {
          animate: {
            scale: [1, 1.03, 1],
            transition: { duration: 2.2, repeat: Infinity, ease: "easeInOut" },
          },
        };
      case "calm":
      default:
        return {
          animate: {
            y: [0, -2, 0],
            transition: { duration: 3, repeat: Infinity, ease: "easeInOut" },
          },
        };
    }
  }, [mood]);

  return (
    <div className={`relative flex flex-col items-center select-none ${className}`}>
      <motion.div
        className={`relative ${SIZE_CLASSES[size]} rounded-2xl overflow-hidden shadow-lg border-2 border-chalkboard-border bg-slate-950/40 p-1`}
        variants={motionVariants}
        animate="animate"
      >
        <AnimatePresence mode="wait">
          <motion.img
            key={`${character}-${mood}`}
            src={imageSrc}
            alt={`${name} (${mood})`}
            className="w-full h-full object-contain rounded-xl"
            initial={{ opacity: 0.4, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0.2 }}
            transition={{ duration: 0.25 }}
          />
        </AnimatePresence>
      </motion.div>

      {showBadge && (
        <span
          className={`mt-1.5 px-2.5 py-0.5 text-xs font-bold rounded-full border shadow-sm ${badgeColor}`}
        >
          {name}
        </span>
      )}
    </div>
  );
};
