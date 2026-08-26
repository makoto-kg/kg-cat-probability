"use client";

import React, { useState, useTransition } from "react";
import { motion } from "framer-motion";
import {
  runParrondoEnsemble,
  runParrondoSim,
  ParrondoSimResult,
} from "@/lib/simulations/parrondo";
import { ControlPanel } from "../lesson/ControlPanel";
import { TrendingUp, Sliders, Sparkles, Coins } from "lucide-react";

interface ParrondoVizProps {
  stepIndex: number;
}

export const ParrondoViz: React.FC<ParrondoVizProps> = ({ stepIndex }) => {
  const [steps, setSteps] = useState(300);
  const [isAveraged, setIsAveraged] = useState(true);
  const [simResult, setSimResult] = useState<ParrondoSimResult>(() =>
    runParrondoEnsemble(300, 300)
  );
  const [, startTransition] = useTransition();

  const handleRun = () => {
    startTransition(() => {
      if (isAveraged) {
        setSimResult(runParrondoEnsemble(300, steps));
      } else {
        setSimResult(runParrondoSim(steps));
      }
    });
  };

  const handleStepSlider = (val: number) => {
    setSteps(val);
    if (isAveraged) {
      setSimResult(runParrondoEnsemble(300, val));
    } else {
      setSimResult(runParrondoSim(val));
    }
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

          <div className="text-xs sm:text-sm text-slate-200 leading-relaxed space-y-3">
            <p>
              単独でプレイすると必ず資産が減っていく2つのギャンブル<strong>「負けゲームA」と「負けゲームB」</strong>があります。
            </p>
            <div className="p-3 bg-chalkboard-dark rounded-xl border border-chalkboard-border text-chalk-yellow font-bold text-xs sm:text-sm space-y-1">
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

  // STEP 1: 体験フェーズ (Experience) - 単独ゲームの損失
  if (stepIndex === 1) {
    return (
      <div className="flex flex-col gap-4 w-full">
        <div className="p-3 bg-slate-950/70 border border-chalkboard-border rounded-xl text-xs font-bold text-slate-300 flex justify-between items-center">
          <span>🎮 ゲームA・B単独のプレイ結果</span>
          <span className="text-red-400 font-bold">どちらもマイナス</span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/60 text-center">
            <span className="text-xs font-bold text-red-300">🔴 ゲームA単独</span>
            <span className="text-xl font-black text-red-400 font-mono mt-1 block">
              {simResult.finalCapital.A}
            </span>
            <span className="text-[10px] text-slate-400 block mt-1">勝率 49.5%（微小な不利）</span>
          </div>

          <div className="p-4 rounded-xl bg-blue-950/40 border border-blue-500/60 text-center">
            <span className="text-xs font-bold text-blue-300">🔷 ゲームB単独</span>
            <span className="text-xl font-black text-blue-400 font-mono mt-1 block">
              {simResult.finalCapital.B}
            </span>
            <span className="text-[10px] text-slate-400 block mt-1">所持金3の倍数で大負け</span>
          </div>
        </div>

        <ControlPanel
          onRunSingle={handleRun}
          runSingleText="単独ゲームを再シミュレーション"
        />
      </div>
    );
  }

  // STEP 2: 試行フェーズ (Simulation) - 交互プレイでの右肩上がり
  if (stepIndex === 2) {
    return (
      <div className="flex flex-col gap-4 w-full">
        <div className="p-3 bg-slate-950/70 border border-chalkboard-border rounded-xl text-xs font-bold text-slate-300 flex justify-between items-center">
          <span>⚡ 資産推移折れ線グラフ（{steps}ステップ）</span>
          <span className="text-emerald-400 font-bold">交互プレイで急上昇！</span>
        </div>

        {/* Multi-Line Chart */}
        <div className="w-full overflow-x-auto bg-slate-900/80 rounded-xl p-2 border border-slate-800">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto min-w-[400px]">
            <line
              x1={padding}
              y1={zeroY}
              x2={width - padding}
              y2={zeroY}
              stroke="#475569"
              strokeDasharray="4 4"
              strokeWidth="1.5"
            />
            <path d={makePath("capitalA")} fill="none" stroke="#ef4444" strokeWidth="2" opacity="0.8" />
            <path d={makePath("capitalB")} fill="none" stroke="#3b82f6" strokeWidth="2" opacity="0.8" />
            <path d={makePath("capitalABAB")} fill="none" stroke="#10b981" strokeWidth="3" />
            <path d={makePath("capitalRandom")} fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeDasharray="3 3" />
          </svg>
        </div>

        <div className="flex justify-around text-[10px] font-bold text-slate-300">
          <span className="text-red-400">● A単独 (減)</span>
          <span className="text-blue-400">● B単独 (減)</span>
          <span className="text-emerald-400 font-black">● 交互 (増!)</span>
          <span className="text-amber-400 font-black">● ランダム (増!)</span>
        </div>

        <ControlPanel
          onRunSingle={handleRun}
          runSingleText="新しくシミュレーション"
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
          <span className="text-emerald-400 font-mono">ラチェット効果</span>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          ゲームBは「所持金が3の倍数」のときだけ勝率10%という罠があります。単独だとこの罠に何度もハマって負けますが、
          <strong>ゲームAのランダム性が適度に所持金をかき乱す</strong>ことで、ゲームBの罠を踏む頻度が減り、勝率75%のボーナス状態を多く引き出せるようになります！
        </p>

        <div className="grid grid-cols-2 gap-3 mt-1">
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
