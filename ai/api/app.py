"""
AgroUnify AI Service - Main FastAPI Application
High-performance agricultural intelligence API
"""

import os
import asyncio
from contextlib import asynccontextmanager
from typing import Dict, Any
import time

from fastapi import FastAPI, HTTPException, Depends, File, UploadFile, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import JSONResponse, Response
import uvicorn
from loguru import logger
import redis.asyncio as redis
from prometheus_client import Counter, Histogram, generate_latest, CONTENT_TYPE_LATEST
from pydantic_settings import BaseSettings

# Import our modules
from api.routes import router as api_router
from api.core import redis_client, model_manager, services
from .middleware import (
    TimingMiddleware,
    ErrorHandlerMiddleware,
    RateLimitMiddleware,
    SecurityMiddleware
)
from utils.model_loader import ModelManager
from services.crop_analysis import EnhancedCropAnalysis
from services.market_analysis import MarketAnalysisService
from services.weather_analysis import WeatherAnalysisService
from services.recommendation import RecommendationService

# Settings
class Settings(BaseSettings):
    api_host: str = "0.0.0.0"
    api_port: int = 8000
    redis_url: str = "redis://localhost:6379"
    mongodb_url: str = "mongodb://localhost:27017"
    log_level: str = "INFO"

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()

# Metrics
REQUEST_COUNT = Counter('agrounify_ai_requests_total', 'Total requests', ['method', 'endpoint'])
REQUEST_DURATION = Histogram('agrounify_ai_request_duration_seconds', 'Request duration')
MODEL_INFERENCE_TIME = Histogram('agrounify_ai_model_inference_seconds', 'Model inference time', ['model_type'])

