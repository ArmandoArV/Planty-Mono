"use client";

import { useState, useEffect, useCallback, useRef } from "react";

export interface SensorData {
  moisture: number;          // 0-100 %
  pumpStatus: boolean;       // on / off
  plantMood: "happy" | "normal" | "sad";
  lastUpdated: Date;
  history: { time: string; moisture: number }[];
}

function randomMoisture(): number {
  return Math.round((Math.random() * 80 + 10) * 100) / 100;
}

function moodFromMoisture(m: number): SensorData["plantMood"] {
  if (m >= 66.66) return "happy";
  if (m >= 33.33) return "normal";
  return "sad";
}

function buildHistory(): { time: string; moisture: number }[] {
  const now = new Date();
  return Array.from({ length: 12 }, (_, i) => {
    const t = new Date(now.getTime() - (11 - i) * 5 * 60_000);
    return {
      time: t.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      moisture: randomMoisture(),
    };
  });
}

const emptyData: SensorData = {
  moisture: 0,
  pumpStatus: false,
  plantMood: "normal",
  lastUpdated: new Date(0),
  history: [],
};

/**
 * Simulates real-time sensor data from the Arduino.
 * Initialises after mount to avoid hydration mismatches.
 * In production, replace the interval body with a fetch/WebSocket call.
 */
export function useSensorData(intervalMs = 2000): SensorData & { togglePump: () => void } {
  const [data, setData] = useState<SensorData>(emptyData);
  const initialised = useRef(false);

  // Seed on mount only
  useEffect(() => {
    if (!initialised.current) {
      initialised.current = true;
      const m = randomMoisture();
      setData({
        moisture: m,
        pumpStatus: false,
        plantMood: moodFromMoisture(m),
        lastUpdated: new Date(),
        history: buildHistory(),
      });
    }
  }, []);

  // Live-update loop
  useEffect(() => {
    const id = setInterval(() => {
      setData((prev) => {
        const m = randomMoisture();
        const newHistory = [
          ...prev.history.slice(1),
          {
            time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            moisture: m,
          },
        ];
        return {
          ...prev,
          moisture: m,
          plantMood: moodFromMoisture(m),
          lastUpdated: new Date(),
          history: newHistory,
        };
      });
    }, intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);

  const togglePump = useCallback(() => {
    setData((prev) => ({ ...prev, pumpStatus: !prev.pumpStatus }));
  }, []);

  return { ...data, togglePump };
}
