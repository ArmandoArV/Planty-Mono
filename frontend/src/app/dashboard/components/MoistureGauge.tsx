"use client";

import { Card, Text } from "@fluentui/react-components";
import {
  DropRegular,
} from "@fluentui/react-icons";

interface MoistureGaugeProps {
  moisture: number;
}

export default function MoistureGauge({ moisture }: MoistureGaugeProps) {
  const clampedValue = Math.min(100, Math.max(0, moisture));

  const getColor = () => {
    if (clampedValue >= 66.66) return "#22c55e";
    if (clampedValue >= 33.33) return "#eab308";
    return "#ef4444";
  };

  const getLabel = () => {
    if (clampedValue >= 66.66) return "Wet";
    if (clampedValue >= 33.33) return "Moderate";
    return "Dry";
  };

  const color = getColor();
  const circumference = 2 * Math.PI * 54;
  const dashOffset = circumference - (clampedValue / 100) * circumference;

  return (
    <Card className="flex flex-col items-center gap-4 border border-border bg-surface p-6 shadow-sm">
      <div className="flex items-center gap-2">
        <DropRegular className="text-xl text-accent" />
        <Text weight="semibold" size={400}>
          Soil Moisture
        </Text>
      </div>

      <div className="relative flex items-center justify-center">
        <svg width="140" height="140" className="-rotate-90">
          <circle
            cx="70"
            cy="70"
            r="54"
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="12"
          />
          <circle
            cx="70"
            cy="70"
            r="54"
            fill="none"
            stroke={color}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            className="transition-all duration-700 ease-out"
          />
        </svg>
        <div className="absolute flex flex-col items-center">
          <Text size={700} weight="bold" style={{ color }}>
            {clampedValue.toFixed(1)}%
          </Text>
          <Text size={200} className="text-muted">
            {getLabel()}
          </Text>
        </div>
      </div>
    </Card>
  );
}