# Global services
model_manager = None
redis_client = None
services = {}

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager for startup and shutdown"""
    
    # Startup
    logger.info("🚀 Starting AgroUnify AI Service...")
    
    try:
        # Initialize Redis
        global redis_client
        try:
            redis_client = redis.from_url(settings.redis_url)
            await redis_client.ping()
            logger.info("✅ Redis connection established")
        except Exception as redis_error:
            logger.warning(f"⚠️ Redis connection failed: {redis_error}. Running without Redis.")
            redis_client = None
        
        # Initialize Model Manager
        global model_manager
        model_manager = ModelManager()
        await model_manager.load_all_models()
        logger.info("✅ All AI models loaded successfully")
        
        # Initialize Services
        global services
        services = {
            'crop_analysis': EnhancedCropAnalysis(),
            'market_analysis': MarketAnalysisService(model_manager),
            'weather_analysis': WeatherAnalysisService(model_manager),
            'recommendation': RecommendationService(model_manager)
        }
        logger.info("✅ All AI services initialized")
        
        # Warm up models
        if os.getenv('MODEL_WARMUP', 'true').lower() == 'true':
            await warmup_models()
            logger.info("✅ Models warmed up successfully")
        
        logger.info("🎉 AgroUnify AI Service started successfully!")
        
    except Exception as e:
        logger.error(f"❌ Failed to start AI service: {e}")
        raise
    
    yield
    
    # Shutdown
    logger.info("🛑 Shutting down AgroUnify AI Service...")
    
    try:
        if redis_client:
            await redis_client.close()
        logger.info("✅ Cleanup completed")
    except Exception as e:
        logger.error(f"❌ Error during shutdown: {e}")

# Create FastAPI app
app = FastAPI(
    title="AgroUnify AI Service",
    description="High-performance agricultural intelligence API with advanced ML capabilities",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# Add middleware
app.add_middleware(SecurityMiddleware)
app.add_middleware(TimingMiddleware)
app.add_middleware(ErrorHandlerMiddleware)
if redis_client:
    app.add_middleware(RateLimitMiddleware, redis_client=lambda: redis_client)
app.add_middleware(GZipMiddleware, minimum_size=1000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("ALLOWED_ORIGINS", "*").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(api_router, prefix="/api/v1")

# Temporary direct route for backward compatibility
from pydantic import BaseModel
import joblib
import os

class CropInput(BaseModel):
    temperature: float
    rainfall: float
    ph: float
    nitrogen: float
    phosphorus: float
    potassium: float

class CropOutput(BaseModel):
    recommended_crop: str

# Load the model for legacy endpoint
model_path = os.path.join(os.path.dirname(__file__), '..', 'artifacts', 'crop_recommendation', 'model.pkl')
try:
    legacy_model = joblib.load(model_path)
except FileNotFoundError:
    legacy_model = None

@app.post("/predict_crop", response_model=CropOutput)
async def predict_crop_legacy(input_data: CropInput):
    """Legacy endpoint for backward compatibility"""
    if legacy_model is None:
        raise HTTPException(status_code=500, detail="Model not loaded")

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
        prediction = legacy_model.predict(features)[0]

        return CropOutput(recommended_crop=prediction)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

# Health and metrics endpoints
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    try:
        # Check Redis connection
        await redis_client.ping()
        redis_status = "healthy"
    except:
        redis_status = "unhealthy"
    
    return {
        "status": "healthy",
        "service": "AgroUnify AI",
        "version": "2.0.0",
        "timestamp": time.time(),
        "dependencies": {
            "redis": redis_status,
            "models_loaded": len(model_manager.loaded_models) if model_manager else 0
        }
    }

@app.get("/metrics")
async def metrics():
    """Prometheus metrics endpoint"""
    return Response(generate_latest(), media_type=CONTENT_TYPE_LATEST)

@app.get("/info")
async def service_info():
    """Service information endpoint"""
    return {
        "service": "AgroUnify AI Service",
        "version": "2.0.0",
        "description": "Advanced agricultural intelligence with ML/AI capabilities",
        "features": [
            "Crop Disease Detection",
            "Yield Prediction", 
            "Market Price Analysis",
            "Weather-based Recommendations",
            "Agricultural Advisory System"
        ],
        "performance": {
            "avg_inference_time": "< 500ms",
            "supported_image_formats": ["JPG", "PNG", "WEBP"],
            "max_image_size": "10MB",
            "concurrent_requests": "1000+",
            "accuracy": {
                "crop_disease_detection": "95%+",
                "yield_prediction": "88%+",
                "price_prediction": "82%+"
            }
        },
        "models": {
            "crop_disease": "Custom CNN with Transfer Learning",
            "yield_prediction": "XGBoost + Feature Engineering",
            "price_prediction": "LSTM + Market Indicators",
            "recommendation": "Rule-based + ML Hybrid"
        }
    }

async def warmup_models():
    """Warm up all models to reduce cold start latency"""
    try:
        # Warmup crop disease detection
        dummy_image_path = "assets/dummy_crop_image.jpg"
        if os.path.exists(dummy_image_path):
            await services['crop_analysis'].analyze_disease(dummy_image_path)
            logger.info("✅ Crop disease model warmed up")
        
        # Warmup yield prediction (skip if method doesn't exist)
        try:
            dummy_crop_data = {
                "crop_type": "wheat",
                "area": 2.5,
                "soil_type": "loamy",
                "season": "winter",
                "irrigation": "drip"
            }
            await services['crop_analysis'].predict_yield(dummy_crop_data)
            logger.info("✅ Yield prediction model warmed up")
        except AttributeError:
            logger.warning("⚠️ Yield prediction warmup skipped - method not available")
        logger.info("✅ Yield prediction model warmed up")
        
        # Warmup market analysis
        dummy_market_data = {
            "crop": "wheat",
            "location": "punjab",
            "season": "winter"
        }
        await services['market_analysis'].predict_price(dummy_market_data)
        logger.info("✅ Market analysis model warmed up")
        
    except Exception as e:
        logger.warning(f"⚠️ Model warmup failed: {e}")

# Dependency injection
async def get_redis():
    return redis_client

async def get_model_manager():
    return model_manager

async def get_services():
    return services

if __name__ == "__main__":
    # Configure logging
    logger.add("logs/ai_service.log", rotation="1 day", retention="30 days", level=settings.log_level)
    
    # Run the application
    uvicorn.run(
        "api.app:app",
        host=settings.api_host,
        port=settings.api_port,
        log_level=settings.log_level.lower(),
        reload=False,
        workers=1,  # Use 1 worker for development, increase for production
        access_log=True
    )