import time
import random
import requests

BACKEND_URL = "http://localhost:5000/api/sensor"
MACHINES = ["Milling-Machine-P1", "Lathe-CNC-P2", "Drill-Press-P3"]

print(" Industrial SCADA Sensor Simulator Active [Interval: 5s]...")
print("Press Ctrl+C to halt stream safely.\n")

# Track tool wear over runtime loops
tool_wear_tracker = {machine: 0.0 for machine in MACHINES}

while True:
    for machine in MACHINES:
        # 1. Standard Ambient Conditions
        air_temp = round(random.uniform(20.0, 24.0), 2)
        
        # 2. Operational Dynamics (Process temp sits slightly higher than room temp)
        base_rpm = random.uniform(1350, 1650)
        torque = round(random.uniform(35.0, 55.0), 2)
        
        # Simulate physical correlation: Higher torque/friction increases process temperature
        process_temp = round(air_temp + 10.0 + (torque * 0.5) + random.uniform(-1.0, 1.0), 2)
        
        # 3. Accumulate Tool Wear over time
        tool_wear_tracker[machine] += round(random.uniform(0.1, 0.5), 2)
        if tool_wear_tracker[machine] > 200.0:  # Reset when tool is replaced
            tool_wear_tracker[machine] = 0.0
            print(f" [MAINTENANCE] Tool bit replaced on {machine}. Tool Wear reset.")

        # 4. Inject Random Industrial Faults (10% chance)
        rpm = base_rpm
        if random.random() < 0.10:
            rpm = round(random.uniform(2200, 2600), 2)  # High RPM stress
            process_temp += 15.0  # Thermal runaway anomaly
            print(f"  [ANOMALY] Rotational stress surge registered on {machine}!")

        # Construct the standardized payload matching your backend expectations
        payload = {
            "device_id": machine,
            "temperature": process_temp, # Maps to main temp table
            "vibration": round(rpm / 25, 2), # Scales RPM naturally into a readable Hz vibration spectrum
            "pressure": torque # Maps physical Torque directly into your pressure gauge
        }

        # 5. Broadcast to Node.js Backend API
        try:
            response = requests.post(BACKEND_URL, json=payload)
            if response.status_code == 201:
                print(f" [{machine}] Streamed -> RPM: {int(rpm)} | Torque: {torque} Nm | Tool Wear: {tool_wear_tracker[machine]} min")
        except requests.exceptions.ConnectionError:
            print(f" Transmission dropped. Is backend 'server.js' active on Port 5000?")
        except Exception as e:
            print(f" Error: {e}")

    # Pause for 5 seconds before the next factory sweep cycle
    time.sleep(5)
