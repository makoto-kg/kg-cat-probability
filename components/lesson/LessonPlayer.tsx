"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ChevronRight, HelpCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { TopicDefinition } from "@/lib/topics";
import { StepIndicator } from "./StepIndicator";
import { DialogueBubble } from "../cats/DialogueBubble";
import { KabuSensei } from "../cats/KabuSensei";
import { TamaAssistant } from "../cats/TamaAssistant";
import { FormulaAccordion } from "./FormulaAccordion";
import { KabuMood, TamaMood } from "../cats/CatAvatar";

interface LessonPlayerProps {
  topic: TopicDefinition;
  renderStage: (stepIndex: number, stepId: string) => React.ReactNode;
  onStepChange?: (stepIndex: number) => void;
}

export const LessonPlayer: React.FC<LessonPlayerProps> = ({
  topic,
  renderStage,
  onStepChange,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [dialogueIndex, setDialogueIndex] = useState(0);
  const [selectedUserChoice, setSelectedUserChoice] = useState<string | null>(null);

  const currentStep = topic.steps[currentStepIndex];
  const dialogues = currentStep.dialogues;
  const currentDialogue = dialogues[dialogueIndex] || dialogues[dialogues.length - 1];

  const handleNextDialogue = () => {
    if (dialogueIndex < dialogues.length - 1) {
      setDialogueIndex((prev) => prev + 1);
    } else if (currentStepIndex < topic.steps.length - 1) {
      goToStep(currentStepIndex + 1);
    } else {
      // 最終ステップの対話が終了したら、最初のフェーズ（直感）に戻る
      goToStep(0);
    }
  };

  const goToStep = (index: number) => {
    setCurrentStepIndex(index);
    setDialogueIndex(0);
    setSelectedUserChoice(null);
    onStepChange?.(index);
  };

  const speaker = currentDialogue.speaker;
  const mood = currentDialogue.mood;

  const isIntuitionChoicePending =
    currentStep.id === "intuition" &&
    currentStep.userPrompt &&
    selectedUserChoice === null &&
    dialogueIndex >= dialogues.length - 1;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Navbar */}
      <header className="border-b border-chalkboard-border/80 bg-chalkboard-dark/95 sticky top-0 z-40 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition-colors"
              title="トピック一覧へ戻る"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {topic.category}
                </span>
                <span className="text-[11px] text-slate-400 font-medium">
                  難易度: {topic.difficulty}
                </span>
              </div>
              <h1 className="text-base sm:text-xl font-bold text-chalk-white mt-0.5">
                {topic.title}
              </h1>
            </div>
          </div>

          <div className="hidden sm:block text-right">
            <p className="text-xs text-slate-400 font-medium">{topic.subtitle}</p>
          </div>
        </div>
      </header>

      {/* Main Lesson Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 flex flex-col gap-5">
        {/* Step Progress Indicator */}
        <StepIndicator
          currentStepIndex={currentStepIndex}
          onSelectStep={(idx) => goToStep(idx)}
        />

        {/* 2-Column Responsive Layout: Left = Stage Visualizer, Right = Dialogue & Avatars */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 flex-1 items-start">
          {/* Stage / Interactive Simulation Column (7 cols on desktop) */}
          <div className="lg:col-span-7 flex flex-col gap-4 order-2 lg:order-1">
            <div className="rounded-3xl border-2 border-chalkboard-border bg-chalkboard p-4 sm:p-6 shadow-2xl relative overflow-hidden min-h-[460px] flex flex-col justify-between">
              {/* Blackboard Header Chalk Label */}
              <div className="flex items-center justify-between pb-3 border-b border-chalkboard-border/70 mb-3">
                <span className="text-xs font-bold text-chalk-yellow tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-chalk-yellow" />
                  {currentStep.title}
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  {currentStepIndex === 0
                    ? "🤔 まずは直感で考えてみよう"
                    : currentStepIndex === 1
                    ? "🎮 自分で操作して確かめよう"
                    : currentStepIndex === 2
                    ? "⚡ 大量試行で確率を収束させよう"
                    : "💡 種明かしと数学的証明"}
                </span>
              </div>

              {/* Stage Content Rendered with Smooth Step Transition */}
              <div className="flex-1 flex flex-col justify-center">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentStep.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.25 }}
                    className="w-full flex-1 flex flex-col justify-center"
                  >
                    {renderStage(currentStepIndex, currentStep.id)}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            {/* Collapsible Math Formula - Appears on Reveal (Step 4) or on demand */}
            {currentStepIndex === 3 && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <FormulaAccordion
                  title={topic.formulaTitle}
                  description={topic.formulaDescription}
                  math={topic.formulaMath}
                  takeaway={topic.mathTakeaway}
                />
              </motion.div>
            )}
          </div>

          {/* Dialogue & Character Avatar Column (5 cols on desktop) */}
          <div className="lg:col-span-5 flex flex-col gap-4 order-1 lg:order-2">
            {/* Cats Presentation Box */}
            <div className="rounded-3xl border-2 border-chalkboard-border bg-chalkboard-light/95 p-4 sm:p-5 shadow-xl flex flex-col gap-4">
              {/* Top Avatars Row */}
              <div className="flex items-center justify-around gap-2 py-2">
                <div
                  className={`transition-all duration-300 ${
                    speaker === "kabu" ? "scale-105 opacity-100 ring-2 ring-amber-400 rounded-2xl p-1" : "opacity-60 scale-95"
                  }`}
                >
                  <KabuSensei
                    mood={speaker === "kabu" ? (mood as KabuMood) : "calm"}
                    size="md"
                  />
                </div>

                <div
                  className={`transition-all duration-300 ${
                    speaker === "tama" ? "scale-105 opacity-100 ring-2 ring-pink-400 rounded-2xl p-1" : "opacity-60 scale-95"
                  }`}
                >
                  <TamaAssistant
                    mood={speaker === "tama" ? (mood as TamaMood) : "base"}
                    size="md"
                  />
                </div>
              </div>

              {/* Dialogue Bubble with Typewriter */}
              <DialogueBubble
                speaker={speaker}
                text={currentDialogue.text}
                showNextButton={!isIntuitionChoicePending}
                actionButtonText={
                  dialogueIndex < dialogues.length - 1
                    ? "つぎへ ▶"
                    : currentStepIndex < topic.steps.length - 1
                    ? `次のステップ (${topic.steps[currentStepIndex + 1].title}) ▶`
                    : "完了！ 最初からもう一度遊ぶ"
                }
                onAction={handleNextDialogue}
              />

              {/* User Prompt Choices (In Intuition Phase) */}
              <AnimatePresence>
                {isIntuitionChoicePending && currentStep.userPrompt && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="p-4 rounded-2xl bg-slate-900 border-2 border-amber-500/50 flex flex-col gap-3 shadow-lg"
                  >
                    <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
                      <HelpCircle className="w-4 h-4" />
                      <span>{currentStep.userPrompt.question}</span>
                    </div>

                    <div className="flex flex-col gap-2">
                      {currentStep.userPrompt.options.map((opt) => (
                        <motion.button
                          key={opt.value}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => {
                            setSelectedUserChoice(opt.value);
                            handleNextDialogue();
                          }}
                          className="w-full text-left p-3 rounded-xl bg-chalkboard hover:bg-slate-800 border border-slate-700 hover:border-amber-400/80 text-chalk-white text-xs sm:text-sm font-semibold transition-all flex items-center justify-between group shadow"
                        >
                          <span>{opt.label}</span>
                          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-amber-400 transition-colors" />
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Step Navigation Pill buttons */}
              <div className="flex items-center justify-between pt-2 border-t border-chalkboard-border/60">
                <button
                  disabled={currentStepIndex === 0}
                  onClick={() => goToStep(currentStepIndex - 1)}
                  className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 disabled:opacity-30 text-xs font-bold text-slate-300 transition-colors"
                >
                  ◀ 前のステップ
                </button>

                <div className="flex items-center gap-1.5">
                  {topic.steps.map((s, idx) => (
                    <button
                      key={s.id}
                      onClick={() => goToStep(idx)}
                      className={`w-2.5 h-2.5 rounded-full transition-all ${
                        idx === currentStepIndex
                          ? "bg-amber-400 w-6"
                          : "bg-slate-700 hover:bg-slate-500"
                      }`}
                      title={s.title}
                    />
                  ))}
                </div>

                <button
                  disabled={currentStepIndex === topic.steps.length - 1}
                  onClick={() => goToStep(currentStepIndex + 1)}
                  className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 disabled:opacity-30 text-xs font-bold text-slate-300 transition-colors"
                >
                  次のステップ ▶
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
