"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";

interface DialogueBubbleProps {
  speaker: "kabu" | "tama";
  text: string;
  speedMs?: number;
  onComplete?: () => void;
  actionButtonText?: string;
  onAction?: () => void;
  showNextButton?: boolean;
  className?: string;
}

export const DialogueBubble: React.FC<DialogueBubbleProps> = ({
  speaker,
  text,
  speedMs = 25,
  onComplete,
  actionButtonText = "つぎへ ▶",
  onAction,
  showNextButton = true,
  className = "",
}) => {
  const [displayedLength, setDisplayedLength] = useState(0);
  const [isDone, setIsDone] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Reset when text changes
  useEffect(() => {
    setDisplayedLength(0);
    setIsDone(false);

    if (!text) {
      setIsDone(true);
      return;
    }

    let current = 0;
    timerRef.current = setInterval(() => {
      current++;
      setDisplayedLength(current);
      if (current >= text.length) {
        if (timerRef.current) clearInterval(timerRef.current);
        setIsDone(true);
        onComplete?.();
      }
    }, speedMs);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [text, speedMs, onComplete]);

  // Click to reveal all text instantly
  const handleBubbleClick = () => {
    if (!isDone) {
      if (timerRef.current) clearInterval(timerRef.current);
      setDisplayedLength(text.length);
      setIsDone(true);
      onComplete?.();
    }
  };

  const isKabu = speaker === "kabu";
  const speakerName = isKabu ? "カブ先生" : "タマ助手";
  const bgClass = isKabu
    ? "bg-gradient-to-br from-chalkboard-light to-chalkboard border-amber-500/40 text-chalk-white"
    : "bg-gradient-to-br from-slate-900 to-chalkboard-light border-pink-500/40 text-chalk-white";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative w-full rounded-2xl border-2 p-4 sm:p-5 shadow-xl transition-all cursor-pointer select-none ${bgClass} ${className}`}
      onClick={handleBubbleClick}
      title={!isDone ? "クリックで全文表示" : undefined}
    >
      {/* Header with speaker badge */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span
            className={`px-2.5 py-0.5 text-xs font-bold rounded-full ${
              isKabu
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                : "bg-pink-500/20 text-pink-300 border border-pink-500/30"
            }`}
          >
            {speakerName}
          </span>
          {!isDone && (
            <span className="text-[11px] text-slate-400 animate-pulse">
              （タップで早送り）
            </span>
          )}
        </div>
      </div>

      {/* Main Dialogue Text */}
      <div className="text-base sm:text-lg leading-relaxed font-medium min-h-[3rem] whitespace-pre-wrap">
        {text.slice(0, displayedLength)}
        {!isDone && (
          <span className="inline-block w-2 h-4 ml-1 bg-chalk-yellow animate-pulse align-middle" />
        )}
      </div>

      {/* Bottom Action / Next Button */}
      {showNextButton && isDone && onAction && (
        <div className="mt-4 flex justify-end">
          <motion.button
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={(e) => {
              e.stopPropagation();
              onAction();
            }}
            className={`px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-1.5 shadow-md transition-all ${
              isKabu
                ? "bg-amber-600 hover:bg-amber-500 text-white"
                : "bg-pink-600 hover:bg-pink-500 text-white"
            }`}
          >
            <span>{actionButtonText}</span>
            <ChevronRight className="w-4 h-4" />
          </motion.button>
        </div>
      )}
    </motion.div>
  );
};
