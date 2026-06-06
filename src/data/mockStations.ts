// ============================================================
// MOCK DATA — Lagos EV Charging Stations
// ============================================================
// TODO: When Abdulroheem's backend is ready, DELETE this entire
// file and replace imports with real API calls.
// The real endpoint will be: GET /api/v1/stations
// See useStations.ts hook for where to plug in the API URL.
// ============================================================

export type PowerSource = "grid" | "solar" | "generator";
export type StationStatus = "available" | "busy" | "offline";

export interface Station {
  id: string;
  name: string;
  operator: string;
  area: string; // Lagos area/neighbourhood
  lga: string; // Local Government Area
  status: StationStatus;
  power_source: PowerSource;
  connectorType: string;
  power_kw: number;
  wait_time: number;
  utilization: number; // 0–100 %
  lastUpdated: string;
  lat: number;
  lng: number;
}

export const MOCK_STATIONS: Station[] = [
  { id: "s01", name: "Victoria Island Hub", operator: "ChargeNG",   area: "Victoria Island",  lga: "Eti-Osa",    status: "available", power_source: "grid",      connectorType: "Type 2",  power_kw: 50,  wait_time: 0,  utilization: 32, lastUpdated: "2 min ago", lat: 6.4281, lng: 3.4219 },
  { id: "s02", name: "Lekki Phase 1 Fast", operator: "GreenVolt",   area: "Lekki Phase 1",   lga: "Eti-Osa",    status: "busy",      power_source: "solar",     connectorType: "CCS",     power_kw: 150, wait_time: 12, utilization: 88, lastUpdated: "1 min ago", lat: 6.4390, lng: 3.4720 },
  { id: "s03", name: "Ikeja GRA Station",  operator: "ChargeNG",   area: "Ikeja GRA",       lga: "Ikeja",      status: "available", power_source: "solar",     connectorType: "Type 2",  power_kw: 50,  wait_time: 0,  utilization: 45, lastUpdated: "5 min ago", lat: 6.5944, lng: 3.3422 },
  { id: "s04", name: "Surulere Express",   operator: "VoltHub",    area: "Surulere",        lga: "Surulere",   status: "offline",   power_source: "grid",      connectorType: "CHAdeMO", power_kw: 25,  wait_time: 0,  utilization: 0,  lastUpdated: "1 hr ago",  lat: 6.5054, lng: 3.3576 },
  { id: "s05", name: "Ajah Supercharge",   operator: "GreenVolt",   area: "Ajah",            lga: "Eti-Osa",    status: "busy",      power_source: "generator", connectorType: "CCS",     power_kw: 100, wait_time: 20, utilization: 95, lastUpdated: "3 min ago", lat: 6.4675, lng: 3.5741 },
  { id: "s06", name: "Maryland Mall Spot", operator: "ChargeNG",   area: "Maryland",        lga: "Kosofe",     status: "available", power_source: "grid",      connectorType: "Type 2",  power_kw: 50,  wait_time: 0,  utilization: 20, lastUpdated: "4 min ago", lat: 6.5695, lng: 3.3621 },
  { id: "s07", name: "Yaba Tech Charge",   operator: "VoltHub",    area: "Yaba",            lga: "Lagos Isl.", status: "available", power_source: "solar",     connectorType: "Type 2",  power_kw: 22,  wait_time: 0,  utilization: 38, lastUpdated: "2 min ago", lat: 6.5022, lng: 3.3742 },
  { id: "s08", name: "Ikoyi Club Road",    operator: "GreenVolt",   area: "Ikoyi",           lga: "Eti-Osa",    status: "busy",      power_source: "grid",      connectorType: "CCS",     power_kw: 150, wait_time: 8,  utilization: 72, lastUpdated: "1 min ago", lat: 6.4550, lng: 3.4363 },
  { id: "s09", name: "Oshodi Transit Hub", operator: "ChargeNG",   area: "Oshodi",          lga: "Oshodi",     status: "offline",   power_source: "generator", connectorType: "CHAdeMO", power_kw: 50,  wait_time: 0,  utilization: 0,  lastUpdated: "2 hr ago",  lat: 6.5566, lng: 3.3520 },
  { id: "s10", name: "Magodo Phase 2",     operator: "VoltHub",    area: "Magodo",          lga: "Kosofe",     status: "available", power_source: "solar",     connectorType: "Type 2",  power_kw: 22,  wait_time: 0,  utilization: 15, lastUpdated: "6 min ago", lat: 6.6082, lng: 3.3998 },
  { id: "s11", name: "Gbagada Express",    operator: "GreenVolt",   area: "Gbagada",         lga: "Kosofe",     status: "busy",      power_source: "grid",      connectorType: "Type 2",  power_kw: 50,  wait_time: 15, utilization: 80, lastUpdated: "2 min ago", lat: 6.5534, lng: 3.3844 },
  { id: "s12", name: "Chevron Drive Stop", operator: "ChargeNG",   area: "Chevron",         lga: "Eti-Osa",    status: "available", power_source: "generator", connectorType: "CCS",     power_kw: 100, wait_time: 0,  utilization: 25, lastUpdated: "3 min ago", lat: 6.4360, lng: 3.5009 },
  { id: "s13", name: "Apapa Wharf Gate",   operator: "VoltHub",    area: "Apapa",           lga: "Apapa",      status: "offline",   power_source: "grid",      connectorType: "Type 2",  power_kw: 50,  wait_time: 0,  utilization: 0,  lastUpdated: "3 hr ago",  lat: 6.4490, lng: 3.3620 },
  { id: "s14", name: "Banana Island East", operator: "GreenVolt",   area: "Banana Island",   lga: "Eti-Osa",    status: "available", power_source: "solar",     connectorType: "CCS",     power_kw: 150, wait_time: 0,  utilization: 10, lastUpdated: "1 min ago", lat: 6.4675, lng: 3.4480 },
  { id: "s15", name: "Ojota Bus Terminal", operator: "ChargeNG",   area: "Ojota",           lga: "Kosofe",     status: "busy",      power_source: "grid",      connectorType: "CHAdeMO", power_kw: 25,  wait_time: 30, utilization: 99, lastUpdated: "1 min ago", lat: 6.5843, lng: 3.3755 },
  { id: "s16", name: "Ikorodu Road Mid",   operator: "VoltHub",    area: "Palmgroove",      lga: "Lagos Isl.", status: "available", power_source: "solar",     connectorType: "Type 2",  power_kw: 22,  wait_time: 0,  utilization: 42, lastUpdated: "7 min ago", lat: 6.5400, lng: 3.3699 },
  { id: "s17", name: "Agege Market Stop",  operator: "ChargeNG",   area: "Agege",           lga: "Agege",      status: "offline",   power_source: "generator", connectorType: "Type 2",  power_kw: 22,  wait_time: 0,  utilization: 0,  lastUpdated: "4 hr ago",  lat: 6.6162, lng: 3.3240 },
  { id: "s18", name: "Festac Town Depot",  operator: "GreenVolt",   area: "Festac",          lga: "Amuwo-O.",   status: "busy",      power_source: "grid",      connectorType: "CCS",     power_kw: 100, wait_time: 18, utilization: 85, lastUpdated: "2 min ago", lat: 6.4660, lng: 3.2810 },
  { id: "s19", name: "Sangotedo Village",  operator: "VoltHub",    area: "Sangotedo",       lga: "Eti-Osa",    status: "available", power_source: "solar",     connectorType: "Type 2",  power_kw: 50,  wait_time: 0,  utilization: 28, lastUpdated: "5 min ago", lat: 6.4415, lng: 3.5618 },
  { id: "s20", name: "Epe Resort Gate",    operator: "ChargeNG",   area: "Epe",             lga: "Epe",        status: "available", power_source: "solar",     connectorType: "Type 2",  power_kw: 22,  wait_time: 0,  utilization: 5,  lastUpdated: "10 min ago", lat: 6.5868, lng: 3.9810 },
  { id: "s21", name: "Badagry Port Road",  operator: "GreenVolt",   area: "Badagry",         lga: "Badagry",    status: "offline",   power_source: "grid",      connectorType: "CHAdeMO", power_kw: 25,  wait_time: 0,  utilization: 0,  lastUpdated: "5 hr ago",  lat: 6.4148, lng: 2.8825 },
  { id: "s22", name: "Bode Thomas Fast",   operator: "VoltHub",    area: "Surulere",        lga: "Surulere",   status: "busy",      power_source: "generator", connectorType: "CCS",     power_kw: 100, wait_time: 10, utilization: 70, lastUpdated: "3 min ago", lat: 6.4921, lng: 3.3491 },
  { id: "s23", name: "Mende Maryland",     operator: "ChargeNG",   area: "Mende",           lga: "Eti-Osa",    status: "available", power_source: "grid",      connectorType: "Type 2",  power_kw: 50,  wait_time: 0,  utilization: 33, lastUpdated: "4 min ago", lat: 6.5662, lng: 3.3682 },
  { id: "s24", name: "Oregun Industrial",  operator: "GreenVolt",   area: "Oregun",          lga: "Ikeja",      status: "busy",      power_source: "solar",     connectorType: "CCS",     power_kw: 150, wait_time: 22, utilization: 91, lastUpdated: "1 min ago", lat: 6.5980, lng: 3.3512 },
  { id: "s25", name: "Mile 2 Connector",   operator: "VoltHub",    area: "Mile 2",          lga: "Amuwo-O.",   status: "available", power_source: "generator", connectorType: "Type 2",  power_kw: 22,  wait_time: 0,  utilization: 18, lastUpdated: "8 min ago", lat: 6.4727, lng: 3.2975 },
];

