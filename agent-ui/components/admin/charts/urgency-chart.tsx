"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

const ORDER = ["URGENT", "HIGH", "MEDIUM", "LOW"];
const COLORS: Record<string, string> = {
  URGENT: "var(--color-destructive)",
  HIGH: "var(--chart-5)",
  MEDIUM: "var(--chart-4)",
  LOW: "var(--chart-2)",
};

interface DataPoint {
  urgency: string;
  count: number;
}

export function UrgencyChart({ data }: { data: DataPoint[] }) {
  const sorted = ORDER.map((u) => {
    const found = data.find((d) => d.urgency === u);
    return { name: u, count: found?.count || 0 };
  });

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={sorted} layout="vertical" margin={{ top: 4, right: 20, left: 10, bottom: 4 }}>
        <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} />
        <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} width={65} tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} />
        <Tooltip
          contentStyle={{
            background: "var(--color-card)",
            border: "1px solid var(--color-border)",
            borderRadius: "8px",
            fontSize: "12px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
          }}
        />
        <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={20} animationDuration={800} name="Calls">
          {sorted.map((entry, i) => (
            <Cell key={i} fill={COLORS[entry.name] || "var(--chart-1)"} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
