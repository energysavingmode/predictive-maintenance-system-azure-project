import joblib
import pandas as pd

# Load model and encoder once
model = joblib.load("predictive_maintenance_model.pkl")
encoder = joblib.load("label_encoder.pkl")


def predict_machine(data):
    """
    Predict machine failure from sensor data.

    Input:
    {
        "Type": "M",
        "AirTemp": 300,
        "ProcessTemp": 310,
        "RPM": 1500,
        "Torque": 40,
        "ToolWear": 120
    }
    """

    df = pd.DataFrame([data])

    # Encode machine type
    df["Type"] = encoder.transform(df["Type"])

    prediction = int(model.predict(df)[0])

    probability = float(model.predict_proba(df)[0][1])

    confidence = round(probability * 100, 2)

    return {
        "prediction": prediction,
        "failure_probability": round(probability, 4),
        "confidence_percent": confidence
    }


if __name__ == "__main__":

    sample = {
        "Type": "M",
        "AirTemp": 300,
        "ProcessTemp": 310,
        "RPM": 1500,
        "Torque": 40,
        "ToolWear": 120
    }

    print(predict_machine(sample))