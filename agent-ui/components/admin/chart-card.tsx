"use client";

import { ReactNode } from "react";
import { motion } from "motion/react";

interface ChartCardProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  delay?: number;
}

export function ChartCard({ title, subtitle, children, delay = 0 }: ChartCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
      className="rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] p-6"
    >
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[var(--color-foreground)]">{title}</h3>
        {subtitle && <span className="text-xs text-[var(--color-muted-foreground)]">{subtitle}</span>}
      </div>
      {children}
    </motion.div>
  );
}