// ── Analytics mock data ─────────────────────────────────────
// TODO: Replace with GET /api/v1/analytics/summary when backend is live

export const PEAK_HOURS_DATA = [
  { hour: "6 AM",  sessions: 12 },
  { hour: "7 AM",  sessions: 28 },
  { hour: "8 AM",  sessions: 55 },
  { hour: "9 AM",  sessions: 48 },
  { hour: "10 AM", sessions: 35 },
  { hour: "11 AM", sessions: 30 },
  { hour: "12 PM", sessions: 42 },
  { hour: "1 PM",  sessions: 38 },
  { hour: "2 PM",  sessions: 33 },
  { hour: "3 PM",  sessions: 45 },
  { hour: "4 PM",  sessions: 60 },
  { hour: "5 PM",  sessions: 72 },
  { hour: "6 PM",  sessions: 65 },
  { hour: "7 PM",  sessions: 50 },
  { hour: "8 PM",  sessions: 38 },
  { hour: "9 PM",  sessions: 20 },
];

export const DEMAND_BY_AREA = [
  // TODO: Replace with GET /api/v1/analytics/demand-by-area
  { area: "Lekki",      demand: 94, supply: 60 },
  { area: "VI",         demand: 80, supply: 75 },
  { area: "Ikeja",      demand: 70, supply: 55 },
  { area: "Surulere",   demand: 65, supply: 30 },
  { area: "Yaba",       demand: 60, supply: 40 },
  { area: "Gbagada",    demand: 55, supply: 35 },
  { area: "Festac",     demand: 50, supply: 25 },
  { area: "Ajah",       demand: 88, supply: 45 },
];

// ── Grid Alerts mock ────────────────────────────────────────
// TODO: Replace with GET /api/v1/events/stream (SSE) from Abdulroheem
// Each alert has: area, affected stations count, message
export const GRID_ALERTS = [
  {
    id: "alert-01",
    area: "Mainland",
    affectedStations: 5,
    message: "Mainland Grid Outage. 5 stations automatically switched to Backup Diesel Generators.",
    severity: "critical" as const,
  },
];
