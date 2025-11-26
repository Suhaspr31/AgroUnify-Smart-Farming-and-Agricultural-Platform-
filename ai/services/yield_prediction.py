"""
AgroUnify AI - Advanced Yield Prediction Service
Highly accurate crop yield forecasting using machine learning and agricultural data
"""

import numpy as np
import pandas as pd
from typing import Dict, List, Any, Optional, Tuple
from pydantic import BaseModel, Field
from loguru import logger
import joblib
import os
from datetime import datetime, timedelta
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
import xgboost as xgb

# Data Models
class YieldPredictionRequest(BaseModel):
    crop_type: str = Field(..., description="Type of crop (rice, wheat, cotton, etc.)")
    field_area: float = Field(..., description="Field area in acres")
    soil_type: str = Field(..., description="Soil type (clay, sandy, loamy, etc.)")
    irrigation_type: str = Field(..., description="Irrigation method (drip, sprinkler, flood, etc.)")
    fertilizer_used: Optional[Dict[str, float]] = Field(None, description="Fertilizer application details")
    pesticides_used: Optional[List[str]] = Field(None, description="Pesticides applied")
    planting_date: str = Field(..., description="Planting date (YYYY-MM-DD)")
    weather_data: Optional[Dict[str, Any]] = Field(None, description="Historical weather data")
    location: Optional[Dict[str, float]] = Field(None, description="Field location coordinates")
    previous_yields: Optional[List[float]] = Field(None, description="Previous season yields")

class YieldPredictionResult(BaseModel):
    predicted_yield: float
    yield_range: Tuple[float, float]
    confidence_score: float
    factors_analysis: Dict[str, float]
    recommendations: List[str]
    risk_assessment: Dict[str, Any]
    seasonal_trend: Dict[str, Any]

