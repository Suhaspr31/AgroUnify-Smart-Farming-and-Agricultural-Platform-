from fastapi import APIRouter
from services.yield_prediction import YieldPredictionService

router = APIRouter()
yield_predictor = YieldPredictionService()

# Old crop doctor endpoints removed - now using unified Offline Crop Doctor API

# Include yield prediction routes
from .yield_prediction import yield_prediction_router
router.include_router(yield_prediction_router)

# Include crop doctor routes
from .crop_doctor import crop_doctor_router
router.include_router(crop_doctor_router)

# Include crop recommendation routes
from .crop_recommendation import crop_recommendation_router
router.include_router(crop_recommendation_router)

# Function to run Flask app (can be called separately) - REMOVED: Using unified FastAPI service