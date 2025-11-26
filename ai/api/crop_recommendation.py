from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import joblib
import os

router = APIRouter()

# Load the model
model_path = os.path.join(os.path.dirname(__file__), '..', 'artifacts', 'crop_recommendation', 'model.pkl')
try:
    model = joblib.load(model_path)
except FileNotFoundError:
    raise RuntimeError("Model file not found. Please train the model first.")

class CropInput(BaseModel):
    temperature: float
    rainfall: float
    ph: float
    nitrogen: float
    phosphorus: float
    potassium: float

class CropOutput(BaseModel):
    recommended_crop: str

@router.post("/predict_crop", response_model=CropOutput)
async def predict_crop(input_data: CropInput):
    try:
        # Prepare input for model
        features = [[
            input_data.temperature,
            input_data.rainfall,
            input_data.ph,
            input_data.nitrogen,
            input_data.phosphorus,
            input_data.potassium
        ]]

        # Make prediction
        prediction = model.predict(features)[0]

        return CropOutput(recommended_crop=prediction)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

# Export the router
crop_recommendation_router = router