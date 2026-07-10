import os
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import joblib

from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
from sklearn.ensemble import RandomForestRegressor
from xgboost import XGBRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

# -----------------------------
# 1. Generate Synthetic Dataset
# -----------------------------
np.random.seed(42)
samples = 1500

data = {
    "transport": np.random.uniform(5, 50, samples),
    "electricity": np.random.uniform(10, 70, samples),
    "fuel": np.random.uniform(2, 40, samples),
}

df = pd.DataFrame(data)

df["predicted_emission"] = (
    df["transport"] * 0.35
    + df["electricity"] * 0.45
    + df["fuel"] * 0.20
    + np.random.normal(0, 2, samples)
)

os.makedirs("models", exist_ok=True)

df.to_csv("carbon_emissions_dataset.csv", index=False)
print("✅ Created 'carbon_emissions_dataset.csv'")

# -----------------------------
# 2. Train/Test Split
# -----------------------------
X = df[["transport", "electricity", "fuel"]]
y = df["predicted_emission"]

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.20,
    random_state=42
)

# -----------------------------
# 3. Models
# -----------------------------
models = {
    "Linear Regression": LinearRegression(),
    "Random Forest": RandomForestRegressor(
        n_estimators=100,
        random_state=42
    ),
    "XGBoost Regressor": XGBRegressor(
        n_estimators=100,
        learning_rate=0.05,
        random_state=42
    )
}

results = []
trained_objects = {}

best_predictions = None

for name, model in models.items():

    model.fit(X_train, y_train)

    preds = model.predict(X_test)

    results.append({
        "Model": name,
        "MAE": mean_absolute_error(y_test, preds),
        "RMSE": np.sqrt(mean_squared_error(y_test, preds)),
        "R2": r2_score(y_test, preds)
    })

    trained_objects[name] = model

    if name == "Linear Regression":
        best_predictions = preds

results_df = pd.DataFrame(results)

print("\n=== MODEL PERFORMANCE METRICS ===")
print(results_df.to_string(index=False))

# -----------------------------
# 4. Model Comparison Plot
# -----------------------------
sns.set_theme(style="whitegrid")

plt.figure(figsize=(9,5))

sns.barplot(
    x="Model",
    y="R2",
    data=results_df,
    palette="magma"
)

plt.title("Model Comparison: R² Score")
plt.ylabel("R² Score")
plt.ylim(0,1.0)

plt.tight_layout()
plt.savefig("model_comparison.png", dpi=300)
plt.close()

print("✅ Saved 'model_comparison.png'")

# -----------------------------
# 5. Actual vs Predicted Plot
# -----------------------------
plt.figure(figsize=(6,6))

plt.scatter(
    y_test,
    best_predictions,
    alpha=0.7
)

plt.plot(
    [y_test.min(), y_test.max()],
    [y_test.min(), y_test.max()],
    "r--",
    linewidth=2
)

plt.xlabel("Actual Carbon Emission")
plt.ylabel("Predicted Carbon Emission")
plt.title("Actual vs Predicted Values")

plt.tight_layout()
plt.savefig("actual_vs_predicted.png", dpi=300)
plt.close()

print("✅ Saved 'actual_vs_predicted.png'")

# -----------------------------
# 6. Residual Plot
# -----------------------------
residuals = y_test - best_predictions

plt.figure(figsize=(7,5))

plt.scatter(
    best_predictions,
    residuals,
    alpha=0.7
)

plt.axhline(
    y=0,
    color="red",
    linestyle="--"
)

plt.xlabel("Predicted Carbon Emission")
plt.ylabel("Residual Error")
plt.title("Residual Error Plot")

plt.tight_layout()
plt.savefig("residual_plot.png", dpi=300)
plt.close()

print("✅ Saved 'residual_plot.png'")

# -----------------------------
# 7. Save Best Model
# -----------------------------
joblib.dump(
    trained_objects["Linear Regression"],
    os.path.join("models", "model.pkl")
)

print("✅ Successfully updated 'models/model.pkl'")