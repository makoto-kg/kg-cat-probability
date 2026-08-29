"use client";

import React, { useState, useMemo, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  simulateBirthdaySingle,
  runBirthdaySim,
  theoreticalBirthdayProbability,
  calculatePairs,
  BirthdayTrialResult,
  BirthdayBatchResult,
} from "@/lib/simulations/birthday";
import { ControlPanel } from "../lesson/ControlPanel";
import { Users, Sparkles, Sliders, Calendar, CheckCircle2, AlertCircle } from "lucide-react";

interface BirthdayVizProps {
  stepIndex: number;
}

interface MonthInfo {
  month: number;
  name: string;
  daysCount: number;
  startDayIndex: number;
}

const MONTHS_DATA: MonthInfo[] = [
  { month: 1, name: "1月", daysCount: 31, startDayIndex: 0 },
  { month: 2, name: "2月", daysCount: 28, startDayIndex: 31 },
  { month: 3, name: "3月", daysCount: 31, startDayIndex: 59 },
  { month: 4, name: "4月", daysCount: 30, startDayIndex: 90 },
  { month: 5, name: "5月", daysCount: 31, startDayIndex: 120 },
  { month: 6, name: "6月", daysCount: 30, startDayIndex: 151 },
  { month: 7, name: "7月", daysCount: 31, startDayIndex: 181 },
  { month: 8, name: "8月", daysCount: 31, startDayIndex: 212 },
  { month: 9, name: "9月", daysCount: 30, startDayIndex: 243 },
  { month: 10, name: "10月", daysCount: 31, startDayIndex: 273 },
  { month: 11, name: "11月", daysCount: 30, startDayIndex: 304 },
  { month: 12, name: "12月", daysCount: 31, startDayIndex: 334 },
];

function dayIndexToDate(dayIndex: number): { month: number; day: number; label: string } {
  for (const m of MONTHS_DATA) {
    if (dayIndex >= m.startDayIndex && dayIndex < m.startDayIndex + m.daysCount) {
      const d = dayIndex - m.startDayIndex + 1;
      return { month: m.month, day: d, label: `${m.month}月${d}日` };
    }
  }
  return { month: 12, day: 31, label: "12月31日" };
}

