"use client";

import React, { useState, useMemo } from "react";
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
  const [selectedDepts, setSelectedDepts] = useState<string[]>([]);

  const summary = computeSimpsonSummary(BERKELEY_1973_DATA);

  const selectedData = useMemo(() => {
    return BERKELEY_1973_DATA.filter((d) => selectedDepts.includes(d.name));
  }, [selectedDepts]);

  const aggregate = useMemo(() => {
    return computeSimpsonSummary(selectedData);
  }, [selectedData]);

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

  // STEP 1: 体験フェーズ (Experience) - 学科組み合わせ合算シミュレーター
  if (stepIndex === 1) {
    const isAllSelected = selectedDepts.length === BERKELEY_1973_DATA.length;
    const isNoneSelected = selectedDepts.length === 0;
    const femaleLeads =
      !isNoneSelected &&
      aggregate.overallFemaleRate > aggregate.overallMaleRate;
    const maleLeads =
      !isNoneSelected &&
      aggregate.overallMaleRate > aggregate.overallFemaleRate;

    return (
      <div className="flex flex-col gap-3 w-full">
        {/* Real-time Aggregation Card (Fixed structure & stable height) */}
        <div
          className={`p-3 sm:p-3.5 rounded-2xl border-2 shadow-xl flex flex-col gap-2.5 transition-colors ${
            isNoneSelected
              ? "bg-slate-950/80 border-slate-700 shadow-md"
              : maleLeads
              ? "bg-gradient-to-br from-blue-950/80 via-slate-950 to-amber-950/50 border-amber-400/80 ring-1 ring-amber-400/30"
              : "bg-gradient-to-br from-pink-950/80 via-slate-950 to-slate-900 border-pink-500/80 ring-1 ring-pink-500/30"
          }`}
        >
          {/* Header Row */}
          <div className="flex items-center justify-between flex-wrap gap-2 h-7 shrink-0">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="text-xs sm:text-sm font-black text-chalk-white">
                選択中の合算結果:{" "}
                <span className="text-chalk-yellow font-mono">
                  {selectedDepts.length > 0
                    ? `学科 [ ${[...selectedDepts].sort().join(", ")} ]`
                    : "（未選択）"}
                </span>
              </span>
            </div>
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-black shrink-0 ${
                isNoneSelected
                  ? "bg-slate-800 text-slate-400 border border-slate-700"
                  : maleLeads
                  ? "bg-blue-600 text-white animate-pulse shadow"
                  : femaleLeads
                  ? "bg-pink-600 text-white shadow"
                  : "bg-slate-700 text-slate-200"
              }`}
            >
              {isNoneSelected
                ? "未選択"
                : maleLeads
                ? `⚡ 男性優勢（+${((aggregate.overallMaleRate - aggregate.overallFemaleRate) * 100).toFixed(1)}%）`
                : femaleLeads
                ? `🌸 女性優勢（+${((aggregate.overallFemaleRate - aggregate.overallMaleRate) * 100).toFixed(1)}%）`
                : "同点"}
            </span>
          </div>

          {/* Rates Comparison Display (Always 2 boxes rendered so height is 100% constant) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* Male Box */}
            <div className="p-2 sm:p-2.5 rounded-xl bg-blue-950/40 border border-blue-500/30 flex flex-col gap-1">
              <div className="flex justify-between items-center text-xs font-bold text-blue-300">
                <span>🔷 男性 合算合格率</span>
                <span className="text-sm sm:text-base font-black font-mono">
                  {isNoneSelected
                    ? "- %"
                    : `${(aggregate.overallMaleRate * 100).toFixed(1)}%`}
                </span>
              </div>
              <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all duration-300"
                  style={{
                    width: isNoneSelected
                      ? "0%"
                      : `${aggregate.overallMaleRate * 100}%`,
                  }}
                />
              </div>
              <span className="text-[11px] text-slate-400 font-mono">
                {isNoneSelected
                  ? "出願者: 0人"
                  : `合格 ${aggregate.totalMaleAdmitted.toLocaleString()}人 / 出願 ${aggregate.totalMaleApplicants.toLocaleString()}人`}
              </span>
            </div>

            {/* Female Box */}
            <div className="p-2 sm:p-2.5 rounded-xl bg-pink-950/40 border border-pink-500/30 flex flex-col gap-1">
              <div className="flex justify-between items-center text-xs font-bold text-pink-300">
                <span>🌸 女性 合算合格率</span>
                <span className="text-sm sm:text-base font-black font-mono">
                  {isNoneSelected
                    ? "- %"
                    : `${(aggregate.overallFemaleRate * 100).toFixed(1)}%`}
                </span>
              </div>
              <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="h-full bg-pink-500 rounded-full transition-all duration-300"
                  style={{
                    width: isNoneSelected
                      ? "0%"
                      : `${aggregate.overallFemaleRate * 100}%`,
                  }}
                />
              </div>
              <span className="text-[11px] text-slate-400 font-mono">
                {isNoneSelected
                  ? "出願者: 0人"
                  : `合格 ${aggregate.totalFemaleAdmitted.toLocaleString()}人 / 出願 ${aggregate.totalFemaleApplicants.toLocaleString()}人`}
              </span>
            </div>
          </div>

          {/* Educational Insight Bar (Fixed min-height to prevent layout jumps) */}
          <div className="p-2 sm:p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-200 leading-snug min-h-[44px] flex items-center">
            {isNoneSelected ? (
              <span className="text-slate-400">
                👇 下の学科カードをタップして、合算したい学科を選択してください。
              </span>
            ) : selectedDepts.length === 6 ? (
              <span className="text-amber-200">
                <strong>💡 全学科合算の罠：</strong> 各学科単体では4学科で女性優勢なのに、全体では<strong>男性（44.5%）が女性（30.4%）に逆転圧勝</strong>します！
              </span>
            ) : femaleLeads ? (
              <span className="text-pink-200">
                <strong>🌸 女性優勢：</strong> 選択中の学科（{[...selectedDepts].sort().join(", ")}）では女性の合算合格率が上回っています。
              </span>
            ) : maleLeads ? (
              <span className="text-blue-200">
                <strong>⚡ 男性優勢：</strong> 選択中の学科（{[...selectedDepts].sort().join(", ")}）では男性の合算合格率が上回っています。
              </span>
            ) : (
              <span className="text-slate-300">
                選択中の学科（{[...selectedDepts].sort().join(", ")}）では男女の合格率が同点です。
              </span>
            )}
          </div>
        </div>

        {/* Presets Row */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-bold text-slate-400 mr-1">クイック実験:</span>
          <button
            type="button"
            onClick={() => setSelectedDepts(["A", "B", "C", "D", "E", "F"])}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all border ${
              isAllSelected
                ? "bg-amber-500 text-slate-950 border-amber-400 font-black shadow"
                : "bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800"
            }`}
          >
            全学科合算 (A〜F)
          </button>
          <button
            type="button"
            onClick={() => setSelectedDepts(["A", "B", "D", "F"])}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all border ${
              selectedDepts.length === 4 &&
              selectedDepts.every((d) => ["A", "B", "D", "F"].includes(d))
                ? "bg-pink-600 text-white border-pink-400 font-black shadow"
                : "bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800"
            }`}
          >
            🌸 女性勝利4学科 (A,B,D,F)
          </button>
          <button
            type="button"
            onClick={() => setSelectedDepts(["A", "B"])}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all border ${
              selectedDepts.length === 2 &&
              selectedDepts.includes("A") &&
              selectedDepts.includes("B")
                ? "bg-amber-500 text-slate-950 border-amber-400 font-black shadow"
                : "bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800"
            }`}
          >
            易しい学科 (A,B)
          </button>
          <button
            type="button"
            onClick={() => setSelectedDepts(["C", "E"])}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all border ${
              selectedDepts.length === 2 &&
              selectedDepts.includes("C") &&
              selectedDepts.includes("E")
                ? "bg-amber-500 text-slate-950 border-amber-400 font-black shadow"
                : "bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800"
            }`}
          >
            難関学科 (C,E)
          </button>
          <button
            type="button"
            onClick={() => setSelectedDepts([])}
            className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800"
          >
            全解除
          </button>
        </div>

        {/* 6 Departments Grid (Clickable Cards with Fixed Height) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {BERKELEY_1973_DATA.map((dept) => {
            const isSelected = selectedDepts.includes(dept.name);
            const femaleWins = dept.femaleRate > dept.maleRate;

            return (
              <button
                key={dept.name}
                type="button"
                onClick={() => {
                  if (isSelected) {
                    setSelectedDepts(selectedDepts.filter((d) => d !== dept.name));
                  } else {
                    setSelectedDepts([...selectedDepts, dept.name]);
                  }
                }}
                className={`p-2.5 sm:p-3 rounded-2xl border-2 text-left transition-all relative overflow-hidden flex flex-col justify-between h-[104px] select-none ${
                  isSelected
                    ? "bg-slate-900 border-amber-400/80 shadow-md ring-1 ring-amber-400/30"
                    : "bg-slate-950/60 border-slate-800 opacity-60 hover:opacity-100"
                }`}
              >
                {/* Card Top */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`w-5 h-5 rounded-md flex items-center justify-center text-xs font-bold ${
                        isSelected
                          ? "bg-amber-500 text-slate-950 font-black"
                          : "bg-slate-800 text-slate-500"
                      }`}
                    >
                      {isSelected ? "✓" : ""}
                    </span>
                    <span className="font-black text-sm text-chalk-yellow">
                      学科 {dept.name}
                    </span>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      femaleWins
                        ? "bg-pink-950/80 text-pink-300 border-pink-600"
                        : "bg-blue-950/80 text-blue-300 border-blue-600"
                    }`}
                  >
                    {femaleWins ? "🌸 女優勢" : "🔷 男優勢"}
                  </span>
                </div>

                {/* Rates Breakdown in this dept */}
                <div className="space-y-0.5 text-xs">
                  <div className="flex justify-between font-mono text-[11px]">
                    <span className="text-blue-300">男: {(dept.maleRate * 100).toFixed(0)}%</span>
                    <span className="text-slate-400">({dept.maleApplicants}人)</span>
                  </div>
                  <div className="flex justify-between font-mono text-[11px]">
                    <span className="text-pink-300">女: {(dept.femaleRate * 100).toFixed(0)}%</span>
                    <span className="text-slate-400">({dept.femaleApplicants}人)</span>
                  </div>
                </div>

                {/* Overall Rate badge */}
                <div className="text-[10px] text-slate-400 border-t border-slate-800/80 pt-1 flex justify-between">
                  <span>難易度:</span>
                  <span className="font-mono text-slate-300">
                    合格率 {(dept.overallRate * 100).toFixed(0)}%
                  </span>
                </div>
              </button>
            );
          })}
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
