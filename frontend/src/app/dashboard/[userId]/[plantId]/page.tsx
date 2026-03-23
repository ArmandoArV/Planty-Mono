import type { Metadata } from "next";
import PlantDetailClient from "./PlantDetailClient";

export const metadata: Metadata = {
  title: "Plant Details | Planty",
  description: "Detailed sensor monitoring for your Planty pot.",
};

export default function PlantDetailPage({ params }: { params: Promise<{ userId: string; plantId: string }> }) {
  return <PlantDetailClient params={params} />;
}
