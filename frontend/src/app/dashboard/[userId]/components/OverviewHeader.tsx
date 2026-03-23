"use client";

import { Text, Button, Badge } from "@fluentui/react-components";
import {
  ArrowLeftRegular,
  AddRegular,
  PersonRegular,
} from "@fluentui/react-icons";
import Image from "next/image";
import Link from "next/link";

interface OverviewHeaderProps {
  userName: string;
  plantCount: number;
  onAddPlant: () => void;
}

export default function OverviewHeader({ userName, plantCount, onAddPlant }: OverviewHeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface/80 backdrop-blur-lg">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-1 text-sm text-muted transition-colors hover:text-foreground"
          >
            <ArrowLeftRegular className="text-base" />
            <span className="hidden sm:inline">Home</span>
          </Link>

          <div className="h-5 w-px bg-border" />

          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/Images/logoPlanty.png"
              alt="Planty logo"
              width={28}
              height={28}
              className="object-contain"
            />
            <Text weight="bold" size={400}>
              Planty
            </Text>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <Badge appearance="tint" color="success" size="medium">
            {plantCount} {plantCount === 1 ? "plant" : "plants"}
          </Badge>

          <Button
            appearance="primary"
            size="small"
            icon={<AddRegular />}
            onClick={onAddPlant}
            className="rounded-full!"
          >
            <span className="hidden sm:inline">Add Plant</span>
          </Button>

          <div className="hidden items-center gap-2 border-l border-border pl-3 md:flex">
            <PersonRegular className="text-base text-muted" />
            <Text size={300} className="text-muted">
              {userName}
            </Text>
          </div>
        </div>
      </div>
    </header>
  );
}
