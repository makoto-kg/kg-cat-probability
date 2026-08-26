"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  computeSimpsonSummary,
  BERKELEY_1973_DATA,
} from "@/lib/simulations/simpson";
import { ControlPanel } from "../lesson/ControlPanel";
import { ArrowUpDown, BarChart3, Layers, Sparkles } from "lucide-react";

interface SimpsonVizProps {
  stepIndex: number;
}

export const SimpsonViz: React.FC<SimpsonVizProps> = ({ stepIndex }) => {
  const [sortByRate, setSortByRate] = useState(false);
  const summary = computeSimpsonSummary(BERKELEY_1973_DATA);

  const sortedDepts = [...summary.departments].sort((a, b) => {
    if (sortByRate) {
      return b.overallRate - a.overallRate;
    }
    return a.name.localeCompare(b.name);
  });

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
            <BarChart3 className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-black text-chalk-white">
              黒板：本日の問題
            </h3>
          </div>

          <div className="text-xs sm:text-sm text-slate-200 leading-relaxed space-y-3">
            <p>
              カリフォルニア大学バークレー校の1973年大学院入試データ。
              <strong>6つの学科のうち4つの学科（A, B, D, F）で、女性の合格率が男性を上回って</strong>いました。
            </p>
            <div className="p-3 bg-chalkboard-dark rounded-xl border border-chalkboard-border text-chalk-yellow font-bold text-xs sm:text-sm">
              大学全体で合算した場合、どちらの合格率が高くなるでしょうか？<br />
              ・各学科で女性が勝っているのだから、当然全体でも女性が高い？<br />
              ・それとも、男性が高くなることがあり得る？
            </div>
            <p className="text-amber-300 font-bold">
              👉 直感ではどう思いますか？ 右の対話を聞いて選択肢を選んでみよう！
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  // STEP 1: 体験フェーズ (Experience) - 学科別データ
  if (stepIndex === 1) {
    return (
      <div className="flex flex-col gap-4 w-full">
        <div className="p-3 bg-slate-950/70 border border-chalkboard-border rounded-xl text-xs font-bold text-slate-300 flex justify-between items-center">
          <span>📊 学科別の合格率一覧（6学科）</span>
          <span className="text-pink-300">
            4学科（A, B, D, F）で女性勝利
          </span>
        </div>

        <div className="rounded-2xl bg-slate-950/60 border border-chalkboard-border overflow-hidden shadow">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-chalkboard-dark text-slate-300 border-b border-chalkboard-border">
                <th className="p-2.5 font-bold">学科</th>
                <th className="p-2.5 font-bold text-blue-300">男性 合格率</th>
                <th className="p-2.5 font-bold text-pink-300">女性 合格率</th>
                <th className="p-2.5 font-bold text-slate-400">結果</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {summary.departments.map((dept) => {
                const femaleWins = dept.femaleRate > dept.maleRate;
                return (
                  <tr key={dept.name} className="hover:bg-slate-900/40">
                    <td className="p-2.5 font-bold text-chalk-yellow">学科 {dept.name}</td>
                    <td className="p-2.5 font-mono text-blue-200">
                      {dept.maleApplicants}人中 {(dept.maleRate * 100).toFixed(0)}%
                    </td>
                    <td className="p-2.5 font-mono text-pink-200">
                      {dept.femaleApplicants}人中 {(dept.femaleRate * 100).toFixed(0)}%
                    </td>
                    <td className="p-2.5">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          femaleWins
                            ? "bg-pink-950/70 text-pink-300 border-pink-700"
                            : "bg-blue-950/70 text-blue-300 border-blue-700"
                        }`}
                      >
                        {femaleWins ? "🌸 女性勝利" : "🔷 男性勝利"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // STEP 2: 試行フェーズ (Simulation) - 合算時の逆転
  if (stepIndex === 2) {
    return (
      <div className="flex flex-col gap-4 w-full">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-5 rounded-2xl bg-gradient-to-br from-slate-950 to-chalkboard-dark border-2 border-amber-500/60 shadow-xl flex flex-col gap-4"
        >
          <div className="text-center">
            <h3 className="text-base font-black text-amber-300">
              ⚡ 全学科の合算結果（衝撃の逆転！）
            </h3>
            <p className="text-xs text-slate-300 mt-1">
              各学科では女性優勢だったのに、全体では男性が大幅に上回る！
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-blue-950/40 border-2 border-blue-500/60">
              <div className="flex justify-between items-center text-xs font-bold text-blue-300 mb-1">
                <span>🔷 男性 全体合格率</span>
                <span className="text-lg font-black font-mono">
                  {(summary.overallMaleRate * 100).toFixed(1)}%
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                出願 {summary.totalMaleApplicants.toLocaleString()}人中 {summary.totalMaleAdmitted.toLocaleString()}人合格
              </p>
              <div className="w-full h-3 bg-slate-900 rounded-full mt-2 overflow-hidden">
                <div
                  style={{ width: `${summary.overallMaleRate * 100}%` }}
                  className="h-full bg-blue-500"
                />
              </div>
            </div>

            <div className="p-4 rounded-xl bg-pink-950/40 border-2 border-pink-500/60">
              <div className="flex justify-between items-center text-xs font-bold text-pink-300 mb-1">
                <span>🌸 女性 全体合格率</span>
                <span className="text-lg font-black font-mono">
                  {(summary.overallFemaleRate * 100).toFixed(1)}%
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                出願 {summary.totalFemaleApplicants.toLocaleString()}人中 {summary.totalFemaleAdmitted.toLocaleString()}人合格
              </p>
              <div className="w-full h-3 bg-slate-900 rounded-full mt-2 overflow-hidden">
                <div
                  style={{ width: `${summary.overallFemaleRate * 100}%` }}
                  className="h-full bg-pink-500"
                />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // STEP 3: 種明かしフェーズ (Reveal) - 難易度ソートと交絡変数
  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-950 to-chalkboard-dark border-2 border-amber-500/50 shadow-xl flex flex-col gap-3">
        <div className="flex items-center justify-between text-xs font-bold text-slate-300">
          <span className="text-amber-300 font-bold flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-400" />
            種明かし：出願先の偏り（交絡変数）
          </span>
          <button
            onClick={() => setSortByRate(!sortByRate)}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-bold border border-slate-700 flex items-center gap-1"
          >
            <ArrowUpDown className="w-3 h-3" />
            {sortByRate ? "学科名順" : "難易度順に並べ替え"}
          </button>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          女性の出願者の約65%は、合格率の低い難関学科（C, E）に集中していました。
          一方、男性の出願者は合格率が60%以上の学科（A, B）に大量に出願していたため、単純合算すると全体の合格率が逆転したのです。
        </p>

        <div className="space-y-2 mt-2">
          {sortedDepts.map((dept) => (
            <div
              key={dept.name}
              className="p-2 rounded-xl bg-slate-900/80 border border-slate-800 flex justify-between items-center text-xs"
            >
              <span className="font-bold text-chalk-yellow">
                学科 {dept.name} (全体合格率: {(dept.overallRate * 100).toFixed(0)}%)
              </span>
              <span className="text-slate-400 font-mono text-[11px]">
                男: {dept.maleApplicants}人 / 女: {dept.femaleApplicants}人出願
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
