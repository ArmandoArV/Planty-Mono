"use client";

import { Text, Button, Badge, Spinner } from "@fluentui/react-components";
import {
  AddRegular,
  WifiSettingsRegular,
  PersonRegular,
} from "@fluentui/react-icons";
import { motion } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import { use } from "react";
import PlantCard from "./components/PlantCard";
import AddPlantDialog from "./components/AddPlantDialog";
import { usePlantCollection } from "@/app/hooks/usePlantCollection";
import { useBreakpoint } from "@/app/hooks";
import { useDashboardShell } from "../context/DashboardShellContext";
import { useAuth } from "@/app/lib/auth";
import { api, asPlantId, type Plant as ApiPlant } from "@/app/lib/api";
import type { Plant } from "@/app/hooks/usePlantCollection";
import { OwnershipGuard } from "@/app/lib/guards";

interface Props {
  params: Promise<{ userId: string }>;
}

function apiPlantToLocal(p: ApiPlant): Plant {
  return {
    id: p.id,
    name: p.name,
    species: p.species,
    moisture: 0,
    pumpStatus: p.pump_status,
    plantMood: "normal",
    lastUpdated: new Date(p.updated_at),
    history: [],
  };
}

export default function PlantsOverviewClient({ params }: Props) {
  const { userId } = use(params);

  return (
    <OwnershipGuard userId={userId}>
      <PlantsOverviewContent userId={userId} />
    </OwnershipGuard>
  );
}

function PlantsOverviewContent({ userId }: { userId: string }) {
  const { isAuthenticated, user } = useAuth();
  const isDemo = userId === "demo" || !isAuthenticated;

  // Demo mode: simulated data
  const demo = usePlantCollection();

  // API mode state
  const [apiPlants, setApiPlants] = useState<Plant[]>([]);
  const [apiLoading, setApiLoading] = useState(false);

  const fetchPlants = useCallback(async () => {
    if (isDemo) return;
    setApiLoading(true);
    try {
      const list = await api.plants.list();
      // Enrich each plant with latest sensor reading
      const enriched = await Promise.all(
        list.map(async (p) => {
          const local = apiPlantToLocal(p);
          const pid = asPlantId(p.id);
          try {
            const reading = await api.sensors.latest(pid);
            local.moisture = reading.moisture;
            local.plantMood = reading.plant_mood;
          } catch {
            // No readings yet
          }
          try {
            const readings = await api.sensors.list(pid);
            local.history = readings
              .slice(0, 12)
              .reverse()
              .map((r) => ({
                time: new Date(r.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                moisture: r.moisture,
              }));
          } catch {
            // No readings
          }
          return local;
        }),
      );
      setApiPlants(enriched);
    } catch {
      // Fall back silently
    } finally {
      setApiLoading(false);
    }
  }, [isDemo]);

  useEffect(() => {
    fetchPlants();
    if (!isDemo) {
      const id = setInterval(fetchPlants, 10_000);
      return () => clearInterval(id);
    }
  }, [fetchPlants, isDemo]);

  const plants = isDemo ? demo.plants : apiPlants;

  const handleTogglePump = async (plantId: string) => {
    if (isDemo) {
      demo.togglePump(plantId);
      return;
    }
    try {
      await api.plants.togglePump(asPlantId(plantId));
      await fetchPlants();
    } catch {
      // Swallow
    }
  };

  const handleRemove = async (plantId: string) => {
    if (isDemo) {
      demo.removePlant(plantId);
      return;
    }
    try {
      await api.plants.delete(asPlantId(plantId));
      setApiPlants((prev) => prev.filter((p) => p.id !== plantId));
    } catch {
      // Swallow
    }
  };

  const handleAdd = async (name: string, species: string) => {
    if (isDemo) {
      demo.addPlant(name, species);
      return;
    }
    try {
      await api.plants.create({ name, species });
      await fetchPlants();
    } catch {
      // Swallow
    }
  };

  const [dialogOpen, setDialogOpen] = useState(false);
  const { isMd, isLg } = useBreakpoint();
  const { setConfig } = useDashboardShell();

  useEffect(() => {
    setConfig({
      backHref: "/",
      backLabel: "Home",
      title: "My Plants",
      rightContent: (
        <div className="flex items-center gap-3">
          <Badge appearance="tint" color="success" size="medium">
            {plants.length} {plants.length === 1 ? "plant" : "plants"}
          </Badge>
          <Button
            appearance="primary"
            size="small"
            icon={<AddRegular />}
            onClick={() => setDialogOpen(true)}
            className="rounded-full!"
          >
            <span className="hidden sm:inline">Add Plant</span>
          </Button>
          <div className="hidden items-center gap-2 border-l border-border pl-3 md:flex">
            <PersonRegular className="text-base text-muted" />
            <Text size={300} className="text-muted">
              {isDemo ? "Demo" : user?.name ?? userId}
            </Text>
          </div>
        </div>
      ),
    });
  }, [userId, plants.length, setConfig, isDemo, user?.name]);

  const cols = isLg ? "grid-cols-3" : isMd ? "grid-cols-2" : "grid-cols-1";

  if (apiLoading && apiPlants.length === 0 && !isDemo) {
    return (
      <main className="flex flex-1 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Spinner size="large" />
          <Text size={300} className="text-muted">Loading plants…</Text>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8"
      >
        <Text size={700} weight="bold" className="text-foreground">
          My Plants
        </Text>
        <Text size={300} className="mt-1 block text-muted">
          {isDemo
            ? "Demo mode — data is simulated. Log in to connect real sensors."
            : "Monitor all your Planty pots in one place. Tap a card for full details."}
        </Text>
      </motion.div>

      {/* Plant grid */}
      {plants.length > 0 ? (
        <div className={`grid gap-6 ${cols}`}>
          {plants.map((p, i) => (
            <PlantCard
              key={p.id}
              plant={p}
              userId={userId}
              index={i}
              onTogglePump={() => handleTogglePump(p.id)}
              onRemove={() => handleRemove(p.id)}
            />
          ))}

          {/* Ghost add card */}
          <motion.button
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: plants.length * 0.07, duration: 0.4, ease: "easeOut" as const }}
            onClick={() => setDialogOpen(true)}
            className="flex min-h-[320px] cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-border bg-transparent transition-colors hover:border-accent hover:bg-accent-light/40"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent-light">
              <AddRegular className="text-2xl text-accent" />
            </div>
            <Text size={300} weight="semibold" className="text-muted">
              Add another plant
            </Text>
          </motion.button>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-4 py-24"
        >
          <span className="text-6xl">🌱</span>
          <Text size={500} weight="semibold" className="text-foreground">
            No plants yet
          </Text>
          <Text size={300} className="text-muted">
            Add your first Planty pot to start monitoring.
          </Text>
        </motion.div>
      )}

      <AddPlantDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onAdd={handleAdd}
      />
    </main>
  );
}
