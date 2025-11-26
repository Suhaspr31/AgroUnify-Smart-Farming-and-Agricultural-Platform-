"""
Offline Crop Doctor API Endpoint
Complete crop analysis API that integrates all AI services
"""

from fastapi import APIRouter, HTTPException, File, UploadFile, Form, BackgroundTasks
from fastapi.responses import JSONResponse, FileResponse
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
import os
import json
from datetime import datetime
from pathlib import Path
import logging

from services.offline_crop_doctor import (
    OfflineCropDoctor,
    CropDoctorInput,
    CropDoctorReport
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/crop-doctor", tags=["crop_doctor"])

# Initialize the Offline Crop Doctor
crop_doctor = OfflineCropDoctor()

class CropDoctorRequest(BaseModel):
    """Request model for crop doctor analysis"""
    soil_type: Optional[str] = Field(None, description="Soil type (clay, sandy, loamy, etc.)")
    weather_data: Optional[Dict[str, Any]] = Field(None, description="Weather data (temperature, humidity, etc.)")
    growth_stage: Optional[str] = Field(None, description="Growth stage (seedling, vegetative, flowering, mature)")
    historical_yield: Optional[List[float]] = Field(None, description="Previous season yields")
    location: Optional[Dict[str, float]] = Field(None, description="Location coordinates (lat, lng)")

class CropDoctorResponse(BaseModel):
    """Response model for crop doctor analysis"""
    status: str
    analysis_id: str
    crop_analysis: Dict[str, Any]
    timestamp: str
    region_info: Optional[Dict[str, Any]] = None
    processing_time_seconds: float

@router.post("/analyze", response_model=CropDoctorResponse)
async def analyze_crop(
    background_tasks: BackgroundTasks,
    image: UploadFile = File(..., description="Crop image (leaf, stem, or fruit)"),
    soil_type: Optional[str] = Form(None),
    weather_temperature: Optional[float] = Form(None),
    weather_humidity: Optional[float] = Form(None),
    growth_stage: Optional[str] = Form(None),
    historical_yield: Optional[str] = Form(None),  # JSON string
    location_lat: Optional[float] = Form(None),
    location_lng: Optional[float] = Form(None)
):
    """
    Complete offline crop analysis using AI

    This endpoint provides comprehensive crop disease detection, severity assessment,
    treatment recommendations, yield prediction, and smart farming advice.

    Parameters:
    - image: Crop image file (JPG, PNG, WEBP)
    - soil_type: Soil type (optional)
    - weather_temperature: Current temperature in Celsius (optional)
    - weather_humidity: Current humidity percentage (optional)
    - growth_stage: Crop growth stage (optional)
    - historical_yield: JSON array of previous yields (optional)
    - location_lat/lng: GPS coordinates (optional)
    """
    start_time = datetime.now()

    try:
        logger.info(f"Starting crop doctor analysis for uploaded image: {image.filename}")

        # Save uploaded image temporarily
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        image_path = f"temp/crop_doctor_{timestamp}_{image.filename}"
        os.makedirs("temp", exist_ok=True)

        with open(image_path, "wb") as buffer:
            content = await image.read()
            buffer.write(content)

        # Parse optional parameters
        weather_data = None
        if weather_temperature is not None or weather_humidity is not None:
            weather_data = {}
            if weather_temperature is not None:
                weather_data['temperature'] = weather_temperature
            if weather_humidity is not None:
                weather_data['humidity'] = weather_humidity

        historical_yields = None
        if historical_yield:
            try:
                historical_yields = json.loads(historical_yield)
            except json.JSONDecodeError:
                historical_yields = None

        location = None
        if location_lat is not None and location_lng is not None:
            location = {'lat': location_lat, 'lng': location_lng}

        # Prepare input data
        input_data = CropDoctorInput(
            image_path=image_path,
            soil_type=soil_type,
            weather_data=weather_data,
            growth_stage=growth_stage,
            historical_yield=historical_yields,
            location=location
        )

        # Perform analysis
        report = await crop_doctor.analyze_crop(input_data)

        # Clean up temporary image
        background_tasks.add_task(os.remove, image_path)

        # Calculate processing time
        processing_time = (datetime.now() - start_time).total_seconds()

        # Format response
        response = CropDoctorResponse(
            status="success",
            analysis_id=f"CROP_DOCTOR_{timestamp}",
            crop_analysis=report.crop_analysis,
            timestamp=report.timestamp,
            region_info=report.region_info,
            processing_time_seconds=round(processing_time, 2)
        )

        logger.info(f"✅ Crop doctor analysis completed in {processing_time:.2f}s")
        return response

    except Exception as e:
        logger.error(f"❌ Crop doctor analysis failed: {e}")

        # Clean up on error
        if 'image_path' in locals() and os.path.exists(image_path):
            os.remove(image_path)

        raise HTTPException(
            status_code=500,
            detail=f"Crop analysis failed: {str(e)}"
        )

@router.get("/overlay/{analysis_id}")
async def get_disease_overlay(analysis_id: str):
    """
    Get the disease overlay image for a completed analysis

    Parameters:
    - analysis_id: Analysis ID from the analysis response
    """
    try:
        # Find overlay image (this is a simplified implementation)
        # In production, you'd store overlay paths in a database
        overlay_dir = Path("temp")
        overlay_files = list(overlay_dir.glob("disease_overlay_*.jpg"))

        if not overlay_files:
            raise HTTPException(status_code=404, detail="Overlay image not found")

        # Return the most recent overlay (simplified)
        overlay_path = max(overlay_files, key=lambda p: p.stat().st_mtime)

        return FileResponse(
            path=overlay_path,
            media_type="image/jpeg",
            filename=f"{analysis_id}_disease_overlay.jpg"
        )

    except Exception as e:
        logger.error(f"❌ Failed to retrieve overlay: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to retrieve overlay: {str(e)}")

@router.get("/health")
async def get_crop_doctor_health():
    """Get health status of the crop doctor service"""
    try:
        health_status = await crop_doctor.get_health_status()

        return {
            "service": "offline_crop_doctor",
            "status": health_status.get("status", "unknown"),
            "version": "1.0.0",
            "services": health_status.get("services", {}),
            "database": health_status.get("database", "unknown"),
            "models_loaded": health_status.get("models_loaded", 0),
            "timestamp": datetime.now().isoformat()
        }

    except Exception as e:
        logger.error(f"❌ Health check failed: {e}")
        return {
            "service": "offline_crop_doctor",
            "status": "unhealthy",
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }

@router.get("/supported-crops")
async def get_supported_crops():
    """Get list of crops supported by the crop doctor"""
    crops = [
        {
            "name": "Rice",
            "code": "rice",
            "common_diseases": ["Bacterial Blight", "Rice Blast", "Brown Spot"],
            "optimal_conditions": "Temperature: 20-35°C, Humidity: 60-80%"
        },
        {
            "name": "Wheat",
            "code": "wheat",
            "common_diseases": ["Rust", "Powdery Mildew", "Septoria"],
            "optimal_conditions": "Temperature: 15-25°C, Humidity: 40-60%"
        },
        {
            "name": "Cotton",
            "code": "cotton",
            "common_diseases": ["Bacterial Blight", "Fusarium Wilt", "Verticillium Wilt"],
            "optimal_conditions": "Temperature: 25-35°C, Humidity: 50-70%"
        },
        {
            "name": "Maize/Corn",
            "code": "maize",
            "common_diseases": ["Gray Leaf Spot", "Northern Corn Leaf Blight", "Common Rust"],
            "optimal_conditions": "Temperature: 20-30°C, Humidity: 50-70%"
        },
        {
            "name": "Tomato",
            "code": "tomato",
            "common_diseases": ["Early Blight", "Late Blight", "Fusarium Wilt"],
            "optimal_conditions": "Temperature: 20-25°C, Humidity: 60-70%"
        },
        {
            "name": "Potato",
            "code": "potato",
            "common_diseases": ["Late Blight", "Early Blight", "Blackleg"],
            "optimal_conditions": "Temperature: 15-20°C, Humidity: 70-80%"
        }
    ]

    return {"crops": crops, "total": len(crops)}

@router.get("/disease-database")
async def get_disease_database():
    """Get comprehensive disease database information"""
    try:
        # This would return the loaded disease database
        # For now, return a summary
        return {
            "total_diseases": len(crop_doctor.disease_database.get('diseases', {})),
            "total_treatments": len(crop_doctor.treatment_database),
            "total_pesticides": len(crop_doctor.pesticide_database),
            "last_updated": datetime.now().isoformat(),
            "categories": ["fungal", "bacterial", "viral", "nutrient_deficiency", "pest_damage"]
        }

    except Exception as e:
        logger.error(f"❌ Failed to retrieve disease database: {e}")
        raise HTTPException(status_code=500, detail=f"Database retrieval failed: {str(e)}")

@router.post("/batch-analyze")
async def batch_analyze_crops(images: List[UploadFile] = File(...)):
    """
    Analyze multiple crop images in batch

    Parameters:
    - images: List of crop image files
    """
    try:
        logger.info(f"Starting batch analysis of {len(images)} images")

        results = []
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")

        for i, image in enumerate(images):
            try:
                # Save image temporarily
                image_path = f"temp/batch_crop_{timestamp}_{i}_{image.filename}"
                os.makedirs("temp", exist_ok=True)

                with open(image_path, "wb") as buffer:
                    content = await image.read()
                    buffer.write(content)

                # Perform analysis
                input_data = CropDoctorInput(image_path=image_path)
                report = await crop_doctor.analyze_crop(input_data)

                results.append({
                    "image_index": i,
                    "filename": image.filename,
                    "analysis": report.crop_analysis,
                    "status": "success"
                })

                # Clean up
                os.remove(image_path)

            except Exception as img_error:
                logger.error(f"❌ Failed to analyze image {i}: {img_error}")
                results.append({
                    "image_index": i,
                    "filename": image.filename,
                    "error": str(img_error),
                    "status": "failed"
                })

        return {
            "status": "completed",
            "batch_id": f"BATCH_{timestamp}",
            "total_images": len(images),
            "successful_analyses": len([r for r in results if r["status"] == "success"]),
            "failed_analyses": len([r for r in results if r["status"] == "failed"]),
            "results": results,
            "timestamp": datetime.now().isoformat()
        }

    except Exception as e:
        logger.error(f"❌ Batch analysis failed: {e}")
        raise HTTPException(status_code=500, detail=f"Batch analysis failed: {str(e)}")

# Export the router
crop_doctor_router = router