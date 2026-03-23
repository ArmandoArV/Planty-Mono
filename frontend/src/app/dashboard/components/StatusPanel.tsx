"use client";

import { Card, Text } from "@fluentui/react-components";
import {
  AlertRegular,
  CheckmarkCircleRegular,
  InfoRegular,
} from "@fluentui/react-icons";

interface StatusPanelProps {
  moisture: number;
  pumpStatus: boolean;
}

interface LogEntry {
  icon: typeof AlertRegular;
  message: string;
  color: string;
  time: string;
}

export default function StatusPanel({ moisture, pumpStatus }: StatusPanelProps) {
  const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const logs: LogEntry[] = [
    moisture < 33.33
      ? { icon: AlertRegular, message: "Soil moisture critically low!", color: "#ef4444", time: now }
      : { icon: CheckmarkCircleRegular, message: "Soil moisture is healthy", color: "#22c55e", time: now },
    {
      icon: InfoRegular,
      message: pumpStatus ? "Water pump is running" : "Water pump is idle",
      color: pumpStatus ? "#3b82f6" : "#6b7280",
      time: now,
    },
    {
      icon: InfoRegular,
      message: "Sensor data streaming via Blynk (V0)",
      color: "#6b7280",
      time: now,
    },
  ];

  return (
    <Card className="border border-border bg-surface p-6 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <AlertRegular className="text-xl text-accent" />
        <Text weight="semibold" size={400}>
          Activity Log
        </Text>
      </div>

      <div className="flex flex-col gap-3">
        {logs.map((log, i) => {
          const Icon = log.icon;
          return (
            <div key={i} className="flex items-start gap-3">
              <Icon className="mt-0.5 shrink-0 text-base" style={{ color: log.color }} />
              <div className="flex flex-1 items-center justify-between">
                <Text size={300} className="text-foreground">
                  {log.message}
                </Text>
                <Text size={100} className="text-muted whitespace-nowrap ml-4">
                  {log.time}
                </Text>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
