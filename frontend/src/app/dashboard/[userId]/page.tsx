import type { Metadata } from "next";
import PlantsOverviewClient from "./PlantsOverviewClient";

export const metadata: Metadata = {
  title: "My Plants | Planty",
  description: "Overview of all your Planty pots.",
};

export default function PlantsOverviewPage({ params }: { params: Promise<{ userId: string }> }) {
  return <PlantsOverviewClient params={params} />;
}
