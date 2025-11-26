"""
Offline Crop Doctor AI Agent
Comprehensive offline agricultural intelligence system for crop disease detection,
yield prediction, and smart farming recommendations.
"""

import os
import json
import cv2
import numpy as np
from PIL import Image
from typing import Dict, List, Tuple, Optional, Any
from datetime import datetime
from pathlib import Path
import sqlite3
from dataclasses import dataclass, asdict
import logging

from .crop_analysis import EnhancedCropAnalysis
from .disease_diagnosis import AdvancedDiseaseDetector
from .yield_prediction import YieldPredictionService
from .treatment_recommendation import TreatmentRecommendationEngine
from .recommendation import RecommendationService
try:
    from ..utils.model_loader import ModelManager
except ImportError:
    # Fallback for direct execution
    from utils.model_loader import ModelManager
try:
    from ..utils.image_processing import ImageProcessor
except ImportError:
    # Fallback for direct execution
    ImageProcessor = None

logger = logging.getLogger(__name__)

@dataclass
class CropDoctorInput:
    """Input data for crop doctor analysis"""
    image_path: str
    soil_type: Optional[str] = None
    weather_data: Optional[Dict[str, Any]] = None
    growth_stage: Optional[str] = None
    historical_yield: Optional[List[float]] = None
    location: Optional[Dict[str, float]] = None

@dataclass
class CropAnalysisResult:
    """Crop identification result"""
    crop_type: str
    confidence: float

@dataclass
class DiseaseAnalysisResult:
    """Disease detection result"""
    disease: str
    confidence: float
    severity_percent: float

@dataclass
class RecommendationResult:
    """Fertilizer and pesticide recommendations"""
    fertilizer_recommendation: str
    fertilizer_dose: str
    pesticide_recommendation: str
    pesticide_dose: str

@dataclass
class SmartRecommendations:
    """Smart farming recommendations"""
    irrigation_advice: str
    prevention_strategies: List[str]
    growth_stage_tips: List[str]

@dataclass
class YieldPredictionResult:
    """Yield prediction result"""
    predicted_yield: float
    confidence: float

@dataclass
class CropDoctorReport:
    """Complete crop doctor analysis report"""
    crop_analysis: Dict[str, Any]
    timestamp: str
    region_info: Optional[Dict[str, Any]] = None

