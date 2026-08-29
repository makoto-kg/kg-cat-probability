"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  DieName,
  EFRON_DICE,
  DIE_COLORS,
  analyzeMatchup,
  getCounterPick,
  rollDie,
  runDiceDuelSim,
} from "@/lib/simulations/nontransitive-dice";
import { ControlPanel } from "../lesson/ControlPanel";
import { Dices, Swords, Sparkles } from "lucide-react";

interface DiceVizProps {
  stepIndex: number;
}

export const DiceViz: React.FC<DiceVizProps> = ({ stepIndex }) => {
  const [playerDie, setPlayerDie] = useState<DieName>("A");
  const [kabuDie, setKabuDie] = useState<DieName>("D");
  const [rollKey, setRollKey] = useState(0);
  const [lastRoll, setLastRoll] = useState<{
    playerVal: number;
    kabuVal: number;
    winner: "player" | "kabu" | "tie";
  } | null>(null);

  const [simResults, setSimResults] = useState<{
    playerWins: number;
    kabuWins: number;
    total: number;
  }>({ playerWins: 0, kabuWins: 0, total: 0 });

  const matchup = analyzeMatchup(playerDie, kabuDie);

  const handleSelectPlayerDie = (die: DieName) => {
    setPlayerDie(die);
    const counter = getCounterPick(die);
    setKabuDie(counter);
    setLastRoll(null);
    setSimResults({ playerWins: 0, kabuWins: 0, total: 0 });
    setRollKey(0);
  };

  const handleRollOnce = () => {
    const pVal = rollDie(playerDie);
    const kVal = rollDie(kabuDie);
    let w: "player" | "kabu" | "tie" = "tie";
    if (pVal > kVal) w = "player";
    else if (kVal > pVal) w = "kabu";

    setLastRoll({ playerVal: pVal, kabuVal: kVal, winner: w });
    setRollKey((prev) => prev + 1);
    setSimResults((prev) => ({
      playerWins: prev.playerWins + (w === "player" ? 1 : 0),
      kabuWins: prev.kabuWins + (w === "kabu" ? 1 : 0),
      total: prev.total + 1,
    }));
  };

  const handleRunBatch = (trials: number) => {
    const res = runDiceDuelSim(playerDie, kabuDie, trials);
    setSimResults((prev) => ({
      playerWins: prev.playerWins + res.die1Wins,
      kabuWins: prev.kabuWins + res.die2Wins,
      total: prev.total + trials,
    }));
  };

  const allDice: DieName[] = ["A", "B", "C", "D"];

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
            <Dices className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-black text-chalk-white">
              黒板：本日の問題
            </h3>
          </div>

          <div className="text-xs sm:text-sm text-slate-200 leading-relaxed space-y-3">
            <p>
              特殊な目を持つ4つのサイコロ A, B, C, D（エフロンのサイコロ）があります。
            </p>
            <div className="p-3 bg-chalkboard-dark rounded-xl border border-chalkboard-border text-chalk-yellow font-bold text-xs sm:text-sm space-y-1">
              <div>・赤 (A): [4, 4, 4, 4, 0, 0]</div>
              <div>・青 (B): [3, 3, 3, 3, 3, 3]</div>
              <div>・緑 (C): [6, 6, 2, 2, 2, 2]</div>
              <div>・黄 (D): [5, 5, 5, 1, 1, 1]</div>
            </div>
            <p className="text-slate-300">
              AはBに勝ちやすく（勝率2/3）、BはCに勝ちやすく（勝率2/3）、CはDに勝ちやすい（勝率2/3）とき、
              <strong>DとAが戦ったらどちらが勝つでしょうか？</strong>
            </p>
            <p className="text-amber-300 font-bold">
              👉 直感ではどう思いますか？ 右の対話を聞いて選択肢を選んでみよう！
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  // STEP 1: 体験フェーズ (Experience) - 1回対決
  if (stepIndex === 1) {
    return (
      <div className="flex flex-col gap-4 w-full">
        {/* Dice Selection */}
        <div className="p-3 bg-slate-950/70 border border-chalkboard-border rounded-xl">
          <div className="flex justify-between items-center text-xs sm:text-sm font-bold text-slate-300 mb-2">
            <span>先攻：あなたのサイコロを選んでね</span>
            <span className="text-amber-400">カブ教授が後出しで対抗</span>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {allDice.map((d) => (
              <button
                key={d}
                onClick={() => handleSelectPlayerDie(d)}
                className={`p-2 sm:p-2.5 rounded-xl border text-center transition-all ${
                  playerDie === d
                    ? "border-pink-400 bg-pink-950/60 ring-2 ring-pink-500/40"
                    : "border-slate-800 bg-slate-900/60 hover:bg-slate-800"
                }`}
              >
                <div
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg mx-auto flex items-center justify-center font-black text-sm text-white shadow"
                  style={{ backgroundColor: DIE_COLORS[d].bg }}
                >
                  {d}
                </div>
                <span className="text-xs font-bold text-slate-200 block mt-1">
                  {playerDie === d ? "選択中" : kabuDie === d ? "教授" : ""}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Duel Arena */}
        <div
          className={`p-4 sm:p-5 rounded-2xl border-2 shadow-2xl flex flex-col items-center gap-3.5 transition-all duration-300 ${
            !lastRoll
              ? "bg-slate-950/80 border-slate-700"
              : lastRoll.winner === "player"
              ? "bg-gradient-to-br from-pink-950/80 via-slate-950 to-slate-900 border-pink-400 ring-2 ring-pink-400/40"
              : lastRoll.winner === "kabu"
              ? "bg-gradient-to-br from-amber-950/80 via-slate-950 to-slate-900 border-amber-400 ring-2 ring-amber-400/40"
              : "bg-slate-950/80 border-slate-600"
          }`}
        >
          {/* Top Status & Dice Comparison */}
          <div className="flex items-center justify-around w-full max-w-md">
            {/* Player Side */}
            <div className="flex flex-col items-center gap-1.5 flex-1">
              <div className="flex items-center gap-1 h-6">
                <span className="text-xs sm:text-sm font-bold text-pink-300">
                  あなた ({playerDie})
                </span>
                {lastRoll && lastRoll.winner === "player" && (
                  <span className="text-xs font-black px-1.5 py-0.5 rounded bg-pink-500 text-white animate-bounce shadow">
                    WIN! 👑
                  </span>
                )}
                {lastRoll && lastRoll.winner === "kabu" && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                    LOSE 😢
                  </span>
                )}
              </div>

              {/* Player Die Box */}
              <motion.div
                key={`p-${rollKey}`}
                initial={lastRoll ? { rotate: -180, scale: 0.7 } : false}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center text-3xl sm:text-4xl font-black text-white shadow-xl transition-all ${
                  lastRoll?.winner === "player"
                    ? "ring-4 ring-pink-400 scale-110 shadow-pink-500/50"
                    : lastRoll?.winner === "kabu"
                    ? "opacity-50 scale-95 grayscale-[40%]"
                    : ""
                }`}
                style={{ backgroundColor: DIE_COLORS[playerDie].bg }}
              >
                {lastRoll ? lastRoll.playerVal : "?"}
              </motion.div>

              <span className="text-[10px] sm:text-[11px] text-slate-400 font-mono text-center">
                目: [{EFRON_DICE[playerDie].join(",")}]
              </span>
            </div>

            {/* Middle Comparison Sign */}
            <div className="flex flex-col items-center justify-center px-2">
              <motion.div
                key={`vs-${rollKey}`}
                initial={lastRoll ? { scale: 0.4 } : false}
                animate={{ scale: 1 }}
                className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center font-black shadow-lg ${
                  !lastRoll
                    ? "bg-slate-900 text-amber-400 border border-slate-700 text-sm"
                    : lastRoll.winner === "player"
                    ? "bg-pink-600 text-white text-2xl animate-pulse"
                    : lastRoll.winner === "kabu"
                    ? "bg-amber-500 text-slate-950 text-2xl animate-pulse"
                    : "bg-slate-800 text-slate-300 text-lg"
                }`}
              >
                {!lastRoll
                  ? "VS"
                  : lastRoll.winner === "player"
                  ? "＞"
                  : lastRoll.winner === "kabu"
                  ? "＜"
                  : "＝"}
              </motion.div>
            </div>

            {/* Kabu Side */}
            <div className="flex flex-col items-center gap-1.5 flex-1">
              <div className="flex items-center gap-1 h-6">
                <span className="text-xs sm:text-sm font-bold text-amber-300">
                  カブ教授 ({kabuDie})
                </span>
                {lastRoll && lastRoll.winner === "kabu" && (
                  <span className="text-xs font-black px-1.5 py-0.5 rounded bg-amber-500 text-slate-950 animate-bounce shadow">
                    WIN! 👨‍🏫
                  </span>
                )}
              </div>

              {/* Kabu Die Box */}
              <motion.div
                key={`k-${rollKey}`}
                initial={lastRoll ? { rotate: 180, scale: 0.7 } : false}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center text-3xl sm:text-4xl font-black text-white shadow-xl transition-all ${
                  lastRoll?.winner === "kabu"
                    ? "ring-4 ring-amber-400 scale-110 shadow-amber-500/50"
                    : lastRoll?.winner === "player"
                    ? "opacity-50 scale-95 grayscale-[40%]"
                    : ""
                }`}
                style={{ backgroundColor: DIE_COLORS[kabuDie].bg }}
              >
                {lastRoll ? lastRoll.kabuVal : "?"}
              </motion.div>

              <span className="text-[10px] sm:text-[11px] text-slate-400 font-mono text-center">
                目: [{EFRON_DICE[kabuDie].join(",")}]
              </span>
            </div>
          </div>

          {/* Big Result Announcement Banner */}
          {lastRoll ? (
            <motion.div
              key={`banner-${rollKey}`}
              initial={{ opacity: 0, y: 6, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={`w-full py-2.5 px-4 rounded-xl text-center shadow-lg border flex flex-col items-center gap-0.5 ${
                lastRoll.winner === "player"
                  ? "bg-gradient-to-r from-pink-900/90 via-rose-900/90 to-pink-900/90 border-pink-400 text-pink-100 ring-1 ring-pink-400/50"
                  : lastRoll.winner === "kabu"
                  ? "bg-gradient-to-r from-amber-950/90 via-amber-900/90 to-amber-950/90 border-amber-400 text-amber-100 ring-1 ring-amber-400/50"
                  : "bg-slate-900 border-slate-700 text-slate-300"
              }`}
            >
              <div className="text-sm sm:text-base font-black flex items-center justify-center gap-2">
                {lastRoll.winner === "player" ? (
                  <>
                    <Sparkles className="w-5 h-5 text-pink-300 shrink-0" />
                    <span>🎉 あなたの勝ち！（出目: {lastRoll.playerVal} ＞ {lastRoll.kabuVal}）</span>
                    <Sparkles className="w-5 h-5 text-pink-300 shrink-0" />
                  </>
                ) : lastRoll.winner === "kabu" ? (
                  <>
                    <Swords className="w-5 h-5 text-amber-300 shrink-0" />
                    <span>😢 あなたの負け…（出目: {lastRoll.playerVal} ＜ {lastRoll.kabuVal}）</span>
                    <Swords className="w-5 h-5 text-amber-300 shrink-0" />
                  </>
                ) : (
                  <span>🤝 引き分け！（出目: {lastRoll.playerVal} ＝ {lastRoll.kabuVal}）</span>
                )}
              </div>
              <p className="text-[11px] sm:text-xs text-slate-300">
                {lastRoll.winner === "player"
                  ? "お見事！ 33.3%の確率を引いて後出し教授に勝利しました！"
                  : lastRoll.winner === "kabu"
                  ? `後出しのカブ教授（${kabuDie}サイコロ・理論勝率 66.7%）が勝利しました！`
                  : "同じ出目が出ました。もう一度振ってみよう！"}
              </p>
            </motion.div>
          ) : (
            <div className="text-xs text-slate-400 py-1 font-medium text-center">
              👉 下の「サイコロを1回振る」ボタンを押して対決しよう！
            </div>
          )}

          {/* Mini Scoreboard */}
          <div className="flex items-center justify-between w-full pt-2 border-t border-slate-800 text-xs text-slate-300">
            <span className="font-bold flex items-center gap-1 text-pink-300">
              あなた: <span className="font-mono font-black text-sm">{simResults.playerWins}</span> 勝
            </span>
            <span className="font-mono text-slate-400 text-[11px]">
              累計 {simResults.total} 戦 (教授勝率: {simResults.total > 0 ? ((simResults.kabuWins / simResults.total) * 100).toFixed(0) : 0}%)
            </span>
            <span className="font-bold flex items-center gap-1 text-amber-300">
              カブ教授: <span className="font-mono font-black text-sm">{simResults.kabuWins}</span> 勝
            </span>
          </div>
        </div>

        <ControlPanel
          onRunSingle={handleRollOnce}
          runSingleText="サイコロを1回振る"
          onReset={() => {
            setLastRoll(null);
            setSimResults({ playerWins: 0, kabuWins: 0, total: 0 });
            setRollKey(0);
          }}
          resetText="リセット"
        />
      </div>
    );
  }

  // STEP 2: 試行フェーズ (Simulation) - 大量対決
  if (stepIndex === 2) {
    return (
      <div className="flex flex-col gap-4 w-full">
        <div className="p-3 bg-slate-950/70 border border-chalkboard-border rounded-xl text-xs font-bold text-slate-300 flex justify-between items-center">
          <span>⚡ 大量対戦シミュレーション（{playerDie} vs {kabuDie}）</span>
          <span className="text-amber-400 font-mono">
            累計: {simResults.total}回
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-950/80 border border-chalkboard-border flex flex-col gap-3">
          <div>
            <div className="flex justify-between text-xs font-bold text-amber-300 mb-1">
              <span>👨‍🏫 カブ教授（後出し側）の勝率 (理論値: 66.7%)</span>
              <span className="font-mono">
                {simResults.total > 0
                  ? ((simResults.kabuWins / simResults.total) * 100).toFixed(1)
                  : 0}
                % ({simResults.kabuWins}勝)
              </span>
            </div>
            <div className="w-full h-4 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
              <motion.div
                className="h-full bg-amber-500"
                style={{
                  width: `${
                    simResults.total > 0
                      ? (simResults.kabuWins / simResults.total) * 100
                      : 0
                  }%`,
                }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-bold text-pink-300 mb-1">
              <span>🐱 あなた（先攻側）の勝率 (理論値: 33.3%)</span>
              <span className="font-mono">
                {simResults.total > 0
                  ? ((simResults.playerWins / simResults.total) * 100).toFixed(1)
                  : 0}
                % ({simResults.playerWins}勝)
              </span>
            </div>
            <div className="w-full h-4 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
              <motion.div
                className="h-full bg-pink-500"
                style={{
                  width: `${
                    simResults.total > 0
                      ? (simResults.playerWins / simResults.total) * 100
                      : 0
                  }%`,
                }}
              />
            </div>
          </div>
        </div>

        <ControlPanel
          onRunBatch={handleRunBatch}
          batchCounts={[100, 1000, 10000]}
          onReset={() => setSimResults({ playerWins: 0, kabuWins: 0, total: 0 })}
        />
      </div>
    );
  }

  // STEP 3: 種明かしフェーズ (Reveal) - 36通りマトリクスと循環ループ
  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-950 to-chalkboard-dark border-2 border-amber-500/50 shadow-xl flex flex-col gap-3">
        <div className="flex items-center justify-between text-xs font-bold text-slate-300">
          <span className="text-amber-300 font-bold flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-400" />
            種明かし：じゃんけん構造（A &gt; B &gt; C &gt; D &gt; A）
          </span>
          <span className="text-emerald-400 font-mono">後出し勝率: 24/36 = 2/3</span>
        </div>

        <div className="grid grid-cols-6 gap-1 p-2 bg-slate-900/80 rounded-xl">
          {matchup.matrix.flatMap((row, rIdx) =>
            row.map((cell, cIdx) => (
              <div
                key={`${rIdx}-${cIdx}`}
                className={`h-6 rounded flex items-center justify-center text-[9px] font-bold font-mono ${
                  cell.winner === 2
                    ? "bg-amber-600 text-slate-950"
                    : cell.winner === 1
                    ? "bg-pink-600 text-white"
                    : "bg-slate-800 text-slate-400"
                }`}
              >
                {cell.die1Value}v{cell.die2Value}
              </div>
            ))
          )}
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          どのサイコロを選んでも、勝率 <strong>2/3（約66.7%）</strong> で勝てる天敵サイコロが必ず存在します。
          推移律（A &gt; B かつ B &gt; C ならば A &gt; C）が成り立たないため、後出し側が必勝となるのです！
        </p>
      </div>
    </div>
  );
};
