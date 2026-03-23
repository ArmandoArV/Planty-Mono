"use client";

import { Text } from "@fluentui/react-components";

export default function DashboardFooter() {
  return (
    <footer className="border-t border-border py-4 text-center">
      <Text size={200} className="text-muted">
        Planty Dashboard &middot; Sensors: A0 Moisture · D7 Relay · LED Matrix &middot; © 2026
      </Text>
    </footer>
  );
}
