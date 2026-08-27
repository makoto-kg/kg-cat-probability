"use client";

import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  computeBaseRateBreakdown,
  calculateTheoreticalPPV,
} from "@/lib/simulations/base-rate";
import { ControlPanel } from "../lesson/ControlPanel";
import { Activity, ShieldAlert, Sliders, CheckCircle2, AlertTriangle } from "lucide-react";

interface BaseRateVizProps {
  stepIndex: number;
}

export const BaseRateViz: React.FC<BaseRateVizProps> = ({ stepIndex }) => {
  const [prevalencePct, setPrevalencePct] = useState(0.1); // 0.1% = 0.001
  const [sensitivityPct, setSensitivityPct] = useState(99); // 99%
  const [specificityPct, setSpecificityPct] = useState(99); // 99%

  const prevalence = prevalencePct / 100;
  const sensitivity = sensitivityPct / 100;
  const specificity = specificityPct / 100;

  const breakdown = useMemo(() => {
    return computeBaseRateBreakdown({
      prevalence,
      sensitivity,
      specificity,
      populationSize: 10000,
    });
  }, [prevalence, sensitivity, specificity]);

  // STEP 0: 直感フェーズ (Intuition) - ゲーム画面は出さず、黒板の出題カードのみ表示
  if (stepIndex === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-5 py-6 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-6 bg-slate-950/80 border-2 border-chalkboard-border rounded-3xl max-w-lg shadow-2xl flex flex-col gap-4 text-left"
        >
          <div className="flex items-center gap-2.5 text-amber-400 border-b border-slate-800 pb-3">
            <Activity className="w-5 h-5 text-pink-400" />
            <h3 className="text-base font-black text-chalk-white">
              黒板：本日の問題
            </h3>
          </div>

          <div className="text-xs sm:text-sm text-slate-200 leading-relaxed space-y-3">
            <p>
              1,000人に1人がかかる珍しい病気があります。
              <strong>感度99%・特異度99%</strong>という超高精度な検査を受けたところ、なんと<strong>「陽性」</strong>と判定されました。
            </p>
            <div className="p-3 bg-chalkboard-dark rounded-xl border border-chalkboard-border text-chalk-yellow font-bold text-xs sm:text-sm">
              あなたが本当にこの病気にかかっている確率は何%でしょうか？<br />
              ・精度99%なんだから、約99%？<br />
              ・それとも、もっとずっと低い？
            </div>
            <p className="text-amber-300 font-bold">
              👉 直感ではどう思いますか？ 右の対話を聞いて選択肢を選んでみよう！
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  // STEP 1: 体験フェーズ (Experience) - 10,000人の住民全体像
  if (stepIndex === 1) {
    return (
      <div className="flex flex-col gap-4 w-full">
        <div className="p-3 bg-slate-950/70 border border-chalkboard-border rounded-xl text-xs font-bold text-slate-300 flex justify-between items-center">
          <span>👥 10,000人のねこ住民の内訳（検査前）</span>
          <span className="text-pink-300">
            有病率: {prevalencePct}%（1,000人に1人）
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/60 text-center">
            <span className="text-2xl block">🐱</span>
            <span className="text-sm font-bold text-red-300 block mt-1">
              本当に病気の猫
            </span>
            <span className="text-xl font-black text-red-400 font-mono mt-1 block">
              たったの {breakdown.totalSick} 匹
            </span>
          </div>

          <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/60 text-center">
            <span className="text-2xl block">😺</span>
            <span className="text-sm font-bold text-emerald-300 block mt-1">
              健康な猫
            </span>
            <span className="text-xl font-black text-emerald-400 font-mono mt-1 block">
              {breakdown.totalHealthy.toLocaleString()} 匹
            </span>
          </div>
        </div>

        <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 text-xs sm:text-sm text-slate-200 leading-relaxed">
          健康な猫が圧倒的多数（99.9%）を占めています。
          この健康な9,990匹にも「1%の確率で誤診（偽陽性）」が発生したらどうなるでしょうか？
        </div>
      </div>
    );
  }

  // STEP 2: 試行フェーズ (Simulation) - 4つの部屋に分類
  if (stepIndex === 2) {
    return (
      <div className="flex flex-col gap-4 w-full">
        <div className="p-3 bg-slate-950/70 border border-chalkboard-border rounded-xl text-xs sm:text-sm font-bold text-slate-300 flex justify-between items-center">
          <span>⚡ 検査結果の4象限分類</span>
          <span className="text-amber-400 font-mono">
            陽性者合計: {breakdown.totalPositives} 匹
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Top-Left: True Positive */}
          <div className="p-3.5 rounded-xl bg-red-950/40 border-2 border-red-500/60">
            <div className="flex justify-between text-xs sm:text-sm font-bold text-red-300">
              <span>🔴 真陽性（病気＆陽性）</span>
              <span className="font-mono">{breakdown.truePositives} 匹</span>
            </div>
            <p className="text-xs text-slate-300 mt-1">正しく発見された病気猫</p>
          </div>

          {/* Top-Right: False Positive */}
          <div className="p-3.5 rounded-xl bg-amber-950/60 border-2 border-amber-400 ring-2 ring-amber-400/40">
            <div className="flex justify-between text-xs sm:text-sm font-bold text-amber-300">
              <span>⚠️ 偽陽性（健康なのに陽性！）</span>
              <span className="font-mono font-black">{breakdown.falsePositives} 匹</span>
            </div>
            <p className="text-xs text-amber-200 mt-1 font-bold">
              健康な9,990匹の1%（真陽性の約10倍！）
            </p>
          </div>

          {/* Bottom-Left: False Negative */}
          <div className="p-3.5 rounded-xl bg-slate-900/40 border border-slate-800">
            <div className="flex justify-between text-xs sm:text-sm font-bold text-slate-400">
              <span>⚪ 偽陰性（病気なのに陰性）</span>
              <span className="font-mono">{breakdown.falseNegatives} 匹</span>
            </div>
          </div>

          {/* Bottom-Right: True Negative */}
          <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-800/40">
            <div className="flex justify-between text-xs sm:text-sm font-bold text-emerald-400">
              <span>🟢 真陰性（健康＆陰性）</span>
              <span className="font-mono">{breakdown.trueNegatives.toLocaleString()} 匹</span>
            </div>
          </div>
        </div>

        <ControlPanel
          customControls={
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-xs font-bold text-slate-300">
                  <span>有病率</span>
                  <span className="text-pink-400 font-mono">{prevalencePct}%</span>
                </div>
                <input
                  type="range"
                  min={0.01}
                  max={5}
                  step={0.01}
                  value={prevalencePct}
                  onChange={(e) => setPrevalencePct(Number(e.target.value))}
                  className="w-full accent-pink-500 cursor-pointer"
                />
              </div>

              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-xs font-bold text-slate-300">
                  <span>感度</span>
                  <span className="text-emerald-400 font-mono">{sensitivityPct}%</span>
                </div>
                <input
                  type="range"
                  min={80}
                  max={100}
                  step={0.5}
                  value={sensitivityPct}
                  onChange={(e) => setSensitivityPct(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>

              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-xs font-bold text-slate-300">
                  <span>特異度</span>
                  <span className="text-blue-400 font-mono">{specificityPct}%</span>
                </div>
                <input
                  type="range"
                  min={80}
                  max={100}
                  step={0.5}
                  value={specificityPct}
                  onChange={(e) => setSpecificityPct(Number(e.target.value))}
                  className="w-full accent-blue-500 cursor-pointer"
                />
              </div>
            </div>
          }
        />
      </div>
    );
  }

  // STEP 3: 種明かしフェーズ (Reveal) - 陽性部屋の拡大
  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950/40 border-2 border-amber-500/60 flex flex-col gap-3 shadow-xl">
        <div className="flex items-center justify-between text-xs font-bold">
          <span className="text-amber-300 flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            陽性者の部屋（合計 {breakdown.totalPositives} 匹）の内訳
          </span>
          <span className="text-lg font-black text-amber-400 font-mono">
            実際の感染率: {(breakdown.ppv * 100).toFixed(2)}%
          </span>
        </div>

        <div className="flex h-8 rounded-xl overflow-hidden border border-slate-700 bg-slate-900 text-xs font-bold shadow-inner">
          <div
            style={{ width: `${breakdown.ppv * 100}%` }}
            className="bg-red-600 text-white flex items-center justify-center transition-all duration-500 overflow-hidden text-[11px]"
          >
            真の病気 ({breakdown.truePositives}匹)
          </div>
          <div
            style={{ width: `${(1 - breakdown.ppv) * 100}%` }}
            className="bg-amber-600 text-slate-950 flex items-center justify-center transition-all duration-500 overflow-hidden text-[11px]"
          >
            健康な猫・偽陽性 ({breakdown.falsePositives}匹)
          </div>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          「精度99%」でも、もともとの有病率（0.1%）が非常に低い場合、健康な9,990匹のたった1%の誤診（約100匹）が本物の感染者（10匹）を圧倒してしまいます。
          陽性判定が出ても、実際に病気である確率はわずか <strong className="text-amber-300 font-bold font-mono">{(breakdown.ppv * 100).toFixed(2)}%</strong> です！
        </p>
      </div>
    </div>
  );
};
