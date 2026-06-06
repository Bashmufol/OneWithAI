from flask import Flask, request, jsonify, Response
from flask_cors import CORS
import math
import time
import json
import random
from datetime import datetime

app = Flask(__name__)
CORS(app)

# ========== SEED DATA (3 operators, 10+ stations) ==========
stations = [
    # === Existing 10 stations (IDs 1–10) ===
    {"id": "1", "name": "Lagos Central", "operator": "GreenCharge", "status": "available", "lat": 6.5244, "lng": 3.3792, "power_kw": 50, "wait_time": 5, "reliability": 92, "connectors": ["CCS", "CHAdeMO"], "utilization": 45},
    {"id": "2", "name": "Abuja City Center", "operator": "PowerUp", "status": "busy", "lat": 9.0765, "lng": 7.3986, "power_kw": 150, "wait_time": 15, "reliability": 88, "connectors": ["CCS"], "utilization": 78},
    {"id": "3", "name": "Port Harcourt Mall", "operator": "EcoCharge", "status": "offline", "lat": 4.8156, "lng": 7.0498, "power_kw": 30, "wait_time": 0, "reliability": 65, "connectors": ["Type 2"], "utilization": 0},
    {"id": "4", "name": "Ikeja City Mall", "operator": "GreenCharge", "status": "available", "lat": 6.6018, "lng": 3.3515, "power_kw": 60, "wait_time": 2, "reliability": 95, "connectors": ["CCS", "CHAdeMO"], "utilization": 30},
    {"id": "5", "name": "Victoria Island", "operator": "PowerUp", "status": "available", "lat": 6.4281, "lng": 3.4216, "power_kw": 100, "wait_time": 8, "reliability": 90, "connectors": ["CCS", "Type 2"], "utilization": 55},
    {"id": "6", "name": "Kano Central", "operator": "EcoCharge", "status": "busy", "lat": 12.0022, "lng": 8.5916, "power_kw": 50, "wait_time": 12, "reliability": 80, "connectors": ["CHAdeMO"], "utilization": 82},
    {"id": "7", "name": "Ibadan Gateway", "operator": "GreenCharge", "status": "available", "lat": 7.3775, "lng": 3.9470, "power_kw": 40, "wait_time": 3, "reliability": 91, "connectors": ["Type 2"], "utilization": 25},
    {"id": "8", "name": "Enugu ShopRite", "operator": "PowerUp", "status": "offline", "lat": 6.5242, "lng": 7.4940, "power_kw": 30, "wait_time": 0, "reliability": 60, "connectors": ["CCS"], "utilization": 0},
    {"id": "9", "name": "Lekki Phase 1", "operator": "EcoCharge", "status": "available", "lat": 6.4560, "lng": 3.5241, "power_kw": 75, "wait_time": 4, "reliability": 93, "connectors": ["CCS", "CHAdeMO"], "utilization": 40},
    {"id": "10", "name": "Ajah", "operator": "GreenCharge", "status": "busy", "lat": 6.4698, "lng": 3.5841, "power_kw": 50, "wait_time": 10, "reliability": 85, "connectors": ["Type 2"], "utilization": 70},

    
    {"id": "11", "name": "Benin City Central", "operator": "PowerUp", "status": "available", "lat": 6.3176, "lng": 5.6145, "power_kw": 60, "wait_time": 7, "reliability": 87, "connectors": ["CCS", "CHAdeMO"], "utilization": 50},
    {"id": "12", "name": "Kaduna Junction", "operator": "GreenCharge", "status": "busy", "lat": 10.5264, "lng": 7.4388, "power_kw": 45, "wait_time": 11, "reliability": 82, "connectors": ["Type 2"], "utilization": 75},
    {"id": "13", "name": "Maiduguri City Gate", "operator": "EcoCharge", "status": "offline", "lat": 11.8333, "lng": 13.1500, "power_kw": 35, "wait_time": 0, "reliability": 55, "connectors": ["CCS"], "utilization": 0},
    {"id": "14", "name": "Warri Refinery Road", "operator": "PowerUp", "status": "available", "lat": 5.5173, "lng": 5.7506, "power_kw": 80, "wait_time": 3, "reliability": 94, "connectors": ["CCS", "CHAdeMO"], "utilization": 35},
    {"id": "15", "name": "Abeokuta Panseke", "operator": "GreenCharge", "status": "available", "lat": 7.1502, "lng": 3.3434, "power_kw": 50, "wait_time": 5, "reliability": 89, "connectors": ["Type 2"], "utilization": 48},
    {"id": "16", "name": "Onitsha Main Market", "operator": "EcoCharge", "status": "busy", "lat": 6.1667, "lng": 6.7833, "power_kw": 55, "wait_time": 14, "reliability": 76, "connectors": ["CCS"], "utilization": 88},
    {"id": "17", "name": "Jos Wildlife Park", "operator": "PowerUp", "status": "available", "lat": 9.8965, "lng": 8.8583, "power_kw": 40, "wait_time": 2, "reliability": 91, "connectors": ["CHAdeMO"], "utilization": 20},
    {"id": "18", "name": "Sokoto Central Mosque", "operator": "GreenCharge", "status": "offline", "lat": 13.0059, "lng": 5.2476, "power_kw": 30, "wait_time": 0, "reliability": 58, "connectors": ["Type 2"], "utilization": 0},
    {"id": "19", "name": "Calabar Marina", "operator": "EcoCharge", "status": "available", "lat": 4.9581, "lng": 8.3250, "power_kw": 70, "wait_time": 6, "reliability": 86, "connectors": ["CCS", "CHAdeMO"], "utilization": 42},
    {"id": "20", "name": "Ilorin Post Office", "operator": "PowerUp", "status": "busy", "lat": 8.5000, "lng": 4.5500, "power_kw": 45, "wait_time": 9, "reliability": 80, "connectors": ["Type 2"], "utilization": 65},
    {"id": "21", "name": "Owerri Warehouse", "operator": "GreenCharge", "status": "available", "lat": 5.4836, "lng": 7.0333, "power_kw": 60, "wait_time": 4, "reliability": 90, "connectors": ["CCS"], "utilization": 38},
    {"id": "22", "name": "Uyo Tropicana", "operator": "EcoCharge", "status": "available", "lat": 5.0515, "lng": 7.9333, "power_kw": 50, "wait_time": 3, "reliability": 88, "connectors": ["CHAdeMO"], "utilization": 28},
    {"id": "23", "name": "Akure FUTA Gate", "operator": "PowerUp", "status": "busy", "lat": 7.2500, "lng": 5.1950, "power_kw": 35, "wait_time": 13, "reliability": 72, "connectors": ["Type 2"], "utilization": 79},
    {"id": "24", "name": "Lokoja Confluence", "operator": "GreenCharge", "status": "available", "lat": 7.8023, "lng": 6.7445, "power_kw": 55, "wait_time": 7, "reliability": 84, "connectors": ["CCS"], "utilization": 55},
    {"id": "25", "name": "Makurdi Market", "operator": "EcoCharge", "status": "offline", "lat": 7.7337, "lng": 8.5391, "power_kw": 40, "wait_time": 0, "reliability": 62, "connectors": ["CHAdeMO"], "utilization": 0},
    {"id": "26", "name": "Bauchi Emir's Palace", "operator": "PowerUp", "status": "available", "lat": 10.3104, "lng": 9.8463, "power_kw": 60, "wait_time": 2, "reliability": 92, "connectors": ["CCS", "Type 2"], "utilization": 31},
    {"id": "27", "name": "Lafia City Center", "operator": "GreenCharge", "status": "busy", "lat": 8.5000, "lng": 8.5000, "power_kw": 45, "wait_time": 10, "reliability": 79, "connectors": ["Type 2"], "utilization": 71},
    {"id": "28", "name": "Gombe Mall", "operator": "EcoCharge", "status": "available", "lat": 10.2833, "lng": 11.1667, "power_kw": 35, "wait_time": 5, "reliability": 83, "connectors": ["CCS"], "utilization": 44},
    {"id": "29", "name": "Jalingo Main Park", "operator": "PowerUp", "status": "offline", "lat": 8.8833, "lng": 11.3667, "power_kw": 30, "wait_time": 0, "reliability": 59, "connectors": ["CHAdeMO"], "utilization": 0},
    {"id": "30", "name": "Yola International Hotel", "operator": "GreenCharge", "status": "available", "lat": 9.2333, "lng": 12.4667, "power_kw": 50, "wait_time": 6, "reliability": 87, "connectors": ["CCS", "Type 2"], "utilization": 52},
]
# Store for SSE (live pulse clients)
clients = []

