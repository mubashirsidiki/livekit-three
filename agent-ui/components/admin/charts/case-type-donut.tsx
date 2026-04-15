"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)", "var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)"];

const LABELS: Record<string, string> = {
  PERSONAL_INJURY: "Personal Injury",
  FAMILY_LAW: "Family Law",
  CRIMINAL_DEFENSE: "Criminal Defense",
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

export function CaseTypeDonut({ data }: { data: DataPoint[] }) {
  const total = data.reduce((s, d) => s + d.count, 0);
  const formatted = data.map((d) => ({ name: LABELS[d.case_type] || d.case_type, value: d.count }));

  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={formatted}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={2}
            stroke="var(--color-card)"
            strokeWidth={2}
            dataKey="value"
            animationDuration={800}
          >
            {formatted.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              background: "var(--color-card)",
              border: "1px solid var(--color-border)",
              borderRadius: "8px",
              fontSize: "12px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
            }}
          />
        </PieChart>
      </ResponsiveContainer>
      {/* Center label */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <p className="text-2xl font-bold text-[var(--color-foreground)]">{total}</p>
          <p className="text-[10px] text-[var(--color-muted-foreground)]">Total Cases</p>
        </div>
      </div>
    </div>
  );
}
