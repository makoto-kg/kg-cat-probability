"use client";

import React from "react";
import Link from "next/link";
import { TOPICS } from "@/lib/topics";
import { KabuSensei } from "@/components/cats/KabuSensei";
import { TamaAssistant } from "@/components/cats/TamaAssistant";
import { Sparkles, ArrowRight, BookOpen, GraduationCap, Compass } from "lucide-react";
import { motion } from "framer-motion";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col justify-between">
      {/* Hero Header */}
      <header className="border-b border-chalkboard-border/80 bg-chalkboard-dark/95 py-6 sm:py-8 px-4 shadow-xl">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col gap-2 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold w-fit mx-auto md:mx-0">
              <Sparkles className="w-3.5 h-3.5" />
              <span>インタラクティブ確率・統計実験室</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-chalk-white tracking-tight">
              猫と学ぶ確率・統計 <span className="text-amber-400 text-lg sm:text-2xl font-bold block sm:inline">〜直感の裏切りを暴こう〜</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
              「絶対にこうだ！」という人間の直感は、確率の世界ではよく裏切られます。
              カブ先生とタマ助手と一緒に、実際に動かして、シミュレーションで確信し、納得の種明かしを体験しよう！
            </p>
          </div>

          {/* Intro Cats Welcome Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-4 p-4 rounded-3xl bg-slate-900/90 border-2 border-chalkboard-border shadow-2xl"
          >
            <KabuSensei mood="explaining" size="sm" />
            <div className="flex flex-col justify-center max-w-[200px]">
              <span className="text-xs font-black text-amber-300">カブ先生 & タマ助手</span>
              <p className="text-[11px] text-slate-300 mt-1 leading-snug">
                「タマ助手、今日も不思議な確率の授業を始めようか！」
                <br />
                「任せてにゃ！ 直感でバシッと当てるにゃ！」
              </p>
            </div>
            <TamaAssistant mood="confident" size="sm" />
          </motion.div>
        </div>
      </header>

      {/* Main Topic Grid */}
      <main className="max-w-6xl w-full mx-auto px-4 py-8 sm:py-12 flex-1 flex flex-col gap-8">
        <div className="flex items-center justify-between border-b border-chalkboard-border/60 pb-3">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg sm:text-xl font-black text-chalk-white">
              開講中の講義（全7テーマ）
            </h2>
          </div>
          <span className="text-xs text-slate-400 font-medium">
            全トピック：直感 → 体験 → 試行 → 種明かしの4部構成
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {TOPICS.map((topic, index) => {
            const difficultyBadge =
              topic.difficulty === "初級"
                ? "bg-emerald-950/80 text-emerald-300 border-emerald-700"
                : topic.difficulty === "中級"
                ? "bg-amber-950/80 text-amber-300 border-amber-700"
                : "bg-pink-950/80 text-pink-300 border-pink-700";

            return (
              <motion.div
                key={topic.slug}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -4 }}
                className="group"
              >
                <Link
                  href={`/topics/${topic.slug}/`}
                  className="h-full flex flex-col justify-between p-5 rounded-3xl bg-chalkboard border-2 border-chalkboard-border hover:border-amber-400/80 shadow-xl transition-all duration-300 relative overflow-hidden"
                >
                  {/* Subtle top chalkboard pattern */}
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-pink-500 to-emerald-400 opacity-60 group-hover:opacity-100 transition-opacity" />

                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-900 text-slate-300 border border-slate-700">
                        {topic.category}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${difficultyBadge}`}
                      >
                        {topic.difficulty}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-base sm:text-lg font-black text-chalk-white group-hover:text-amber-300 transition-colors">
                        {topic.title}
                      </h3>
                      <p className="text-xs text-amber-400/90 font-bold mt-0.5">
                        {topic.subtitle}
                      </p>
                    </div>

                    <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed">
                      {topic.summary}
                    </p>
                  </div>

                  <div className="mt-5 pt-3 border-t border-chalkboard-border/60 flex items-center justify-between text-xs font-bold text-slate-400 group-hover:text-amber-300 transition-colors">
                    <span className="flex items-center gap-1">
                      <BookOpen className="w-3.5 h-3.5" />
                      講義を始める
                    </span>
                    <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-chalkboard-border/60 bg-slate-950/90 py-6 px-4 text-center text-xs text-slate-500">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© 2026 猫と学ぶ確率・統計 — 完全静的SPA</p>
          <p className="flex items-center gap-1 text-slate-400">
            <Compass className="w-3.5 h-3.5 text-amber-400" />
            シミュレーションはすべて純粋関数＆クライアント完結
          </p>
        </div>
      </footer>
    </div>
  );
}
