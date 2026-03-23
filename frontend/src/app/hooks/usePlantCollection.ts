"use client";

import { useState, useCallback, useEffect, useRef } from "react";

export interface Plant {
  id: string;
  name: string;
  species: string;
  moisture: number;
  pumpStatus: boolean;
  plantMood: "happy" | "normal" | "sad";
  lastUpdated: Date;
  history: { time: string; moisture: number }[];
}

function randomMoisture(): number {
  return Math.round((Math.random() * 80 + 10) * 100) / 100;
}

function moodFromMoisture(m: number): Plant["plantMood"] {
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

function createPlant(id: string, name: string, species: string): Plant {
  const m = randomMoisture();
  return {
    id,
    name,
    species,
    moisture: m,
    pumpStatus: false,
    plantMood: moodFromMoisture(m),
    lastUpdated: new Date(),
    history: buildHistory(),
  };
}

const seedPlants: Array<{ id: string; name: string; species: string }> = [
  { id: "plant-1", name: "Living Room Fern", species: "Boston Fern" },
  { id: "plant-2", name: "Kitchen Basil", species: "Sweet Basil" },
  { id: "plant-3", name: "Office Succulent", species: "Echeveria" },
];

export interface PlantCollection {
  plants: Plant[];
  addPlant: (name: string, species: string) => void;
  removePlant: (id: string) => void;
  togglePump: (id: string) => void;
  getPlant: (id: string) => Plant | undefined;
}

/**
 * Manages a collection of plants, each with live-updating sensor data.
 * Plants are initialised **after mount** to avoid hydration mismatches
 * caused by Math.random() / Date.now() differing between server and client.
 */
export function usePlantCollection(intervalMs = 2500): PlantCollection {
  const [plants, setPlants] = useState<Plant[]>([]);
  const counterRef = useRef(seedPlants.length);
  const initialised = useRef(false);

  // Populate on first client render only
  useEffect(() => {
    if (!initialised.current) {
      initialised.current = true;
      setPlants(seedPlants.map((s) => createPlant(s.id, s.name, s.species)));
    }
  }, []);

  // Live-update loop
  useEffect(() => {
    const id = setInterval(() => {
      setPlants((prev) =>
        prev.map((p) => {
          const m = randomMoisture();
          return {
            ...p,
            moisture: m,
            plantMood: moodFromMoisture(m),
            lastUpdated: new Date(),
            history: [
              ...p.history.slice(1),
              {
                time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                moisture: m,
              },
            ],
          };
        }),
      );
    }, intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);

  const addPlant = useCallback((name: string, species: string) => {
    counterRef.current += 1;
    const id = `plant-${counterRef.current}`;
    setPlants((prev) => [...prev, createPlant(id, name, species)]);
  }, []);

  const removePlant = useCallback((id: string) => {
    setPlants((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const togglePump = useCallback((id: string) => {
    setPlants((prev) =>
      prev.map((p) => (p.id === id ? { ...p, pumpStatus: !p.pumpStatus } : p)),
    );
  }, []);

  const getPlant = useCallback(
    (id: string) => plants.find((p) => p.id === id),
    [plants],
  );

  return { plants, addPlant, removePlant, togglePump, getPlant };
}
