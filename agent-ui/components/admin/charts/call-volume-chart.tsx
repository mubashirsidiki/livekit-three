"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface DataPoint {
  date: string;
  calls: number;
  genuine: number;
  spam: number;
  urgent: number;
}

export function CallVolumeChart({ data }: { data: DataPoint[] }) {
  const formatted = data.map((d) => ({
    ...d,
    label: new Date(d.date + "T00:00:00").toLocaleDateString("en-US", { weekday: "short", day: "numeric" }),
  }));

  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={formatted} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="gradGenuine" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.3} />
            <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0.02} />
          </linearGradient>
          <linearGradient id="gradSpam" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--chart-3)" stopOpacity={0.2} />
            <stop offset="95%" stopColor="var(--chart-3)" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" opacity={0.4} />
        <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} />
        <YAxis axisLine={false} tickLine={false} width={28} tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} />
        <Tooltip
          contentStyle={{
            background: "var(--color-card)",
            border: "1px solid var(--color-border)",
            borderRadius: "8px",
            fontSize: "12px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
          }}
          labelStyle={{ color: "var(--color-foreground)", fontWeight: 600 }}
        />
        <Area type="monotone" dataKey="genuine" stroke="var(--chart-1)" fill="url(#gradGenuine)" strokeWidth={2} name="Genuine" animationDuration={800} />
        <Area type="monotone" dataKey="spam" stroke="var(--chart-3)" fill="url(#gradSpam)" strokeWidth={1.5} name="Spam" animationDuration={800} animationBegin={200} />
      </AreaChart>
    </ResponsiveContainer>
  );
}