# ========== HELPER FUNCTIONS ==========
def haversine(lat1, lng1, lat2, lng2):
    R = 6371  # km
    dlat = math.radians(lat2 - lat1)
    dlng = math.radians(lng2 - lng1)
    a = math.sin(dlat/2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlng/2)**2
    return R * 2 * math.asin(math.sqrt(a))

def generate_demand_heatmap():
    # Simulate demand based on station utilization
    hotspots = []
    for s in stations:
        if s["status"] == "available" or s["status"] == "busy":
            demand = s["utilization"] + random.randint(-10, 10)
            demand = max(0, min(100, demand))
            hotspots.append({"lat": s["lat"], "lng": s["lng"], "demand": demand})
    return hotspots

# ========== 1. STATION MAP & LIST ==========
@app.route('/stations', methods=['GET'])
def get_stations():
    operator = request.args.get('operator')
    status = request.args.get('status')
    connector = request.args.get('connector')
    
    result = stations
    if operator:
        result = [s for s in result if s['operator'] == operator]
    if status:
        result = [s for s in result if s['status'] == status]
    if connector:
        result = [s for s in result if connector in s['connectors']]
    
    return jsonify(result)

@app.route('/stations/<station_id>', methods=['GET'])
def get_station(station_id):
    station = next((s for s in stations if s['id'] == station_id), None)
    return jsonify(station) if station else ({"error": "Not found"}, 404)

