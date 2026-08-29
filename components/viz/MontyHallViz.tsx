"use client";

import React, { useState, useTransition } from "react";
import { motion } from "framer-motion";
import {
  runMontyHallSim,
  MontyHallBatchResult,
} from "@/lib/simulations/monty-hall";
import { ControlPanel } from "../lesson/ControlPanel";
import { Sliders, Sparkles, BookOpen } from "lucide-react";

interface MontyHallVizProps {
  stepIndex: number;
}

function pickRandomDoorsToReveal(pool: number[], count: number): number[] {
  const p = [...pool];
  const revealed: number[] = [];
  while (revealed.length < count && p.length > 0) {
    const idx = Math.floor(Math.random() * p.length);
    revealed.push(p.splice(idx, 1)[0]);
  }
  return revealed;
}

export const MontyHallViz: React.FC<MontyHallVizProps> = ({ stepIndex }) => {
  const [numDoors, setNumDoors] = useState(3);
  const [carDoor, setCarDoor] = useState<number>(1);
  const [selectedDoor, setSelectedDoor] = useState<number | null>(null);
  const [revealedDoors, setRevealedDoors] = useState<number[]>([]);
  const [finalChoice, setFinalChoice] = useState<number | null>(null);
  const [isFinished, setIsFinished] = useState(false);

  // Batch stats
  const [batchStats, setBatchStats] = useState<MontyHallBatchResult>(() =>
    runMontyHallSim(100, 3)
  );
  const [, startTransition] = useTransition();

  const handleDoorClick = (doorIdx: number) => {
    if (isFinished) return;

    if (selectedDoor === null) {
      // Phase 1: Pick initial door
      setSelectedDoor(doorIdx);

      // Host reveals goat doors
      const availableToReveal: number[] = [];
      for (let i = 0; i < numDoors; i++) {
        if (i !== doorIdx && i !== carDoor) {
          availableToReveal.push(i);
        }
      }
      const revealed = pickRandomDoorsToReveal(availableToReveal, numDoors - 2);
      setRevealedDoors(revealed);
    } else if (!revealedDoors.includes(doorIdx)) {
      // Phase 2: Final choice (switch or stay)
      setFinalChoice(doorIdx);
      setIsFinished(true);
    }
  };

  const handleReset = () => {
    const newCar = Math.floor(Math.random() * numDoors);
    setCarDoor(newCar);
    setSelectedDoor(null);
    setRevealedDoors([]);
    setFinalChoice(null);
    setIsFinished(false);
  };

  const handleRunBatch = (trials: number) => {
    startTransition(() => {
      const stats = runMontyHallSim(trials, numDoors);
      setBatchStats(stats);
    });
  };

  const otherUnopened =
    selectedDoor !== null
      ? Array.from({ length: numDoors }, (_, i) => i).find(
          (i) => i !== selectedDoor && !revealedDoors.includes(i)
        )
      : null;

  // STEP 0: 直感フェーズ (Intuition) - 黒板の出題カード
  if (stepIndex === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-5 py-4 sm:py-6 text-center w-full">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-5 sm:p-6 bg-slate-950/80 border-2 border-chalkboard-border rounded-3xl w-full max-w-lg shadow-2xl flex flex-col gap-4 text-left"
        >
          <div className="flex items-center gap-2.5 text-amber-400 border-b border-slate-800 pb-3">
            <BookOpen className="w-5 h-5 shrink-0" />
            <h3 className="text-base sm:text-lg font-black text-chalk-white">
              黒板：本日の問題
            </h3>
          </div>

          <div className="text-sm sm:text-base text-slate-200 leading-relaxed space-y-3">
            <p>
              目の前に<strong>3枚の扉</strong>があります。どれか1つだけが「当たり（豪華キャットタワー）」で、残りの2つは「ハズレ（ヤギ）」です。
            </p>
            <div className="p-3.5 bg-chalkboard-dark rounded-xl border border-chalkboard-border text-chalk-yellow font-bold text-xs sm:text-sm leading-relaxed space-y-1">
              <div>1. あなたが1枚の扉を選びます。</div>
              <div>2. ハズレを知っている司会者が、残りの2枚からハズレの扉を1枚開けて見せます。</div>
              <div>3. 司会者：「扉を変えますか？ それともそのまま維持しますか？」</div>
            </div>
            <p className="text-amber-300 font-bold text-xs sm:text-sm">
              👉 直感ではどう思いますか？ 右の対話を聞いて選択肢を選んでみよう！
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  // STEP 1: 体験フェーズ (Experience) - スマホでも絶対に改行・崩れが起きないグリッド
  if (stepIndex === 1) {
    const isUserWinner = isFinished && finalChoice === carDoor;
    const isUserLoser = isFinished && finalChoice !== null && finalChoice !== carDoor;

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col gap-4 w-full max-w-xl mx-auto"
      >
        {/* Status Announcement Banner */}
        <div
          className={`p-3 rounded-2xl border text-xs sm:text-sm font-bold flex flex-col sm:flex-row items-center justify-between gap-1.5 transition-all shadow-md ${
            !isFinished
              ? "bg-slate-950/80 border-chalkboard-border text-slate-300"
              : isUserWinner
              ? "bg-emerald-950/90 border-emerald-500 text-emerald-200 shadow-emerald-950/50"
              : "bg-red-950/90 border-red-500 text-red-200 shadow-red-950/50"
          }`}
        >
          <span className="flex items-center gap-1.5 font-black text-center sm:text-left">
            {isFinished ? (
              isUserWinner ? (
                <span>🎉 大当たり！（キャットタワー獲得）</span>
              ) : (
                <span>😢 残念！ 選んだ扉は【ハズレ（ヤギ）】でした</span>
              )
            ) : (
              <span className="text-amber-300 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                ✨ 実験ステージ（扉を選んでね）
              </span>
            )}
          </span>
          <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-slate-900/80 border border-slate-700">
            {selectedDoor === null
              ? "1枚選択"
              : !isFinished
              ? "変更 or 維持"
              : isUserWinner
              ? "WIN!"
              : "LOSE"}
          </span>
        </div>

        {/* 3 Doors Responsive Grid: Guaranteed 3 columns on all screen widths */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 py-1 w-full">
          {[0, 1, 2].map((idx) => {
            const isSelected = selectedDoor === idx;
            const isRevealed = revealedDoors.includes(idx);
            const isFinal = finalChoice === idx;
            const isWinner = carDoor === idx;
            const isOpen = isRevealed || (isFinished && (isWinner || isFinal));

            // Determine specific styling based on outcome
            let cardStyle =
              "bg-gradient-to-b from-wood to-wood-dark border-amber-800 hover:border-amber-500";
            if (isFinished) {
              if (isFinal && isWinner) {
                // User chose the winning door -> BIG GLOWING GREEN WIN
                cardStyle =
                  "bg-emerald-950/90 border-emerald-400 ring-2 sm:ring-4 ring-emerald-400/60 shadow-2xl scale-[1.02]";
              } else if (isFinal && !isWinner) {
                // User chose a losing door -> BIG RED X ERROR CARD
                cardStyle =
                  "bg-red-950/90 border-red-500 ring-2 sm:ring-4 ring-red-500/60 shadow-2xl scale-[1.02]";
              } else if (isWinner) {
                // Winning door that the user did NOT pick -> Dim helper
                cardStyle = "bg-slate-900/80 border-slate-700 opacity-60";
              } else {
                // Other door opened by host
                cardStyle = "bg-slate-950/50 border-slate-800 opacity-30";
              }
            } else if (isOpen) {
              cardStyle = "bg-slate-900/60 border-slate-700 opacity-60";
            } else if (isSelected) {
              cardStyle = "bg-blue-600/30 border-blue-400 ring-2 sm:ring-4 ring-blue-500/30";
            }

            return (
              <motion.button
                key={idx}
                whileHover={{ scale: !isRevealed && !isFinished ? 1.04 : 1 }}
                whileTap={{ scale: !isRevealed && !isFinished ? 0.96 : 1 }}
                disabled={isRevealed || isFinished}
                onClick={() => handleDoorClick(idx)}
                className={`relative w-full aspect-[2/3] min-h-[155px] sm:min-h-[210px] rounded-2xl border-2 flex flex-col items-center justify-between p-1.5 sm:p-2.5 shadow-xl transition-all cursor-pointer select-none ${cardStyle}`}
              >
                <span className="text-xs sm:text-sm font-black text-amber-200">
                  ドア #{idx + 1}
                </span>

                {/* Center Content */}
                <div className="flex flex-col items-center justify-center flex-1 w-full my-1">
                  {isOpen ? (
                    isFinished && isFinal ? (
                      isWinner ? (
                        <div className="text-center animate-bounce">
                          <span className="text-3xl sm:text-4xl">🏰</span>
                          <span className="text-[11px] sm:text-xs font-black text-emerald-300 block mt-0.5 sm:mt-1">
                            🎉 当たり！
                          </span>
                        </div>
                      ) : (
                        <div className="text-center">
                          <span className="text-3xl sm:text-4xl font-black text-red-500 block leading-none animate-pulse">
                            ✕
                          </span>
                          <span className="text-xl sm:text-2xl mt-0.5 block">🐐</span>
                          <span className="text-[11px] sm:text-xs font-black text-red-300 block">
                            ハズレ！
                          </span>
                        </div>
                      )
                    ) : isWinner ? (
                      <div className="text-center opacity-75">
                        <span className="text-2xl sm:text-3xl">🏰</span>
                        <span className="text-[9px] sm:text-[10px] font-bold text-amber-300 block mt-0.5">
                          正解はここ
                        </span>
                      </div>
                    ) : (
                      <div className="text-center opacity-50">
                        <span className="text-2xl sm:text-3xl">🐐</span>
                        <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 block mt-0.5">
                          ヤギ (ハズレ)
                        </span>
                      </div>
                    )
                  ) : (
                    <span className="text-2xl sm:text-3xl text-amber-300">🚪</span>
                  )}
                </div>

                {/* Bottom Status / Selection Badge */}
                <div className="text-[10px] sm:text-xs font-bold w-full text-center">
                  {isSelected && !isFinished && (
                    <span className="text-blue-300 bg-blue-950/90 px-1.5 py-0.5 rounded-full border border-blue-700 block text-[10px] sm:text-xs leading-tight">
                      あなたの選択
                    </span>
                  )}
                  {isRevealed && !isFinished && (
                    <span className="text-slate-400 block text-[9px] sm:text-[10px]">
                      司会者が開示
                    </span>
                  )}
                  {isFinished && isFinal && (
                    <span
                      className={`px-1.5 py-0.5 rounded-full font-black block text-[10px] sm:text-xs leading-tight shadow ${
                        isWinner
                          ? "bg-emerald-600 text-white"
                          : "bg-red-600 text-white"
                      }`}
                    >
                      {isWinner ? "★ あなた (WIN!)" : "✕ あなた (LOSE)"}
                    </span>
                  )}
                  {isFinished && !isFinal && isWinner && (
                    <span className="text-[9px] sm:text-[10px] text-amber-300/90 font-bold block leading-tight">
                      (当たり扉)
                    </span>
                  )}
                  {isFinished && !isFinal && !isWinner && (
                    <span className="text-[9px] sm:text-[10px] text-slate-500 block leading-tight">
                      司会者が開示
                    </span>
                  )}
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Choice Prompt Buttons (維持 / 変更) with Full Mobile-Friendly Touch Targets */}
        {selectedDoor !== null && !isFinished && otherUnopened !== undefined && otherUnopened !== null && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-2 p-3 sm:p-3.5 bg-slate-900/95 rounded-2xl border-2 border-amber-500/50 shadow-xl"
          >
            <span className="text-xs sm:text-sm font-bold text-amber-300 text-center">
              司会者がハズレを開けました！ どうしますか？
            </span>
            <div className="grid grid-cols-2 gap-2 w-full">
              <button
                onClick={() => handleDoorClick(selectedDoor)}
                className="py-2.5 px-2 rounded-xl bg-blue-700 hover:bg-blue-600 active:scale-95 text-white font-bold text-xs sm:text-sm shadow text-center transition-transform"
              >
                #{selectedDoor + 1}を【維持】
              </button>
              <button
                onClick={() => handleDoorClick(otherUnopened)}
                className="py-2.5 px-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-xs sm:text-sm shadow animate-pulse text-center transition-transform"
              >
                #{otherUnopened + 1}に【変更】
              </button>
            </div>
          </motion.div>
        )}

        <ControlPanel
          onReset={handleReset}
          resetText="もう一度試す"
        />
      </motion.div>
    );
  }

  // STEP 2: 試行フェーズ (Simulation) - 大量試行
  if (stepIndex === 2) {
    return (
      <div className="flex flex-col gap-4 sm:gap-5 w-full">
        <div className="p-3 bg-slate-950/70 border border-chalkboard-border rounded-xl text-xs sm:text-sm font-bold text-slate-300 flex justify-between items-center">
          <span>⚡ 大量試行シミュレーション</span>
          <span className="text-amber-400 font-mono">
            累計: {batchStats.totalTrials.toLocaleString()} 回
          </span>
        </div>

        {/* Real-time Win Rate Comparison Bars */}
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/80 border border-chalkboard-border flex flex-col gap-4">
          <div>
            <div className="flex justify-between text-xs sm:text-sm font-bold text-emerald-400 mb-1.5">
              <span>🔄 変更した場合の勝率 (理論値: 66.7%)</span>
              <span className="font-mono text-sm sm:text-base">
                {(batchStats.switchWinRate * 100).toFixed(1)}% ({batchStats.switchWins.toLocaleString()}勝)
              </span>
            </div>
            <div className="w-full h-5 sm:h-6 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
              <motion.div
                className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400"
                initial={{ width: 0 }}
                animate={{ width: `${batchStats.switchWinRate * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs sm:text-sm font-bold text-blue-400 mb-1.5">
              <span>🛡️ 維持した場合の勝率 (理論値: 33.3%)</span>
              <span className="font-mono text-sm sm:text-base">
                {(batchStats.stayWinRate * 100).toFixed(1)}% ({batchStats.stayWins.toLocaleString()}勝)
              </span>
            </div>
            <div className="w-full h-5 sm:h-6 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
              <motion.div
                className="h-full bg-gradient-to-r from-blue-600 to-blue-400"
                initial={{ width: 0 }}
                animate={{ width: `${batchStats.stayWinRate * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
        </div>

        <ControlPanel
          onRunBatch={handleRunBatch}
          batchCounts={[10, 100, 10000, 100000]}
          onReset={() => setBatchStats(runMontyHallSim(100, numDoors))}
        />
      </div>
    );
  }

  // STEP 3: 種明かしフェーズ (Reveal) - 構造図解 & 100枚スライダー
  return (
    <div className="flex flex-col gap-4 sm:gap-5 w-full">
      {/* Probability Flow Bar Visual Proof */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-slate-950 to-chalkboard-dark border-2 border-amber-500/50 shadow-xl flex flex-col gap-3">
        <div className="flex items-center justify-between text-xs sm:text-sm font-bold text-slate-300">
          <span className="text-amber-300 font-bold flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            確率の流動（なぜ2倍になるのか？）
          </span>
          <span className="text-slate-400">扉数: {numDoors}枚</span>
        </div>

        <div className="flex h-8 sm:h-9 rounded-xl overflow-hidden border border-slate-700 bg-slate-900 text-xs sm:text-sm font-bold shadow-inner">
          <div
            style={{ width: `${(1 / numDoors) * 100}%` }}
            className="bg-amber-600 text-amber-100 flex items-center justify-center transition-all duration-500 overflow-hidden text-xs"
          >
            初期選択 ({Math.round((1 / numDoors) * 100)}%)
          </div>
          <div
            style={{ width: `${((numDoors - 1) / numDoors) * 100}%` }}
            className="bg-emerald-600 text-emerald-100 flex items-center justify-center transition-all duration-500 overflow-hidden text-xs"
          >
            残りの領域 → 変更先に集中！ ({Math.round(((numDoors - 1) / numDoors) * 100)}%)
          </div>
        </div>

        <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
          最初に選んだ扉が当たりである確率は <strong>1/{numDoors}</strong> です。
          司会者が残りの領域からハズレを排除してくれるため、残りの <strong>{(numDoors - 1)}/{numDoors}</strong> の確率がそのまま変更先の扉1枚に流れ込みます！
        </p>
      </div>

      {/* Extreme Case Slider (100 Doors) */}
      <div className="p-4 rounded-2xl bg-slate-950/70 border border-chalkboard-border flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs sm:text-sm font-bold text-slate-300">
          <span className="flex items-center gap-1.5 text-chalk-yellow">
            <Sliders className="w-4 h-4 shrink-0" />
            扉の数を増やしてみよう（100枚にすると直感がスッキリ！）
          </span>
          <span className="font-mono text-amber-300 px-2 py-0.5 rounded bg-amber-950 border border-amber-800 text-xs sm:text-sm">
            {numDoors} 枚 (勝率: {((numDoors - 1) / numDoors * 100).toFixed(1)}%)
          </span>
        </div>

        <div className="flex items-center gap-2 pt-2">
          <span className="text-xs text-slate-400">3</span>
          <input
            type="range"
            min={3}
            max={100}
            value={numDoors}
            onChange={(e) => {
              const val = Number(e.target.value);
              setNumDoors(val);
              setBatchStats(runMontyHallSim(500, val));
            }}
            className="w-full accent-amber-500 cursor-pointer h-2"
          />
          <span className="text-xs text-slate-400">100</span>
        </div>
      </div>
    </div>
  );
};
