"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";

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
  total: number;
  high_qual: number;
}

export function ConversionChart({ data }: { data: DataPoint[] }) {
  const formatted = data.map((d) => ({
    name: LABELS[d.case_type] || d.case_type,
    "All Leads": d.total,
    "High Quality": d.high_qual,
  }));

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={formatted} layout="vertical" margin={{ top: 4, right: 20, left: 20, bottom: 4 }}>
        <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} />
        <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} width={100} tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }} />
        <Tooltip
          contentStyle={{
            background: "var(--color-card)",
            border: "1px solid var(--color-border)",
            borderRadius: "8px",
            fontSize: "12px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
          }}
        />
        <Legend wrapperStyle={{ fontSize: "11px" }} />
        <Bar dataKey="All Leads" fill="var(--chart-2)" opacity={0.5} radius={[0, 4, 4, 0]} barSize={14} animationDuration={800} />
        <Bar dataKey="High Quality" fill="var(--chart-1)" radius={[0, 4, 4, 0]} barSize={14} animationDuration={800} animationBegin={200} />
      </BarChart>
    </ResponsiveContainer>
  );
}
