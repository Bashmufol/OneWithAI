// GridAlertBanner.tsx
// Shows a red warning banner when a neighbourhood grid goes down.
// TODO: Replace GRID_ALERTS import with live SSE data from
//       GET /api/v1/events/stream once Abdulroheem's backend is ready.

import { useState } from "react";
import { GRID_ALERTS } from "../data/mockStations";

export function GridAlertBanner() {
  const [dismissed, setDismissed] = useState<string[]>([]);

  const visible = GRID_ALERTS.filter((a) => !dismissed.includes(a.id));
  if (visible.length === 0) return null;

  return (
    <div className="space-y-2 mb-6">
      {visible.map((alert) => (
        <div
          key={alert.id}
          className="flex items-start gap-3 bg-red-950/80 border border-red-500/60 rounded-xl px-4 py-3 backdrop-blur-sm animate-pulse-slow"
        >
          {/* Warning icon */}
          <span className="text-red-400 text-xl mt-0.5 shrink-0">⚡</span>

          <div className="flex-1 min-w-0">
            <p className="text-red-300 font-semibold text-sm tracking-wide uppercase">
              Grid Alert — {alert.area}
            </p>
            <p className="text-red-100 text-sm mt-0.5">
              {alert.message}
            </p>
          </div>

          {/* Dismiss button */}
          <button
            onClick={() => setDismissed((d) => [...d, alert.id])}
            className="text-red-400 hover:text-red-200 transition-colors text-lg leading-none shrink-0 mt-0.5"
            aria-label="Dismiss alert"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
