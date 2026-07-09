from flask import Flask, request, jsonify
import joblib
import pandas as pd

app = Flask(__name__)

# Load model and encoder
model = joblib.load("predictive_maintenance_model.pkl")
encoder = joblib.load("label_encoder.pkl")


@app.route("/")
def home():
    return "Predictive Maintenance API is running!"


@app.route("/predict", methods=["POST"])
def predict():

    data = request.json

    machine_type = encoder.transform([data["Type"]])[0]

    input_data = pd.DataFrame([{
        "Type": machine_type,
        "AirTemp": data["AirTemp"],
        "ProcessTemp": data["ProcessTemp"],
        "RPM": data["RPM"],
        "Torque": data["Torque"],
        "ToolWear": data["ToolWear"]
    }])

    prediction = int(model.predict(input_data)[0])
    probability = float(model.predict_proba(input_data)[0][1])

    return jsonify({
        "prediction": prediction,
        "failure_probability": round(probability, 4),
        "confidence_percent": round(probability * 100, 2)
    })


if __name__ == "__main__":
    app.run(debug=True)