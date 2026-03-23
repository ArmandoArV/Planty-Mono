"use client";

import { Card, CardHeader, Text } from "@fluentui/react-components";
import { motion } from "framer-motion";

const features = [
  {
    icon: "💧",
    title: "Soil Moisture Tracking",
    description:
      "Real-time moisture sensors alert you when your plant needs water — no more guessing.",
    placeholder: "Moisture dashboard image",
  },
  {
    icon: "☀️",
    title: "Light Monitoring",
    description:
      "Know exactly how much sunlight your plant receives and get repositioning suggestions.",
    placeholder: "Light chart image",
  },
  {
    icon: "🌡️",
    title: "Temperature Alerts",
    description:
      "Instant notifications if conditions are too hot or cold for your specific plant species.",
    placeholder: "Temperature alert image",
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
                  <div className="image-placeholder aspect-video w-full">
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-2xl">🖼️</span>
                      <span>{f.placeholder}</span>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
