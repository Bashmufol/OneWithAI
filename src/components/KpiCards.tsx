// KpiCards.tsx
// The 4 big number boxes at the top of the dashboard.
// Numbers are calculated from the live stations array passed in.

import type { Station } from "../data/mockStations";

interface Props {
  stations: Station[];
}

interface KpiCardProps {
  label: string;
  value: string | number;
  sub: string;
  icon: string;
  accent: string; // Tailwind border-color class
}

function KpiCard({ label, value, sub, icon, accent }: KpiCardProps) {
  return (
    <div
      className={`relative bg-zinc-900/70 border ${accent} rounded-2xl p-5 backdrop-blur-sm overflow-hidden group hover:bg-zinc-800/70 transition-colors duration-300`}
    >
      {/* Subtle glow top-right */}
      <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full opacity-10 blur-2xl bg-current" />

      <div className="flex items-start justify-between">
        <span className="text-2xl">{icon}</span>
        <span className="text-xs text-zinc-500 font-mono uppercase tracking-widest">{sub}</span>
      </div>

      <p className="mt-3 text-4xl font-black text-white tracking-tight leading-none">
        {value}
      </p>
      <p className="mt-1 text-sm text-zinc-400">{label}</p>
    </div>
  );
}

export function KpiCards({ stations }: Props) {
  const total = stations.length;
  const available = stations.filter((s) => s.status === "available").length;
  const busy = stations.filter((s) => s.status === "busy").length;
  const offline = stations.filter((s) => s.status === "offline").length;

  // Average utilization only across non-offline stations
  const activeStations = stations.filter((s) => s.status !== "offline");
  const avg_utilization_pct =
    activeStations.length > 0
      ? Math.round(
          activeStations.reduce((sum, s) => sum + s.utilization, 0) /
            activeStations.length
        )
      : 0;

  // Average wait time across busy stations
  const busyStations = stations.filter((s) => s.status === "busy");
  const avg_wait_min =
    busyStations.length > 0
      ? Math.round(
          busyStations.reduce((sum, s) => sum + s.wait_time, 0) /
            busyStations.length
        )
      : 0;

  const cards: KpiCardProps[] = [
    {
      label: "Total Stations",
      value: total,
      sub: "Network",
      icon: "🔌",
      accent: "border-zinc-700/60",
    },
    {
      label: "Available Now",
      value: available,
      sub: `${offline} offline`,
      icon: "✅",
      accent: "border-emerald-800/60",
    },
    {
      label: "Avg. Utilization",
      value: `${avg_utilization_pct}%`,
      sub: `${busy} busy`,
      icon: "📊",
      accent: "border-amber-800/60",
    },
    {
      label: "Avg. Wait Time",
      value: `${avg_wait_min} min`,
      sub: "busy stations",
      icon: "⏱",
      accent: "border-cyan-800/60",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <KpiCard key={card.label} {...card} />
      ))}
    </div>
  );
}
