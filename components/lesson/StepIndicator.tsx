"use client";

import React from "react";
import { Check, Sparkles } from "lucide-react";

interface StepIndicatorProps {
  currentStepIndex: number; // 0..3
  onSelectStep?: (index: number) => void;
  className?: string;
}

const STEP_LABELS = [
  { index: 0, title: "1. 直感", short: "直感" },
  { index: 1, title: "2. 体験", short: "体験" },
  { index: 2, title: "3. 試行", short: "試行" },
  { index: 3, title: "4. 種明かし", short: "種明かし" },
];

export const StepIndicator: React.FC<StepIndicatorProps> = ({
  currentStepIndex,
  onSelectStep,
  className = "",
}) => {
  return (
    <div className={`w-full bg-chalkboard-dark/90 rounded-2xl border border-chalkboard-border p-3 sm:p-4 shadow-md ${className}`}>
      <div className="flex items-center justify-between max-w-2xl mx-auto relative">
        {/* Connecting progress line */}
        <div className="absolute top-1/2 left-4 right-4 -translate-y-1/2 h-1 bg-slate-800 rounded-full z-0" />
        <div
          className="absolute top-1/2 left-4 -translate-y-1/2 h-1 bg-gradient-to-r from-amber-500 via-pink-500 to-emerald-400 rounded-full transition-all duration-500 z-0"
          style={{ width: `${(currentStepIndex / 3) * 92}%` }}
        />

        {STEP_LABELS.map((step) => {
          const isDone = step.index < currentStepIndex;
          const isCurrent = step.index === currentStepIndex;

          return (
            <button
              key={step.index}
              disabled={!onSelectStep}
              onClick={() => onSelectStep?.(step.index)}
              className={`relative z-10 flex flex-col items-center group transition-transform ${
                isCurrent ? "scale-105" : "hover:scale-102"
              }`}
            >
              <div
                className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm border-2 transition-all shadow-md ${
                  isCurrent
                    ? "bg-amber-500 border-chalk-white text-slate-950 ring-4 ring-amber-500/30"
                    : isDone
                    ? "bg-emerald-600 border-emerald-400 text-white"
                    : "bg-slate-800 border-slate-700 text-slate-400"
                }`}
              >
                {isDone ? (
                  <Check className="w-4 h-4 sm:w-5 sm:h-5 stroke-[3]" />
                ) : isCurrent ? (
                  <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                ) : (
                  step.index + 1
                )}
              </div>
              <span
                className={`mt-1.5 text-xs sm:text-sm font-bold transition-colors ${
                  isCurrent
                    ? "text-chalk-yellow font-black"
                    : isDone
                    ? "text-emerald-300"
                    : "text-slate-400"
                }`}
              >
                <span className="hidden sm:inline">{step.title}</span>
                <span className="sm:hidden">{step.short}</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
