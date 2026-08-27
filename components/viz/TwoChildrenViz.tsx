"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  runBasicTwoChildrenSim,
  runTuesdayBoySim,
  generateTuesdayGridData,
  generateFamily,
  Family,
  TwoChildrenSimResult,
} from "@/lib/simulations/two-children";
import { ControlPanel } from "../lesson/ControlPanel";
import { Users, Sparkles, HelpCircle } from "lucide-react";

interface TwoChildrenVizProps {
  stepIndex: number;
}

export const TwoChildrenViz: React.FC<TwoChildrenVizProps> = ({ stepIndex }) => {
  const [mode, setMode] = useState<"basic" | "tuesday">("basic");
  const [lastFamily, setLastFamily] = useState<{
    family: Family;
    isAccepted: boolean;
    isBothBoys: boolean;
  } | null>(null);
  const [simResult, setSimResult] = useState<TwoChildrenSimResult>(() =>
    runBasicTwoChildrenSim(1000)
  );

  const tuesdayData = generateTuesdayGridData(2);

  const handleModeChange = (newMode: "basic" | "tuesday") => {
    setMode(newMode);
    setLastFamily(null);
    if (newMode === "basic") {
      setSimResult(runBasicTwoChildrenSim(1000));
    } else {
      setSimResult(runTuesdayBoySim(1000, "Tue"));
    }
  };

  const handleSampleSingle = () => {
    let found = false;
    while (!found) {
      const fam = generateFamily();
      if (mode === "basic") {
        if (fam.child1.gender === "B" || fam.child2.gender === "B") {
          const bothBoys = fam.child1.gender === "B" && fam.child2.gender === "B";
          setLastFamily({ family: fam, isAccepted: true, isBothBoys: bothBoys });
          found = true;
        }
      } else {
        const c1Match = fam.child1.gender === "B" && fam.child1.day === "Tue";
        const c2Match = fam.child2.gender === "B" && fam.child2.day === "Tue";
        if (c1Match || c2Match) {
          const bothBoys = fam.child1.gender === "B" && fam.child2.gender === "B";
          setLastFamily({ family: fam, isAccepted: true, isBothBoys: bothBoys });
          found = true;
        }
      }
    }
  };

  const handleRunBatch = (trials: number) => {
    if (mode === "basic") {
      setSimResult(runBasicTwoChildrenSim(trials));
    } else {
      setSimResult(runTuesdayBoySim(trials, "Tue"));
    }
  };

  const DAY_JA: Record<string, string> = {
    Sun: "日曜",
    Mon: "月曜",
    Tue: "火曜",
    Wed: "水曜",
    Thu: "木曜",
    Fri: "金曜",
    Sat: "土曜",
  };

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
            <Users className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-black text-chalk-white">
              黒板：本日の問題
            </h3>
          </div>

          <div className="text-sm sm:text-base text-slate-200 leading-relaxed space-y-3">
            <p>
              子供が2人いる家庭があります。
            </p>
            <div className="p-3.5 bg-chalkboard-dark rounded-xl border border-chalkboard-border text-chalk-yellow font-bold text-xs sm:text-sm space-y-2">
              <div>①「少なくとも1人は男の子」と知ったとき、2人とも男の子である確率は？</div>
              <div>② さらに「火曜日生まれの男の子がいる」と知ったとき、確率は変わる？</div>
            </div>
            <p className="text-slate-300">
              曜日という無関係に見える情報で、確率は変わらないでしょうか？ それとも変化するでしょうか？
            </p>
            <p className="text-amber-300 font-bold">
              👉 直感ではどう思いますか？ 右の対話を聞いて選択肢を選んでみよう！
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  // STEP 1: 体験フェーズ (Experience) - 標本空間4マスの消し込み
  if (stepIndex === 1) {
    return (
      <div className="flex flex-col gap-4 w-full">
        <div className="p-3 bg-slate-950/70 border border-chalkboard-border rounded-xl text-xs sm:text-sm font-bold text-slate-300 flex justify-between items-center">
          <span>🎮 標本空間 4マスの消し込み体験</span>
          <span className="text-amber-400 font-mono">
            残った3マス中 1マスが (男, 男) = 1/3
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 max-w-xs mx-auto w-full p-2">
          <div className="p-3 sm:p-3.5 rounded-2xl bg-emerald-950/60 border-2 border-emerald-400 text-center">
            <span className="text-2xl block">👦👦</span>
            <span className="text-xs sm:text-sm font-black text-emerald-200 block mt-0.5">(男, 男)</span>
            <span className="text-[10px] sm:text-xs text-emerald-400 font-bold">★ 該当 (1/3)</span>
          </div>

          <div className="p-3 sm:p-3.5 rounded-2xl bg-slate-900/80 border border-slate-700 text-center">
            <span className="text-2xl block">👦👧</span>
            <span className="text-xs sm:text-sm font-bold text-slate-300 block mt-0.5">(男, 女)</span>
          </div>

          <div className="p-3 sm:p-3.5 rounded-2xl bg-slate-900/80 border border-slate-700 text-center">
            <span className="text-2xl block">👧👦</span>
            <span className="text-xs sm:text-sm font-bold text-slate-300 block mt-0.5">(女, 男)</span>
          </div>

          <div className="p-3 sm:p-3.5 rounded-2xl bg-slate-950/40 border border-dashed border-red-500/40 text-center opacity-40">
            <span className="text-2xl block line-through">👧👧</span>
            <span className="text-xs sm:text-sm font-bold text-red-400 block mt-0.5">(女, 女) ✕除外</span>
          </div>
        </div>

        {lastFamily && (
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs sm:text-sm flex justify-between items-center font-bold">
            <span>
              抽出: {lastFamily.family.child1.gender === "B" ? "👦男" : "👧女"} &amp; {lastFamily.family.child2.gender === "B" ? "👦男" : "👧女"}
            </span>
            <span className={lastFamily.isBothBoys ? "text-emerald-400 font-black" : "text-slate-400"}>
              {lastFamily.isBothBoys ? "🎉 両方男の子！" : "男女ペア"}
            </span>
          </div>
        )}

        <ControlPanel
          onRunSingle={handleSampleSingle}
          runSingleText="家族を1組サンプリング"
          onReset={() => setLastFamily(null)}
        />
      </div>
    );
  }

  // STEP 2: 試行フェーズ (Simulation) - 棄却サンプリング
  if (stepIndex === 2) {
    return (
      <div className="flex flex-col gap-4 w-full">
        <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/70 border border-chalkboard-border">
          <span className="text-xs font-bold text-slate-300">シミュレーション対象:</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleModeChange("basic")}
              className={`px-3 py-1 rounded-xl text-xs font-bold ${
                mode === "basic"
                  ? "bg-amber-500 text-slate-950"
                  : "bg-slate-800 text-slate-400"
              }`}
            >
              基本版 (1/3)
            </button>
            <button
              onClick={() => handleModeChange("tuesday")}
              className={`px-3 py-1 rounded-xl text-xs font-bold ${
                mode === "tuesday"
                  ? "bg-pink-500 text-white"
                  : "bg-slate-800 text-slate-400"
              }`}
            >
              火曜日版 (13/27)
            </button>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-950/80 border border-chalkboard-border flex flex-col gap-3">
          <div className="flex justify-between text-xs font-bold">
            <span className="text-chalk-white">
              両方男の子である確率（棄却サンプリング {simResult.acceptedTrials.toLocaleString()}件）
            </span>
            <span className="text-emerald-400 font-mono text-sm">
              {(simResult.bothBoysRate * 100).toFixed(1)}% (理論値:{" "}
              {(simResult.theoreticalRate * 100).toFixed(1)}%)
            </span>
          </div>

          <div className="w-full h-4 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-500 to-emerald-400"
              initial={{ width: 0 }}
              animate={{ width: `${simResult.bothBoysRate * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        <ControlPanel
          onRunBatch={handleRunBatch}
          batchCounts={[100, 1000, 10000]}
        />
      </div>
    );
  }

  // STEP 3: 種明かしフェーズ (Reveal) - 196マスのグリッド
  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-950 to-chalkboard-dark border-2 border-amber-500/50 shadow-xl flex flex-col gap-3">
        <div className="flex items-center justify-between text-xs font-bold text-slate-300">
          <span className="text-amber-300 font-bold flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-400" />
            種明かし：火曜日の情報で標本空間がどう削られるか
          </span>
          <span className="font-mono text-pink-400">13 / 27 ≒ 48.15%</span>
        </div>

        <div className="grid grid-cols-14 gap-0.5 p-2 bg-slate-900/80 rounded-xl max-h-40 overflow-y-auto">
          {tuesdayData.grid.flatMap((row, r) =>
            row.map((cell, c) => (
              <div
                key={`${r}-${c}`}
                className={`h-2.5 rounded-[2px] ${
                  cell.isBothBoys
                    ? "bg-emerald-400 shadow ring-1 ring-emerald-300"
                    : cell.isAccepted
                    ? "bg-pink-500/80"
                    : "bg-slate-800/30"
                }`}
              />
            ))
          )}
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          「火曜日」という細かい情報が付くことで、両方が条件に当てはまる重複ケースが「1通り」だけに減少し、分母が27通り、分子が13通りになります。
          情報が細かくなるほど、確率は極限で <strong>1/2（50%）</strong> に近づいていきます！
        </p>
      </div>
    </div>
  );
};
