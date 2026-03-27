"use client";

import { Card, CardHeader, Text } from "@fluentui/react-components";
import { motion } from "framer-motion";
import Image, { StaticImageData } from "next/image";
import healthyPlant from "../../../public/Images/healthyPlant.png";
import notHealthyPlant from "../../../public/Images/notHealthyPlant.png";

const features: { icon: string; title: string; description: string; image: StaticImageData; alt: string }[] = [
  {
    icon: "💧",
    title: "Soil Moisture Tracking",
    description:
      "Real-time moisture sensors alert you when your plant needs water — no more guessing.",
    image: healthyPlant,
    alt: "Healthy plant with optimal moisture",
  },
  {
    icon: "☀️",
    title: "Light Monitoring",
    description:
      "Know exactly how much sunlight your plant receives and get repositioning suggestions.",
    image: notHealthyPlant,
    alt: "Plant needing more light",
  },
  {
    icon: "🌡️",
    title: "Temperature Alerts",
    description:
      "Instant notifications if conditions are too hot or cold for your specific plant species.",
    image: healthyPlant,
    alt: "Plant thriving at ideal temperature",
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.15 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
};

export default function Features() {
  return (
    <section id="features" className="bg-background py-24">
      <div className="mx-auto max-w-6xl px-6">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="mb-16 flex flex-col items-center text-center"
        >
          <div className="section-divider mb-4" />
          <Text size={600} weight="bold" className="text-foreground mb-3 text-3xl!">
            Everything Your Plant Needs
          </Text>
          <Text size={400} className="text-muted max-w-lg">
            Planty combines precision sensors with intelligent software to keep
            your plants healthy, effortlessly.
          </Text>
        </motion.div>

        {/* Feature cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid gap-8 md:grid-cols-3"
        >
          {features.map((f) => (
            <motion.div key={f.title} variants={cardVariants}>
              <Card className="h-full border border-border bg-surface p-6 shadow-sm transition-shadow hover:shadow-md">
                <CardHeader
                  image={<span className="text-3xl">{f.icon}</span>}
                  header={
                    <Text weight="semibold" size={400}>
                      {f.title}
                    </Text>
                  }
                  description={
                    <Text size={300} className="text-muted">
                      {f.description}
                    </Text>
                  }
                />
                <div className="mt-4">
                  <Image
                    src={f.image}
                    alt={f.alt}
                    width={400}
                    height={225}
                    className="w-full aspect-video object-contain rounded-xl"
                  />
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
