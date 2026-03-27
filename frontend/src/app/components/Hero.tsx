"use client";

import { Button, Text, Title1, Subtitle1 } from "@fluentui/react-components";
import { motion } from "framer-motion";
import Image from "next/image";
import healthyPlant from "../../../public/Images/healthyPlant.png";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-surface">
      <div className="mx-auto grid max-w-6xl gap-12 px-6 py-24 md:grid-cols-2 md:items-center md:py-32">
        {/* Copy */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="flex flex-col gap-6"
        >
          <div className="flex items-center gap-2 rounded-full bg-accent-light px-4 py-1.5 w-fit">
            <span className="h-2 w-2 rounded-full bg-accent animate-pulse" />
            <Text size={200} weight="semibold" className="text-accent">
              Smart Plant Care
            </Text>
          </div>

          <Title1 className="text-foreground leading-tight! text-4xl! md:text-5xl! font-bold! tracking-tight!">
            Your Plants Deserve{" "}
            <span className="text-accent">Intelligence</span>
          </Title1>

          <Subtitle1 className="text-muted leading-relaxed! font-normal! max-w-lg">
            Planty is an intelligent pot that monitors soil moisture, light, and
            temperature — so your plants thrive while you live your life.
          </Subtitle1>

          <div className="flex items-center gap-4 pt-2">
            <Button appearance="primary" size="large" className="rounded-full!">
              Get Planty
            </Button>
            <Button appearance="outline" size="large" className="rounded-full!">
              Learn More
            </Button>
          </div>

          <div className="flex items-center gap-6 pt-4">
            {[
              { value: "10K+", label: "Happy Plants" },
              { value: "98%", label: "Survival Rate" },
              { value: "4.9★", label: "User Rating" },
            ].map((stat) => (
              <div key={stat.label} className="flex flex-col">
                <Text weight="bold" size={500} className="text-foreground">
                  {stat.value}
                </Text>
                <Text size={200} className="text-muted">
                  {stat.label}
                </Text>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Image placeholder */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.2 }}
          className="flex items-center justify-center"
        >
          <Image
            src={healthyPlant}
            alt="Healthy plant in a Planty pot"
            width={500}
            height={500}
            className="object-contain w-full max-w-md rounded-3xl"
            priority
          />
        </motion.div>
      </div>

      {/* Subtle gradient blob */}
      <div
        className="pointer-events-none absolute -top-32 right-0 h-[500px] w-[500px] rounded-full opacity-20 blur-3xl"
        style={{ background: "radial-gradient(circle, #22c55e 0%, transparent 70%)" }}
      />
    </section>
  );
}