export const BirthdayViz: React.FC<BirthdayVizProps> = ({ stepIndex }) => {
  const [numPeople, setNumPeople] = useState(23);
  const [singleTrial, setSingleTrial] = useState<BirthdayTrialResult | null>(null);
  const [batchStats, setBatchStats] = useState<BirthdayBatchResult>(() =>
    runBirthdaySim(1000, 23)
  );
  const [, startTransition] = useTransition();

  const handleRunSingle = () => {
    setSingleTrial(simulateBirthdaySingle(numPeople));
  };

  const handleReset = () => {
    setSingleTrial(null);
  };

  const handleRunBatch = (trials: number) => {
    startTransition(() => {
      setBatchStats(runBirthdaySim(trials, numPeople));
    });
  };

  const handleSliderChange = (n: number) => {
    setNumPeople(n);
    if (singleTrial !== null) {
      setSingleTrial(simulateBirthdaySingle(n));
    }
    setBatchStats(runBirthdaySim(500, n));
  };

  const dayOccupancy = useMemo(() => {
    const map = new Map<number, number[]>();
    if (!singleTrial) return map;
    singleTrial.birthdays.forEach((day, personIdx) => {
      const list = map.get(day) || [];
      list.push(personIdx + 1);
      map.set(day, list);
    });
    return map;
  }, [singleTrial]);

  const collisionDates = useMemo(() => {
    if (!singleTrial) return [];
    return singleTrial.collisionDays.map((dayIdx) => ({
      dayIdx,
      dateInfo: dayIndexToDate(dayIdx),
      personIds: dayOccupancy.get(dayIdx) || [],
    }));
  }, [singleTrial, dayOccupancy]);

  const pairCount = calculatePairs(numPeople);
  const theoreticalProb = theoreticalBirthdayProbability(numPeople);

  // STEP 0: 直感フェーズ (Intuition) - 黒板の出題カード
  if (stepIndex === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-5 py-6 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-6 bg-slate-950/80 border-2 border-chalkboard-border rounded-3xl max-w-lg shadow-2xl flex flex-col gap-4 text-left"
        >
          <div className="flex items-center gap-2.5 text-amber-400 border-b border-slate-800 pb-3">
            <Calendar className="w-5 h-5 text-chalk-yellow" />
            <h3 className="text-base font-black text-chalk-white">
              黒板：本日の問題
            </h3>
          </div>

          <div className="text-xs sm:text-sm text-slate-200 leading-relaxed space-y-3">
            <p>
              1年は<strong>365日</strong>もあります。ある部屋に生徒を集めるとき、
              <strong>「同じ誕生日のペアが少なくとも1組いる確率」が50%（半分）</strong>を超えるには、何人集まれば十分だと思いますか？
            </p>
            <div className="p-3 bg-chalkboard-dark rounded-xl border border-chalkboard-border text-chalk-yellow font-bold text-xs sm:text-sm">
              ・365日の半分だから 180人くらい必要？<br />
              ・それとも、もっとずっと少ない人数で足りる？
            </div>
            <p className="text-amber-300 font-bold">
              👉 直感ではどう思いますか？ 右の対話を聞いて選択肢を選んでみよう！
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  // STEP 1: 体験フェーズ (Experience) - 12ヶ月一目で分かる年間カレンダー
  if (stepIndex === 1) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col gap-3 w-full"
      >
        {/* Collision Alert Header (Completely fixed height to prevent any layout shifts) */}
        <div
          className={`px-3 py-2 rounded-2xl border-2 flex items-center justify-between transition-colors h-[72px] shrink-0 overflow-hidden ${
            !singleTrial
              ? "bg-slate-950/80 border-slate-700 shadow-md"
              : singleTrial.hasCollision
              ? "bg-pink-950/70 border-pink-500 shadow-lg"
              : "bg-slate-950/80 border-slate-700"
          }`}
        >
          <div className="flex items-center gap-2.5 min-w-0 pr-2">
            <div className="shrink-0 w-8 h-8 rounded-xl bg-slate-900 flex items-center justify-center border border-slate-800">
              {!singleTrial ? (
                <Users className="w-4 h-4 text-amber-400" />
              ) : singleTrial.hasCollision ? (
                <span className="text-base">🎉</span>
              ) : (
                <Calendar className="w-4 h-4 text-slate-400" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-xs sm:text-sm font-bold text-chalk-white truncate block">
                {!singleTrial
                  ? `365日カレンダー（参加設定: ${numPeople}人）`
                  : singleTrial.hasCollision
                  ? `【一致発見！】 ${
                      collisionDates.length <= 2
                        ? collisionDates.map((c) => c.dateInfo.label).join("、 ")
                        : `${collisionDates[0].dateInfo.label}、 ${collisionDates[1].dateInfo.label} ほか計${collisionDates.length}日`
                    } が同じ誕生日！`
                  : `365日カレンダー抽選結果（参加: ${numPeople}人）`}
              </span>
              <span className="text-xs text-slate-300 block truncate mt-0.5">
                {!singleTrial
                  ? `「生徒を教室に集める」ボタンを押して誕生日を配置してみよう！`
                  : singleTrial.hasCollision
                  ? `たった${numPeople}人集まっただけで、同じ誕生日のペアが出現しました！`
                  : `今回は被りませんでした。「もう一度抽選」を押してみよう！`}
              </span>
            </div>
          </div>

          <span
            className={`px-2.5 py-1 rounded-full text-xs font-black font-mono shrink-0 ${
              !singleTrial
                ? "bg-slate-800 text-slate-400 border border-slate-700"
                : singleTrial.hasCollision
                ? "bg-pink-500 text-white shadow"
                : "bg-slate-800 text-slate-400"
            }`}
          >
            {!singleTrial ? "未入室" : singleTrial.hasCollision ? "★ 一致あり" : "一致なし"}
          </span>
        </div>

        {/* 12 Months Visual Grid - Uniform 5-row (35 dots) grid per month */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 p-2.5 sm:p-3 bg-slate-950/90 rounded-2xl border border-chalkboard-border shrink-0">
          {MONTHS_DATA.map((m) => {
            // Find if this month has any collisions
            const hasMonthCollision = collisionDates.some(
              (c) => c.dateInfo.month === m.month
            );

            return (
              <div
                key={m.month}
                className={`p-1.5 sm:p-2 rounded-xl border flex flex-col justify-between transition-colors ${
                  hasMonthCollision
                    ? "bg-pink-950/40 border-pink-500/80 ring-1 ring-pink-400/50"
                    : "bg-slate-900/70 border-slate-800"
                }`}
              >
                {/* Month Header (Fixed height) */}
                <div className="flex items-center justify-between pb-1 mb-1 border-b border-slate-800 text-[11px] sm:text-xs font-bold h-5 shrink-0">
                  <span className={hasMonthCollision ? "text-pink-300 font-bold" : "text-amber-300 font-bold"}>
                    {m.name}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {m.daysCount}日
                  </span>
                </div>

                {/* Day Dots Grid (Always 35 slots = 5 rows x 7 cols so height is fixed) */}
                <div className="grid grid-cols-7 gap-0.5 sm:gap-1">
                  {Array.from({ length: 35 }).map((_, dIdx) => {
                    if (dIdx >= m.daysCount) {
                      return (
                        <div
                          key={dIdx}
                          className="aspect-square w-full rounded-[2px] invisible pointer-events-none"
                        />
                      );
                    }

                    const dayIdx = m.startDayIndex + dIdx;
                    const occupants = dayOccupancy.get(dayIdx);
                    const count = occupants ? occupants.length : 0;
                    const isCollision = count > 1;

                    return (
                      <div
                        key={dIdx}
                        title={`${m.month}月${dIdx + 1}日: ${
                          count > 0 ? `${count}人 (ID: ${occupants?.join(", ")})` : "空き"
                        }`}
                        className={`aspect-square w-full rounded-[2px] sm:rounded-[3px] relative overflow-hidden transition-colors ${
                          isCollision
                            ? "bg-pink-500 text-white animate-pulse"
                            : count === 1
                            ? "bg-amber-400 text-slate-950"
                            : "bg-slate-800/40 text-transparent"
                        }`}
                      >
                        {/* Position text absolutely to prevent font line-height from expanding the grid cell */}
                        <div className="absolute inset-0 flex items-center justify-center leading-none select-none text-[8px] font-black pointer-events-none">
                          {isCollision ? "★" : count === 1 ? "●" : ""}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend bar (Fixed height) */}
        <div className="flex items-center justify-around text-xs font-bold text-slate-300 bg-slate-900/60 p-2 rounded-xl border border-slate-800 h-9 shrink-0">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded bg-slate-800 inline-block" /> 空き日
          </span>
          <span className="flex items-center gap-1 text-amber-300">
            <span className="w-2.5 h-2.5 rounded bg-amber-400 inline-block" /> 誕生日の生徒
          </span>
          <span className="flex items-center gap-1 text-pink-300 font-black">
            <span className="w-2.5 h-2.5 rounded bg-pink-500 inline-block ring-1 ring-white" />
            ★ 一致ペア！
          </span>
        </div>

        <ControlPanel
          onRunSingle={handleRunSingle}
          runSingleText={!singleTrial ? `生徒を教室に集める（${numPeople}人）` : "もう一度抽選"}
          onReset={handleReset}
          resetText="全員退室"
          customControls={
            <div className="flex flex-col gap-2.5">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-200">
                  <Users className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>参加人数:</span>
                  <span className="px-2.5 py-0.5 rounded-lg bg-amber-500/20 text-amber-300 font-mono font-black border border-amber-500/30">
                    {numPeople} 人
                  </span>
                </div>

                {/* Quick Presets */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  {[10, 23, 40, 50].map((count) => (
                    <button
                      key={count}
                      onClick={() => handleSliderChange(count)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                        numPeople === count
                          ? "bg-amber-500 text-slate-950 shadow"
                          : "bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700"
                      }`}
                    >
                      {count}人
                    </button>
                  ))}
                </div>
              </div>

              {/* Range Slider */}
              <div className="flex items-center gap-2 w-full">
                <span className="text-xs text-slate-400 font-mono shrink-0">2人</span>
                <input
                  type="range"
                  min={2}
                  max={70}
                  value={numPeople}
                  onChange={(e) => handleSliderChange(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
                />
                <span className="text-xs text-slate-400 font-mono shrink-0">70人</span>
              </div>
            </div>
          }
        />
      </motion.div>
    );
  }

  // STEP 2: 試行フェーズ (Simulation) - 大量試行と理論収束
  if (stepIndex === 2) {
    return (
      <div className="flex flex-col gap-4 w-full">
        <div className="p-3 bg-slate-950/70 border border-chalkboard-border rounded-xl text-xs font-bold text-slate-300 flex justify-between items-center">
          <span>⚡ 大量試行シミュレーション</span>
          <span className="text-amber-300 font-mono">
            参加人数: {numPeople}人 / {batchStats.totalTrials.toLocaleString()}回試行
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-950/80 border border-chalkboard-border flex flex-col gap-3">
          <div className="flex justify-between text-xs font-bold">
            <span className="text-chalk-white">
              {numPeople}人の中に同じ誕生日のペアがいる確率
            </span>
            <span className="text-emerald-400 font-mono text-sm">
              {(batchStats.collisionRate * 100).toFixed(1)}% (理論値:{" "}
              {(batchStats.theoreticalRate * 100).toFixed(1)}%)
            </span>
          </div>

          <div className="w-full h-5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
            <motion.div
              className="h-full bg-gradient-to-r from-pink-500 via-amber-500 to-emerald-400"
              initial={{ width: 0 }}
              animate={{ width: `${batchStats.collisionRate * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        <ControlPanel
          onRunBatch={handleRunBatch}
          batchCounts={[100, 1000, 10000]}
          customControls={
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                <Users className="w-4 h-4 text-amber-400" />
                <span>人数 (N):</span>
                <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono">
                  {numPeople} 人
                </span>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-64">
                <span className="text-[10px] text-slate-400">2</span>
                <input
                  type="range"
                  min={2}
                  max={70}
                  value={numPeople}
                  onChange={(e) => handleSliderChange(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
                <span className="text-[10px] text-slate-400">70</span>
              </div>
            </div>
          }
        />
      </div>
    );
  }

  // STEP 3: 種明かしフェーズ (Reveal) - 握手の本数とペアの爆発
  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-950 to-chalkboard-dark border-2 border-amber-500/50 shadow-xl flex flex-col gap-3">
        <div className="flex items-center justify-between text-xs font-bold text-slate-300">
          <span className="text-amber-300 font-bold flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-400" />
            直感の罠：ペアの数（握手の本数）の爆発
          </span>
          <span className="font-mono text-emerald-400">23人 ⇒ {pairCount}本</span>
        </div>

        <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 text-xs text-slate-300 leading-relaxed">
          直感では「<strong>自分と同じ人</strong>を探す（22通り）」と考えがちです。
          しかし実際には「<strong>部屋の中の誰と誰でも良い</strong>」ため、比較ペアの数は <strong>23 × 22 ÷ 2 = 253本</strong> も存在します。
          253回もサイコロを振るようなものなので、50%を超えるのは当然なのです！
        </div>

        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-400 block">N = 10人</span>
            <span className="font-bold text-amber-300 font-mono">45組 (11.7%)</span>
          </div>
          <div className="p-2.5 bg-emerald-950/60 rounded-xl border border-emerald-500/50">
            <span className="text-[10px] text-emerald-300 block font-bold">N = 23人 (過半数!)</span>
            <span className="font-black text-emerald-400 font-mono">253組 (50.7%)</span>
          </div>
          <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-400 block">N = 70人</span>
            <span className="font-bold text-pink-300 font-mono">2,415組 (99.9%)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
