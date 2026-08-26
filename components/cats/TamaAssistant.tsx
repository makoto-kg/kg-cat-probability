"use client";

import React from "react";
import { CatAvatar, TamaMood } from "./CatAvatar";

interface TamaAssistantProps {
  mood?: TamaMood;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  showBadge?: boolean;
}

export const TamaAssistant: React.FC<TamaAssistantProps> = ({
  mood = "base",
  size = "md",
  className = "",
  showBadge = true,
}) => {
  return (
    <CatAvatar
      character="tama"
      mood={mood}
      size={size}
      className={className}
      showBadge={showBadge}
    />
  );
};
