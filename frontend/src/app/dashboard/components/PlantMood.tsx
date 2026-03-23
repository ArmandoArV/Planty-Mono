"use client";

import { Card, Text } from "@fluentui/react-components";
import { EmojiRegular, EmojiSadRegular, EmojiMehRegular } from "@fluentui/react-icons";

interface PlantMoodProps {
  mood: "happy" | "normal" | "sad";
}

const config = {
  happy: {
    icon: EmojiRegular,
    label: "Thriving!",
    color: "#22c55e",
    bg: "bg-green-50",
    description: "Moisture is in the ideal range. Your plant is loving life.",
  },
  normal: {
    icon: EmojiMehRegular,
    label: "Moderate",
    color: "#eab308",
    bg: "bg-yellow-50",
    description: "Moisture is okay but could be better. Consider watering soon.",
  },
  sad: {
    icon: EmojiSadRegular,
    label: "Needs Water",
    color: "#ef4444",
    bg: "bg-red-50",
    description: "Soil is dry — your plant needs attention right away!",
  },
};

export default function PlantMood({ mood }: PlantMoodProps) {
  const c = config[mood];
  const Icon = c.icon;

  return (
    <Card className="flex flex-col items-center gap-4 border border-border bg-surface p-6 shadow-sm">
      <div className="flex items-center gap-2">
        <Icon className="text-xl" style={{ color: c.color }} />
        <Text weight="semibold" size={400}>
          Plant Mood
        </Text>
      </div>

      <div
        className={`flex h-24 w-24 items-center justify-center rounded-full ${c.bg}`}
      >
        <Icon className="text-5xl!" style={{ color: c.color }} />
      </div>

      <div className="text-center">
        <Text weight="bold" size={500} style={{ color: c.color }}>
          {c.label}
        </Text>
        <Text size={200} className="mt-1 block text-muted">
          {c.description}
        </Text>
      </div>
    </Card>
  );
}