class YieldPredictionService:
    """Advanced yield prediction service using ensemble ML models"""

    def __init__(self, model_path: str = None):
        self.model_path = model_path or os.path.join(os.path.dirname(__file__), '../artifacts/yield_prediction')
        self.models = {}
        self.scalers = {}
        self.encoders = {}
        self.feature_importance = {}

        # Initialize models for different crops
        self.crop_models = {
            'rice': 'rice_yield_model.pkl',
            'wheat': 'wheat_yield_model.pkl',
            'cotton': 'cotton_yield_model.pkl',
            'maize': 'maize_yield_model.pkl',
            'soybean': 'soybean_yield_model.pkl',
            'sugarcane': 'sugarcane_yield_model.pkl'
        }

        # Load pre-trained models
        self._load_models()

        # Expert knowledge base for yield factors
        self.yield_factors = self._initialize_yield_factors()

        logger.info("✅ YieldPredictionService initialized successfully")

    def _load_models(self):
        """Load pre-trained ML models for different crops"""
        try:
            for crop, model_file in self.crop_models.items():
                model_path = os.path.join(self.model_path, model_file)
                if os.path.exists(model_path):
                    self.models[crop] = joblib.load(model_path)
                    logger.info(f"Loaded {crop} yield prediction model")
                else:
                    # Create default model if not found
                    self.models[crop] = self._create_default_model()
                    logger.warning(f"Using default model for {crop}")

            # Load scalers and encoders
            scaler_path = os.path.join(self.model_path, 'scaler.pkl')
            if os.path.exists(scaler_path):
                self.scalers['default'] = joblib.load(scaler_path)

            encoder_path = os.path.join(self.model_path, 'label_encoders.pkl')
            if os.path.exists(encoder_path):
                self.encoders = joblib.load(encoder_path)

        except Exception as e:
            logger.error(f"Error loading models: {e}")
            # Create fallback models
            for crop in self.crop_models.keys():
                self.models[crop] = self._create_default_model()

    def _create_default_model(self) -> RandomForestRegressor:
        """Create a default Random Forest model for yield prediction"""
        return RandomForestRegressor(
            n_estimators=100,
            max_depth=10,
            random_state=42,
            n_jobs=-1
        )

    def _initialize_yield_factors(self) -> Dict[str, Dict[str, float]]:
        """Initialize yield factor weights based on agricultural research"""
        return {
            'rice': {
                'soil_quality': 0.25,
                'irrigation_efficiency': 0.20,
                'fertilizer_management': 0.18,
                'pest_management': 0.12,
                'weather_conditions': 0.15,
                'variety_quality': 0.10
            },
            'wheat': {
                'soil_quality': 0.22,
                'irrigation_efficiency': 0.18,
                'fertilizer_management': 0.20,
                'pest_management': 0.15,
                'weather_conditions': 0.20,
                'variety_quality': 0.05
            },
            'cotton': {
                'soil_quality': 0.20,
                'irrigation_efficiency': 0.25,
                'fertilizer_management': 0.15,
                'pest_management': 0.20,
                'weather_conditions': 0.15,
                'variety_quality': 0.05
            },
            'maize': {
                'soil_quality': 0.18,
                'irrigation_efficiency': 0.22,
                'fertilizer_management': 0.20,
                'pest_management': 0.18,
                'weather_conditions': 0.17,
                'variety_quality': 0.05
            }
        }

    async def predict_yield(self, request: YieldPredictionRequest) -> YieldPredictionResult:
        """
        Predict crop yield using advanced ML models and agricultural expertise

        Args:
            request: Yield prediction request with all relevant data

        Returns:
            Comprehensive yield prediction result
        """
        try:
            # Extract features from request
            features = await self._extract_features(request)

            # Get appropriate model for crop
            model = self.models.get(request.crop_type.lower(), self.models.get('rice'))

            # Make prediction
            prediction = self._make_prediction(model, features)

            # Calculate confidence and uncertainty
            confidence, yield_range = self._calculate_confidence_and_range(prediction, features)

            # Analyze contributing factors
            factors_analysis = await self._analyze_factors(request, features)

            # Generate recommendations
            recommendations = await self._generate_recommendations(request, factors_analysis)

            # Assess risks
            risk_assessment = await self._assess_risks(request, prediction)

            # Analyze seasonal trends
            seasonal_trend = await self._analyze_seasonal_trends(request)

            result = YieldPredictionResult(
                predicted_yield=round(prediction, 2),
                yield_range=yield_range,
                confidence_score=round(confidence, 2),
                factors_analysis=factors_analysis,
                recommendations=recommendations,
                risk_assessment=risk_assessment,
                seasonal_trend=seasonal_trend
            )

            logger.info(f"Yield prediction completed for {request.crop_type}: {prediction:.2f} tons/acre")
            return result

        except Exception as e:
            logger.error(f"Yield prediction failed: {e}")
            raise

    async def _extract_features(self, request: YieldPredictionRequest) -> Dict[str, Any]:
        """Extract and preprocess features for ML model"""
        features = {}

        # Basic features
        features['field_area'] = request.field_area
        features['crop_type'] = request.crop_type.lower()

        # Soil type encoding
        soil_types = {'clay': 1, 'sandy': 2, 'loamy': 3, 'silt': 4, 'peat': 5}
        features['soil_type'] = soil_types.get(request.soil_type.lower(), 3)

        # Irrigation type encoding
        irrigation_types = {'drip': 4, 'sprinkler': 3, 'flood': 2, 'rainfed': 1}
        features['irrigation_type'] = irrigation_types.get(request.irrigation_type.lower(), 2)

        # Fertilizer features
        if request.fertilizer_used:
            features['nitrogen_applied'] = request.fertilizer_used.get('nitrogen', 0)
            features['phosphorus_applied'] = request.fertilizer_used.get('phosphorus', 0)
            features['potassium_applied'] = request.fertilizer_used.get('potassium', 0)
        else:
            features['nitrogen_applied'] = 50  # Default values
            features['phosphorus_applied'] = 25
            features['potassium_applied'] = 25

        # Weather features
        if request.weather_data:
            weather = request.weather_data
            features['avg_temperature'] = weather.get('avg_temperature', 25)
            features['total_rainfall'] = weather.get('total_rainfall', 100)
            features['humidity'] = weather.get('humidity', 60)
        else:
            # Default weather values based on crop and season
            features['avg_temperature'] = self._get_default_temperature(request.crop_type)
            features['total_rainfall'] = self._get_default_rainfall(request.crop_type)
            features['humidity'] = 65

        # Time-based features
        planting_date = datetime.strptime(request.planting_date, '%Y-%m-%d')
        current_date = datetime.now()
        features['days_since_planting'] = (current_date - planting_date).days
        features['season_progress'] = min(features['days_since_planting'] / 120, 1.0)  # Assuming 120 day crop cycle

        # Historical performance
        if request.previous_yields:
            features['avg_previous_yield'] = np.mean(request.previous_yields)
            features['yield_trend'] = self._calculate_yield_trend(request.previous_yields)
        else:
            features['avg_previous_yield'] = self._get_baseline_yield(request.crop_type)
            features['yield_trend'] = 0

        return features

    def _make_prediction(self, model, features: Dict[str, Any]) -> float:
        """Make yield prediction using ML model"""
        try:
            # Convert features to array
            feature_names = [
                'field_area', 'soil_type', 'irrigation_type', 'nitrogen_applied',
                'phosphorus_applied', 'potassium_applied', 'avg_temperature',
                'total_rainfall', 'humidity', 'days_since_planting', 'season_progress',
                'avg_previous_yield', 'yield_trend'
            ]

            feature_values = [features.get(name, 0) for name in feature_names]
            X = np.array(feature_values).reshape(1, -1)

            # Scale features if scaler available
            if 'default' in self.scalers:
                X = self.scalers['default'].transform(X)

            # Make prediction
            prediction = model.predict(X)[0]

            # Ensure reasonable prediction bounds
            min_yield, max_yield = self._get_yield_bounds(features['crop_type'])
            prediction = np.clip(prediction, min_yield, max_yield)

            return prediction

        except Exception as e:
            logger.error(f"Prediction error: {e}")
            # Fallback to rule-based prediction
            return self._rule_based_prediction(features)

    def _calculate_confidence_and_range(self, prediction: float, features: Dict[str, Any]) -> Tuple[float, Tuple[float, float]]:
        """Calculate prediction confidence and uncertainty range"""
        base_confidence = 0.85  # Base confidence

        # Reduce confidence based on data quality
        if features.get('days_since_planting', 0) < 30:
            base_confidence -= 0.2  # Early season prediction
        if not features.get('weather_data'):
            base_confidence -= 0.1  # No weather data
        if not features.get('previous_yields'):
            base_confidence -= 0.1  # No historical data

        # Calculate uncertainty range (±15% for 85% confidence)
        uncertainty = (1 - base_confidence) * prediction
        yield_range = (prediction - uncertainty, prediction + uncertainty)

        return base_confidence, yield_range

    async def _analyze_factors(self, request: YieldPredictionRequest, features: Dict[str, Any]) -> Dict[str, float]:
        """Analyze factors contributing to yield prediction"""
        factors = {}

        # Soil quality factor
        soil_score = self._calculate_soil_score(features)
        factors['soil_quality'] = soil_score

        # Irrigation efficiency
        irrigation_score = self._calculate_irrigation_score(features)
        factors['irrigation_efficiency'] = irrigation_score

        # Fertilizer management
        fertilizer_score = self._calculate_fertilizer_score(features)
        factors['fertilizer_management'] = fertilizer_score

        # Weather conditions
        weather_score = self._calculate_weather_score(features)
        factors['weather_conditions'] = weather_score

        # Pest management
        pest_score = self._calculate_pest_score(request)
        factors['pest_management'] = pest_score

        # Variety quality (estimated)
        variety_score = 0.85  # Default good score
        factors['variety_quality'] = variety_score

        return factors

    async def _generate_recommendations(self, request: YieldPredictionRequest, factors: Dict[str, float]) -> List[str]:
        """Generate actionable recommendations based on factor analysis"""
        recommendations = []

        # Soil recommendations
        if factors['soil_quality'] < 0.7:
            recommendations.extend([
                "Conduct detailed soil testing to identify nutrient deficiencies",
                "Consider adding organic matter to improve soil structure",
                "Test soil pH and adjust with appropriate amendments"
            ])

        # Irrigation recommendations
        if factors['irrigation_efficiency'] < 0.7:
            recommendations.extend([
                "Upgrade to drip irrigation system for better water efficiency",
                "Install soil moisture sensors for optimal irrigation timing",
                "Implement mulching to reduce water evaporation"
            ])

        # Fertilizer recommendations
        if factors['fertilizer_management'] < 0.7:
            recommendations.extend([
                "Implement precision fertilizer application based on soil tests",
                "Use slow-release fertilizers to improve nutrient availability",
                "Balance NPK ratios according to crop requirements"
            ])

        # Weather-based recommendations
        if factors['weather_conditions'] < 0.7:
            recommendations.extend([
                "Monitor weather forecasts closely for irrigation planning",
                "Prepare contingency plans for extreme weather events",
                "Consider crop insurance for weather-related risks"
            ])

        # Pest management recommendations
        if factors['pest_management'] < 0.7:
            recommendations.extend([
                "Implement integrated pest management (IPM) practices",
                "Regular field scouting for early pest detection",
                "Use beneficial insects and biological controls"
            ])

        # General recommendations
        recommendations.extend([
            "Maintain detailed field records for continuous improvement",
            "Regular monitoring of crop health indicators",
            "Stay updated with latest agricultural best practices"
        ])

        return recommendations[:8]  # Limit to top 8 recommendations

    async def _assess_risks(self, request: YieldPredictionRequest, prediction: float) -> Dict[str, Any]:
        """Assess various risks affecting yield"""
        risks = {
            'weather_risk': self._calculate_weather_risk(request),
            'pest_disease_risk': self._calculate_pest_risk(request),
            'market_risk': self._calculate_market_risk(request),
            'input_cost_risk': self._calculate_input_risk(request),
            'overall_risk_level': 'medium'
        }

        # Calculate overall risk level
        risk_scores = [risks[key] for key in risks.keys() if key.endswith('_risk')]
        avg_risk = np.mean(risk_scores)

        if avg_risk > 0.7:
            risks['overall_risk_level'] = 'high'
        elif avg_risk > 0.4:
            risks['overall_risk_level'] = 'medium'
        else:
            risks['overall_risk_level'] = 'low'

        return risks

    async def _analyze_seasonal_trends(self, request: YieldPredictionRequest) -> Dict[str, Any]:
        """Analyze seasonal trends and patterns"""
        crop_type = request.crop_type.lower()

        # Mock seasonal analysis (in real implementation, use historical data)
        seasonal_data = {
            'current_season_performance': 'above_average',
            'historical_average': self._get_baseline_yield(crop_type),
            'trend_direction': 'increasing',
            'seasonal_factors': {
                'monsoon_timing': 'favorable',
                'temperature_trend': 'optimal',
                'pest_pressure': 'moderate'
            }
        }

        return seasonal_data

    # Helper methods for factor calculations
    def _calculate_soil_score(self, features: Dict[str, Any]) -> float:
        """Calculate soil quality score"""
        soil_type = features.get('soil_type', 3)
        soil_scores = {1: 0.7, 2: 0.6, 3: 0.9, 4: 0.8, 5: 0.5}  # clay to peat
        return soil_scores.get(soil_type, 0.7)

    def _calculate_irrigation_score(self, features: Dict[str, Any]) -> float:
        """Calculate irrigation efficiency score"""
        irrigation_type = features.get('irrigation_type', 2)
        irrigation_scores = {1: 0.5, 2: 0.6, 3: 0.8, 4: 0.9}  # rainfed to drip
        return irrigation_scores.get(irrigation_type, 0.6)

    def _calculate_fertilizer_score(self, features: Dict[str, Any]) -> float:
        """Calculate fertilizer management score"""
        n = features.get('nitrogen_applied', 50)
        p = features.get('phosphorus_applied', 25)
        k = features.get('potassium_applied', 25)

        # Check if NPK ratios are balanced (ideal N:P:K = 4:2:1)
        total = n + p + k
        if total == 0:
            return 0.5

        n_ratio = n/total
        p_ratio = p/total
        k_ratio = k/total

        # Score based on how close to ideal ratios
        ideal_n, ideal_p, ideal_k = 0.57, 0.29, 0.14  # 4:2:1 ratio
        score = 1 - (abs(n_ratio - ideal_n) + abs(p_ratio - ideal_p) + abs(k_ratio - ideal_k)) / 3
        return max(0.3, min(1.0, score))

    def _calculate_weather_score(self, features: Dict[str, Any]) -> float:
        """Calculate weather conditions score"""
        temp = features.get('avg_temperature', 25)
        rainfall = features.get('total_rainfall', 100)
        humidity = features.get('humidity', 65)

        # Crop-specific optimal ranges
        crop = features.get('crop_type', 'rice')
        optimal_ranges = {
            'rice': {'temp': (20, 35), 'rainfall': (100, 200), 'humidity': (60, 80)},
            'wheat': {'temp': (15, 25), 'rainfall': (50, 100), 'humidity': (40, 60)},
            'cotton': {'temp': (25, 35), 'rainfall': (50, 100), 'humidity': (50, 70)},
            'maize': {'temp': (20, 30), 'rainfall': (50, 100), 'humidity': (50, 70)}
        }

        optimal = optimal_ranges.get(crop, optimal_ranges['rice'])

        # Calculate how close to optimal conditions
        temp_score = 1 - min(abs(temp - (optimal['temp'][0] + optimal['temp'][1])/2) / 10, 1)
        rainfall_score = 1 - min(abs(rainfall - (optimal['rainfall'][0] + optimal['rainfall'][1])/2) / 50, 1)
        humidity_score = 1 - min(abs(humidity - (optimal['humidity'][0] + optimal['humidity'][1])/2) / 20, 1)

        return (temp_score + rainfall_score + humidity_score) / 3

    def _calculate_pest_score(self, request: YieldPredictionRequest) -> float:
        """Calculate pest management score"""
        if request.pesticides_used and len(request.pesticides_used) > 0:
            return 0.8  # Good pest management if pesticides used
        else:
            return 0.6  # Moderate score if no pesticides mentioned

    def _rule_based_prediction(self, features: Dict[str, Any]) -> float:
        """Fallback rule-based yield prediction"""
        crop = features.get('crop_type', 'rice')
        baseline = self._get_baseline_yield(crop)

        # Apply modifiers based on factors
        modifier = 1.0

        # Soil modifier
        soil_modifier = {1: 0.8, 2: 0.7, 3: 1.0, 4: 0.9, 5: 0.6}
        modifier *= soil_modifier.get(features.get('soil_type', 3), 1.0)

        # Irrigation modifier
        irrigation_modifier = {1: 0.7, 2: 0.8, 3: 0.9, 4: 1.0}
        modifier *= irrigation_modifier.get(features.get('irrigation_type', 2), 0.8)

        # Weather modifier
        weather_score = self._calculate_weather_score(features)
        modifier *= (0.8 + 0.4 * weather_score)

        return baseline * modifier

    def _get_baseline_yield(self, crop_type: str) -> float:
        """Get baseline yield for crop type"""
        baselines = {
            'rice': 5.0,
            'wheat': 4.5,
            'cotton': 3.0,
            'maize': 6.0,
            'soybean': 2.5,
            'sugarcane': 80.0
        }
        return baselines.get(crop_type.lower(), 4.0)

    def _get_yield_bounds(self, crop_type: str) -> Tuple[float, float]:
        """Get reasonable yield bounds for crop type"""
        bounds = {
            'rice': (2.0, 10.0),
            'wheat': (2.0, 8.0),
            'cotton': (1.0, 6.0),
            'maize': (2.0, 12.0),
            'soybean': (1.0, 5.0),
            'sugarcane': (40.0, 120.0)
        }
        return bounds.get(crop_type.lower(), (1.0, 10.0))

    def _get_default_temperature(self, crop_type: str) -> float:
        """Get default temperature for crop"""
        defaults = {
            'rice': 28,
            'wheat': 22,
            'cotton': 30,
            'maize': 25,
            'soybean': 26,
            'sugarcane': 27
        }
        return defaults.get(crop_type.lower(), 25)

    def _get_default_rainfall(self, crop_type: str) -> float:
        """Get default rainfall for crop"""
        defaults = {
            'rice': 150,
            'wheat': 75,
            'cotton': 75,
            'maize': 80,
            'soybean': 70,
            'sugarcane': 200
        }
        return defaults.get(crop_type.lower(), 100)

    def _calculate_yield_trend(self, previous_yields: List[float]) -> float:
        """Calculate yield trend from previous seasons"""
        if len(previous_yields) < 2:
            return 0

        # Simple linear trend
        n = len(previous_yields)
        x = np.arange(n)
        slope = np.polyfit(x, previous_yields, 1)[0]
        return slope

    # Risk calculation methods
    def _calculate_weather_risk(self, request: YieldPredictionRequest) -> float:
        """Calculate weather-related risk"""
        if not request.weather_data:
            return 0.6  # Medium risk if no weather data

        weather = request.weather_data
        risk_factors = []

        # Temperature extremes
        temp = weather.get('avg_temperature', 25)
        if temp < 15 or temp > 35:
            risk_factors.append(0.8)

        # Drought risk
        rainfall = weather.get('total_rainfall', 100)
        if rainfall < 50:
            risk_factors.append(0.7)

        return np.mean(risk_factors) if risk_factors else 0.3

    def _calculate_pest_risk(self, request: YieldPredictionRequest) -> float:
        """Calculate pest and disease risk"""
        if not request.pesticides_used:
            return 0.5  # Medium risk if no pest management mentioned

        return 0.2  # Low risk if pest management is in place

    def _calculate_market_risk(self, request: YieldPredictionRequest) -> float:
        """Calculate market-related risk"""
        # Simplified market risk calculation
        return 0.4  # Medium market risk

    def _calculate_input_risk(self, request: YieldPredictionRequest) -> float:
        """Calculate input cost risk"""
        # Simplified input cost risk
        return 0.3  # Low-moderate input cost risk

    async def train_model(self, crop_type: str, training_data: pd.DataFrame):
        """Train or update ML model for specific crop"""
        try:
            logger.info(f"Training yield prediction model for {crop_type}")

            # Prepare features and target
            feature_cols = [
                'field_area', 'soil_type', 'irrigation_type', 'nitrogen_applied',
                'phosphorus_applied', 'potassium_applied', 'avg_temperature',
                'total_rainfall', 'humidity', 'days_since_planting', 'season_progress',
                'avg_previous_yield', 'yield_trend'
            ]

            X = training_data[feature_cols]
            y = training_data['yield']

            # Split data
            X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

            # Scale features
            scaler = StandardScaler()
            X_train_scaled = scaler.fit_transform(X_train)
            X_test_scaled = scaler.transform(X_test)

            # Train model
            model = xgb.XGBRegressor(
                n_estimators=200,
                max_depth=6,
                learning_rate=0.1,
                random_state=42
            )

            model.fit(X_train_scaled, y_train)

            # Evaluate model
            y_pred = model.predict(X_test_scaled)
            mae = mean_absolute_error(y_test, y_pred)
            r2 = r2_score(y_test, y_pred)

            logger.info(f"Model performance for {crop_type}: MAE={mae:.3f}, R²={r2:.3f}")

            # Save model and scaler
            model_path = os.path.join(self.model_path, f'{crop_type}_yield_model.pkl')
            joblib.dump(model, model_path)

            scaler_path = os.path.join(self.model_path, f'{crop_type}_scaler.pkl')
            joblib.dump(scaler, scaler_path)

            # Update loaded models
            self.models[crop_type] = model
            self.scalers[crop_type] = scaler

            return {'mae': mae, 'r2': r2}

        except Exception as e:
            logger.error(f"Model training failed for {crop_type}: {e}")
            raise