"use client";

import { motion } from "framer-motion";
import Button from "@/components/ui/button";

export default function Home() {
  return (
    <main style={{ maxWidth: 1100, margin: "0 auto", padding: "80px 20px" }}>

      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 style={{ fontSize: 56, fontWeight: 800 }}>
          Китайский язык онлайн
        </h1>

        <p style={{ color: "#666", marginTop: 16 }}>
          Обучение для детей, подростков и взрослых с HSK преподавателями
        </p>

        <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
          <Button>Записаться</Button>
          <Button variant="secondary">Курсы</Button>
        </div>
      </motion.section>

    </main>
  );
}
