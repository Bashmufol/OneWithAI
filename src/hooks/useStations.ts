// ============================================================
// useStations.ts — Data fetching hook
// ============================================================
// RIGHT NOW: Returns mock data immediately.
//
// WHEN BACKEND IS READY (Abdulroheem):
//   1. Set VITE_API_URL in your .env file:
//        VITE_API_URL=http://your-ecs-alb-url.amazonaws.com
//   2. Change `USE_MOCK_DATA` below from `true` to `false`
//   3. That's it! Everything else stays the same.
// ============================================================

import { useState, useEffect } from "react";
import { MOCK_STATIONS } from "../data/mockStations";
import type { Station } from "../data/mockStations";

// ↓ CHANGE THIS to false when Abdulroheem's API is ready
const USE_MOCK_DATA = true;

// ↓ This reads from your .env file: VITE_API_URL=http://...
//   Never hardcode a URL here!
const API_BASE = import.meta.env.VITE_API_URL ?? "";

export function useStations() {
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (USE_MOCK_DATA) {
      // Fake a small loading delay so the skeleton shows nicely
      setTimeout(() => {
        setStations(MOCK_STATIONS);
        setLoading(false);
      }, 800);
      return;
    }

    // ── REAL API CALL (uncomment when backend is ready) ────
    fetch(`${API_BASE}/api/v1/stations`)
      .then((res) => {
        if (!res.ok) throw new Error(`API error: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        setStations(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return { stations, loading, error };
}