# ========== 2. NEAR ME ==========
@app.route('/stations/nearby', methods=['GET'])
def nearby_stations():
    lat = float(request.args.get('lat', 0))
    lng = float(request.args.get('lng', 0))
    radius = float(request.args.get('radius', 10))  # km
    
    nearby = []
    for s in stations:
        dist = haversine(lat, lng, s["lat"], s["lng"])
        if dist <= radius:
            s_copy = s.copy()
            s_copy["distance_km"] = round(dist, 1)
            nearby.append(s_copy)
    
    nearby.sort(key=lambda x: x["distance_km"])
    return jsonify(nearby)

# ========== 3. EVOSCORE RECOMMEND ==========
@app.route('/recommend', methods=['POST'])
def recommend():
    data = request.get_json()
    battery_pct = data.get('battery_pct', 0)
    lat = data.get('lat')
    lng = data.get('lng')
    
    # Filter available stations
    available = [s for s in stations if s["status"] == "available"]
    
    if lat and lng:
        for s in available:
            s["distance"] = haversine(lat, lng, s["lat"], s["lng"])
        available.sort(key=lambda x: x["distance"])
    else:
        # fallback: best reliability + lowest wait time
        available.sort(key=lambda x: (-x["reliability"], x["wait_time"]))
    
    # EvoScore formula: battery low -> prioritize reliability & distance
    top3 = available[:3]
    for i, s in enumerate(top3):
        score = 0
        if battery_pct < 20:
            score = s["reliability"] * 0.6 + (100 - s["wait_time"]) * 0.4
        else:
            score = s["reliability"] * 0.5 + (100 - s["wait_time"]) * 0.5
        s["evoscore"] = round(score, 1)
    
    return jsonify({"recommendations": top3, "user_battery": battery_pct})

# ========== 4. DEMAND HEATMAP ==========
@app.route('/demand/heatmap', methods=['GET'])
def demand_heatmap():
    hotspots = generate_demand_heatmap()
    return jsonify({"hotspots": hotspots})

# ========== 5. NETWORK PULSE (SSE) ==========
@app.route('/pulse/stream')
def pulse_stream():
    def event_stream():
        while True:
            # Simulate real-time status change (1% chance per tick)
            if random.random() < 0.02:
                station = random.choice(stations)
                new_status = random.choice(["available", "busy", "offline"])
                station["status"] = new_status
                station["wait_time"] = random.randint(0, 20)
                station["utilization"] = random.randint(0, 100)
                event_data = json.dumps({
                    "type": "status_update",
                    "station_id": station["id"],
                    "status": new_status,
                    "wait_time": station["wait_time"],
                    "utilization": station["utilization"]
                })
                yield f"data: {event_data}\n\n"
            time.sleep(5)  # send every 5 seconds
    
    return Response(event_stream(), mimetype="text/event-stream")

# ========== 6. AI CHARGE ADVISOR ==========
@app.route('/ai/advisor', methods=['POST'])
def ai_advisor():
    data = request.get_json()
    question = data.get('question', '').lower()
    
    # Simple rule-based for hackathon (no external API)
    if "range" in question or "how far" in question:
        answer = "EvoTip: Average EV range in Nigeria is 250-350km per full charge. Use our EvoScore to find top chargers."
    elif "cost" in question:
        answer = "Charging costs vary by operator: GreenCharge ~500 Naira/kWh, PowerUp ~450, EcoCharge ~550. Check station details."
    elif "wait" in question or "queue" in question:
        answer = "Peak wait times are 6-8 PM weekdays. Use our live pulse to see current wait times."
    else:
        answer = "I'm EvoCharge AI. Try asking about range, cost, or wait times!"
    
    return jsonify({"question": question, "answer": answer})

