"use client";

import { Card, Text, Switch } from "@fluentui/react-components";
import { PlugConnectedRegular, PlugDisconnectedRegular } from "@fluentui/react-icons";

interface PumpControlProps {
  isOn: boolean;
  onToggle: () => void;
}

export default function PumpControl({ isOn, onToggle }: PumpControlProps) {
  return (
    <Card className="flex flex-col items-center gap-5 border border-border bg-surface p-6 shadow-sm">
      <div className="flex items-center gap-2">
        {isOn ? (
          <PlugConnectedRegular className="text-xl text-accent" />
        ) : (
          <PlugDisconnectedRegular className="text-xl text-muted" />
        )}
        <Text weight="semibold" size={400}>
          Water Pump
        </Text>
      </div>

      <div
        className={`flex h-24 w-24 items-center justify-center rounded-full border-4 transition-colors duration-500 ${
          isOn
            ? "border-accent bg-accent-light"
            : "border-border bg-background"
        }`}
      >
        <Text size={600} weight="bold" className={isOn ? "text-accent" : "text-muted"}>
          {isOn ? "ON" : "OFF"}
        </Text>
      </div>

      <Switch
        checked={isOn}
        onChange={onToggle}
        label={isOn ? "Pump running" : "Pump idle"}
      />
    </Card>
  );
}
