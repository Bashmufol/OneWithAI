# EvoCharge API Contract

**Base URL (local development):** `http://localhost:8000`  
**Base URL (deployed):** *provided by Bashir after AWS deployment*  

All endpoints return JSON. CORS is enabled for all origins (restricted later by Bashir).

---

## Driver App Endpoints

| Method | Endpoint | Description | Request Parameters / Body | Response Example |
|--------|----------|-------------|--------------------------|------------------|
| GET | `/stations` | List all stations with filters | Query params (all optional): `operator`, `status`, `connector` | `[{ "id": "1", "name": "Lagos Central", "operator": "GreenCharge", "status": "available", "lat": 6.5244, "lng": 3.3792, "power_kw": 50, "wait_time": 5, "reliability": 92, "connectors": ["CCS", "CHAdeMO"], "utilization": 45 }]` |
| GET | `/stations/{id}` | Details of one station | `id` in URL path | Same object as above for that ID |
| GET | `/stations/nearby` | Find stations within radius | `lat`, `lng`, `radius` (km, default 10) | Same as `/stations` but with extra field `distance_km` |
| POST | `/recommend` | EvoScore: top 3 stations based on battery % and location | `{ "battery_pct": 30, "lat": 6.5, "lng": 3.4 }` (lat/lng optional) | `{ "recommendations": [ ...3 stations with 'evoscore' field ], "user_battery": 30 }` |
| GET | `/demand/heatmap` | Get high‑demand areas for map overlay | None | `{ "hotspots": [{ "lat": 6.5244, "lng": 3.3792, "demand": 45 }] }` |
| GET | `/pulse/stream` | Server‑sent events (SSE) for live status changes | None (keep connection open) | `data: { "type": "status_update", "station_id": "1", "status": "busy", "wait_time": 12, "utilization": 70 }` |
| POST | `/ai/advisor` | Natural‑language Q&A about charging | `{ "question": "How far can I drive on 80%?" }` | `{ "question": "...", "answer": "EvoTip: ..." }` |

---

## Operator Dashboard Endpoints

| Method | Endpoint | Description | Response Example |
|--------|----------|-------------|------------------|
| GET | `/analytics/overview` | KPIs, operator breakdown, peak hours, unmet demand, investment summary | `{ "total_stations": 30, "available": 12, "busy": 10, "offline": 8, "avg_wait_min": 5.2, "avg_utilization_pct": 48.5, "operator_breakdown": { "GreenCharge": { "total": 10, "available": 4, ... } }, "peak_hours": [{ "hour": 8, "demand": 45 }], "unmet_demand": [{ "area": "Benin City", "demand_score": 85, "stations_needed": 3 }], "investment_summary": "..." }` |
| GET | `/analytics/demand_by_area` | Demand score per geographic region | `[{ "area": "Lagos", "demand_score": 48.3, "station_count": 6 }]` |
| GET | `/stations` | Same as driver endpoint – used for station table | See above |

---

## Important Notes for Frontend Developers

1. **Filters** for `/stations` can be combined:  
   `/stations?operator=GreenCharge&status=available&connector=CCS`

2. **SSE (Server‑Sent Events)** – Keep the connection open and listen to `message` events. The server sends a new update every 5 seconds. Example in JavaScript:
   ```js
   const eventSource = new EventSource('http://localhost:8000/pulse/stream');
   eventSource.onmessage = (event) => {
       const update = JSON.parse(event.data);
       // update station status on the map
   };