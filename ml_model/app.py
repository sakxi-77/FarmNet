from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import numpy as np
import pandas as pd

app = Flask(__name__)
CORS(app)

# Load trained model
model = joblib.load("crop_model.pkl")


# ================= HOME ROUTE =================
@app.route("/")
def home():
    return "🌾 Crop Prediction API Running Successfully"


# ================= PREDICTION ROUTE =================
@app.route("/predict", methods=["POST"])
def predict():

    try:

        # Get JSON data from Node.js
        data = request.get_json()

        print("\n📥 Received Data:")
        print(data)

        # Convert input values into numpy array
        features = pd.DataFrame([{
            "N": float(data["N"]),
            "P": float(data["P"]),
            "K": float(data["K"]),
            "temperature": float(data["temperature"]),
            "humidity": float(data["humidity"]),
            "ph": float(data["ph"]),
            "rainfall": float(data["rainfall"])
        }])

        print("\n✅ Processed Features:")
        print(features)

        # Make prediction
        prediction = model.predict(features)

        print("\n🌾 Predicted Crop:")
        print(prediction)

        # Send prediction back
        return jsonify({
            "predicted_crop": str(prediction[0])
        })

    except Exception as e:

        print("\n❌ ERROR OCCURRED:")
        print(e)

        return jsonify({
            "error": str(e)
        })


# ================= RUN SERVER =================
if __name__ == "__main__":
    app.run(port=5000, debug=True)

