"use client";

import { Text } from "@fluentui/react-components";
import { motion } from "framer-motion";

const steps = [
  {
    step: "01",
    title: "Place Your Plant",
    description: "Drop any houseplant into the Planty pot — it fits most standard sizes.",
    placeholder: "Step 1 illustration",
  },
  {
    step: "02",
    title: "Connect the App",
    description: "Pair with the Planty app via Bluetooth. Setup takes less than 60 seconds.",
    placeholder: "Step 2 illustration",
  },
  {
    step: "03",
    title: "Relax & Monitor",
    description: "Get real-time insights and smart alerts. Your plant practically cares for itself.",
    placeholder: "Step 3 illustration",
  },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.2 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
};

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-surface py-24">
      <div className="mx-auto max-w-6xl px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="mb-16 flex flex-col items-center text-center"
        >
          <div className="section-divider mb-4" />
          <Text size={600} weight="bold" className="text-foreground mb-3 text-3xl!">
            How It Works
          </Text>
          <Text size={400} className="text-muted max-w-lg">
            Three simple steps to smarter plant care.
          </Text>
        </motion.div>

        {/* Steps */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid gap-12 md:grid-cols-3"
        >
          {steps.map((s) => (
            <motion.div
              key={s.step}
              variants={itemVariants}
              className="flex flex-col items-center text-center"
            >
              <div className="image-placeholder mb-6 aspect-square w-48">
                <div className="flex flex-col items-center gap-2">
                  <span className="text-2xl">🖼️</span>
                  <span>{s.placeholder}</span>
                </div>
              </div>

              <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-accent text-sm font-bold text-white">
                {s.step}
              </div>

              <Text weight="semibold" size={400} className="mb-1 text-foreground">
                {s.title}
              </Text>
              <Text size={300} className="text-muted max-w-xs">
                {s.description}
              </Text>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
