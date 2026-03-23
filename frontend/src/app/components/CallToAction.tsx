"use client";

import { Button, Text } from "@fluentui/react-components";
import { motion } from "framer-motion";

export default function CallToAction() {
  return (
    <section id="cta" className="bg-background py-24">
      <div className="mx-auto max-w-6xl px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative overflow-hidden rounded-3xl bg-accent px-8 py-16 text-center md:px-16 md:py-20"
        >
          {/* Decorative circles */}
          <div className="pointer-events-none absolute -left-16 -top-16 h-64 w-64 rounded-full bg-white/10" />
          <div className="pointer-events-none absolute -bottom-20 -right-20 h-80 w-80 rounded-full bg-white/10" />

          <div className="relative z-10 flex flex-col items-center gap-6">
            <Text size={600} weight="bold" className="text-white text-3xl! md:text-4xl!">
              Ready to Keep Your Plants Alive?
            </Text>
            <Text size={400} className="text-white/80 max-w-md">
              Join thousands of plant parents who trust Planty to do the
              monitoring, so they can enjoy the greenery.
            </Text>
            <div className="flex items-center gap-4 pt-2">
              <Button
                appearance="primary"
                size="large"
                className="rounded-full! bg-white! text-accent! hover:bg-white/90!"
              >
                Pre-Order — $59
              </Button>
              <Button
                appearance="outline"
                size="large"
                className="rounded-full! border-white! text-white! hover:bg-white/10!"
              >
                View Demo
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
