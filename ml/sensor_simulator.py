import random
import time
import requests

API_URL = "http://127.0.0.1:5000/predict"


class Machine:

    def __init__(self, machine_id):

        self.machine_id = machine_id

        self.machine_type = random.choice(["L", "M", "H"])

        self.air_temp = round(random.uniform(298, 300), 2)

        self.process_temp = round(self.air_temp + random.uniform(8, 11), 2)

        self.rpm = random.randint(1450, 1550)

        self.torque = round(random.uniform(35, 45), 2)

        self.tool_wear = 0

        self.running = True

    def update(self):

        # Tool continuously wears out
        self.tool_wear += random.randint(1, 3)

        # Air temperature changes slowly
        self.air_temp += random.uniform(-0.05, 0.05)

        # Process temperature follows air temperature
        self.process_temp = self.air_temp + random.uniform(8, 11)

        # RPM fluctuates slightly
        self.rpm += random.randint(-8, 8)

        # Torque fluctuates
        self.torque += random.uniform(-1, 1)

        # -------------------------
        # Machine starts degrading
        # -------------------------

        if self.tool_wear > 120:

            self.process_temp += random.uniform(1, 2)

            self.torque += random.uniform(1, 3)

        if self.tool_wear > 180:

            self.process_temp += random.uniform(2, 4)

            self.torque += random.uniform(2, 5)

            self.rpm -= random.randint(5, 15)

        # Clamp values

        self.air_temp = round(self.air_temp, 2)

        self.process_temp = round(self.process_temp, 2)

        self.torque = round(self.torque, 2)

        self.rpm = max(1000, min(3000, self.rpm))

        # -------------------------
        # Maintenance
        # -------------------------

        if self.tool_wear >= 250:

            print(f"\nMaintenance performed on Machine {self.machine_id}")

            self.tool_wear = 0

            self.process_temp = self.air_temp + random.uniform(8, 10)

            self.rpm = random.randint(1450, 1550)

            self.torque = random.uniform(35, 45)

    def get_sensor_data(self):

        return {

            "Type": self.machine_type,

            "AirTemp": round(self.air_temp, 2),

            "ProcessTemp": round(self.process_temp, 2),

            "RPM": int(self.rpm),

            "Torque": round(self.torque, 2),

            "ToolWear": int(self.tool_wear)

        }


# -------------------------
# Create Machines
# -------------------------

machines = [

    Machine("Machine-A"),

    Machine("Machine-B"),

    Machine("Machine-C")

]


print("=" * 70)
print("SMART SENSOR SIMULATOR STARTED")
print("=" * 70)

while True:

    for machine in machines:

        machine.update()

        sensor_data = machine.get_sensor_data()

        try:

            response = requests.post(API_URL, json=sensor_data)

            prediction = response.json()

            print("-" * 70)

            print(machine.machine_id)

            print(sensor_data)

            print("Prediction:", prediction)

        except Exception as e:

            print("API Error:", e)

    time.sleep(2)