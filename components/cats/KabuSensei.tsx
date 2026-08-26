"use client";

import React from "react";
import { CatAvatar, KabuMood } from "./CatAvatar";

interface KabuSenseiProps {
  mood?: KabuMood;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  showBadge?: boolean;
}

export const KabuSensei: React.FC<KabuSenseiProps> = ({
  mood = "calm",
  size = "md",
  className = "",
  showBadge = true,
}) => {
  return (
    <CatAvatar
      character="kabu"
      mood={mood}
      size={size}
      className={className}
      showBadge={showBadge}
    />
  );
};
