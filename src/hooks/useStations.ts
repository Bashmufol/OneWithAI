// ============================================================
// useStations.ts — Data fetching hook
// ============================================================
/// <reference types="vite/client" />
// CONNECTED TO: Abdulroheem's Flask backend (Python)
// Backend base URL comes from .env → VITE_API_URL
//
// Example .env file:
//   VITE_API_URL=http://192.168.x.x:8000
//   (use Abdulroheem's actual WiFi IP address, not localhost)
// ============================================================

import { useState, useEffect } from "react";
import { MOCK_STATIONS } from "../data/mockStations";
import type { Station } from "../data/mockStations";

// ── Switch between mock and real data ──────────────────────
// Set to false to use Abdulroheem's real backend
const USE_MOCK_DATA = false;

// ── Backend URL from .env ───────────────────────────────────
// Set VITE_API_URL=http://<Abdulroheem's WiFi IP>:8000 in your .env file
const API_BASE = import.meta.env.VITE_API_URL ?? "http://10.34.236.123:8000";

// ── Map backend field names → frontend field names ──────────
// Abdulroheem's backend uses snake_case (power_kw, wait_time, etc.)
// Our frontend uses camelCase (powerKw, waitTimeMinutes, etc.)
// This function silently translates so neither side has to change.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapStation(raw: any): Station {
  return {
    id:               String(raw.id),
    name:             raw.name             ?? "Unknown Station",
    operator:         raw.operator         ?? "Unknown",
    area:             raw.area             ?? raw.name ?? "",   // backend has no "area" field — use name as fallback
    lga:              raw.lga              ?? "",               // backend has no "lga" — leave blank for now
    status:           raw.status           ?? "offline",
    power_source:      raw.power_source     ?? "grid",          // backend has no power_source yet — defaults to grid
    connectorType:    Array.isArray(raw.connectors)
                        ? raw.connectors.join(", ")
                        : (raw.connectorType ?? ""),
    power_kw:          raw.power_kw         ?? raw.powerKw         ?? 0,
    wait_time:  raw.wait_time        ?? raw.waitTimeMinutes  ?? 0,
    utilization:      raw.utilization      ?? 0,
    lastUpdated:      raw.lastUpdated      ?? "just now",
    lat:              raw.lat              ?? 0,
    lng:              raw.lng              ?? 0,
  };
}

export function useStations() {
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);

  useEffect(() => {
    if (USE_MOCK_DATA) {
      setTimeout(() => {
        setStations(MOCK_STATIONS);
        setLoading(false);
      }, 800);
      return;
    }

    // ── Real API call ───────────────────────────────────────
    // Abdulroheem's endpoint is GET /stations (no /api/v1/ prefix)
    fetch(`${API_BASE}/stations`)
      .then((res) => {
        if (!res.ok) throw new Error(`Server returned ${res.status}`);
        return res.json();
      })
      .then((data: unknown[]) => {
        setStations(data.map(mapStation));
        setLoading(false);
      })
      .catch((err: Error) => {
        console.error("Failed to fetch stations:", err.message);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return { stations, loading, error };
}
