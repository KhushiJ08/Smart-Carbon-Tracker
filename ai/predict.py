import sys
import json
import joblib
import os

current_dir = os.path.dirname(__file__)
model_path = os.path.join(current_dir, "models", "model.pkl")

# Load the newly trained, high-accuracy model
model = joblib.load(model_path)

transport = float(sys.argv[1])
electricity = float(sys.argv[2])
fuel = float(sys.argv[3])

prediction = model.predict([[transport, electricity, fuel]])

result = {
    "predicted_emission": round(float(prediction[0]), 2)
}

print(json.dumps(result))