// Charts.tsx
// All chart components in one file for speed during hackathon.
// Uses Recharts — install with: npm install recharts

import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  BarChart, Bar,
} from "recharts";
import type { Station } from "../data/mockStations";
import { PEAK_HOURS_DATA, DEMAND_BY_AREA } from "../data/mockStations";

// TODO: Replace PEAK_HOURS_DATA and DEMAND_BY_AREA with real API response
// from GET /api/v1/analytics/summary once Abdulroheem's backend is ready.

interface Props {
  stations: Station[];
}

// ── 1. Status Donut Chart ───────────────────────────────────
export function StatusDonut({ stations }: Props) {
  const available = stations.filter((s) => s.status === "available").length;
  const busy      = stations.filter((s) => s.status === "busy").length;
  const offline   = stations.filter((s) => s.status === "offline").length;

  const data = [
    { name: "Available", value: available, color: "#34d399" },
    { name: "Busy",      value: busy,      color: "#fbbf24" },
    { name: "Offline",   value: offline,   color: "#f87171" },
  ];

  return (
    <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 backdrop-blur-sm">
      <h3 className="text-white font-bold mb-4">Station Status</h3>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={3}
            dataKey="value"
          >
            {data.map((entry) => (
              <Cell key={entry.name} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ background: "#18181b", border: "1px solid #3f3f46", borderRadius: 8 }}
            labelStyle={{ color: "#fff" }}
            itemStyle={{ color: "#a1a1aa" }}
          />
          <Legend
            iconType="circle"
            wrapperStyle={{ fontSize: 12, color: "#a1a1aa" }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

// ── 2. Operator Breakdown Bar Chart ────────────────────────
export function OperatorBreakdown({ stations }: Props) {
  // Count stations per operator
  const countMap: Record<string, number> = {};
  stations.forEach((s) => {
    countMap[s.operator] = (countMap[s.operator] ?? 0) + 1;
  });
  const data = Object.entries(countMap).map(([name, count]) => ({ name, count }));

  return (
    <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 backdrop-blur-sm">
      <h3 className="text-white font-bold mb-4">Stations per Operator</h3>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} barSize={36}>
          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
          <XAxis dataKey="name" tick={{ fill: "#a1a1aa", fontSize: 12 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: "#a1a1aa", fontSize: 12 }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{ background: "#18181b", border: "1px solid #3f3f46", borderRadius: 8 }}
            labelStyle={{ color: "#fff" }}
            itemStyle={{ color: "#a1a1aa" }}
          />
          <Bar dataKey="count" fill="#22d3ee" radius={[6, 6, 0, 0]} name="Stations" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ── 3. Peak Hours Line Chart ────────────────────────────────
export function PeakHoursChart() {
  return (
    <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 backdrop-blur-sm">
      <h3 className="text-white font-bold mb-4">Peak Usage Hours (Today)</h3>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={PEAK_HOURS_DATA}>
          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
          <XAxis dataKey="hour" tick={{ fill: "#a1a1aa", fontSize: 11 }} axisLine={false} tickLine={false} interval={2} />
          <YAxis tick={{ fill: "#a1a1aa", fontSize: 11 }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{ background: "#18181b", border: "1px solid #3f3f46", borderRadius: 8 }}
            labelStyle={{ color: "#fff" }}
            itemStyle={{ color: "#a1a1aa" }}
          />
          <Line
            type="monotone"
            dataKey="sessions"
            stroke="#a78bfa"
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 4, fill: "#a78bfa" }}
            name="Sessions"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

// ── 4. Demand vs Supply (Unmet Demand Panel) ────────────────
export function DemandChart() {
  // Highlight areas where demand > supply (unmet demand)
  return (
    <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-bold">Demand vs Supply by Area</h3>
        <span className="text-xs bg-orange-900/60 text-orange-300 border border-orange-800/50 rounded-full px-2.5 py-1">
          ⚠ Unmet Demand Areas
        </span>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={DEMAND_BY_AREA} barSize={18}>
          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
          <XAxis dataKey="area" tick={{ fill: "#a1a1aa", fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: "#a1a1aa", fontSize: 11 }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{ background: "#18181b", border: "1px solid #3f3f46", borderRadius: 8 }}
            labelStyle={{ color: "#fff" }}
            itemStyle={{ color: "#a1a1aa" }}
          />
          <Bar dataKey="demand" fill="#f87171" radius={[4, 4, 0, 0]} name="Demand Score" />
          <Bar dataKey="supply" fill="#22d3ee" radius={[4, 4, 0, 0]} name="Supply Score" />
        </BarChart>
      </ResponsiveContainer>

      {/* Written summary for investors / policymakers */}
      <div className="mt-4 p-3 bg-orange-950/40 border border-orange-900/40 rounded-xl">
        <p className="text-orange-300 text-xs font-semibold uppercase tracking-wide mb-1">
          Investment Insight
        </p>
        <p className="text-zinc-300 text-sm leading-relaxed">
          <strong className="text-white">Lekki</strong> and{" "}
          <strong className="text-white">Ajah</strong> have the highest unmet
          demand. These corridors serve high-income EV users with limited
          charging options — the best targets for new station investment in
          Q3 2025.
        </p>
        {/* TODO: Make this text dynamic from GET /api/v1/analytics/summary
                  once Abdulroheem adds an "investment_summary" field */}
      </div>
    </div>
  );
}
