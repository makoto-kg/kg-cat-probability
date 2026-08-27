"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  computeBaseRateBreakdown,
  calculateTheoreticalPPV,
} from "@/lib/simulations/base-rate";
import { ControlPanel } from "../lesson/ControlPanel";
import { Activity, ShieldAlert, Sliders, CheckCircle2, AlertTriangle, Sparkles, UserCheck, Zap } from "lucide-react";

interface BaseRateVizProps {
  stepIndex: number;
}

interface InspectionLog {
  id: number;
  isSick: boolean;
  testResult: "positive" | "negative";
}

export const BaseRateViz: React.FC<BaseRateVizProps> = ({ stepIndex }) => {
  const [prevalencePct, setPrevalencePct] = useState(0.1); // 0.1% = 0.001
  const [sensitivityPct, setSensitivityPct] = useState(99); // 99%
  const [specificityPct, setSpecificityPct] = useState(99); // 99%

  // Step 1 Interactive State: Test Cats in the Clinic (No limit on count)
  const [sessionStats, setSessionStats] = useState({
    totalTested: 0,
    positives: 0,
    negatives: 0,
  });
  const [latestInspection, setLatestInspection] = useState<InspectionLog | null>(null);

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

  // Inspect cats
  const handleInspect = (count: number = 1) => {
    let posCount = 0;
    let negCount = 0;
    let lastCat: InspectionLog | null = null;

    for (let i = 0; i < count; i++) {
      const isSick = Math.random() < prevalence;
      let testResult: "positive" | "negative";

      if (isSick) {
        testResult = Math.random() < sensitivity ? "positive" : "negative";
      } else {
        testResult = Math.random() < (1 - specificity) ? "positive" : "negative";
      }

      if (testResult === "positive") {
        posCount++;
      } else {
        negCount++;
      }

      if (i === count - 1) {
        lastCat = {
          id: Math.floor(Math.random() * 10000) + 1,
          isSick,
          testResult,
        };
      }
    }

    setSessionStats((prev) => ({
      totalTested: prev.totalTested + count,
      positives: prev.positives + posCount,
      negatives: prev.negatives + negCount,
    }));

    if (lastCat) {
      setLatestInspection(lastCat);
    }
  };

  const handleResetStep1 = () => {
    setSessionStats({ totalTested: 0, positives: 0, negatives: 0 });
    setLatestInspection(null);
  };

  // STEP 0: 直感フェーズ (Intuition) - 黒板の出題カード
  if (stepIndex === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-5 py-6 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-5 sm:p-6 bg-slate-950/80 border-2 border-chalkboard-border rounded-3xl max-w-lg shadow-2xl flex flex-col gap-4 text-left"
        >
          <div className="flex items-center gap-2.5 text-amber-400 border-b border-slate-800 pb-3">
            <Activity className="w-5 h-5 text-pink-400 shrink-0" />
            <h3 className="text-base sm:text-lg font-black text-chalk-white">
              黒板：本日の問題
            </h3>
          </div>

          <div className="text-sm sm:text-base text-slate-200 leading-relaxed space-y-3">
            <p>
              <strong>1,000人に1人（0.1%）</strong>しかかからない珍しい病気があります。
              <strong>精度99%</strong>の超高精度な検査を受けたところ、なんと<strong>「陽性」</strong>と判定されました。
            </p>

            {/* Simple Explanation of Sensitivity & Specificity */}
            <div className="p-3.5 bg-slate-900/90 rounded-2xl border border-slate-700 text-xs sm:text-sm space-y-2">
              <div className="text-amber-300 font-bold border-b border-slate-800 pb-1 flex items-center gap-1.5">
                <span>💡 検査の「精度99%」とは？</span>
              </div>
              <div className="grid grid-cols-1 gap-1.5 leading-relaxed">
                <div>
                  <span className="font-bold text-emerald-300">・感度 99%</span>：病気の人を<strong>99%正しく「陽性」</strong>と見抜く（見逃しは1%）
                </div>
                <div>
                  <span className="font-bold text-blue-300">・特異度 99%</span>：健康な人を<strong>99%正しく「陰性」</strong>と見抜く（誤診は1%）
                </div>
              </div>
            </div>

            <div className="p-3 bg-chalkboard-dark rounded-xl border border-chalkboard-border text-chalk-yellow font-bold text-xs sm:text-sm">
              「陽性」が出たあなたが、本当に病気である確率は何%でしょうか？<br />
              ・どっちも99%正解するんだから、約99%？<br />
              ・それとも、もっとずっと低い？
            </div>
            <p className="text-amber-300 font-bold text-xs sm:text-sm">
              👉 直感ではどう思いますか？ 右の対話を聞いて選択肢を選んでみよう！
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  // STEP 1: 体験フェーズ (Experience) - 健康診断センターでの実地検査体験（答えはまだ出さない）
  if (stepIndex === 1) {
    return (
      <div className="flex flex-col gap-4 w-full">
        {/* Header Banner */}
        <div className="p-3 bg-slate-950/70 border border-chalkboard-border rounded-xl text-xs sm:text-sm font-bold text-slate-300 flex justify-between items-center">
          <span className="flex items-center gap-1.5 text-amber-300 font-bold">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            🏥 ねこ健康診断センター（住民10,000匹）
          </span>
          <span className="text-slate-400 font-mono">
            検査済み: {sessionStats.totalTested.toLocaleString()} 匹
          </span>
        </div>

        {/* Inspection Result Area */}
        {latestInspection ? (
          <motion.div
            key={`${latestInspection.id}-${sessionStats.totalTested}`}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`p-4 rounded-2xl border-2 shadow-xl flex flex-col gap-2.5 transition-all ${
              latestInspection.testResult === "positive"
                ? "bg-amber-950/90 border-amber-400 text-amber-100 ring-2 ring-amber-400/50"
                : "bg-slate-900/90 border-slate-700 text-slate-200"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded bg-slate-950/80 border border-slate-700">
                ねこ #{latestInspection.id} の検査結果
              </span>
              <span
                className={`text-xs font-black px-3 py-0.5 rounded-full shadow ${
                  latestInspection.testResult === "positive"
                    ? "bg-amber-500 text-slate-950 font-black animate-pulse"
                    : "bg-emerald-600 text-white"
                }`}
              >
                {latestInspection.testResult === "positive" ? "⚠️ 陽性判定 (＋)" : "🟢 陰性判定 (ー)"}
              </span>
            </div>

            <div className="flex items-center gap-3 py-1">
              <span className="text-3xl sm:text-4xl">
                {latestInspection.testResult === "positive" ? "🚨" : "😺"}
              </span>
              <div>
                <div className="text-xs sm:text-sm font-black">
                  {latestInspection.testResult === "positive"
                    ? "【判定結果】 陽性反応が出ました！"
                    : "【判定結果】 陰性（正常）でした"}
                </div>
                <div className="text-xs text-slate-300 mt-0.5">
                  {latestInspection.testResult === "positive" ? (
                    latestInspection.isSick ? (
                      <span className="text-red-300 font-bold">
                        カルテ確認: 🐱 本当に病気にかかっていました（真陽性）
                      </span>
                    ) : (
                      <span className="text-amber-200 font-bold">
                        カルテ確認: 😺 実は健康な猫でした！（1%の誤診で陽性が出たようです）
                      </span>
                    )
                  ) : (
                    <span className="text-emerald-300">
                      カルテ確認: 😺 健康な猫です（真陰性）
                    </span>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="p-6 rounded-2xl bg-slate-900/60 border-2 border-dashed border-slate-700 text-center flex flex-col items-center gap-2">
            <span className="text-4xl">🏥</span>
            <span className="text-sm font-bold text-slate-200">
              下のボタンを押して、街の猫を診断してみよう！
            </span>
            <span className="text-xs text-slate-400">
              （感度99%・特異度99%の超高精度な検査器で検査します）
            </span>
          </div>
        )}

        {/* Live Counters */}
        <div className="grid grid-cols-3 gap-2 p-3 bg-slate-950/80 rounded-2xl border border-chalkboard-border text-center">
          <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-xs text-slate-400 block">総検査数</span>
            <span className="text-base sm:text-lg font-black font-mono text-slate-200">
              {sessionStats.totalTested.toLocaleString()} 匹
            </span>
          </div>
          <div className="p-2 rounded-xl bg-amber-950/40 border border-amber-500/50">
            <span className="text-xs text-amber-300 font-bold block">陽性判定 (＋)</span>
            <span className="text-base sm:text-lg font-black font-mono text-amber-400">
              {sessionStats.positives.toLocaleString()} 匹
            </span>
          </div>
          <div className="p-2 rounded-xl bg-emerald-950/40 border border-emerald-800/40">
            <span className="text-xs text-emerald-300 block">陰性判定 (ー)</span>
            <span className="text-base sm:text-lg font-black font-mono text-emerald-400">
              {sessionStats.negatives.toLocaleString()} 匹
            </span>
          </div>
        </div>

        {/* Control Panel */}
        <ControlPanel
          onRunSingle={() => handleInspect(1)}
          runSingleText="住民から1匹選んで検査する"
          onReset={handleResetStep1}
          resetText="リセット"
          customControls={
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleInspect(10)}
                className="flex-1 py-2 px-2 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-98 text-chalk-white border border-slate-700 font-bold text-xs sm:text-sm flex items-center justify-center gap-1 shadow"
              >
                <Zap className="w-3.5 h-3.5 text-chalk-yellow" />
                <span>10匹検査</span>
              </button>
              <button
                onClick={() => handleInspect(100)}
                className="flex-1 py-2 px-2 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-98 text-chalk-white border border-slate-700 font-bold text-xs sm:text-sm flex items-center justify-center gap-1 shadow"
              >
                <Zap className="w-3.5 h-3.5 text-chalk-yellow" />
                <span>100匹検査</span>
              </button>
              <button
                onClick={() => handleInspect(1000)}
                className="flex-1 py-2 px-2 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-98 text-chalk-white border border-slate-700 font-bold text-xs sm:text-sm flex items-center justify-center gap-1 shadow"
              >
                <Zap className="w-3.5 h-3.5 text-chalk-yellow" />
                <span>1000匹検査</span>
              </button>
            </div>
          }
        />
      </div>
    );
  }

  // STEP 2: 試行フェーズ (Simulation) - 4つの部屋に分類とスライダー調整
  if (stepIndex === 2) {
    return (
      <div className="flex flex-col gap-4 w-full">
        <div className="p-3 bg-slate-950/70 border border-chalkboard-border rounded-xl text-xs sm:text-sm font-bold text-slate-300 flex justify-between items-center">
          <span>⚡ 検査結果の4象限分類（10,000匹の全体像）</span>
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

        <div className="text-xs sm:text-sm text-slate-200 leading-relaxed space-y-1">
          <p>
            陽性反応が出た <strong>{breakdown.totalPositives}匹</strong> のうち、本当に病気の猫は{" "}
            <strong className="text-red-400">{breakdown.truePositives}匹</strong> だけ。
            残り <strong className="text-amber-300">{breakdown.falsePositives}匹</strong> は健康な猫です！
          </p>
          <p className="text-amber-200 font-semibold">
            👉 なぜなら、健康な猫（9,990匹）が圧倒的多数なため、わずか1%の誤診が本物の病気の猫（10匹）の約10倍も発生するからです。
          </p>
        </div>
      </div>
    </div>
  );
};
