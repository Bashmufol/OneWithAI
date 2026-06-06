// Dashboard.tsx
// The main page. Puts all components together in the correct order.

import { useStations } from "../hooks/useStations";
import { GridAlertBanner } from "../components/GridAlertBanner";
import { KpiCards } from "../components/KpiCards";
import { StationTable } from "../components/StationTable";
import { StatusDonut, OperatorBreakdown, PeakHoursChart, DemandChart } from "../components/Charts";

// Skeleton loader — shows while data is being fetched
function Skeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="grid grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-28 bg-zinc-800 rounded-2xl" />
        ))}
      </div>
      <div className="h-64 bg-zinc-800 rounded-2xl" />
      <div className="grid grid-cols-2 gap-4">
        <div className="h-64 bg-zinc-800 rounded-2xl" />
        <div className="h-64 bg-zinc-800 rounded-2xl" />
      </div>
    </div>
  );
}

export function Dashboard() {
  const { stations, loading, error } = useStations();

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* ── Top navigation bar ── */}
      <header className="border-b border-zinc-800/80 bg-zinc-950/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-screen-2xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Logo */}
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-violet-600 flex items-center justify-center text-white font-black text-sm">
              E
            </div>
            <div>
              <span className="font-black text-white tracking-tight text-lg">EvoCharge</span>
              <span className="ml-2 text-xs text-zinc-500 font-mono uppercase tracking-widest">
                Operator Dashboard
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Live indicator */}
            <div className="flex items-center gap-2 text-xs text-zinc-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Live
            </div>

            {/* TODO: Hook this up to a real auth system
                     Right now it just shows a label.
                     When Bashir sets up Cognito or any auth, replace this
                     with a real user session display + logout button. */}
            <div className="text-xs text-zinc-500 bg-zinc-800 px-3 py-1.5 rounded-full border border-zinc-700">
              Operator View
            </div>
          </div>
        </div>
      </header>

      {/* ── Main content ── */}
      <main className="max-w-screen-2xl mx-auto px-6 py-8 space-y-8">

        {/* Page title */}
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Network Intelligence
          </h1>
          <p className="text-zinc-500 text-sm mt-1">
            Lagos EV Charging Infrastructure — Real-time Overview
          </p>
        </div>

        {/* 🔴 Grid Alert Banner — ALWAYS at the very top */}
        <GridAlertBanner />

        {loading ? (
          <Skeleton />
        ) : error ? (
          <div className="text-center py-24 text-red-400">
            <p className="text-5xl mb-4">⚠️</p>
            <p className="font-semibold text-lg">Could not load station data</p>
            <p className="text-sm text-zinc-500 mt-1">{error}</p>
            {/* TODO: Add retry button that calls refetch() from useStations */}
          </div>
        ) : (
          <>
            {/* ── KPI cards ── */}
            <KpiCards stations={stations} />

            {/* ── Top 3 charts row ── */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <StatusDonut stations={stations} />
              <OperatorBreakdown stations={stations} />
              <PeakHoursChart />
            </div>

            {/* ── Demand chart (full width) ── */}
            <DemandChart />

            {/* ── Station table (full width) ── */}
            <StationTable stations={stations} />

            {/* ── Investment summary footer ── */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-xs text-zinc-500 uppercase tracking-widest font-semibold mb-1">
                  Platform
                </p>
                <p className="text-white font-bold">EvoCharge Beta</p>
                <p className="text-zinc-500 text-sm">ONE WITH AI Hackathon</p>
              </div>
              <div>
                <p className="text-xs text-zinc-500 uppercase tracking-widest font-semibold mb-1">
                  Coverage
                </p>
                <p className="text-white font-bold">Lagos State</p>
                <p className="text-zinc-500 text-sm">
                  {stations.length} stations · 3 operators
                </p>
              </div>
              <div>
                <p className="text-xs text-zinc-500 uppercase tracking-widest font-semibold mb-1">
                  Data
                </p>
                {/* TODO: Replace "Mock Data" with "Live" once API is connected */}
                <p className="text-amber-400 font-bold">⚠ Mock Data</p>
                <p className="text-zinc-500 text-sm">
                  Connect backend to go live
                </p>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
