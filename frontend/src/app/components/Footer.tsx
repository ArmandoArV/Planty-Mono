"use client";

import { Text } from "@fluentui/react-components";
import Link from "next/link";

const links = {
  Product: ["Features", "Pricing", "Integrations"],
  Company: ["About", "Blog", "Careers"],
  Support: ["Help Center", "Contact", "Privacy"],
};

export default function Footer() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-12 md:grid-cols-4">
          {/* Brand */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🌱</span>
              <Text weight="bold" size={500} className="text-foreground">
                Planty
              </Text>
            </div>
            <Text size={300} className="text-muted max-w-xs">
              Intelligent plant monitoring for modern homes. Keep every leaf
              happy.
            </Text>
          </div>

          {/* Link columns */}
          {Object.entries(links).map(([heading, items]) => (
            <div key={heading} className="flex flex-col gap-3">
              <Text weight="semibold" size={300} className="text-foreground uppercase tracking-wider">
                {heading}
              </Text>
              {items.map((item) => (
                <Link
                  key={item}
                  href="#"
                  className="text-sm text-muted transition-colors hover:text-foreground"
                >
                  {item}
                </Link>
              ))}
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 md:flex-row">
          <Text size={200} className="text-muted">
            © 2026 Planty. All rights reserved.
          </Text>
          <div className="flex gap-6">
            {["Twitter", "GitHub", "Instagram"].map((social) => (
              <Link
                key={social}
                href="#"
                className="text-sm text-muted transition-colors hover:text-foreground"
              >
                {social}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