# ========== 7. OPERATOR DASHBOARD ANALYTICS ==========
@app.route('/analytics/overview', methods=['GET'])
def analytics_overview():
    total = len(stations)
    available = len([s for s in stations if s["status"] == "available"])
    busy = len([s for s in stations if s["status"] == "busy"])
    offline = len([s for s in stations if s["status"] == "offline"])
    avg_wait = round(sum(s["wait_time"] for s in stations) / total, 1)
    avg_util = round(sum(s["utilization"] for s in stations) / total, 1)
    
    # Operator breakdown
    operators = {}
    for s in stations:
        ops = s["operator"]
        if ops not in operators:
            operators[ops] = {"total": 0, "available": 0, "busy": 0, "offline": 0}
        operators[ops]["total"] += 1
        operators[ops][s["status"]] += 1
    
    # Peak hours dummy data
    peak_hours = [{"hour": h, "demand": random.randint(20, 90)} for h in range(0, 24)]
    
    # Unmet demand areas (low station density)
    unmet = [
        {"area": "Benin City", "demand_score": 85, "stations_needed": 3},
        {"area": "Onitsha", "demand_score": 72, "stations_needed": 2},
        {"area": "Abeokuta", "demand_score": 60, "stations_needed": 1}
    ]
    
    return jsonify({
        "total_stations": total,
        "available": available,
        "busy": busy,
        "offline": offline,
        "avg_wait_min": avg_wait,
        "avg_utilization_pct": avg_util,
        "operator_breakdown": operators,
        "peak_hours": peak_hours,
        "unmet_demand": unmet,
        "investment_summary": "High opportunity in South-South & North-West. Focus on Benin, Onitsha, Kano."
    })
@app.route('/analytics/demand_by_area', methods=['GET'])
def demand_by_area():
    # Group stations by geo-region (simplified for MVP)
    areas = {
        "Lagos": [s for s in stations if "Lagos" in s["name"] or "Lekki" in s["name"] or "Ajah" in s["name"] or "Ikeja" in s["name"] or "Victoria" in s["name"]],
        "Abuja": [s for s in stations if "Abuja" in s["name"]],
        "South-South": [s for s in stations if any(city in s["name"] for city in ["Port Harcourt", "Benin", "Warri", "Calabar", "Uyo"])],
        "North-West": [s for s in stations if any(city in s["name"] for city in ["Kano", "Kaduna", "Sokoto"])],
        "South-East": [s for s in stations if any(city in s["name"] for city in ["Enugu", "Onitsha", "Owerri"])],
        "South-West Other": [s for s in stations if any(city in s["name"] for city in ["Ibadan", "Abeokuta", "Akure"])],
    }
    
    result = []
    for area, stns in areas.items():
        if stns:
            total_demand = sum(s["utilization"] for s in stns) / len(stns)
            result.append({"area": area, "demand_score": round(total_demand, 1), "station_count": len(stns)})
    
    return jsonify(result)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000, debug=True, threaded=True)
@app.route('/analytics/demand_by_area', methods=['GET'])
def demand_by_area():
    # Group stations by geo-region (simplified for MVP)
    areas = {
        "Lagos": [s for s in stations if "Lagos" in s["name"] or "Lekki" in s["name"] or "Ajah" in s["name"] or "Ikeja" in s["name"] or "Victoria" in s["name"]],
        "Abuja": [s for s in stations if "Abuja" in s["name"]],
        "South-South": [s for s in stations if any(city in s["name"] for city in ["Port Harcourt", "Benin", "Warri", "Calabar", "Uyo"])],
        "North-West": [s for s in stations if any(city in s["name"] for city in ["Kano", "Kaduna", "Sokoto"])],
        "South-East": [s for s in stations if any(city in s["name"] for city in ["Enugu", "Onitsha", "Owerri"])],
        "South-West Other": [s for s in stations if any(city in s["name"] for city in ["Ibadan", "Abeokuta", "Akure"])],
    }
    
    result = []
    for area, stns in areas.items():
        if stns:
            total_demand = sum(s["utilization"] for s in stns) / len(stns)
            result.append({"area": area, "demand_score": round(total_demand, 1), "station_count": len(stns)})
    
    return jsonify(result)