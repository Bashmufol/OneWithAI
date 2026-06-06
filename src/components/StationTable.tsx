// StationTable.tsx
// Table of all charging stations with live status and power source badges.
// Includes search and filter controls.

import { useState } from "react";
import type { Station, StationStatus, PowerSource } from "../data/mockStations";

interface Props {
  stations: Station[];
}

// ── Helper: Status Badge ────────────────────────────────────
function StatusBadge({ status }: { status: StationStatus }) {
  const map: Record<StationStatus, { label: string; cls: string }> = {
    available: { label: "Available", cls: "bg-emerald-900/60 text-emerald-300 border border-emerald-700/50" },
    busy:      { label: "Busy",      cls: "bg-amber-900/60  text-amber-300  border border-amber-700/50"  },
    offline:   { label: "Offline",   cls: "bg-red-900/60    text-red-300    border border-red-700/50"    },
  };
  const { label, cls } = map[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cls}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {label}
    </span>
  );
}

// ── Helper: Power Source Badge (Nigeria-specific) ───────────
// 🟢 Grid (NEPA/DisCo) | 🟡 Solar | 🔴 Generator (Diesel)
function PowerBadge({ source }: { source: PowerSource }) {
  const map: Record<PowerSource, { label: string; emoji: string; cls: string }> = {
    grid:      { label: "Grid (NEPA)",  emoji: "🟢", cls: "bg-green-900/40  text-green-300  border border-green-800/40"  },
    solar:     { label: "Solar",        emoji: "🟡", cls: "bg-yellow-900/40 text-yellow-300 border border-yellow-800/40" },
    generator: { label: "Generator",    emoji: "🔴", cls: "bg-red-900/40    text-red-300    border border-red-800/40"    },
  };
  const { label, emoji, cls } = map[source];
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium ${cls}`}>
      {emoji} {label}
    </span>
  );
}

// ── Main Component ──────────────────────────────────────────
export function StationTable({ stations }: Props) {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<StationStatus | "all">("all");
  const [filterOperator, setFilterOperator] = useState("all");
  const [filterPower, setFilterPower] = useState<PowerSource | "all">("all");

  // Build unique operator list from data
  // TODO: Could also fetch from GET /api/v1/operators once backend is live
  const operators = ["all", ...Array.from(new Set(stations.map((s) => s.operator)))];

  const filtered = stations.filter((s) => {
    const matchSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.area.toLowerCase().includes(search.toLowerCase()) ||
      s.lga.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || s.status === filterStatus;
    const matchOp = filterOperator === "all" || s.operator === filterOperator;
    const matchPower = filterPower === "all" || s.power_source === filterPower;
    return matchSearch && matchStatus && matchOp && matchPower;
  });

  return (
    <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl overflow-hidden backdrop-blur-sm">
      {/* Table header / filters */}
      <div className="p-4 border-b border-zinc-800 flex flex-wrap gap-3 items-center">
        <h2 className="text-white font-bold text-base flex-1 min-w-[120px]">
          Station Network
          <span className="ml-2 text-zinc-500 font-normal text-sm">({filtered.length})</span>
        </h2>

        {/* Search */}
        <input
          type="text"
          placeholder="Search station or area…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-600 w-48"
        />

        {/* Status filter */}
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as StationStatus | "all")}
          className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-cyan-600"
        >
          <option value="all">All Statuses</option>
          <option value="available">Available</option>
          <option value="busy">Busy</option>
          <option value="offline">Offline</option>
        </select>

        {/* Operator filter */}
        <select
          value={filterOperator}
          onChange={(e) => setFilterOperator(e.target.value)}
          className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-cyan-600"
        >
          {operators.map((op) => (
            <option key={op} value={op}>
              {op === "all" ? "All Operators" : op}
            </option>
          ))}
        </select>

        {/* Power source filter */}
        <select
          value={filterPower}
          onChange={(e) => setFilterPower(e.target.value as PowerSource | "all")}
          className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-cyan-600"
        >
          <option value="all">All Power Sources</option>
          <option value="grid">🟢 Grid (NEPA)</option>
          <option value="solar">🟡 Solar</option>
          <option value="generator">🔴 Generator</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-800 text-zinc-500 text-xs uppercase tracking-wider">
              <th className="text-left px-4 py-3">Station</th>
              <th className="text-left px-4 py-3">Area / LGA</th>
              <th className="text-left px-4 py-3">Operator</th>
              <th className="text-left px-4 py-3">Status</th>
              <th className="text-left px-4 py-3">Power Source</th>
              <th className="text-left px-4 py-3">Power</th>
              <th className="text-left px-4 py-3">Utilization</th>
              <th className="text-left px-4 py-3">Wait</th>
              <th className="text-left px-4 py-3">Updated</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={9} className="text-center py-12 text-zinc-500">
                  No stations match your filters.
                </td>
              </tr>
            ) : (
              filtered.map((station, i) => (
                <tr
                  key={station.id}
                  className={`border-b border-zinc-800/50 hover:bg-zinc-800/40 transition-colors ${
                    i % 2 === 0 ? "bg-transparent" : "bg-zinc-900/30"
                  }`}
                >
                  <td className="px-4 py-3 font-medium text-white">{station.name}</td>
                  <td className="px-4 py-3 text-zinc-400">
                    {station.area}
                    <span className="text-zinc-600 text-xs ml-1">/ {station.lga}</span>
                  </td>
                  <td className="px-4 py-3 text-zinc-300">{station.operator}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={station.status} />
                  </td>
                  <td className="px-4 py-3">
                    {/* Nigeria power source badge — unique differentiator */}
                    <PowerBadge source={station.power_source} />
                  </td>
                  <td className="px-4 py-3 text-zinc-400 font-mono">{station.power_kw} kW</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-zinc-700 rounded-full h-1.5">
                        <div
                          className={`h-1.5 rounded-full ${
                            station.utilization > 80
                              ? "bg-red-400"
                              : station.utilization > 50
                              ? "bg-amber-400"
                              : "bg-emerald-400"
                          }`}
                          style={{ width: `${station.utilization}%` }}
                        />
                      </div>
                      <span className="text-zinc-400 text-xs font-mono">{station.utilization}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-zinc-400 text-xs font-mono">
                    {station.status === "busy" ? `${station.wait_time} min` : "—"}
                  </td>
                  <td className="px-4 py-3 text-zinc-500 text-xs">{station.lastUpdated}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
