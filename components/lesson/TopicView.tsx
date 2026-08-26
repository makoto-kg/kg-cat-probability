"use client";

import React from "react";
import { TopicDefinition } from "@/lib/topics";
import { LessonPlayer } from "./LessonPlayer";
import { MontyHallViz } from "@/components/viz/MontyHallViz";
import { BirthdayViz } from "@/components/viz/BirthdayViz";
import { BaseRateViz } from "@/components/viz/BaseRateViz";
import { SimpsonViz } from "@/components/viz/SimpsonViz";
import { DiceViz } from "@/components/viz/DiceViz";
import { TwoChildrenViz } from "@/components/viz/TwoChildrenViz";
import { ParrondoViz } from "@/components/viz/ParrondoViz";

export function TopicView({ topic }: { topic: TopicDefinition }) {
  const renderStage = (stepIndex: number, stepId: string) => {
    switch (topic.slug) {
      case "monty-hall":
        return <MontyHallViz stepIndex={stepIndex} />;
      case "birthday":
        return <BirthdayViz stepIndex={stepIndex} />;
      case "base-rate":
        return <BaseRateViz stepIndex={stepIndex} />;
      case "simpson":
        return <SimpsonViz stepIndex={stepIndex} />;
      case "nontransitive-dice":
        return <DiceViz stepIndex={stepIndex} />;
      case "two-children":
        return <TwoChildrenViz stepIndex={stepIndex} />;
      case "parrondo":
        return <ParrondoViz stepIndex={stepIndex} />;
      default:
        return <div>ステージ準備中</div>;
    }
  };

  return <LessonPlayer topic={topic} renderStage={renderStage} />;
}
