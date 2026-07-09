import sys
import json

try:
    # Read input features passed from Node.js server
    temp = float(sys.argv[1])
    vib = float(sys.argv[2])
    press = float(sys.argv[3])

    # Basic threshold heuristic matching local rule-engine logic
    if temp > 80.0 or vib > 90.0:
        prediction = "Maintenance Required (High Risk)"
    else:
        prediction = "Operational (Low Risk)"
except Exception:
    prediction = "Operational"

# Print result back to Node.js via stdout stream
output = {
    "prediction": prediction,
    "engine": "Local Python Mock"
}
print(json.dumps(output))
