"use client";

import { Card, Text, Button, Badge } from "@fluentui/react-components";
import {
  DropRegular,
  EmojiRegular,
  EmojiMehRegular,
  EmojiSadRegular,
  OpenRegular,
  PlugConnectedRegular,
  DeleteRegular,
} from "@fluentui/react-icons";
import { motion } from "framer-motion";
import Link from "next/link";
import type { Plant } from "@/app/hooks/usePlantCollection";

interface PlantCardProps {
  plant: Plant;
  userId: string;
  onTogglePump: () => void;
  onRemove: () => void;
  index: number;
}

const moodConfig = {
  happy: { Icon: EmojiRegular, label: "Thriving", color: "#22c55e", bg: "bg-green-50" },
  normal: { Icon: EmojiMehRegular, label: "Moderate", color: "#eab308", bg: "bg-yellow-50" },
  sad: { Icon: EmojiSadRegular, label: "Needs Water", color: "#ef4444", bg: "bg-red-50" },
};

const moistureColor = (m: number) => (m >= 66.66 ? "#22c55e" : m >= 33.33 ? "#eab308" : "#ef4444");

export default function PlantCard({ plant, userId, onTogglePump, onRemove, index }: PlantCardProps) {
  const mood = moodConfig[plant.plantMood];
  const MoodIcon = mood.Icon;
  const circumference = 2 * Math.PI * 28;
  const dashOffset = circumference - (plant.moisture / 100) * circumference;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, duration: 0.4, ease: "easeOut" as const }}
    >
      <Card className="group relative flex h-full flex-col border border-border bg-surface p-0 shadow-sm transition-shadow hover:shadow-md">
        {/* Image placeholder */}
        <div className="image-placeholder aspect-[4/3] w-full rounded-b-none! rounded-t-2xl!">
          <div className="flex flex-col items-center gap-2">
            <span className="text-4xl">🪴</span>
            <span className="text-xs">Plant photo</span>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col gap-4 p-5">
          {/* Title row */}
          <div className="flex items-start justify-between">
            <div>
              <Text weight="semibold" size={400} className="text-foreground">
                {plant.name}
              </Text>
              <Text size={200} className="mt-0.5 block text-muted">
                {plant.species}
              </Text>
            </div>
            <Badge
              appearance="filled"
              size="small"
              style={{ backgroundColor: mood.color }}
              icon={<MoodIcon />}
            >
              {mood.label}
            </Badge>
          </div>

          {/* Moisture mini-gauge */}
          <div className="flex items-center gap-4">
            <div className="relative flex-shrink-0">
              <svg width="64" height="64" className="-rotate-90">
                <circle cx="32" cy="32" r="28" fill="none" stroke="#e5e7eb" strokeWidth="6" />
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  fill="none"
                  stroke={moistureColor(plant.moisture)}
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={dashOffset}
                  className="transition-all duration-700 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <Text size={200} weight="bold" style={{ color: moistureColor(plant.moisture) }}>
                  {plant.moisture.toFixed(0)}%
                </Text>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1.5">
                <DropRegular className="text-sm text-accent" />
                <Text size={200}>Moisture</Text>
              </div>
              <div className="flex items-center gap-1.5">
                <PlugConnectedRegular
                  className={`text-sm ${plant.pumpStatus ? "text-blue-500" : "text-muted"}`}
                />
                <Text size={200} className={plant.pumpStatus ? "text-blue-600" : "text-muted"}>
                  Pump {plant.pumpStatus ? "ON" : "OFF"}
                </Text>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-auto flex items-center gap-2 border-t border-border pt-3">
            <Button
              appearance={plant.pumpStatus ? "primary" : "outline"}
              size="small"
              icon={<DropRegular />}
              onClick={onTogglePump}
              className="flex-1"
            >
              {plant.pumpStatus ? "Stop Watering" : "Water Now"}
            </Button>

            <Link href={`/dashboard/${userId}/${plant.id}`}>
              <Button appearance="subtle" size="small" icon={<OpenRegular />}>
                Details
              </Button>
            </Link>

            <Button
              appearance="subtle"
              size="small"
              icon={<DeleteRegular />}
              onClick={onRemove}
              aria-label="Remove plant"
              className="text-red-500! hover:bg-red-50!"
            />
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
