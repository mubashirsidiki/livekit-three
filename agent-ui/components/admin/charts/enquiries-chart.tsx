"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const LABELS: Record<string, string> = {
  PERSONAL_INJURY: "Personal Injury",
  FAMILY_LAW: "Family Law",
  CRIMINAL_DEFENSE: "Criminal",
  EMPLOYMENT_LAW: "Employment",
  REAL_ESTATE: "Real Estate",
  CORPORATE: "Corporate",
  IMMIGRATION: "Immigration",
  ESTATE_PLANNING: "Estate Planning",
  OTHER: "Other",
};

interface DataPoint {
  case_type: string;
  count: number;
}

export function EnquiriesChart({ data }: { data: DataPoint[] }) {
  const formatted = data.map((d) => ({
    name: LABELS[d.case_type] || d.case_type,
    enquiries: d.count,
  }));

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={formatted} margin={{ top: 4, right: 4, left: -20, bottom: 40 }}>
        <XAxis
          dataKey="name"
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }}
          angle={-35}
          textAnchor="end"
          interval={0}
          height={60}
        />
        <YAxis axisLine={false} tickLine={false} width={28} tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} />
        <Tooltip
          contentStyle={{
            background: "var(--color-card)",
            border: "1px solid var(--color-border)",
            borderRadius: "8px",
            fontSize: "12px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
          }}
        />
        <Bar dataKey="enquiries" fill="var(--chart-1)" radius={[4, 4, 0, 0]} barSize={32} animationDuration={800} />
      </BarChart>
    </ResponsiveContainer>
  );
}
