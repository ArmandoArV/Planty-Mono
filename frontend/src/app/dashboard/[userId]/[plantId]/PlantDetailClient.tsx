"use client";

import { Text, Button, Badge, Spinner } from "@fluentui/react-components";
import { WifiSettingsRegular } from "@fluentui/react-icons";
import { motion } from "framer-motion";
import Link from "next/link";
import { use, useEffect, useState, useCallback } from "react";
import MoistureGauge from "../../components/MoistureGauge";
import PumpControl from "../../components/PumpControl";
import PlantMood from "../../components/PlantMood";
import MoistureChart from "../../components/MoistureChart";
import StatusPanel from "../../components/StatusPanel";
import { usePlantCollection } from "@/app/hooks/usePlantCollection";
import { useBreakpoint } from "@/app/hooks";
import { useDashboardShell } from "../../context/DashboardShellContext";
import { useAuth } from "@/app/lib/auth";
import { api, asPlantId, type Plant as ApiPlant, type SensorReading } from "@/app/lib/api";
import type { Plant } from "@/app/hooks/usePlantCollection";
import { OwnershipGuard } from "@/app/lib/guards";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.45, ease: "easeOut" as const },
  }),
};

interface Props {
  params: Promise<{ userId: string; plantId: string }>;
}

export default function PlantDetailClient({ params }: Props) {
  const { userId, plantId } = use(params);

  return (
    <OwnershipGuard userId={userId}>
      <PlantDetailContent userId={userId} plantId={plantId} />
    </OwnershipGuard>
  );
}

function PlantDetailContent({ userId, plantId }: { userId: string; plantId: string }) {
  const { isAuthenticated } = useAuth();
  const isDemo = userId === "demo" || !isAuthenticated;

  // Demo mode
  const demoCollection = usePlantCollection();
  const demoPlant = demoCollection.getPlant(plantId);

  // API mode
  const [apiPlant, setApiPlant] = useState<Plant | null>(null);
  const [apiLoading, setApiLoading] = useState(!isDemo);

  const fetchPlantData = useCallback(async () => {
    if (isDemo) return;
    const pid = asPlantId(plantId);
    try {
      const [p, readings] = await Promise.all([
        api.plants.get(pid),
        api.sensors.list(pid).catch(() => [] as SensorReading[]),
      ]);

      const latest = readings[0];
      const history = readings
        .slice(0, 12)
        .reverse()
        .map((r) => ({
          time: new Date(r.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          moisture: r.moisture,
        }));

      setApiPlant({
        id: p.id,
        name: p.name,
        species: p.species,
        moisture: latest?.moisture ?? 0,
        pumpStatus: p.pump_status,
        plantMood: latest?.plant_mood ?? "normal",
        lastUpdated: latest ? new Date(latest.created_at) : new Date(p.updated_at),
        history,
      });
    } catch {
      // Swallow
    } finally {
      setApiLoading(false);
    }
  }, [isDemo, plantId]);

  useEffect(() => {
    fetchPlantData();
    if (!isDemo) {
      const id = setInterval(fetchPlantData, 5_000);
      return () => clearInterval(id);
    }
  }, [fetchPlantData, isDemo]);

  const plant = isDemo ? demoPlant : apiPlant;

  const handleTogglePump = async () => {
    if (isDemo && demoPlant) {
      demoCollection.togglePump(demoPlant.id);
      return;
    }
    try {
      await api.plants.togglePump(asPlantId(plantId));
      await fetchPlantData();
    } catch {
      // Swallow
    }
  };

  const { isMd } = useBreakpoint();
  const { setConfig } = useDashboardShell();

  useEffect(() => {
    setConfig({
      backHref: `/dashboard/${userId}`,
      backLabel: "My Plants",
      title: plant?.name ?? "Plant Details",
      rightContent: (
        <div className="flex items-center gap-3">
          <WifiSettingsRegular className="text-lg text-accent" />
          <Badge appearance="filled" color="success" size="small">
            {isDemo ? "Demo" : "Live"}
          </Badge>
          {plant && (
            <Text size={200} className="hidden text-muted sm:block">
              Updated {plant.lastUpdated.toLocaleTimeString()}
            </Text>
          )}
        </div>
      ),
    });
  }, [userId, plant?.name, plant?.lastUpdated, setConfig, isDemo]);

  if (apiLoading && !isDemo) {
    return (
      <main className="flex flex-1 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Spinner size="large" />
          <Text size={300} className="text-muted">Loading plant data…</Text>
        </div>
      </main>
    );
  }

  if (!plant) {
    return (
      <main className="flex flex-1 items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <span className="text-5xl">🔍</span>
          <Text size={500} weight="semibold">Plant not found</Text>
          <Link href={`/dashboard/${userId}`}>
            <Button appearance="primary">Back to My Plants</Button>
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
      {/* Page title */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3">
          <Text size={700} weight="bold" className="text-foreground">
            {plant.name}
          </Text>
          <Badge appearance="tint" color="brand" size="small">
            {plant.species}
          </Badge>
        </div>
        <Text size={300} className="mt-1 block text-muted">
          {isDemo
            ? "Demo mode — simulated sensor data"
            : "Real-time sensor data \u00b7 Arduino R4 WiFi \u00b7 Blynk V0/V1"}
        </Text>
      </motion.div>

      {/* Top row — 3 sensor cards */}
      <div className={`grid gap-6 ${isMd ? "grid-cols-3" : "grid-cols-1"}`}>
        {[0, 1, 2].map((i) => (
          <motion.div key={i} custom={i} variants={fadeUp} initial="hidden" animate="visible">
            {i === 0 && <MoistureGauge moisture={plant.moisture} />}
            {i === 1 && <PumpControl isOn={plant.pumpStatus} onToggle={handleTogglePump} />}
            {i === 2 && <PlantMood mood={plant.plantMood} />}
          </motion.div>
        ))}
      </div>

      {/* Bottom row — chart + status */}
      <div className={`mt-6 grid gap-6 ${isMd ? "grid-cols-3" : "grid-cols-1"}`}>
        <motion.div
          className={isMd ? "col-span-2" : ""}
          custom={3}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
        >
          <MoistureChart history={plant.history} />
        </motion.div>

        <motion.div custom={4} variants={fadeUp} initial="hidden" animate="visible">
          <StatusPanel moisture={plant.moisture} pumpStatus={plant.pumpStatus} />
        </motion.div>
      </div>
    </main>
  );
}
