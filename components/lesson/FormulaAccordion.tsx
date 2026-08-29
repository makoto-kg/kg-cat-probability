"use client";

import React, { useState } from "react";
import { ChevronDown, BookOpen } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface FormulaAccordionProps {
  title: string;
  description: string;
  math: string;
  takeaway: string;
  className?: string;
}

export const FormulaAccordion: React.FC<FormulaAccordionProps> = ({
  title,
  description,
  math,
  takeaway,
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className={`rounded-2xl border border-chalkboard-border bg-slate-950/60 overflow-hidden shadow-md transition-all ${className}`}
    >
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3.5 flex items-center justify-between text-left hover:bg-slate-900/50 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm sm:text-base font-bold text-chalk-white">
              {title}
            </h4>
            <p className="text-xs text-slate-400">
              {isOpen ? "クリックで閉じる" : "詳細な数式と数学的証明を見る"}
            </p>
          </div>
        </div>

        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-slate-400"
        >
          <ChevronDown className="w-5 h-5" />
        </motion.div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="border-t border-chalkboard-border px-4 py-4 sm:px-5 sm:py-5 bg-chalkboard-dark/50"
          >
            <p className="text-xs sm:text-sm text-slate-300 mb-3 leading-relaxed">
              {description}
            </p>

            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 font-mono text-xs sm:text-sm text-chalk-yellow overflow-x-auto leading-relaxed shadow-inner my-2">
              <code>{math}</code>
            </div>

            <div className="mt-4 p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/40 text-xs sm:text-sm text-emerald-200 leading-relaxed">
              <strong className="text-emerald-300 font-bold block mb-1">
                💡 カブ教授のまとめ
              </strong>
              {takeaway}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
