import pandas as pd
import seaborn as sns
import numpy as np
import joblib
import matplotlib.pyplot as plt

from sklearn.metrics import ConfusionMatrixDisplay
from sklearn.metrics import confusion_matrix
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score
from sklearn.metrics import roc_auc_score

from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier
from xgboost import XGBClassifier

# -----------------------------
# Load Dataset
# -----------------------------
df = pd.read_csv("ai4i2020.csv")
df.rename(columns={
    "Air temperature [K]": "AirTemp",
    "Process temperature [K]": "ProcessTemp",
    "Rotational speed [rpm]": "RPM",
    "Torque [Nm]": "Torque",
    "Tool wear [min]": "ToolWear",
    "Machine failure": "Failure"
}, inplace=True)


print("Dataset Shape:", df.shape)
print(df.head())

# -----------------------------
# Encode Machine Type
# -----------------------------
encoder = LabelEncoder()
df["Type"] = encoder.fit_transform(df["Type"])
joblib.dump(encoder, "label_encoder.pkl")

# -----------------------------
# Remove unnecessary columns
# -----------------------------
df.drop(columns=[
    "UDI",
    "Product ID",
    "TWF",
    "HDF",
    "PWF",
    "OSF",
    "RNF"
], inplace=True)

# -----------------------------
# Features and Target
# -----------------------------
X = df.drop(columns=["Failure"])

y = df["Failure"]

# -----------------------------
# Train-Test Split
# -----------------------------
X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42,
    stratify=y
)
# -----------------------------
# Calculate class imbalance
# -----------------------------
negative = (y_train == 0).sum()
positive = (y_train == 1).sum()

scale_pos_weight = negative / positive

print(f"Negative samples: {negative}")
print(f"Positive samples: {positive}")
print(f"scale_pos_weight: {scale_pos_weight:.2f}")

# -----------------------------
# Models
# -----------------------------
models = {
    "Logistic Regression": LogisticRegression(max_iter=1000),

    "Decision Tree": DecisionTreeClassifier(random_state=42),

    "Random Forest": RandomForestClassifier(
        n_estimators=200,
        random_state=42
    ),

    "XGBoost": XGBClassifier(
    eval_metric="logloss",
    random_state=42,
    scale_pos_weight=scale_pos_weight
    )

}

results = []
best_model = None
best_score = 0

print("\n==============================")

for name, model in models.items():

    # Train model
    model.fit(X_train, y_train)

    # Make predictions
    predictions = model.predict(X_test)

    # Calculate metrics
    accuracy = accuracy_score(y_test, predictions)
    precision = precision_score(y_test, predictions)
    recall = recall_score(y_test, predictions)
    f1 = f1_score(y_test, predictions)

    cm = confusion_matrix(y_test, predictions)
    auc = roc_auc_score(y_test, model.predict_proba(X_test)[:, 1])

    # Print results
    print(f"\n{name}")
    print("-" * 40)
    print("Accuracy :", round(accuracy, 4))
    print("Precision:", round(precision, 4))
    print("Recall   :", round(recall, 4))
    print("F1 Score :", round(f1, 4))
    print("ROC-AUC  :", round(auc, 4))
    print("Confusion Matrix:")
    print(cm)

    # Save results for CSV
    results.append({
        "Model": name,
        "Accuracy": round(accuracy, 4),
        "Precision": round(precision, 4),
        "Recall": round(recall, 4),
        "F1 Score": round(f1, 4),
        "ROC-AUC": round(auc, 4)
    })

    # Plot confusion matrix
    plt.figure(figsize=(5, 4))

    sns.heatmap(
        cm,
        annot=True,
        fmt="d",
        cmap="Blues",
        xticklabels=["Healthy", "Failure"],
        yticklabels=["Healthy", "Failure"]
    )

    plt.xlabel("Predicted")
    plt.ylabel("Actual")
    plt.title(f"Confusion Matrix - {name}")

    plt.tight_layout()
    plt.show()

    # Save best model
    if f1 > best_score:
        best_score = f1
        best_model = model

# Save comparison table
results_df = pd.DataFrame(results)
results_df.to_csv("model_results.csv", index=False)

print("\nModel comparison saved as model_results.csv")
# -----------------------------
# Save Best Model
# -----------------------------
print(f"\nBest Model: {type(best_model).__name__}")
print(f"Best F1 Score: {best_score:.4f}")

joblib.dump(best_model, "predictive_maintenance_model.pkl")

print("\nBest model saved successfully!")