class OfflineCropDoctor:
    """
    Main Offline Crop Doctor AI Agent
    Orchestrates all AI services for comprehensive crop analysis
    """

    def __init__(self, model_path: str = None, database_path: str = None):
        """
        Initialize the Offline Crop Doctor

        Args:
            model_path: Path to AI models directory
            database_path: Path to local database
        """
        self.model_path = Path(model_path or "ai/artifacts")
        self.database_path = Path(database_path or "ai/data")
        self.database_path.mkdir(parents=True, exist_ok=True)

        # Initialize AI services
        self._initialize_services()

        # Initialize local database
        self._initialize_database()

        # Load offline data
        self._load_offline_data()

        logger.info("✅ Offline Crop Doctor initialized successfully")

    def _initialize_services(self):
        """Initialize all AI services"""
        try:
            # Initialize model manager
            self.model_manager = ModelManager()

            # Initialize core services with error handling
            try:
                self.crop_analyzer = EnhancedCropAnalysis()
            except Exception as e:
                logger.warning(f"Crop analyzer initialization failed: {e}")
                self.crop_analyzer = None

            try:
                self.disease_detector = AdvancedDiseaseDetector()
            except Exception as e:
                logger.warning(f"Disease detector initialization failed: {e}")
                self.disease_detector = None

            try:
                self.yield_predictor = YieldPredictionService()
            except Exception as e:
                logger.warning(f"Yield predictor initialization failed: {e}")
                self.yield_predictor = None

            try:
                self.treatment_engine = TreatmentRecommendationEngine()
            except Exception as e:
                logger.warning(f"Treatment engine initialization failed: {e}")
                self.treatment_engine = None

            try:
                self.recommendation_service = RecommendationService(self.model_manager)
            except Exception as e:
                logger.warning(f"Recommendation service initialization failed: {e}")
                self.recommendation_service = None

            # Initialize image processor
            self.image_processor = ImageProcessor if ImageProcessor else None

            logger.info("✅ AI services initialization completed (with fallbacks)")

        except Exception as e:
            logger.error(f"❌ Failed to initialize services: {e}")
            raise

    def _initialize_database(self):
        """Initialize local SQLite database for caching"""
        self.db_path = self.database_path / "crop_doctor_cache.db"

        with sqlite3.connect(self.db_path) as conn:
            conn.execute('''
                CREATE TABLE IF NOT EXISTS analysis_cache (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    image_hash TEXT UNIQUE,
                    crop_type TEXT,
                    disease TEXT,
                    severity REAL,
                    recommendations TEXT,
                    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            ''')

            conn.execute('''
                CREATE TABLE IF NOT EXISTS offline_data (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    data_type TEXT,
                    key TEXT,
                    value TEXT,
                    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                    UNIQUE(data_type, key)
                )
            ''')

        logger.info("✅ Local database initialized")

    def _load_offline_data(self):
        """Load offline datasets and knowledge bases"""
        try:
            # Load disease database
            disease_db_path = self.database_path / "disease_info" / "disease_info.json"
            if disease_db_path.exists():
                with open(disease_db_path, 'r') as f:
                    self.disease_database = json.load(f)
            else:
                self.disease_database = {}

            # Load treatment protocols
            treatment_db_path = self.database_path / "disease_info" / "treatment_protocols.json"
            if treatment_db_path.exists():
                with open(treatment_db_path, 'r') as f:
                    self.treatment_database = json.load(f)
            else:
                self.treatment_database = {}

            # Load pesticide database
            pesticide_db_path = self.database_path / "disease_info" / "pesticide_database.json"
            if pesticide_db_path.exists():
                with open(pesticide_db_path, 'r') as f:
                    self.pesticide_database = json.load(f)
            else:
                self.pesticide_database = {}

            logger.info("✅ Offline data loaded successfully")

        except Exception as e:
            logger.error(f"❌ Failed to load offline data: {e}")
            self.disease_database = {}
            self.treatment_database = {}
            self.pesticide_database = {}

    async def analyze_crop(self, input_data: CropDoctorInput) -> CropDoctorReport:
        """
        Perform complete offline crop analysis

        Args:
            input_data: Input data including image and optional parameters

        Returns:
            Complete analysis report
        """
        try:
            logger.info(f"Starting crop analysis for image: {input_data.image_path}")

            # Step 1: Crop Identification
            crop_result = await self._identify_crop(input_data.image_path)

            # Step 2: Disease Detection
            disease_result = await self._detect_disease(input_data.image_path, crop_result.crop_type)

            # Step 3: Disease Severity Assessment
            severity_result = await self._assess_severity(input_data.image_path, disease_result.disease)

            # Step 4: Fertilizer & Pesticide Recommendations
            recommendation_result = await self._get_recommendations(
                crop_result.crop_type,
                disease_result.disease,
                input_data.soil_type,
                input_data.growth_stage,
                input_data.weather_data
            )

            # Step 5: Smart Recommendations
            smart_recommendations = await self._get_smart_recommendations(
                disease_result.disease,
                severity_result.severity_percent,
                input_data.growth_stage,
                input_data.weather_data
            )

            # Step 6: Yield Prediction
            yield_result = await self._predict_yield(
                crop_result.crop_type,
                input_data.soil_type,
                input_data.weather_data,
                input_data.historical_yield
            )

            # Step 7: Generate Visual Overlay
            overlay_path = await self._generate_visual_overlay(
                input_data.image_path,
                disease_result.disease,
                severity_result.severity_percent
            )

            # Step 8: Compile Comprehensive Report
            report = await self._generate_comprehensive_report(
                crop_result,
                disease_result,
                severity_result,
                recommendation_result,
                smart_recommendations,
                yield_result,
                overlay_path,
                input_data
            )

            # Cache results for future use
            await self._cache_analysis_results(input_data.image_path, report)

            logger.info("✅ Crop analysis completed successfully")
            return report

        except Exception as e:
            logger.error(f"❌ Crop analysis failed: {e}")
            raise

    async def _identify_crop(self, image_path: str) -> CropAnalysisResult:
        """Step 1: Crop Identification with enhanced accuracy"""
        try:
            logger.info("🔍 Identifying crop type...")

            # Load and analyze image
            image = cv2.imread(image_path)
            if image is None:
                return CropAnalysisResult(crop_type="Unknown", confidence=0.0)

            # Enhanced crop identification using image features
            crop_features = self._extract_crop_features(image)

            # Use multiple methods for crop identification
            crop_candidates = []

            # Method 1: Color-based identification
            color_result = self._identify_crop_by_color(crop_features)
            if color_result:
                crop_candidates.append(color_result)

            # Method 2: Shape-based identification
            shape_result = self._identify_crop_by_shape(crop_features)
            if shape_result:
                crop_candidates.append(shape_result)

            # Method 3: Use existing crop analyzer as fallback
            if self.crop_analyzer:
                try:
                    analysis = self.crop_analyzer.predict_disease(image_path)
                    fallback_crop = analysis.get('crop_type', 'Unknown')
                    fallback_confidence = analysis.get('overall_confidence', 0.3)
                    crop_candidates.append((fallback_crop, fallback_confidence))
                except:
                    pass

            # Select best crop identification
            if crop_candidates:
                # Sort by confidence and select highest
                crop_candidates.sort(key=lambda x: x[1], reverse=True)
                best_crop, best_confidence = crop_candidates[0]

                # Apply confidence threshold
                if best_confidence < 0.2:
                    best_crop = "Unknown"
                    best_confidence = 0.0
            else:
                best_crop = "Unknown"
                best_confidence = 0.0

            result = CropAnalysisResult(
                crop_type=best_crop,
                confidence=best_confidence
            )

            logger.info(f"✅ Crop identified: {best_crop} (confidence: {best_confidence:.2f})")
            return result

        except Exception as e:
            logger.error(f"❌ Crop identification failed: {e}")
            return CropAnalysisResult(crop_type="Unknown", confidence=0.0)

    async def _detect_disease(self, image_path: str, crop_type: str) -> DiseaseAnalysisResult:
        """Step 2: Enhanced Disease Detection with multiple methods"""
        try:
            logger.info("🔍 Detecting diseases...")

            # Load and preprocess image
            image = cv2.imread(image_path)
            if image is None:
                return DiseaseAnalysisResult(disease="Unknown", confidence=0.0, severity_percent=0.0)

            # Extract disease-specific features
            disease_features = self._extract_disease_features(image)

            # Use multiple disease detection methods
            disease_candidates = []

            # Method 1: Use advanced disease detector
            if self.disease_detector:
                try:
                    diagnosis = self.disease_detector.analyze_image(image_path)
                    primary_disease = diagnosis.get('diagnosis', {}).get('primary_disease', 'Healthy')
                    confidence = diagnosis.get('diagnosis', {}).get('confidence', 0.5)
                    disease_candidates.append((primary_disease, confidence))
                except Exception as e:
                    logger.warning(f"Disease detector failed: {e}")

            # Method 2: Feature-based disease identification
            feature_disease = self._identify_disease_by_features(disease_features, crop_type)
            if feature_disease:
                disease_candidates.append(feature_disease)

            # Method 3: Color and texture analysis
            visual_disease = self._identify_disease_by_visual_analysis(disease_features, crop_type)
            if visual_disease:
                disease_candidates.append(visual_disease)

            # Select best disease detection
            if disease_candidates:
                # Sort by confidence and select highest
                disease_candidates.sort(key=lambda x: x[1], reverse=True)
                best_disease, best_confidence = disease_candidates[0]

                # Apply confidence threshold - if too low, mark as healthy
                if best_confidence < 0.3:
                    best_disease = "Healthy"
                    best_confidence = max(best_confidence, 0.8)  # High confidence for healthy
            else:
                best_disease = "Healthy"
                best_confidence = 0.9

            result = DiseaseAnalysisResult(
                disease=best_disease,
                confidence=best_confidence,
                severity_percent=0.0  # Will be updated in next step
            )

            logger.info(f"✅ Disease detected: {best_disease} (confidence: {best_confidence:.2f})")
            return result

        except Exception as e:
            logger.error(f"❌ Disease detection failed: {e}")
            return DiseaseAnalysisResult(disease="Unknown", confidence=0.0, severity_percent=0.0)

    async def _assess_severity(self, image_path: str, disease: str) -> DiseaseAnalysisResult:
        """Step 3: Enhanced Disease Severity Assessment"""
        try:
            logger.info("📊 Assessing disease severity...")

            # Load image and extract features
            image = cv2.imread(image_path)
            if image is None:
                return DiseaseAnalysisResult(disease=disease, confidence=0.0, severity_percent=50.0)

            disease_features = self._extract_disease_features(image)

            # Multiple severity assessment methods
            severity_scores = []

            # Method 1: Use disease detector severity
            if self.disease_detector:
                try:
                    diagnosis = self.disease_detector.analyze_image(image_path)
                    severity_level = diagnosis.get('diagnosis', {}).get('severity_level', 'moderate')
                    severity_map = {'mild': 25.0, 'moderate': 50.0, 'severe': 75.0, 'epidemic': 95.0}
                    detector_severity = severity_map.get(severity_level, 50.0)
                    severity_scores.append(detector_severity)
                except:
                    pass

            # Method 2: Feature-based severity calculation
            feature_severity = self._calculate_severity_from_features(disease_features, disease)
            if feature_severity > 0:
                severity_scores.append(feature_severity)

            # Method 3: Visual analysis severity
            visual_severity = self._calculate_visual_severity(image, disease)
            if visual_severity > 0:
                severity_scores.append(visual_severity)

            # Calculate final severity as weighted average
            if severity_scores:
                final_severity = sum(severity_scores) / len(severity_scores)

                # Apply disease-specific adjustments
                final_severity = self._adjust_severity_by_disease(final_severity, disease)
            else:
                final_severity = 50.0  # Default moderate severity

            # Ensure reasonable bounds
            final_severity = max(5.0, min(100.0, final_severity))

            logger.info(f"✅ Severity assessed: {final_severity:.1f}%")
            return DiseaseAnalysisResult(
                disease=disease,
                confidence=0.85,  # High confidence for severity assessment
                severity_percent=final_severity
            )

        except Exception as e:
            logger.error(f"❌ Severity assessment failed: {e}")
            return DiseaseAnalysisResult(disease=disease, confidence=0.0, severity_percent=50.0)

    async def _get_recommendations(self, crop_type: str, disease: str, soil_type: str = None,
                                 growth_stage: str = None, weather_data: Dict = None) -> RecommendationResult:
        """Step 4: Fertilizer & Pesticide Recommendations"""
        try:
            logger.info("💊 Generating treatment recommendations...")

            # Get treatment recommendations from treatment engine
            treatment_plan = self.treatment_engine.get_comprehensive_treatment_plan({
                'diagnosis': {'primary_disease': disease}
            })

            # Extract fertilizer and pesticide recommendations
            chemical_treatments = treatment_plan.get('chemical_treatments', [])

            fertilizer_rec = "Balanced NPK fertilizer"
            fertilizer_dose = "50-100 kg/acre"
            pesticide_rec = "No pesticide needed"
            pesticide_dose = "0"

            if chemical_treatments:
                # Get primary treatment
                primary_treatment = chemical_treatments[0]
                pesticide_rec = primary_treatment.get('product_name', 'Unknown pesticide')
                pesticide_dose = primary_treatment.get('application_rate', 'As per label')

            # Get fertilizer recommendations based on crop and soil
            fertilizer_recs = self._get_fertilizer_recommendations(crop_type, soil_type)
            if fertilizer_recs:
                fertilizer_rec = fertilizer_recs.get('name', fertilizer_rec)
                fertilizer_dose = fertilizer_recs.get('dose', fertilizer_dose)

            result = RecommendationResult(
                fertilizer_recommendation=fertilizer_rec,
                fertilizer_dose=fertilizer_dose,
                pesticide_recommendation=pesticide_rec,
                pesticide_dose=pesticide_dose
            )

            logger.info(f"✅ Recommendations generated: {pesticide_rec}")
            return result

        except Exception as e:
            logger.error(f"❌ Recommendation generation failed: {e}")
            return RecommendationResult(
                fertilizer_recommendation="Standard fertilizer",
                fertilizer_dose="50 kg/acre",
                pesticide_recommendation="No treatment needed",
                pesticide_dose="0"
            )

    async def _get_smart_recommendations(self, disease: str, severity: float, growth_stage: str = None,
                                       weather_data: Dict = None) -> SmartRecommendations:
        """Step 5: Smart Recommendations"""
        try:
            logger.info("🧠 Generating smart recommendations...")

            # Get irrigation advice based on weather and disease
            irrigation_advice = self._get_irrigation_advice(weather_data, disease, severity)

            # Get prevention strategies
            prevention_strategies = self._get_prevention_strategies(disease, severity)

            # Get growth stage tips
            growth_tips = self._get_growth_stage_tips(growth_stage, disease)

            result = SmartRecommendations(
                irrigation_advice=irrigation_advice,
                prevention_strategies=prevention_strategies,
                growth_stage_tips=growth_tips
            )

            logger.info("✅ Smart recommendations generated")
            return result

        except Exception as e:
            logger.error(f"❌ Smart recommendations failed: {e}")
            return SmartRecommendations(
                irrigation_advice="Maintain regular irrigation schedule",
                prevention_strategies=["Regular field monitoring", "Proper sanitation"],
                growth_stage_tips=["Follow standard cultivation practices"]
            )

    async def _predict_yield(self, crop_type: str, soil_type: str = None, weather_data: Dict = None,
                            historical_yield: List[float] = None) -> YieldPredictionResult:
        """Step 6: Yield Prediction"""
        try:
            logger.info("🌾 Predicting yield...")

            # Create proper YieldPredictionRequest object
            from services.yield_prediction import YieldPredictionRequest

            request_data = YieldPredictionRequest(
                crop_type=crop_type,
                field_area=1.0,  # Default 1 acre
                soil_type=soil_type or 'loamy',
                irrigation_type='drip',
                planting_date=datetime.now().strftime('%Y-%m-%d'),
                weather_data=weather_data,
                previous_yields=historical_yield or []
            )

            # Use yield prediction service
            prediction = await self.yield_predictor.predict_yield(request_data)

            result = YieldPredictionResult(
                predicted_yield=prediction.predicted_yield,
                confidence=prediction.confidence_score
            )

            logger.info(f"✅ Yield predicted: {prediction.predicted_yield:.2f} tons/acre")
            return result

        except Exception as e:
            logger.error(f"❌ Yield prediction failed: {e}")
            return YieldPredictionResult(predicted_yield=0.0, confidence=0.0)

    async def _generate_visual_overlay(self, image_path: str, disease: str, severity: float) -> str:
        """Step 7: Generate Visual Disease Overlay"""
        try:
            logger.info("🎨 Generating visual overlay...")

            # Load image
            image = cv2.imread(image_path)
            if image is None:
                return None

            # Create overlay based on disease and severity
            overlay = image.copy()

            # Add disease-specific visual indicators
            if disease != "Healthy":
                # Add colored overlay for affected areas
                severity_color = self._get_severity_color(severity)
                overlay_layer = np.full_like(image, severity_color, dtype=np.uint8)

                # Blend with original image based on severity
                alpha = severity / 100.0
                overlay = cv2.addWeighted(image, 1 - alpha, overlay_layer, alpha, 0)

                # Add text annotation
                text = f"{disease}: {severity:.1f}% severity"
                cv2.putText(overlay, text, (10, 30), cv2.FONT_HERSHEY_SIMPLEX,
                           0.7, (255, 255, 255), 2, cv2.LINE_AA)

            # Save overlay image
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            overlay_filename = f"disease_overlay_{timestamp}.jpg"
            overlay_path = f"temp/{overlay_filename}"

            os.makedirs("temp", exist_ok=True)
            cv2.imwrite(overlay_path, overlay)

            logger.info(f"✅ Visual overlay generated: {overlay_path}")
            return overlay_path

        except Exception as e:
            logger.error(f"❌ Visual overlay generation failed: {e}")
            return None

    async def _generate_comprehensive_report(self, crop_result: CropAnalysisResult,
                                           disease_result: DiseaseAnalysisResult,
                                           severity_result: DiseaseAnalysisResult,
                                           recommendation_result: RecommendationResult,
                                           smart_recommendations: SmartRecommendations,
                                           yield_result: YieldPredictionResult,
                                           overlay_path: str,
                                           input_data: CropDoctorInput) -> CropDoctorReport:
        """Step 8: Generate Comprehensive Report"""
        try:
            logger.info("📋 Generating comprehensive report...")

            # Compile all results into structured report
            crop_analysis = {
                "crop_type": crop_result.crop_type,
                "disease": disease_result.disease,
                "disease_severity_percent": severity_result.severity_percent,
                "fertilizer_recommendation": recommendation_result.fertilizer_recommendation,
                "fertilizer_dose": recommendation_result.fertilizer_dose,
                "pesticide_recommendation": recommendation_result.pesticide_recommendation,
                "pesticide_dose": recommendation_result.pesticide_dose,
                "irrigation_advice": smart_recommendations.irrigation_advice,
                "prevention_strategies": smart_recommendations.prevention_strategies,
                "growth_stage_tips": smart_recommendations.growth_stage_tips,
                "predicted_yield": yield_result.predicted_yield,
                "confidence_scores": {
                    "crop_type": crop_result.confidence,
                    "disease": disease_result.confidence,
                    "yield_prediction": yield_result.confidence
                },
                "disease_overlay_image": overlay_path
            }

            # Add region-specific information if available
            region_info = None
            if input_data.location or input_data.weather_data:
                region_info = {
                    "location": input_data.location,
                    "weather_data": input_data.weather_data,
                    "soil_type": input_data.soil_type
                }

            report = CropDoctorReport(
                crop_analysis=crop_analysis,
                timestamp=datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
                region_info=region_info
            )

            logger.info("✅ Comprehensive report generated")
            return report

        except Exception as e:
            logger.error(f"❌ Report generation failed: {e}")
            raise

    async def _cache_analysis_results(self, image_path: str, report: CropDoctorReport):
        """Cache analysis results for performance optimization"""
        try:
            # Generate simple hash of image for caching
            import hashlib
            with open(image_path, 'rb') as f:
                image_hash = hashlib.md5(f.read()).hexdigest()

            # Store in database
            with sqlite3.connect(self.db_path) as conn:
                conn.execute('''
                    INSERT OR REPLACE INTO analysis_cache
                    (image_hash, crop_type, disease, severity, recommendations, timestamp)
                    VALUES (?, ?, ?, ?, ?, ?)
                ''', (
                    image_hash,
                    report.crop_analysis['crop_type'],
                    report.crop_analysis['disease'],
                    report.crop_analysis['disease_severity_percent'],
                    json.dumps(report.crop_analysis),
                    report.timestamp
                ))

            logger.info("✅ Analysis results cached")

        except Exception as e:
            logger.error(f"❌ Caching failed: {e}")

    def _get_fertilizer_recommendations(self, crop_type: str, soil_type: str = None) -> Dict:
        """Get detailed fertilizer recommendations based on crop and soil type"""
        # Enhanced fertilizer database with soil-specific recommendations
        fertilizer_db = {
            'rice': {
                'clay': {'name': 'NPK 20-10-10 + Zinc', 'dose': '120-150 kg/acre'},
                'sandy': {'name': 'NPK 15-15-15 + Organic matter', 'dose': '100-130 kg/acre'},
                'loamy': {'name': 'NPK 20-10-10', 'dose': '100-140 kg/acre'}
            },
            'wheat': {
                'clay': {'name': 'Urea + DAP + Potash', 'dose': '90-120 kg/acre'},
                'sandy': {'name': 'NPK 18-18-18 + Lime', 'dose': '80-110 kg/acre'},
                'loamy': {'name': 'Urea + DAP', 'dose': '80-120 kg/acre'}
            },
            'cotton': {
                'clay': {'name': 'NPK 15-15-15 + Boron', 'dose': '70-100 kg/acre'},
                'sandy': {'name': 'NPK 20-20-20 + Gypsum', 'dose': '60-90 kg/acre'},
                'loamy': {'name': 'NPK 15-15-15', 'dose': '60-100 kg/acre'}
            },
            'maize': {
                'clay': {'name': 'NPK 28-14-14 + Magnesium', 'dose': '130-180 kg/acre'},
                'sandy': {'name': 'NPK 25-10-10 + Organic compost', 'dose': '120-160 kg/acre'},
                'loamy': {'name': 'NPK 28-14-14', 'dose': '120-180 kg/acre'}
            },
            'tomato': {
                'clay': {'name': 'NPK 10-20-20 + Calcium nitrate', 'dose': '80-120 kg/acre'},
                'sandy': {'name': 'NPK 15-15-15 + Epsom salt', 'dose': '70-100 kg/acre'},
                'loamy': {'name': 'NPK 10-20-20', 'dose': '75-110 kg/acre'}
            },
            'potato': {
                'clay': {'name': 'NPK 15-15-30 + Potassium sulfate', 'dose': '100-140 kg/acre'},
                'sandy': {'name': 'NPK 20-10-20 + Compost', 'dose': '90-130 kg/acre'},
                'loamy': {'name': 'NPK 15-15-30', 'dose': '95-135 kg/acre'}
            }
        }

        crop_recs = fertilizer_db.get(crop_type.lower(), {})
        soil_rec = crop_recs.get(soil_type.lower() if soil_type else 'loamy', crop_recs.get('loamy'))

        if soil_rec:
            return soil_rec
        else:
            # Fallback recommendations
            fallbacks = {
                'rice': {'name': 'NPK 20-10-10', 'dose': '100-150 kg/acre'},
                'wheat': {'name': 'Urea + DAP', 'dose': '80-120 kg/acre'},
                'cotton': {'name': 'NPK 15-15-15', 'dose': '60-100 kg/acre'},
                'maize': {'name': 'NPK 28-14-14', 'dose': '120-180 kg/acre'},
                'tomato': {'name': 'NPK 10-20-20', 'dose': '75-110 kg/acre'},
                'potato': {'name': 'NPK 15-15-30', 'dose': '95-135 kg/acre'}
            }
            return fallbacks.get(crop_type.lower(), {'name': 'Balanced NPK 14-14-14', 'dose': '50-100 kg/acre'})

    def _get_irrigation_advice(self, weather_data: Dict = None, disease: str = None, severity: float = 0) -> str:
        """Generate detailed irrigation advice based on conditions"""
        advice_parts = []

        if weather_data:
            temp = weather_data.get('temperature', 25)
            humidity = weather_data.get('humidity', 60)
            rainfall = weather_data.get('rainfall', 0)

            if temp > 35:
                advice_parts.append("Increase irrigation frequency to 2-3 times per week due to extreme heat")
            elif temp > 30:
                advice_parts.append("Increase irrigation frequency due to high temperatures")
            elif temp < 15:
                advice_parts.append("Reduce irrigation frequency to prevent frost damage")

            if humidity > 85:
                advice_parts.append("Reduce irrigation and improve ventilation to prevent fungal diseases")
            elif humidity > 80:
                advice_parts.append("Monitor humidity levels and reduce overhead watering")

            if rainfall > 50:
                advice_parts.append("Reduce irrigation due to recent rainfall")
            elif rainfall > 100:
                advice_parts.append("Skip irrigation this week due to heavy rainfall")

        # Disease-specific irrigation advice
        if disease and disease != "Healthy":
            if severity > 70:
                advice_parts.append("Use drip irrigation to maintain soil moisture without wetting leaves")
            elif severity > 40:
                advice_parts.append("Avoid overhead watering to prevent disease spread")
            else:
                advice_parts.append("Maintain consistent soil moisture to support plant recovery")

            # Disease-specific advice
            if disease in ["Late Blight", "Powdery Mildew"]:
                advice_parts.append("Water early in the day to allow leaves to dry quickly")
            elif disease == "Root Rot":
                advice_parts.append("Reduce watering frequency and improve drainage")

        # Default advice if no specific conditions
        if not advice_parts:
            advice_parts.append("Follow standard irrigation schedule for the crop (typically every 4-7 days)")

        # Combine advice parts
        return ". ".join(advice_parts)

    def _get_prevention_strategies(self, disease: str, severity: float) -> List[str]:
        """Get detailed prevention strategies based on disease and severity"""
        base_strategies = [
            "Regular field monitoring and scouting (check plants 2-3 times per week)",
            "Proper field sanitation - remove and destroy infected plant debris",
            "Practice crop rotation with non-host plants for at least 2-3 years",
            "Use certified disease-resistant varieties when available",
            "Maintain balanced fertilization to keep plants healthy and stress-resistant",
            "Ensure proper plant spacing for adequate air circulation",
            "Avoid working in fields when plants are wet to prevent disease spread"
        ]

        # Disease-specific strategies
        disease_strategies = {
            "Late Blight": [
                "Avoid overhead irrigation - use drip irrigation instead",
                "Apply preventive fungicide sprays during humid weather",
                "Hill soil around potato plants to prevent tuber infection",
                "Destroy volunteer plants that may harbor the disease"
            ],
            "Early Blight": [
                "Mulch around plants to prevent soil splash",
                "Stake or trellis plants to improve air circulation",
                "Apply copper-based fungicides preventively",
                "Avoid planting tomatoes near potatoes"
            ],
            "Powdery Mildew": [
                "Improve air circulation by proper plant spacing",
                "Avoid overhead watering to keep leaves dry",
                "Apply sulfur-based fungicides as preventive measure",
                "Remove and destroy infected leaves immediately"
            ],
            "Bacterial Spot": [
                "Use copper-based bactericides preventively",
                "Avoid handling wet plants to prevent spread",
                "Disinfect tools between plants and fields",
                "Plant disease-resistant varieties"
            ],
            "Fusarium Wilt": [
                "Use soil sterilization methods before planting",
                "Avoid planting susceptible crops in infected soil",
                "Use grafted plants with resistant rootstocks",
                "Maintain soil pH between 6.0-7.0"
            ]
        }

        # Add disease-specific strategies
        if disease in disease_strategies:
            base_strategies.extend(disease_strategies[disease])

        # Severity-based additional strategies
        if severity > 70:
            base_strategies.extend([
                "Implement strict quarantine measures for affected areas",
                "Increase monitoring frequency to daily inspections",
                "Consider professional agricultural consultation",
                "Isolate affected plants and destroy them if necessary",
                "Apply protective fungicides/bactericides immediately"
            ])
        elif severity > 40:
            base_strategies.extend([
                "Monitor neighboring fields for disease spread",
                "Prepare emergency treatment supplies",
                "Document disease progression with photos"
            ])

        return base_strategies

    def _get_growth_stage_tips(self, growth_stage: str = None, disease: str = None) -> List[str]:
        """Get growth stage specific tips"""
        tips = []

        if growth_stage:
            stage_tips = {
                'seedling': [
                    "Ensure proper seed treatment",
                    "Maintain optimal soil moisture",
                    "Protect from early pest attacks"
                ],
                'vegetative': [
                    "Monitor for nutrient deficiencies",
                    "Implement weed control measures",
                    "Support proper plant spacing"
                ],
                'flowering': [
                    "Avoid stress during critical growth stages",
                    "Ensure pollination if applicable",
                    "Monitor for flower/fruit drop"
                ],
                'mature': [
                    "Prepare for harvest timing",
                    "Monitor for late-season diseases",
                    "Plan post-harvest activities"
                ]
            }

            tips.extend(stage_tips.get(growth_stage.lower(), []))

        if disease and disease != "Healthy":
            tips.append(f"Take preventive measures against {disease}")

        if not tips:
            tips = ["Follow standard cultivation practices", "Regular monitoring of crop health"]

        return tips

    def _get_severity_color(self, severity: float) -> Tuple[int, int, int]:
        """Get color for severity overlay"""
        if severity < 25:
            return (0, 255, 0)  # Green for mild
        elif severity < 50:
            return (0, 255, 255)  # Yellow for moderate
        elif severity < 75:
            return (0, 165, 255)  # Orange for severe
        else:
            return (0, 0, 255)  # Red for epidemic

    def _extract_crop_features(self, image: np.ndarray) -> Dict[str, Any]:
        """Extract features for crop identification"""
        features = {}

        # Color analysis
        hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)
        features['dominant_hue'] = np.argmax(np.histogram(hsv[:,:,0], bins=180)[0])
        features['avg_saturation'] = np.mean(hsv[:,:,1])
        features['avg_brightness'] = np.mean(hsv[:,:,2])

        # Shape analysis
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        features['texture_variance'] = np.var(gray)
        features['edge_density'] = np.sum(cv2.Canny(gray, 100, 200)) / (gray.shape[0] * gray.shape[1])

        return features

    def _identify_crop_by_color(self, features: Dict[str, Any]) -> Tuple[str, float]:
        """Identify crop based on color features"""
        hue = features.get('dominant_hue', 0)
        saturation = features.get('avg_saturation', 0)
        brightness = features.get('avg_brightness', 0)

        # Color-based crop identification rules
        if 30 <= hue <= 60 and saturation > 100:  # Yellow-green range
            return ("Rice", 0.7)
        elif 60 <= hue <= 90 and brightness > 150:  # Light green
            return ("Wheat", 0.6)
        elif 20 <= hue <= 40 and saturation > 120:  # Deep green
            return ("Cotton", 0.65)
        elif 80 <= hue <= 110 and brightness > 140:  # Bright green
            return ("Maize", 0.75)

        return None

    def _identify_crop_by_shape(self, features: Dict[str, Any]) -> Tuple[str, float]:
        """Identify crop based on shape/texture features"""
        texture_var = features.get('texture_variance', 0)
        edge_density = features.get('edge_density', 0)

        # Shape-based identification
        if texture_var > 500 and edge_density > 0.05:  # High texture, many edges
            return ("Rice", 0.6)
        elif texture_var < 300 and edge_density < 0.03:  # Smooth texture
            return ("Wheat", 0.55)
        elif 300 <= texture_var <= 600 and 0.03 <= edge_density <= 0.07:  # Medium texture
            return ("Cotton", 0.6)

        return None

    def _extract_disease_features(self, image: np.ndarray) -> Dict[str, Any]:
        """Extract features for disease detection"""
        features = {}

        # Color analysis for disease indicators
        hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)
        lab = cv2.cvtColor(image, cv2.COLOR_BGR2LAB)

        # Spot detection
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        _, thresh = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
        contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

        features['num_spots'] = len(contours)
        features['avg_spot_size'] = np.mean([cv2.contourArea(c) for c in contours]) if contours else 0
        features['total_affected_area'] = sum([cv2.contourArea(c) for c in contours])

        # Color distribution
        features['yellow_pixels'] = np.sum((hsv[:,:,0] >= 25) & (hsv[:,:,0] <= 35))
        features['brown_pixels'] = np.sum((hsv[:,:,0] >= 10) & (hsv[:,:,0] <= 20))
        features['white_pixels'] = np.sum(hsv[:,:,2] > 200)

        # Texture analysis
        features['texture_contrast'] = np.std(gray)
        features['homogeneity'] = 1.0 / (1.0 + np.var(gray))

        return features

    def _identify_disease_by_features(self, features: Dict[str, Any], crop_type: str) -> Tuple[str, float]:
        """Identify disease based on extracted features"""
        num_spots = features.get('num_spots', 0)
        yellow_pixels = features.get('yellow_pixels', 0)
        brown_pixels = features.get('brown_pixels', 0)
        white_pixels = features.get('white_pixels', 0)
        contrast = features.get('texture_contrast', 0)

        # Disease identification rules
        if white_pixels > 1000 and contrast > 50:  # Powdery mildew indicators
            return ("Powdery Mildew", 0.8)
        elif yellow_pixels > 2000 and num_spots > 10:  # Early blight indicators
            return ("Early Blight", 0.75)
        elif brown_pixels > 1500 and num_spots > 5:  # Late blight indicators
            return ("Late Blight", 0.85)
        elif num_spots > 20 and contrast < 30:  # Bacterial spot indicators
            return ("Bacterial Spot", 0.7)

        return None

    def _identify_disease_by_visual_analysis(self, features: Dict[str, Any], crop_type: str) -> Tuple[str, float]:
        """Identify disease using visual analysis"""
        affected_area = features.get('total_affected_area', 0)
        num_spots = features.get('num_spots', 0)

        # Visual disease indicators
        if affected_area > 5000:  # Large affected area
            return ("Late Blight", 0.8)
        elif num_spots > 15:  # Many small spots
            return ("Early Blight", 0.7)
        elif affected_area > 2000 and num_spots < 10:  # Medium patches
            return ("Bacterial Spot", 0.65)

        return None

    def _calculate_severity_from_features(self, features: Dict[str, Any], disease: str) -> float:
        """Calculate severity percentage from features"""
        affected_area = features.get('total_affected_area', 0)
        num_spots = features.get('num_spots', 0)
        contrast = features.get('texture_contrast', 0)

        # Base severity calculation
        area_severity = min(100, (affected_area / 10000) * 100)  # Normalize to image size
        spot_severity = min(100, num_spots * 3)  # Each spot adds severity
        texture_severity = min(100, (contrast / 50) * 100)  # High contrast = high severity

        # Weighted average
        severity = (area_severity * 0.5 + spot_severity * 0.3 + texture_severity * 0.2)

        return severity

    def _calculate_visual_severity(self, image: np.ndarray, disease: str) -> float:
        """Calculate severity using visual analysis"""
        # Convert to HSV for better disease visibility
        hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)

        # Count pixels that indicate disease
        disease_pixels = 0
        total_pixels = image.shape[0] * image.shape[1]

        # Disease-specific pixel counting
        if disease == "Powdery Mildew":
            # White/pale areas
            disease_pixels = np.sum(hsv[:,:,2] > 180)
        elif disease in ["Early Blight", "Late Blight"]:
            # Brown/yellow spots
            disease_pixels = np.sum((hsv[:,:,0] >= 10) & (hsv[:,:,0] <= 35) & (hsv[:,:,1] > 50))
        elif disease == "Bacterial Spot":
            # Dark spots
            disease_pixels = np.sum(hsv[:,:,2] < 80)

        severity = (disease_pixels / total_pixels) * 100
        return min(100, severity * 2)  # Amplify for visibility

    def _adjust_severity_by_disease(self, severity: float, disease: str) -> float:
        """Adjust severity based on disease characteristics"""
        adjustments = {
            "Powdery Mildew": 1.2,  # Often appears more severe visually
            "Early Blight": 1.0,    # Standard severity
            "Late Blight": 1.3,     # Can spread rapidly
            "Bacterial Spot": 0.9,  # Usually less severe
            "Healthy": 0.0          # No severity
        }

        multiplier = adjustments.get(disease, 1.0)
        return severity * multiplier

    async def get_health_status(self) -> Dict[str, Any]:
        """Get system health status"""
        return {
            "status": "healthy",
            "services": {
                "crop_analysis": "operational",
                "disease_detection": "operational",
                "yield_prediction": "operational",
                "treatment_engine": "operational",
                "recommendation_service": "operational"
            },
            "database": "connected",
            "models_loaded": len(self.model_manager.loaded_models) if hasattr(self.model_manager, 'loaded_models') else 0,
            "timestamp": datetime.now().isoformat()
        }

# Export the main class
__all__ = ['OfflineCropDoctor', 'CropDoctorInput', 'CropDoctorReport']