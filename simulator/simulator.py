import time
import random
import requests

# Point to Express backend ingestion engine route
SENSOR_URL = "http://localhost:3001/api/sensor"
PREDICT_URL = "http://localhost:3001/api/predict"
MACHINES = ["M_001", "L_002", "H_003"]

print("=" * 70)
print(" Enterprise IoT SCADA Edge Broadcaster Sandbox Operational")
print("=" * 70)

tool_wear_tracker = {m: 0 for m in MACHINES}
machine_types = {"M_001": "M", "L_002": "L", "H_003": "H"}

while True:
    for machine in MACHINES:
        m_type = machine_types[machine]
        
        # Base Ambient Baseline (Kelvin to match AI4I Dataset specs)
        air_temp = round(random.uniform(295.0, 301.0), 1)
        process_temp = round(air_temp + 10.0 + random.uniform(-0.5, 2.5), 1)
        rpm = random.randint(1400, 1600)
        torque = round(random.uniform(38.0, 48.0), 1)
        
        # Accumulate tool degradation state
        tool_wear_tracker[machine] += random.randint(1, 3)
        
        # Inject Anomaly Scenario (12% Probability)
        if random.random() < 0.12:
            print(f"\nAnomaly event generated on Edge Unit: {machine}")
            rpm = random.randint(2200, 2700)
            torque = round(random.uniform(55.0, 75.0), 1)
            process_temp += 8.5

        # Construct unified production schema payload payload
        payload = {
            "device_id": machine,
            "Type": m_type,
            "AirTemp": air_temp,
            "ProcessTemp": process_temp,
            "RPM": rpm,
            "Torque": torque,
            "ToolWear": tool_wear_tracker[machine]
        }

        try:
            # 1. Ingest Raw Logs to DB
            requests.post(SENSOR_URL, json=payload)
            # 2. Query ML workspace prediction evaluation engine
            pred_res = requests.post(PREDICT_URL, json=payload).json()
            
            print(f"[{machine}] Type: {m_type} | RPM: {rpm} | Torque: {torque}Nm | Status Evaluation -> {pred_res.get('status')}")
            
        except Exception as e:
            print(f"Transmission dropout on execution gate to Express framework server: {e}")

        # Reset wear parameters when maintenance threshold caps
        if tool_wear_tracker[machine] >= 220:
            print(f" [Edge Directive] Tooling array swapped on {machine}. Clearing internal degradation registers.")
            tool_wear_tracker[machine] = 0

    time.sleep(5)