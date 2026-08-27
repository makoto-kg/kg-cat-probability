"use client";

import React from "react";
import { Play, RotateCcw, Zap } from "lucide-react";
import { motion } from "framer-motion";

interface ControlPanelProps {
  onRunSingle?: () => void;
  runSingleText?: string;
  onRunBatch?: (trials: number) => void;
  onReset?: () => void;
  resetText?: string;
  isRunning?: boolean;
  batchCounts?: number[];
  customControls?: React.ReactNode;
  statusNode?: React.ReactNode;
  className?: string;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  onRunSingle,
  runSingleText = "1回試す",
  onRunBatch,
  onReset,
  resetText = "リセット",
  isRunning = false,
  batchCounts = [10, 100, 10000],
  customControls,
  statusNode,
  className = "",
}) => {
  return (
    <div
      className={`rounded-2xl border border-chalkboard-border bg-chalkboard-dark/95 p-4 shadow-lg ${className}`}
    >
      <div className="flex flex-col gap-3.5">
        {/* Custom Sliders / Selectors */}
        {customControls && <div className="w-full">{customControls}</div>}

        {/* Buttons Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2 border-t border-chalkboard-border/60">
          <div className="flex flex-wrap items-center gap-2">
            {onRunSingle && (
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                disabled={isRunning}
                onClick={onRunSingle}
                className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow"
                title="1回だけ実験を実行します"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>{runSingleText}</span>
              </motion.button>
            )}

            {onRunBatch &&
              batchCounts.map((count) => (
                <motion.button
                  key={count}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  disabled={isRunning}
                  onClick={() => onRunBatch(count)}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-chalk-white border border-slate-700 font-bold text-xs sm:text-sm flex items-center gap-1 shadow"
                  title={`${count.toLocaleString()}回のシミュレーションを高速実行します`}
                >
                  <Zap className="w-3.5 h-3.5 text-chalk-yellow" />
                  <span>{count >= 10000 ? `${count.toLocaleString()}回` : `${count}回`}</span>
                </motion.button>
              ))}
          </div>

          {onReset && (
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              disabled={isRunning}
              onClick={onReset}
              className="px-3.5 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 hover:border-amber-400/60 text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-colors shadow"
              title={`${resetText}します`}
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
              <span>{resetText}</span>
            </motion.button>
          )}
        </div>

        {/* Live Status indicator if provided */}
        {statusNode && <div className="mt-1">{statusNode}</div>}
      </div>
    </div>
  );
};
