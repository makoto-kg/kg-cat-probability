"use client";

import React, { useState, useTransition } from "react";
import { motion } from "framer-motion";
import {
  runParrondoEnsemble,
  runParrondoSim,
  ParrondoSimResult,
} from "@/lib/simulations/parrondo";
import { ControlPanel } from "../lesson/ControlPanel";
import { Coins, Sparkles, AlertTriangle, CheckCircle2, RotateCcw } from "lucide-react";

interface ParrondoVizProps {
  stepIndex: number;
}

interface PlayBatchStats {
  game: "A" | "B";
  count: number;
  wins: number;
  losses: number;
  delta: number;
  prevCap: number;
  newCap: number;
  singlePWin?: number;
  trapPlays?: number;
  trapWins?: number;
  nonTrapPlays?: number;
  nonTrapWins?: number;
}

export const ParrondoViz: React.FC<ParrondoVizProps> = ({ stepIndex }) => {
  // Step 1: 単独ゲーム体験用ステート
  const [capitalA, setCapitalA] = useState<number>(0);
  const [historyA, setHistoryA] = useState<number[]>([0]);
  const [winsA, setWinsA] = useState<number>(0);
  const [playsA, setPlaysA] = useState<number>(0);

  const [capitalB, setCapitalB] = useState<number>(0);
  const [historyB, setHistoryB] = useState<number[]>([0]);
  const [winsB, setWinsB] = useState<number>(0);
  const [playsB, setPlaysB] = useState<number>(0);

  const [lastPlayed, setLastPlayed] = useState<PlayBatchStats | null>(null);
  const [playKey, setPlayKey] = useState(0);

  // Step 2: 試行シミュレーション用ステート
  const [steps, setSteps] = useState(300);
  const [isAveraged, setIsAveraged] = useState(true);
  const [simResult, setSimResult] = useState<ParrondoSimResult>(() =>
    runParrondoEnsemble(300, 300)
  );
  const [, startTransition] = useTransition();

  const handleStep1PlayA = (count: number = 1) => {
    const prevCap = capitalA;
    let cap = capitalA;
    let w = 0;
    const newHist = [...historyA];

    for (let i = 0; i < count; i++) {
      const won = Math.random() < 0.495;
      cap += won ? 1 : -1;
      if (won) w++;
      newHist.push(cap);
    }

    const losses = count - w;
    const delta = cap - prevCap;

    setCapitalA(cap);
    setHistoryA(newHist.slice(-50));
    setPlaysA((prev) => prev + count);
    setWinsA((prev) => prev + w);
    setLastPlayed({
      game: "A",
      count,
      wins: w,
      losses,
      delta,
      prevCap,
      newCap: cap,
      singlePWin: 0.495,
    });
    setPlayKey((k) => k + 1);
  };

  const handleStep1PlayB = (count: number = 1) => {
    const prevCap = capitalB;
    let cap = capitalB;
    let w = 0;
    let trapPlays = 0;
    let trapWins = 0;
    let nonTrapPlays = 0;
    let nonTrapWins = 0;
    let singlePWin = 0.095;
    const newHist = [...historyB];

    for (let i = 0; i < count; i++) {
      const isMultipleOf3 = Math.abs(cap) % 3 === 0;
      const pWin = isMultipleOf3 ? 0.095 : 0.745;
      singlePWin = pWin;
      if (isMultipleOf3) {
        trapPlays++;
      } else {
        nonTrapPlays++;
      }

      const won = Math.random() < pWin;
      if (won) {
        w++;
        if (isMultipleOf3) trapWins++;
        else nonTrapWins++;
      }

      cap += won ? 1 : -1;
      newHist.push(cap);
    }

    const losses = count - w;
    const delta = cap - prevCap;

    setCapitalB(cap);
    setHistoryB(newHist.slice(-50));
    setPlaysB((prev) => prev + count);
    setWinsB((prev) => prev + w);
    setLastPlayed({
      game: "B",
      count,
      wins: w,
      losses,
      delta,
      prevCap,
      newCap: cap,
      singlePWin,
      trapPlays,
      trapWins,
      nonTrapPlays,
      nonTrapWins,
    });
    setPlayKey((k) => k + 1);
  };

  const handleStep1Reset = () => {
    setCapitalA(0);
    setHistoryA([0]);
    setPlaysA(0);
    setWinsA(0);
    setCapitalB(0);
    setHistoryB([0]);
    setPlaysB(0);
    setWinsB(0);
    setLastPlayed(null);
    setPlayKey(0);
  };

  const handleRun = () => {
    startTransition(() => {
      if (isAveraged) {
        setSimResult(runParrondoEnsemble(300, steps));
      } else {
        setSimResult(runParrondoSim(steps));
      }
    });
  };

  // Build SVG Path for chart
  const trajectories = simResult.trajectories;
  const maxStep = steps;
  let minCap = -10;
  let maxCap = 10;
  trajectories.forEach((pt) => {
    minCap = Math.min(minCap, pt.capitalA, pt.capitalB, pt.capitalABAB, pt.capitalRandom);
    maxCap = Math.max(maxCap, pt.capitalA, pt.capitalB, pt.capitalABAB, pt.capitalRandom);
  });
  const range = maxCap - minCap || 1;

  const width = 600;
  const height = 220;
  const padding = 30;

  const toX = (s: number) => padding + (s / maxStep) * (width - 2 * padding);
  const toY = (c: number) =>
    height - padding - ((c - minCap) / range) * (height - 2 * padding);

  const makePath = (key: "capitalA" | "capitalB" | "capitalABAB" | "capitalRandom") => {
    return trajectories
      .map((pt, i) => `${i === 0 ? "M" : "L"} ${toX(pt.step)} ${toY(pt[key])}`)
      .join(" ");
  };

  const zeroY = toY(0);

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
            <Coins className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-black text-chalk-white">
              黒板：本日の問題
            </h3>
          </div>

          <div className="text-sm sm:text-base text-slate-200 leading-relaxed space-y-3">
            <p>
              コインの表裏で掛け金が増減する、2つの負けゲーム（AとB）があります。
            </p>
            <div className="p-3.5 bg-chalkboard-dark rounded-xl border border-chalkboard-border text-chalk-yellow font-bold text-xs sm:text-sm space-y-1">
              <div>・ゲームA：勝率 49.5%（微小な不利コイン）</div>
              <div>・ゲームB：残高が3の倍数なら勝率10%、そうでなければ75%</div>
            </div>
            <p className="text-slate-300">
              この2つの負けゲームを<strong>「A→B→A→B」と交互にプレイ</strong>したり、ランダムに切り替えて遊ぶと、最終的な資産はどうなるでしょうか？
            </p>
            <p className="text-amber-300 font-bold">
              👉 直感ではどう思いますか？ 右の対話を聞いて選択肢を選んでみよう！
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  // STEP 1: 体験フェーズ (Experience) - ゲームA・Bを実際にプレイして所持金の減衰を体感！
  if (stepIndex === 1) {
    const isBMultipleOf3 = Math.abs(capitalB) % 3 === 0;

    return (
      <div className="flex flex-col gap-3 w-full">
        {/* Latest Result Banner */}
        <motion.div
          key={`last-play-${playKey}`}
          initial={{ scale: 0.98, opacity: 0.8 }}
          animate={{ scale: 1, opacity: 1 }}
          className={`p-3 sm:p-3.5 rounded-2xl border text-xs sm:text-sm font-bold flex flex-col gap-2 transition-all ${
            !lastPlayed
              ? "bg-slate-950/80 border-slate-800 text-slate-400"
              : lastPlayed.delta > 0
              ? "bg-emerald-950/80 border-emerald-500/80 text-emerald-200 shadow-lg shadow-emerald-500/10"
              : lastPlayed.delta < 0
              ? "bg-red-950/80 border-red-500/80 text-red-200 shadow-lg shadow-red-500/10"
              : "bg-slate-900/90 border-slate-700 text-slate-200"
          }`}
        >
          {!lastPlayed ? (
            <div className="flex items-center gap-2">
              <Coins className="w-4 h-4 text-amber-400" />
              <span>👉 下のボタンを押して、ゲームA・Bをプレイしてみよう！</span>
            </div>
          ) : lastPlayed.count === 1 ? (
            /* 1回プレイ時の表示 */
            <div className="flex items-center justify-between flex-wrap gap-2 w-full">
              <span className="flex items-center gap-1.5">
                {lastPlayed.wins > 0 ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                )}
                <span>
                  ゲーム{lastPlayed.game}（1回）:{" "}
                  <strong className={lastPlayed.wins > 0 ? "text-emerald-300" : "text-red-300"}>
                    {lastPlayed.wins > 0 ? "🪙 勝ち！（+1 コイン）" : "💀 負け…（-1 コイン）"}
                  </strong>
                  <span className="text-xs font-normal opacity-80 ml-1.5">
                    (勝率: {((lastPlayed.singlePWin ?? 0.5) * 100).toFixed(1)}%)
                  </span>
                </span>
              </span>
              <span className="font-mono text-xs text-slate-300">
                所持金: {lastPlayed.prevCap} → <strong>{lastPlayed.newCap}枚</strong>
              </span>
            </div>
          ) : (
            /* 10回 / 50回 バッチプレイ時の統計表示 */
            <div className="flex flex-col gap-2 w-full">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="flex items-center gap-1.5 font-black">
                  <Coins className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>
                    ゲーム{lastPlayed.game}（{lastPlayed.count}回連続プレイの統計結果）
                  </span>
                </span>
                <span className="font-mono text-xs font-bold text-slate-300">
                  所持金: {lastPlayed.prevCap} →{" "}
                  <strong className={lastPlayed.newCap >= 0 ? "text-emerald-300" : "text-red-300"}>
                    {lastPlayed.newCap}枚
                  </strong>{" "}
                  (今回の収支:{" "}
                  <strong className={lastPlayed.delta > 0 ? "text-emerald-300" : lastPlayed.delta < 0 ? "text-red-300" : "text-slate-300"}>
                    {lastPlayed.delta > 0 ? `+${lastPlayed.delta}` : lastPlayed.delta}枚
                  </strong>)
                </span>
              </div>

              {/* 統計バッジグリッド */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-xs font-mono pt-1 border-t border-slate-700/60">
                <div className="p-1.5 bg-slate-900/90 rounded-lg text-center border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-sans">勝敗結果</span>
                  <strong className="text-slate-200">{lastPlayed.wins}勝 {lastPlayed.losses}敗</strong>
                </div>
                <div className="p-1.5 bg-slate-900/90 rounded-lg text-center border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-sans">今回の勝率</span>
                  <strong className={lastPlayed.wins / lastPlayed.count >= 0.5 ? "text-emerald-300" : "text-red-300"}>
                    {((lastPlayed.wins / lastPlayed.count) * 100).toFixed(1)}%
                  </strong>
                </div>
                {lastPlayed.game === "B" && lastPlayed.trapPlays !== undefined && (
                  <>
                    <div className="p-1.5 bg-red-950/60 rounded-lg text-center border border-red-500/40">
                      <span className="text-[10px] text-red-300 block font-sans">⚠️ 罠(3の倍数)</span>
                      <span className="text-red-200 font-bold">
                        {lastPlayed.trapPlays}回 ({lastPlayed.trapWins}勝)
                      </span>
                    </div>
                    <div className="p-1.5 bg-emerald-950/60 rounded-lg text-center border border-emerald-500/40">
                      <span className="text-[10px] text-emerald-300 block font-sans">🌟 大吉(それ以外)</span>
                      <span className="text-emerald-200 font-bold">
                        {lastPlayed.nonTrapPlays}回 ({lastPlayed.nonTrapWins}勝)
                      </span>
                    </div>
                  </>
                )}
                {lastPlayed.game === "A" && (
                  <div className="col-span-2 p-1.5 bg-slate-900/90 rounded-lg text-center text-slate-300 flex items-center justify-center text-[11px] border border-slate-800 font-sans">
                    💡 理論勝率: 49.5%（常にわずかに負け越す）
                  </div>
                )}
              </div>
            </div>
          )}
        </motion.div>

        {/* 2 Game Interactive Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Game A Card */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-b from-slate-950 to-red-950/30 border-2 border-red-500/50 shadow-xl flex flex-col justify-between gap-3">
            <div className="flex items-center justify-between border-b border-red-500/30 pb-2">
              <span className="text-xs font-black text-red-300 flex items-center gap-1.5">
                🔴 ゲームA（微小不利コイン）
              </span>
              <span className="px-2 py-0.5 rounded-md bg-red-950 text-red-300 text-[10px] font-bold border border-red-700">
                勝率 49.5%
              </span>
            </div>

            <div className="flex items-end justify-between py-1">
              <div>
                <span className="text-[10px] text-slate-400 block">現在の所持金</span>
                <span
                  className={`text-2xl sm:text-3xl font-black font-mono ${
                    capitalA > 0
                      ? "text-emerald-400"
                      : capitalA < 0
                      ? "text-red-400"
                      : "text-slate-200"
                  }`}
                >
                  {capitalA > 0 ? `+${capitalA}` : capitalA}
                  <span className="text-xs font-normal text-slate-400 ml-1">枚</span>
                </span>
              </div>
              <div className="text-right text-[11px] text-slate-300 font-mono">
                <div>試行: {playsA}回</div>
                <div>勝率: {playsA > 0 ? ((winsA / playsA) * 100).toFixed(1) : 0}%</div>
              </div>
            </div>

            {/* Play Buttons for Game A */}
            <div className="grid grid-cols-3 gap-1.5 pt-1">
              <button
                type="button"
                onClick={() => handleStep1PlayA(1)}
                className="px-2 py-2 rounded-xl bg-red-600 hover:bg-red-500 active:scale-95 text-white font-black text-xs shadow transition-all flex items-center justify-center gap-1"
              >
                1回投げる
              </button>
              <button
                type="button"
                onClick={() => handleStep1PlayA(10)}
                className="px-2 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-red-300 font-bold text-xs border border-red-500/40 transition-all"
              >
                10回
              </button>
              <button
                type="button"
                onClick={() => handleStep1PlayA(50)}
                className="px-2 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-red-300 font-bold text-xs border border-red-500/40 transition-all"
              >
                50回
              </button>
            </div>
          </div>

          {/* Game B Card */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-b from-slate-950 to-blue-950/30 border-2 border-blue-500/50 shadow-xl flex flex-col justify-between gap-3">
            <div className="flex items-center justify-between border-b border-blue-500/30 pb-2">
              <span className="text-xs font-black text-blue-300 flex items-center gap-1.5">
                🔷 ゲームB（所持金連動コイン）
              </span>
              <span
                className={`px-2 py-0.5 rounded-md text-[10px] font-black border transition-all ${
                  isBMultipleOf3
                    ? "bg-red-950 text-red-300 border-red-600 animate-pulse"
                    : "bg-emerald-950 text-emerald-300 border-emerald-600"
                }`}
              >
                {isBMultipleOf3 ? "⚠️ 勝率 9.5%（罠）" : "🌟 勝率 74.5%（大吉）"}
              </span>
            </div>

            <div className="flex items-end justify-between py-1">
              <div>
                <span className="text-[10px] text-slate-400 block">
                  現在の所持金 (mod 3 ＝ {Math.abs(capitalB) % 3})
                </span>
                <span
                  className={`text-2xl sm:text-3xl font-black font-mono ${
                    capitalB > 0
                      ? "text-emerald-400"
                      : capitalB < 0
                      ? "text-red-400"
                      : "text-slate-200"
                  }`}
                >
                  {capitalB > 0 ? `+${capitalB}` : capitalB}
                  <span className="text-xs font-normal text-slate-400 ml-1">枚</span>
                </span>
              </div>
              <div className="text-right text-[11px] text-slate-300 font-mono">
                <div>試行: {playsB}回</div>
                <div>勝率: {playsB > 0 ? ((winsB / playsB) * 100).toFixed(1) : 0}%</div>
              </div>
            </div>

            {/* Play Buttons for Game B */}
            <div className="grid grid-cols-3 gap-1.5 pt-1">
              <button
                type="button"
                onClick={() => handleStep1PlayB(1)}
                className="px-2 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-black text-xs shadow transition-all flex items-center justify-center gap-1"
              >
                1回投げる
              </button>
              <button
                type="button"
                onClick={() => handleStep1PlayB(10)}
                className="px-2 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-blue-300 font-bold text-xs border border-blue-500/40 transition-all"
              >
                10回
              </button>
              <button
                type="button"
                onClick={() => handleStep1PlayB(50)}
                className="px-2 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-blue-300 font-bold text-xs border border-blue-500/40 transition-all"
              >
                50回
              </button>
            </div>
          </div>
        </div>

        {/* Status Hint Bar & Reset Button */}
        <div className="p-2.5 rounded-xl bg-slate-950/70 border border-chalkboard-border flex items-center justify-between text-xs text-slate-300">
          <span className="text-slate-400">
            💡 どちらのゲームも回数を重ねるとじわじわマイナス（負けゲーム）になることを確かめてみよう！
          </span>
          {(playsA > 0 || playsB > 0) && (
            <button
              type="button"
              onClick={handleStep1Reset}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold flex items-center gap-1 border border-slate-700 shrink-0 ml-2"
            >
              <RotateCcw className="w-3 h-3" />
              リセット
            </button>
          )}
        </div>
      </div>
    );
  }

  // STEP 2: 試行フェーズ (Simulation) - 交互プレイでの右肩上がり
  if (stepIndex === 2) {
    return (
      <div className="flex flex-col gap-3 w-full">
        <div className="p-3 bg-slate-950/70 border border-chalkboard-border rounded-2xl text-xs sm:text-sm font-bold text-slate-300 flex justify-between items-center flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>⚡ 資産推移折れ線グラフ（{steps}ステップ）</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsAveraged(!isAveraged)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                isAveraged
                  ? "bg-emerald-600 text-white shadow"
                  : "bg-slate-800 text-slate-400 border border-slate-700"
              }`}
            >
              {isAveraged ? "📊 300回平均" : "🎲 1回シミュレーション"}
            </button>
          </div>
        </div>

        {/* Multi-Line Chart */}
        <div className="w-full bg-slate-950 rounded-2xl p-3 border-2 border-slate-800 shadow-xl overflow-hidden">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto min-w-[340px]">
            <line
              x1={padding}
              y1={zeroY}
              x2={width - padding}
              y2={zeroY}
              stroke="#475569"
              strokeDasharray="4 4"
              strokeWidth="1.5"
            />
            {/* Grid Line Zero label */}
            <text x={padding - 5} y={zeroY + 4} fill="#94a3b8" fontSize="10" textAnchor="end">
              0
            </text>
            <path d={makePath("capitalA")} fill="none" stroke="#ef4444" strokeWidth="2.5" opacity="0.85" />
            <path d={makePath("capitalB")} fill="none" stroke="#3b82f6" strokeWidth="2.5" opacity="0.85" />
            <path d={makePath("capitalABAB")} fill="none" stroke="#10b981" strokeWidth="3.5" />
            <path d={makePath("capitalRandom")} fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeDasharray="4 4" />
          </svg>
        </div>

        {/* Chart Legend with final numbers */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
          <div className="p-2 rounded-xl bg-red-950/40 border border-red-500/50 text-red-300">
            <span className="font-sans font-bold block text-[10px]">🔴 A単独</span>
            <strong className="text-sm font-black">{simResult.finalCapital.A > 0 ? `+${simResult.finalCapital.A}` : simResult.finalCapital.A}</strong> (減)
          </div>
          <div className="p-2 rounded-xl bg-blue-950/40 border border-blue-500/50 text-blue-300">
            <span className="font-sans font-bold block text-[10px]">🔷 B単独</span>
            <strong className="text-sm font-black">{simResult.finalCapital.B > 0 ? `+${simResult.finalCapital.B}` : simResult.finalCapital.B}</strong> (減)
          </div>
          <div className="p-2 rounded-xl bg-emerald-950/60 border-2 border-emerald-500 text-emerald-300 shadow">
            <span className="font-sans font-bold block text-[10px]">🟢 AABB交互</span>
            <strong className="text-sm font-black text-emerald-200">+{simResult.finalCapital.ABAB}</strong> (急増!)
          </div>
          <div className="p-2 rounded-xl bg-amber-950/40 border border-amber-500/50 text-amber-300">
            <span className="font-sans font-bold block text-[10px]">🟡 ランダム</span>
            <strong className="text-sm font-black">+{simResult.finalCapital.Random}</strong> (増!)
          </div>
        </div>

        <ControlPanel
          onRunSingle={handleRun}
          runSingleText="新しくシミュレーション"
          onRunBatch={(s) => {
            setSteps(s);
            startTransition(() => {
              if (isAveraged) {
                setSimResult(runParrondoEnsemble(300, s));
              } else {
                setSimResult(runParrondoSim(s));
              }
            });
          }}
          batchCounts={[100, 300, 500]}
        />
      </div>
    );
  }

  // STEP 3: 種明かしフェーズ (Reveal)
  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-950 to-chalkboard-dark border-2 border-amber-500/50 shadow-xl flex flex-col gap-3">
        <div className="flex items-center justify-between text-xs font-bold text-slate-300">
          <span className="text-amber-300 font-bold flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-400" />
            種明かし：負け＋負け＝勝ち のメカニズム
          </span>
          <span className="text-emerald-400 font-mono font-bold">ラチェット効果</span>
        </div>

        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          ゲームBは「所持金が3の倍数」のときだけ勝率9.5%という強烈な罠があります。単独プレイだとこの罠に何度もハマって負け続けますが、
          <strong>ゲームAのランダム性が適度に所持金をかき乱す</strong>ことで、ゲームBの罠を踏む頻度が劇的に減り、勝率74.5%のボーナス状態を効率よく引き出せるようになります！
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1">
          <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-xs">
            <strong className="text-amber-300 block mb-1">ゲームBの罠</strong>
            所持金 mod 3 ＝ 0 ⇒ 勝率10%（大凶）
            <br />
            所持金 mod 3 ≠ 0 ⇒ 勝率75%（大吉）
          </div>
          <div className="p-3 bg-emerald-950/40 rounded-xl border border-emerald-500/40 text-xs text-emerald-200">
            <strong className="text-emerald-300 block mb-1">ゲームAの撹乱効果</strong>
            ゲームAが罠から脱出させて大吉状態を長持ちさせる！
          </div>
        </div>
      </div>
    </div>
  );
};
