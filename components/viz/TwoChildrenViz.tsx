"use client";

import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  runBasicTwoChildrenSim,
  runTuesdayBoySim,
  generateTuesdayGridData,
  generateFamily,
  Family,
  TwoChildrenSimResult,
  GridCellInfo,
  DAYS_OF_WEEK,
} from "@/lib/simulations/two-children";
import { ControlPanel } from "../lesson/ControlPanel";
import { Users, Sparkles, HelpCircle } from "lucide-react";

interface FourCellCounts {
  BB: number; // (男, 男)
  BG: number; // (男, 女)
  GB: number; // (女, 男)
  GG: number; // (女, 女) [棄却]
}

interface TwoChildrenVizProps {
  stepIndex: number;
}

const DAY_LABELS = ["日", "月", "火", "水", "木", "金", "土"];

export const TwoChildrenViz: React.FC<TwoChildrenVizProps> = ({ stepIndex }) => {
  const [mode, setMode] = useState<"basic" | "tuesday">("basic");

  // Step 1: 4マスのサンプリング状態
  const [fourCellCounts, setFourCellCounts] = useState<FourCellCounts>({
    BB: 0,
    BG: 0,
    GB: 0,
    GG: 0,
  });
  const [step1Sample, setStep1Sample] = useState<{
    family: Family;
    cellKey: "BB" | "BG" | "GB" | "GG";
    isAccepted: boolean;
    isBothBoys: boolean;
  } | null>(null);
  const [step1SampleKey, setStep1SampleKey] = useState(0);

  // Step 2 用のシミュレーション状態 & 14x14 グリッド
  const [targetDayIndex, setTargetDayIndex] = useState<number>(2); // 2: 火曜日
  const [hoveredCell, setHoveredCell] = useState<GridCellInfo | null>(null);
  const [step2LastSample, setStep2LastSample] = useState<{
    r: number;
    c: number;
    isBothBoys: boolean;
  } | null>(null);
  const [step2SampleKey, setStep2SampleKey] = useState<number>(0);

  const [simResult, setSimResult] = useState<TwoChildrenSimResult>(() =>
    runBasicTwoChildrenSim(1000)
  );

  const activeGridData = useMemo(() => {
    return generateTuesdayGridData(
      targetDayIndex,
      mode === "basic" ? "basic" : "day"
    );
  }, [targetDayIndex, mode]);

  const handleModeChange = (newMode: "basic" | "tuesday") => {
    setMode(newMode);
    setStep2LastSample(null);
    setHoveredCell(null);
    if (newMode === "basic") {
      setSimResult(runBasicTwoChildrenSim(1000));
    } else {
      setSimResult(runTuesdayBoySim(1000, DAYS_OF_WEEK[targetDayIndex]));
    }
  };

  const handleStep1SampleSingle = () => {
    const fam = generateFamily();
    const k1 = fam.child1.gender;
    const k2 = fam.child2.gender;
    const cellKey = `${k1}${k2}` as "BB" | "BG" | "GB" | "GG";
    const isAccepted = cellKey !== "GG";
    const isBothBoys = cellKey === "BB";

    setStep1Sample({
      family: fam,
      cellKey,
      isAccepted,
      isBothBoys,
    });
    setStep1SampleKey((prev) => prev + 1);

    setFourCellCounts((prev) => ({
      ...prev,
      [cellKey]: prev[cellKey] + 1,
    }));
  };

  const handleStep1SampleBatch = (count: number) => {
    let bb = 0;
    let bg = 0;
    let gb = 0;
    let gg = 0;
    let lastFam: Family | null = null;
    let lastKey: "BB" | "BG" | "GB" | "GG" = "BB";

    for (let i = 0; i < count; i++) {
      const fam = generateFamily();
      const k1 = fam.child1.gender;
      const k2 = fam.child2.gender;
      const cellKey = `${k1}${k2}` as "BB" | "BG" | "GB" | "GG";
      if (cellKey === "BB") bb++;
      else if (cellKey === "BG") bg++;
      else if (cellKey === "GB") gb++;
      else if (cellKey === "GG") gg++;

      if (i === count - 1) {
        lastFam = fam;
        lastKey = cellKey;
      }
    }

    if (lastFam) {
      setStep1Sample({
        family: lastFam,
        cellKey: lastKey,
        isAccepted: lastKey !== "GG",
        isBothBoys: lastKey === "BB",
      });
      setStep1SampleKey((prev) => prev + 1);
    }

    setFourCellCounts((prev) => ({
      BB: prev.BB + bb,
      BG: prev.BG + bg,
      GB: prev.GB + gb,
      GG: prev.GG + gg,
    }));
  };

  const handleStep1Reset = () => {
    setFourCellCounts({ BB: 0, BG: 0, GB: 0, GG: 0 });
    setStep1Sample(null);
    setStep1SampleKey(0);
  };

  const handleStep2SampleSingle = () => {
    const targetDay = DAYS_OF_WEEK[targetDayIndex];
    let found = false;
    let attempts = 0;
    while (!found && attempts < 1000) {
      attempts++;
      const fam = generateFamily();
      const c1 = fam.child1;
      const c2 = fam.child2;
      const r = (c1.gender === "B" ? 0 : 7) + c1.dayIndex;
      const c = (c2.gender === "B" ? 0 : 7) + c2.dayIndex;

      let isAccepted = false;
      if (mode === "basic") {
        isAccepted = c1.gender === "B" || c2.gender === "B";
      } else {
        isAccepted =
          (c1.gender === "B" && c1.day === targetDay) ||
          (c2.gender === "B" && c2.day === targetDay);
      }

      if (isAccepted) {
        const isBothBoys = c1.gender === "B" && c2.gender === "B";
        setStep2LastSample({ r, c, isBothBoys });
        setStep2SampleKey((prev) => prev + 1);
        setSimResult((prev) => {
          const newAcc = prev.acceptedTrials + 1;
          const newBoth = prev.bothBoysCount + (isBothBoys ? 1 : 0);
          return {
            ...prev,
            acceptedTrials: newAcc,
            bothBoysCount: newBoth,
            bothBoysRate: newBoth / newAcc,
          };
        });
        found = true;
      }
    }
  };

  const handleStep2RunBatch = (trials: number) => {
    const targetDay = DAYS_OF_WEEK[targetDayIndex];
    if (mode === "basic") {
      setSimResult(runBasicTwoChildrenSim(trials));
    } else {
      setSimResult(runTuesdayBoySim(trials, targetDay));
    }
  };

  const handleStep2Reset = () => {
    setStep2LastSample(null);
    setHoveredCell(null);
    if (mode === "basic") {
      setSimResult(runBasicTwoChildrenSim(1000));
    } else {
      setSimResult(runTuesdayBoySim(1000, DAYS_OF_WEEK[targetDayIndex]));
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

  // STEP 1: 体験フェーズ (Experience) - 標本空間4マスの消し込み & サンプリング
  if (stepIndex === 1) {
    const validTotal =
      fourCellCounts.BB + fourCellCounts.BG + fourCellCounts.GB;
    const totalDrawn = validTotal + fourCellCounts.GG;
    const bothBoysRate =
      validTotal > 0 ? (fourCellCounts.BB / validTotal) * 100 : 0;

    return (
      <div className="flex flex-col gap-3 w-full">
        {/* Real-time Summary Card */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-slate-950 to-chalkboard-dark border border-chalkboard-border shadow-xl flex flex-col gap-2.5">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="text-xs sm:text-sm font-black text-chalk-white">
                抽出結果:{" "}
                <span className="text-chalk-yellow">
                  有効 {validTotal.toLocaleString()}組 / 全{" "}
                  {totalDrawn.toLocaleString()}組
                </span>
              </span>
            </div>
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-black shadow ${
                validTotal === 0
                  ? "bg-slate-800 text-slate-400"
                  : "bg-emerald-600 text-white"
              }`}
            >
              {validTotal === 0
                ? "未サンプリング"
                : `(男, 男) 確率: ${bothBoysRate.toFixed(1)}%`}
            </span>
          </div>

          {/* Progress Bar & Theory Marker */}
          <div className="space-y-1">
            <div className="flex justify-between text-[11px] font-mono text-slate-400">
              <span>
                実測 (男,男) 比率:{" "}
                {validTotal > 0
                  ? `${bothBoysRate.toFixed(1)}% (${fourCellCounts.BB}/${validTotal}組)`
                  : "-"}
              </span>
              <span className="text-amber-300 font-bold">
                理論値: 33.3% (1/3)
              </span>
            </div>
            <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800 relative">
              {/* Theory line at 33.3% */}
              <div className="absolute top-0 bottom-0 left-1/3 w-0.5 bg-amber-400 z-10 opacity-70" />
              <motion.div
                className="h-full bg-gradient-to-r from-blue-500 to-emerald-400 rounded-full transition-all duration-300"
                style={{
                  width: `${validTotal > 0 ? Math.min(bothBoysRate, 100) : 0}%`,
                }}
              />
            </div>
          </div>
        </div>

        {/* 4 Cells Sample Space Interactive Grid */}
        <div className="grid grid-cols-2 gap-2.5 w-full">
          {/* Cell (BB): (男, 男) */}
          <motion.div
            key={`cell-bb-${step1SampleKey}`}
            animate={
              step1Sample?.cellKey === "BB" ? { scale: [1, 1.05, 1] } : {}
            }
            transition={{ duration: 0.25 }}
            className={`p-3 rounded-2xl border-2 transition-all relative overflow-hidden flex flex-col justify-between h-[112px] ${
              step1Sample?.cellKey === "BB"
                ? "bg-emerald-950/80 border-emerald-400 ring-4 ring-emerald-400/50 shadow-lg shadow-emerald-500/20"
                : "bg-emerald-950/40 border-emerald-500/50"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xl sm:text-2xl">👦👦</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/90 text-slate-950">
                ★ 目的 (1/3)
              </span>
            </div>
            <div className="flex justify-between items-end">
              <div>
                <span className="text-xs font-black text-emerald-200 block">
                  (男, 男)
                </span>
                <span className="text-[10px] text-emerald-400 font-medium">
                  両方男の子！
                </span>
              </div>
              <div className="text-right">
                <span className="text-base sm:text-lg font-black font-mono text-emerald-300">
                  {fourCellCounts.BB}
                  <span className="text-xs font-normal text-emerald-400/80 ml-0.5">
                    回
                  </span>
                </span>
                <span className="text-[10px] text-slate-400 block font-mono">
                  {validTotal > 0
                    ? `${((fourCellCounts.BB / validTotal) * 100).toFixed(1)}%`
                    : "0%"}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Cell (BG): (男, 女) */}
          <motion.div
            key={`cell-bg-${step1SampleKey}`}
            animate={
              step1Sample?.cellKey === "BG" ? { scale: [1, 1.05, 1] } : {}
            }
            transition={{ duration: 0.25 }}
            className={`p-3 rounded-2xl border-2 transition-all relative overflow-hidden flex flex-col justify-between h-[112px] ${
              step1Sample?.cellKey === "BG"
                ? "bg-blue-950/80 border-blue-400 ring-4 ring-blue-400/50 shadow-lg shadow-blue-500/20"
                : "bg-slate-900/80 border-slate-700"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xl sm:text-2xl">👦👧</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-950 text-blue-300 border border-blue-600">
                受理 (男あり)
              </span>
            </div>
            <div className="flex justify-between items-end">
              <div>
                <span className="text-xs font-black text-slate-200 block">
                  (男, 女)
                </span>
                <span className="text-[10px] text-slate-400 font-medium">
                  第1子男・第2子女
                </span>
              </div>
              <div className="text-right">
                <span className="text-base sm:text-lg font-black font-mono text-blue-300">
                  {fourCellCounts.BG}
                  <span className="text-xs font-normal text-slate-400 ml-0.5">
                    回
                  </span>
                </span>
                <span className="text-[10px] text-slate-400 block font-mono">
                  {validTotal > 0
                    ? `${((fourCellCounts.BG / validTotal) * 100).toFixed(1)}%`
                    : "0%"}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Cell (GB): (女, 男) */}
          <motion.div
            key={`cell-gb-${step1SampleKey}`}
            animate={
              step1Sample?.cellKey === "GB" ? { scale: [1, 1.05, 1] } : {}
            }
            transition={{ duration: 0.25 }}
            className={`p-3 rounded-2xl border-2 transition-all relative overflow-hidden flex flex-col justify-between h-[112px] ${
              step1Sample?.cellKey === "GB"
                ? "bg-blue-950/80 border-blue-400 ring-4 ring-blue-400/50 shadow-lg shadow-blue-500/20"
                : "bg-slate-900/80 border-slate-700"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xl sm:text-2xl">👧👦</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-950 text-blue-300 border border-blue-600">
                受理 (男あり)
              </span>
            </div>
            <div className="flex justify-between items-end">
              <div>
                <span className="text-xs font-black text-slate-200 block">
                  (女, 男)
                </span>
                <span className="text-[10px] text-slate-400 font-medium">
                  第1子女・第2子男
                </span>
              </div>
              <div className="text-right">
                <span className="text-base sm:text-lg font-black font-mono text-blue-300">
                  {fourCellCounts.GB}
                  <span className="text-xs font-normal text-slate-400 ml-0.5">
                    回
                  </span>
                </span>
                <span className="text-[10px] text-slate-400 block font-mono">
                  {validTotal > 0
                    ? `${((fourCellCounts.GB / validTotal) * 100).toFixed(1)}%`
                    : "0%"}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Cell (GG): (女, 女) [除外/棄却] */}
          <motion.div
            key={`cell-gg-${step1SampleKey}`}
            animate={
              step1Sample?.cellKey === "GG" ? { scale: [1, 1.05, 1] } : {}
            }
            transition={{ duration: 0.25 }}
            className={`p-3 rounded-2xl border-2 border-dashed transition-all relative overflow-hidden flex flex-col justify-between h-[112px] ${
              step1Sample?.cellKey === "GG"
                ? "bg-red-950/80 border-red-500 ring-4 ring-red-500/50 shadow-lg shadow-red-500/20 opacity-100"
                : "bg-slate-950/40 border-red-500/40 opacity-50"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xl sm:text-2xl line-through text-slate-500">
                👧👧
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-red-950 text-red-300 border border-red-700">
                ✕ 条件外で除外
              </span>
            </div>
            <div className="flex justify-between items-end">
              <div>
                <span className="text-xs font-black text-red-300 line-through block">
                  (女, 女)
                </span>
                <span className="text-[10px] text-red-400 font-medium">
                  男の子ゼロ（棄却）
                </span>
              </div>
              <div className="text-right">
                <span className="text-base sm:text-lg font-black font-mono text-red-300">
                  {fourCellCounts.GG}
                  <span className="text-xs font-normal text-slate-400 ml-0.5">
                    回
                  </span>
                </span>
                <span className="text-[10px] text-red-400 block">除外</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Latest Sample Feedback Banner */}
        <div
          className={`p-2.5 sm:p-3 rounded-xl border text-xs sm:text-sm font-bold min-h-[44px] flex items-center justify-between transition-colors ${
            !step1Sample
              ? "bg-slate-950/70 border-slate-800 text-slate-400"
              : step1Sample.cellKey === "BB"
              ? "bg-emerald-950/80 border-emerald-400 text-emerald-200"
              : step1Sample.cellKey === "GG"
              ? "bg-red-950/80 border-red-400 text-red-200"
              : "bg-blue-950/80 border-blue-400 text-blue-200"
          }`}
        >
          {!step1Sample ? (
            <span>👉 下のボタンで家族をサンプリングしてみよう！</span>
          ) : step1Sample.cellKey === "BB" ? (
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
              抽出: 👦男 &amp; 👦男 → ★ 2人とも男の子！（目的の事象）
            </span>
          ) : step1Sample.cellKey === "GG" ? (
            <span className="flex items-center gap-1.5">
              🚫 抽出: 👧女 &amp; 👧女 → 男の子がいないため「条件外として除外」！
            </span>
          ) : (
            <span className="flex items-center gap-1.5">
              🔵 抽出:{" "}
              {step1Sample.family.child1.gender === "B" ? "👦男" : "👧女"} &amp;{" "}
              {step1Sample.family.child2.gender === "B" ? "👦男" : "👧女"} →
              少なくとも1人男の子（受理）
            </span>
          )}
          {step1Sample && (
            <span className="text-xs font-mono font-normal opacity-80 shrink-0 ml-2">
              (4マス中: {step1Sample.cellKey})
            </span>
          )}
        </div>

        {/* Control Panel */}
        <ControlPanel
          onRunSingle={handleStep1SampleSingle}
          runSingleText="家族を1組サンプリング"
          onRunBatch={handleStep1SampleBatch}
          batchCounts={[10, 100]}
          onReset={handleStep1Reset}
          resetText="リセット"
        />
      </div>
    );
  }

  // STEP 2: 試行フェーズ (Simulation) - 14x14 = 196マスのグリッドと棄却サンプリング
  const targetDayName = DAY_LABELS[targetDayIndex];

  if (stepIndex === 2) {
    const { acceptedCount, bothBoysCount } = activeGridData;
    const nonBothBoysCount = acceptedCount - bothBoysCount;
    const theoreticalPercent = ((bothBoysCount / acceptedCount) * 100).toFixed(
      1
    );

    return (
      <div className="flex flex-col gap-3 w-full">
        {/* Mode & Target Day Selector */}
        <div className="p-3 rounded-2xl bg-slate-950/80 border border-chalkboard-border shadow flex flex-col gap-2.5">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <span className="text-xs font-bold text-slate-300">問題の切り替え:</span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => handleModeChange("basic")}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                  mode === "basic"
                    ? "bg-amber-500 text-slate-950 font-black shadow"
                    : "bg-slate-900 text-slate-400 border border-slate-700 hover:bg-slate-800"
                }`}
              >
                基本版（男の子がいる → 1/3）
              </button>
              <button
                type="button"
                onClick={() => handleModeChange("tuesday")}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                  mode === "tuesday"
                    ? "bg-pink-600 text-white font-black shadow"
                    : "bg-slate-900 text-slate-400 border border-slate-700 hover:bg-slate-800"
                }`}
              >
                曜日指定版（◯曜日の男の子 → 13/27）
              </button>
            </div>
          </div>

          {/* Day of Week Tabs (Only for tuesday mode) */}
          {mode === "tuesday" && (
            <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 flex-wrap gap-1.5">
              <span className="text-xs font-bold text-pink-300">指定曜日:</span>
              <div className="flex items-center gap-1">
                {DAY_LABELS.map((day, idx) => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => {
                      setTargetDayIndex(idx);
                      setStep2LastSample(null);
                    }}
                    className={`w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center transition-all ${
                      targetDayIndex === idx
                        ? "bg-pink-500 text-white font-black ring-2 ring-pink-300 shadow"
                        : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 14x14 Grid Visual Map Container */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-slate-950 to-chalkboard-dark border-2 border-slate-700 shadow-2xl flex flex-col gap-2.5">
          {/* Grid Header Info */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="text-xs sm:text-sm font-black text-chalk-white">
                全196マス（14×14）の消し込みマップ
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="px-2 py-0.5 rounded-md bg-emerald-950/80 text-emerald-300 border border-emerald-500 font-bold">
                (男,男): {bothBoysCount}マス
              </span>
              <span className="text-slate-400">/</span>
              <span className="px-2 py-0.5 rounded-md bg-slate-800 text-amber-300 font-bold">
                全体: {acceptedCount}マス
              </span>
              <span className="text-chalk-yellow font-black">
                ＝ {bothBoysCount}/{acceptedCount} (≒ {theoreticalPercent}%)
              </span>
            </div>
          </div>

          {/* Axis Labels & 14x14 Grid (Guaranteed Exact Square) */}
          <div className="flex flex-col items-center mx-auto my-1">
            {/* Top Axis Label (Child 2) */}
            <div className="flex items-center pl-[24px] sm:pl-[28px]">
              <div className="w-[126px] sm:w-[154px] text-center text-[10px] sm:text-xs font-black text-blue-300 border-b-2 border-blue-500/60 pb-0.5">
                👦 第2子 男 (7日)
              </div>
              <div className="w-[126px] sm:w-[154px] text-center text-[10px] sm:text-xs font-black text-pink-300 border-b-2 border-pink-500/60 pb-0.5">
                👧 第2子 女 (7日)
              </div>
            </div>

            {/* Main Row: Left Axis + 14x14 Grid */}
            <div className="flex items-center">
              {/* Left Axis Label (Child 1) */}
              <div className="w-[24px] sm:w-[28px] h-[252px] sm:h-[308px] flex flex-col justify-between text-[10px] sm:text-xs font-black pr-1 select-none shrink-0">
                <div className="h-[126px] sm:h-[154px] flex flex-col items-center justify-center text-blue-300 border-r-2 border-blue-500/60 leading-none gap-0.5 py-1">
                  <span>👦</span>
                  <span>第</span>
                  <span>1</span>
                  <span>子</span>
                  <span>男</span>
                </div>
                <div className="h-[126px] sm:h-[154px] flex flex-col items-center justify-center text-pink-300 border-r-2 border-pink-500/60 leading-none gap-0.5 py-1">
                  <span>👧</span>
                  <span>第</span>
                  <span>1</span>
                  <span>子</span>
                  <span>女</span>
                </div>
              </div>

              {/* 14x14 Cells (Explicit 252px x 252px or 308px x 308px square) */}
              <div
                className="w-[252px] h-[252px] sm:w-[308px] sm:h-[308px] bg-slate-950 rounded-xl border border-slate-700 relative p-1 shrink-0"
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(14, 1fr)",
                  gridTemplateRows: "repeat(14, 1fr)",
                  gap: "1px",
                }}
              >
                {activeGridData.grid.flatMap((row, r) =>
                  row.map((cell, c) => {
                    const isLastHit =
                      step2LastSample?.r === r && step2LastSample?.c === c;
                    const isOverlapCell =
                      mode === "tuesday" &&
                      r === targetDayIndex &&
                      c === targetDayIndex;

                    return (
                      <button
                        key={`${r}-${c}`}
                        type="button"
                        onMouseEnter={() => setHoveredCell(cell)}
                        onClick={() => setHoveredCell(cell)}
                        className={`w-full h-full p-0 m-0 border-0 outline-none rounded-[1.5px] transition-all relative ${
                          isLastHit
                            ? "ring-2 ring-amber-300 z-30 animate-pulse"
                            : ""
                        } ${
                          cell.isAccepted
                            ? cell.isBothBoys
                              ? "bg-emerald-400 hover:brightness-125 z-10 shadow-sm"
                              : "bg-sky-400 hover:brightness-125 z-10 shadow-sm"
                            : "bg-slate-900/80 opacity-20 hover:opacity-60"
                        } ${
                          // 4 Big Quadrant dividing borders
                          r === 6 ? "border-b border-b-slate-600" : ""
                        } ${c === 6 ? "border-r border-r-slate-600" : ""}`}
                        title={`第1子: ${cell.c1Gender === "B" ? "男" : "女"}(${
                          DAY_LABELS[cell.c1DayIndex]
                        }) × 第2子: ${cell.c2Gender === "B" ? "男" : "女"}(${
                          DAY_LABELS[cell.c2DayIndex]
                        })`}
                      >
                        {isOverlapCell && (
                          <div className="absolute inset-0 flex items-center justify-center text-[7px] sm:text-[8px] text-slate-950 font-black leading-none pointer-events-none">
                            ★
                          </div>
                        )}
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Cell Inspection / Hover Tooltip */}
          <div className="p-2 rounded-xl bg-slate-900/90 border border-slate-800 text-xs flex justify-between items-center min-h-[36px]">
            {hoveredCell ? (
              <div className="flex items-center gap-2 w-full justify-between">
                <span className="font-mono text-slate-200">
                  第1子:{" "}
                  <strong className={hoveredCell.c1Gender === "B" ? "text-blue-300" : "text-pink-300"}>
                    {hoveredCell.c1Gender === "B" ? "👦男" : "👧女"}({DAY_LABELS[hoveredCell.c1DayIndex]}曜)
                  </strong>{" "}
                  × 第2子:{" "}
                  <strong className={hoveredCell.c2Gender === "B" ? "text-blue-300" : "text-pink-300"}>
                    {hoveredCell.c2Gender === "B" ? "👦男" : "👧女"}({DAY_LABELS[hoveredCell.c2DayIndex]}曜)
                  </strong>
                </span>
                <span
                  className={`px-2 py-0.5 rounded text-[11px] font-black ${
                    hoveredCell.isAccepted
                      ? hoveredCell.isBothBoys
                        ? "bg-emerald-500 text-slate-950"
                        : "bg-sky-500 text-slate-950"
                      : "bg-slate-800 text-slate-500"
                  }`}
                >
                  {hoveredCell.isAccepted
                    ? hoveredCell.isBothBoys
                      ? "★ 両方男の子 (該当)"
                      : "男女ペア (受理)"
                    : "✕ 条件外 (除外)"}
                </span>
              </div>
            ) : (
              <span className="text-slate-400 text-center w-full">
                {mode === "tuesday"
                  ? `💡 【${targetDayName}曜日の男の子】の十字クロス（縦14＋横14−重複1＝27マス）が点灯しています！`
                  : "💡 基本版：男の子を含む147マスが点灯中（49/147 ＝ 1/3）"}
              </span>
            )}
          </div>

          {/* Color Legend Bar */}
          <div className="flex items-center justify-around flex-wrap gap-2 text-xs border-t border-slate-800 pt-2 text-slate-300">
            <div className="flex items-center gap-1.5">
              <div className="w-3.5 h-3.5 rounded-sm bg-emerald-400 shadow-sm" />
              <span className="font-bold">両方男の子 ({bothBoysCount}マス)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3.5 h-3.5 rounded-sm bg-sky-400 shadow-sm" />
              <span className="font-bold">男女ペア ({nonBothBoysCount}マス)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3.5 h-3.5 rounded-sm bg-slate-900 border border-slate-700 opacity-40" />
              <span className="text-slate-400">除外 ({196 - acceptedCount}マス)</span>
            </div>
          </div>
        </div>

        {/* Live Simulation Progress & Controls */}
        <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-chalkboard-border flex flex-col gap-2.5">
          <div className="flex justify-between items-center text-xs font-bold">
            <span className="text-chalk-white">
              棄却サンプリング実測結果 ({simResult.acceptedTrials.toLocaleString()}組抽出):
            </span>
            <span className="text-emerald-400 font-mono text-sm font-black">
              {(simResult.bothBoysRate * 100).toFixed(1)}% (理論値: {theoreticalPercent}%)
            </span>
          </div>

          <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-slate-800 relative">
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-amber-400 z-10 opacity-80"
              style={{ left: `${(bothBoysCount / acceptedCount) * 100}%` }}
            />
            <motion.div
              className="h-full bg-gradient-to-r from-blue-500 to-emerald-400 transition-all duration-300"
              style={{ width: `${simResult.bothBoysRate * 100}%` }}
            />
          </div>
        </div>

        <ControlPanel
          onRunSingle={handleStep2SampleSingle}
          runSingleText="1組サンプリング"
          onRunBatch={handleStep2RunBatch}
          batchCounts={[100, 1000, 10000]}
          onReset={handleStep2Reset}
          resetText="リセット"
        />
      </div>
    );
  }

  // STEP 3: 種明かしフェーズ (Reveal) - なぜ情報が増えると確率が1/2に近づくのか？
  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-950 to-chalkboard-dark border-2 border-amber-500/50 shadow-xl flex flex-col gap-3.5">
        <div className="flex items-center justify-between text-xs font-bold text-slate-300">
          <span className="text-amber-300 font-bold flex items-center gap-1.5 text-sm">
            <Sparkles className="w-4 h-4 text-amber-400" />
            種明かし：なぜ曜日情報で 13/27（約48.15%）に跳ね上がるのか？
          </span>
          <span className="font-mono text-pink-400 font-black text-sm">13 / 27 ≒ 48.15%</span>
        </div>

        <div className="space-y-2.5 text-xs sm:text-sm text-slate-200 leading-relaxed">
          <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 space-y-1.5">
            <div className="font-bold text-chalk-yellow">① 基本版（曜日なし）の場合：</div>
            <p className="text-slate-300">
              (男,男)、(男,女)、(女,男) の3通りが各1マスで均等に存在するため、確率は <strong>1/3（33.3%）</strong> になります。
            </p>
          </div>

          <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 space-y-1.5">
            <div className="font-bold text-pink-300">② 曜日（7通り）の属性が付いた場合：</div>
            <p className="text-slate-300">
              「火曜日生まれの男の子」という条件がつくと、14×14グリッド上で<strong>十字クロス（縦14＋横14－重複1 ＝ 27マス）</strong>だけが残ります。
              重複するマス（2人とも火曜男）がたった「1マス」に激減するため、両方男の子のマスは <strong>7＋7－1 ＝ 13マス</strong> となり、
              確率は <strong>13/27（約48.15%）</strong> に急上昇します！
            </p>
          </div>

          <div className="p-3 bg-amber-950/40 rounded-xl border border-amber-500/40 text-amber-200">
            <strong>💡 情報量の極限：</strong>
            属性が細かくなる（曜日 7通り $\rightarrow$ 365日 $\rightarrow$ 生年月日時分秒）ほど重複マスがほぼゼロになり、
            分子と分母の比率は極限で <strong className="text-white text-sm">1/2（50%）</strong> に収束していきます！
          </div>
        </div>
      </div>
    </div>
  );
};
