import pandas as pd
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import PolynomialFeatures
from sklearn.pipeline import make_pipeline
from sklearn.metrics import mean_absolute_error, r2_score
from sklearn.model_selection import train_test_split
import joblib

# ------------------ LOAD / DEFINE DATA ------------------
# Replace this with your actual dataset if needed

# Example dummy data (you can replace with your real data)
data = {
    "transport": [10, 20, 15, 30, 25, 18, 22, 27],
    "electricity": [50, 60, 55, 65, 70, 58, 62, 68],
    "fuel": [5, 8, 6, 9, 7, 6, 8, 9],
    "emission": [20, 35, 28, 45, 40, 30, 38, 42]
}

df = pd.DataFrame(data)

# ------------------ DATASET CLEANING ------------------
df = df.dropna()

# ------------------ SMOOTHING (ROLLING AVERAGE) ------------------
df["smoothed_emission"] = df["emission"].rolling(window=3).mean()

# Remove NaN values after smoothing
df = df.dropna()

# Features and target
X = df[["transport", "electricity", "fuel"]]
y = df["smoothed_emission"]

# ------------------ TRAIN TEST SPLIT ------------------
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# ------------------ LINEAR MODEL ------------------
linear_model = LinearRegression()
linear_model.fit(X_train, y_train)

# ------------------ POLYNOMIAL MODEL ------------------
poly_model = make_pipeline(PolynomialFeatures(2), LinearRegression())
poly_model.fit(X_train, y_train)

# ------------------ PREDICTIONS ------------------
linear_pred = linear_model.predict(X_test)
poly_pred = poly_model.predict(X_test)

# ------------------ EVALUATION ------------------
linear_mae = mean_absolute_error(y_test, linear_pred)
poly_mae = mean_absolute_error(y_test, poly_pred)

linear_r2 = r2_score(y_test, linear_pred)
poly_r2 = r2_score(y_test, poly_pred)

print("Linear Regression -> MAE:", linear_mae, "R2:", linear_r2)
print("Polynomial Regression -> MAE:", poly_mae, "R2:", poly_r2)

# ------------------ SELECT BEST MODEL ------------------
if poly_r2 > linear_r2:
    final_model = poly_model
    print("✅ Using Polynomial Model")
    best_r2 = poly_r2
else:
    final_model = linear_model
    print("✅ Using Linear Model")
    best_r2 = linear_r2

# ------------------ SAVE MODEL ------------------
joblib.dump(final_model, "model.pkl")

# ------------------ PREDICTION FUNCTION ------------------
def predict_emission(transport, electricity, fuel):
    model = joblib.load("model.pkl")
    prediction = model.predict([[transport, electricity, fuel]])
    
    # Confidence based on R2 score
    confidence = round(best_r2 * 100, 2)

    return {
        "predicted_emission": round(prediction[0], 2),
        "confidence": f"{confidence}%"
    }

# ------------------ TEST OUTPUT ------------------
if __name__ == "__main__":
    result = predict_emission(20, 60, 7)
    print("Prediction:", result)