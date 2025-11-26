"""
AgroUnify AI - Weather Analysis Service
Advanced weather analysis for agricultural decision making
"""

import asyncio
import numpy as np
import pandas as pd
from typing import Dict, List, Any, Optional, Tuple
from pydantic import BaseModel, Field
from loguru import logger
import time
import requests
from datetime import datetime, timedelta
import aiohttp
import json
from concurrent.futures import ThreadPoolExecutor

from utils.model_loader import ModelManager
from utils.data_validation import DataValidator

# Data Models
class WeatherData(BaseModel):
    location: Dict[str, Any] = Field(..., description="Location coordinates and details")
    current_conditions: Optional[Dict[str, Any]] = None
    forecast_data: Optional[List[Dict[str, Any]]] = None
    historical_data: Optional[Dict[str, Any]] = None
    crop_context: Optional[str] = None

class WeatherAdvice(BaseModel):
    overall_recommendation: str
    irrigation_advice: str
    pest_disease_risk: Dict[str, Any]
    harvesting_guidance: str
    field_operations: List[str]
    weather_alerts: List[Dict[str, Any]]
    confidence: float

class WeatherAnalysisService:
    """Advanced weather analysis service for agricultural insights"""
    
    def __init__(self, model_manager: ModelManager):
        self.model_manager = model_manager
        self.data_validator = DataValidator()
        self.executor = ThreadPoolExecutor(max_workers=4)
        
        # Weather analysis parameters
        self.crop_weather_requirements = self._load_crop_weather_requirements()
        self.weather_thresholds = self._load_weather_thresholds()
        
        # External API configurations
        self.weather_apis = self._configure_weather_apis()
        
        logger.info("✅ WeatherAnalysisService initialized successfully")
    
    def _load_crop_weather_requirements(self) -> Dict[str, Dict]:
        """Load crop-specific weather requirements"""
        return {
            'wheat': {
                'optimal_temp_range': (15, 25),
                'critical_temp_low': 0,
                'critical_temp_high': 35,
                'water_requirement': 450,  # mm per season
                'humidity_tolerance': (50, 80),
                'wind_sensitivity': 'medium',
                'frost_tolerance': 'high',
                'drought_tolerance': 'medium',
                'critical_stages': {
                    'germination': {'temp': (10, 25), 'moisture': 'high'},
                    'tillering': {'temp': (15, 25), 'moisture': 'medium'},
                    'stem_elongation': {'temp': (18, 25), 'moisture': 'medium'},
                    'flowering': {'temp': (20, 25), 'moisture': 'low'},
                    'grain_filling': {'temp': (15, 23), 'moisture': 'medium'},
                    'maturity': {'temp': (15, 25), 'moisture': 'low'}
                }
            },
            'rice': {
                'optimal_temp_range': (22, 30),
                'critical_temp_low': 12,
                'critical_temp_high': 40,
                'water_requirement': 1200,
                'humidity_tolerance': (70, 95),
                'wind_sensitivity': 'high',
                'frost_tolerance': 'low',
                'drought_tolerance': 'low',
                'critical_stages': {
                    'germination': {'temp': (25, 35), 'moisture': 'very_high'},
                    'vegetative': {'temp': (25, 30), 'moisture': 'very_high'},
                    'reproductive': {'temp': (22, 28), 'moisture': 'high'},
                    'ripening': {'temp': (20, 25), 'moisture': 'medium'}
                }
            },
            'cotton': {
                'optimal_temp_range': (21, 30),
                'critical_temp_low': 15,
                'critical_temp_high': 40,
                'water_requirement': 700,
                'humidity_tolerance': (55, 85),
                'wind_sensitivity': 'low',
                'frost_tolerance': 'very_low',
                'drought_tolerance': 'high',
                'critical_stages': {
                    'planting': {'temp': (18, 30), 'moisture': 'medium'},
                    'squaring': {'temp': (21, 30), 'moisture': 'high'},
                    'flowering': {'temp': (21, 27), 'moisture': 'high'},
                    'boll_development': {'temp': (21, 30), 'moisture': 'medium'}
                }
            },
            'tomato': {
                'optimal_temp_range': (18, 28),
                'critical_temp_low': 10,
                'critical_temp_high': 35,
                'water_requirement': 400,
                'humidity_tolerance': (60, 85),
                'wind_sensitivity': 'medium',
                'frost_tolerance': 'very_low',
                'drought_tolerance': 'medium',
                'critical_stages': {
                    'germination': {'temp': (20, 30), 'moisture': 'high'},
                    'vegetative': {'temp': (18, 25), 'moisture': 'medium'},
                    'flowering': {'temp': (18, 24), 'moisture': 'medium'},
                    'fruit_set': {'temp': (18, 24), 'moisture': 'medium'},
                    'ripening': {'temp': (20, 25), 'moisture': 'low'}
                }
            }
        }
    
    def _load_weather_thresholds(self) -> Dict[str, Dict]:
        """Load weather threshold parameters for alerts and recommendations"""
        return {
            'temperature': {
                'frost_warning': 2,
                'cold_stress': 10,
                'heat_stress': 35,
                'extreme_heat': 40
            },
            'rainfall': {
                'drought_threshold': 10,  # mm per week
                'excess_rainfall': 100,   # mm per week
                'flood_risk': 200        # mm per day
            },
            'humidity': {
                'disease_risk_high': 85,
                'disease_risk_medium': 70,
                'drought_stress': 40
            },
            'wind': {
                'spray_limit': 15,       # km/h
                'damage_risk': 50,      # km/h
                'severe_damage': 80     # km/h
            }
        }
    
    def _configure_weather_apis(self) -> Dict[str, str]:
        """Configure weather API endpoints"""
        return {
            'openweather': 'https://api.openweathermap.org/data/2.5',
            'weatherapi': 'https://api.weatherapi.com/v1',
            'accuweather': 'https://dataservice.accuweather.com',
            'india_meteorological': 'https://mausam.imd.gov.in/api'
        }
    
    async def analyze_weather(self, weather_data: Dict[str, Any]) -> WeatherAdvice:
        """
        Comprehensive weather analysis for agricultural decision making
        
        Args:
            weather_data: Weather information and crop context
            
        Returns:
            WeatherAdvice with recommendations and alerts
        """
        start_time = time.time()
        
        try:
            # Validate input data
            validated_data = self.data_validator.validate_weather_data(weather_data)
            
            # Enhance weather data with additional sources
            enhanced_data = await self._enhance_weather_data(validated_data)
            
            # Analyze current conditions
            current_analysis = await self._analyze_current_conditions(enhanced_data)
            
            # Generate forecast analysis
            forecast_analysis = await self._analyze_weather_forecast(enhanced_data)
            
            # Assess agricultural impacts
            agricultural_impact = await self._assess_agricultural_impact(
                enhanced_data, current_analysis, forecast_analysis
            )
            
            # Generate specific recommendations
            recommendations = await self._generate_weather_recommendations(
                enhanced_data, agricultural_impact
            )
            
            # Create weather alerts
            alerts = await self._generate_weather_alerts(enhanced_data, agricultural_impact)
            
            # Calculate confidence score
            confidence = self._calculate_confidence_score(enhanced_data, recommendations)
            
            result = WeatherAdvice(
                overall_recommendation=recommendations['overall'],
                irrigation_advice=recommendations['irrigation'],
                pest_disease_risk=recommendations['pest_disease'],
                harvesting_guidance=recommendations['harvesting'],
                field_operations=recommendations['field_operations'],
                weather_alerts=alerts,
                confidence=confidence
            )
            
            processing_time = time.time() - start_time
            logger.info(f"Weather analysis completed in {processing_time:.3f}s")
            
            return result
            
        except Exception as e:
            logger.error(f"Weather analysis failed: {e}")
            raise
    
    async def _enhance_weather_data(self, weather_data: Dict[str, Any]) -> Dict[str, Any]:
        """Enhance weather data with additional sources and processing"""
        
        enhanced_data = weather_data.copy()
        location = weather_data.get('location', {})
        
        try:
            # Fetch additional weather data if needed
            if not weather_data.get('current_conditions'):
                current_weather = await self._fetch_current_weather(location)
                enhanced_data['current_conditions'] = current_weather
            
            if not weather_data.get('forecast_data'):
                forecast_data = await self._fetch_weather_forecast(location)
                enhanced_data['forecast_data'] = forecast_data
            
            # Add derived meteorological parameters
            enhanced_data['derived_parameters'] = await self._calculate_derived_parameters(
                enhanced_data
            )
            
            # Add agricultural indices
            enhanced_data['agricultural_indices'] = await self._calculate_agricultural_indices(
                enhanced_data
            )
            
        except Exception as e:
            logger.warning(f"Weather data enhancement failed: {e}")
        
        return enhanced_data
    
    async def _fetch_current_weather(self, location: Dict[str, Any]) -> Dict[str, Any]:
        """Fetch current weather conditions"""
        
        async def _fetch():
            try:
                # Mock current weather data
                return {
                    'temperature': 25.5,
                    'humidity': 65,
                    'pressure': 1013,
                    'wind_speed': 12,
                    'wind_direction': 250,
                    'rainfall_24h': 0,
                    'cloud_cover': 40,
                    'uv_index': 6,
                    'visibility': 10,
                    'dew_point': 18.2,
                    'timestamp': datetime.now().isoformat()
                }
            except Exception as e:
                logger.error(f"Failed to fetch current weather: {e}")
                return {}
        
        return await _fetch()
    
    async def _fetch_weather_forecast(self, location: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Fetch weather forecast data"""
        
        async def _fetch():
            try:
                # Mock 7-day forecast
                forecast = []
                for i in range(7):
                    date = datetime.now() + timedelta(days=i)
                    forecast.append({
                        'date': date.isoformat(),
                        'temperature_min': 18 + np.random.normal(0, 3),
                        'temperature_max': 28 + np.random.normal(0, 4),
                        'humidity': 60 + np.random.normal(0, 15),
                        'rainfall': max(0, np.random.exponential(5)),
                        'wind_speed': 8 + np.random.normal(0, 4),
                        'cloud_cover': np.random.uniform(20, 80),
                        'pressure': 1013 + np.random.normal(0, 10)
                    })
                return forecast
            except Exception as e:
                logger.error(f"Failed to fetch weather forecast: {e}")
                return []
        
        return await _fetch()
    
    async def _calculate_derived_parameters(self, weather_data: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate derived meteorological parameters"""
        
        derived = {}
        current = weather_data.get('current_conditions', {})
        
        if current:
            temp = current.get('temperature', 25)
            humidity = current.get('humidity', 60)
            pressure = current.get('pressure', 1013)
            
            # Heat Index
            if temp >= 27:
                hi = -8.78469475556 + 1.61139411 * temp + 2.33854883889 * humidity
                hi += -0.14611605 * temp * humidity - 0.012308094 * temp * temp
                hi += -0.0164248277778 * humidity * humidity + 0.002211732 * temp * temp * humidity
                hi += 0.00072546 * temp * humidity * humidity - 0.000003582 * temp * temp * humidity * humidity
                derived['heat_index'] = hi
            else:
                derived['heat_index'] = temp
            
            # Vapor Pressure Deficit (VPD)
            es = 0.6108 * np.exp(17.27 * temp / (temp + 237.3))  # Saturation vapor pressure
            ea = es * humidity / 100  # Actual vapor pressure
            derived['vapor_pressure_deficit'] = es - ea
            
            # Wind Chill (for temperatures below 10°C)
            if temp <= 10 and 'wind_speed' in current:
                wind_speed = current['wind_speed']
                if wind_speed > 4.8:
                    wc = 13.12 + 0.6215 * temp - 11.37 * (wind_speed ** 0.16) + 0.3965 * temp * (wind_speed ** 0.16)
                    derived['wind_chill'] = wc
                else:
                    derived['wind_chill'] = temp
            
            # Wet Bulb Temperature (approximation)
            tw = temp * np.arctan(0.151977 * np.sqrt(humidity + 8.313659)) + np.arctan(temp + humidity) - np.arctan(humidity - 1.676331) + 0.00391838 * (humidity ** 1.5) * np.arctan(0.023101 * humidity) - 4.686035
            derived['wet_bulb_temperature'] = tw
        
        return derived
    
    async def _calculate_agricultural_indices(self, weather_data: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate agricultural weather indices"""
        
        indices = {}
        current = weather_data.get('current_conditions', {})
        forecast = weather_data.get('forecast_data', [])
        
        if current:
            temp = current.get('temperature', 25)
            humidity = current.get('humidity', 60)
            rainfall = current.get('rainfall_24h', 0)
            
            # Evapotranspiration (Simplified Penman-Monteith)
            # This is a simplified calculation - full implementation would be more complex
            et0 = 0.0023 * (temp + 17.8) * np.sqrt(abs(temp - humidity)) * 0.408 * 15.392
            indices['reference_evapotranspiration'] = max(0, et0)
            
            # Growing Degree Days base temperature 10°C
            if temp > 10:
                indices['growing_degree_days'] = temp - 10
            else:
                indices['growing_degree_days'] = 0
            
            # Disease Risk Index (based on temperature and humidity)
            if 15 <= temp <= 30 and humidity >= 70:
                disease_risk = (humidity - 70) / 30 * (1 - abs(temp - 22.5) / 7.5)
                indices['disease_risk_index'] = min(1.0, max(0.0, disease_risk))
            else:
                indices['disease_risk_index'] = 0.1
            
            # Drought Stress Index
            if len(forecast) >= 7:
                weekly_rainfall = sum(day.get('rainfall', 0) for day in forecast[:7])
                if weekly_rainfall < 10:
                    indices['drought_stress_index'] = 0.8
                elif weekly_rainfall < 25:
                    indices['drought_stress_index'] = 0.4
                else:
                    indices['drought_stress_index'] = 0.1
            else:
                indices['drought_stress_index'] = 0.3
        
        # Spray Conditions Index
        if current and 'wind_speed' in current:
            wind_speed = current['wind_speed']
            if wind_speed <= 10:
                indices['spray_conditions_index'] = 1.0  # Excellent
            elif wind_speed <= 15:
                indices['spray_conditions_index'] = 0.7  # Good
            elif wind_speed <= 20:
                indices['spray_conditions_index'] = 0.4  # Fair
            else:
                indices['spray_conditions_index'] = 0.1  # Poor
        
        return indices
    
    async def _analyze_current_conditions(self, weather_data: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze current weather conditions for agricultural impact"""
        
        analysis = {
            'temperature_stress': 'none',
            'moisture_status': 'adequate',
            'wind_conditions': 'suitable',
            'disease_pressure': 'low',
            'overall_favorability': 'good'
        }
        
        current = weather_data.get('current_conditions', {})
        crop_context = weather_data.get('crop_context', 'general')
        
        if current:
            temp = current.get('temperature', 25)
            humidity = current.get('humidity', 60)
            wind_speed = current.get('wind_speed', 10)
            
            # Temperature analysis
            if crop_context in self.crop_weather_requirements:
                crop_reqs = self.crop_weather_requirements[crop_context]
                opt_min, opt_max = crop_reqs['optimal_temp_range']
                
                if temp < crop_reqs['critical_temp_low']:
                    analysis['temperature_stress'] = 'severe_cold'
                elif temp < opt_min:
                    analysis['temperature_stress'] = 'cold_stress'
                elif temp > crop_reqs['critical_temp_high']:
                    analysis['temperature_stress'] = 'severe_heat'
                elif temp > opt_max:
                    analysis['temperature_stress'] = 'heat_stress'
                else:
                    analysis['temperature_stress'] = 'optimal'
            
            # Moisture analysis
            if humidity < 40:
                analysis['moisture_status'] = 'dry'
            elif humidity > 85:
                analysis['moisture_status'] = 'excessive'
            elif 60 <= humidity <= 75:
                analysis['moisture_status'] = 'optimal'
            else:
                analysis['moisture_status'] = 'adequate'
            
            # Wind analysis
            if wind_speed > 25:
                analysis['wind_conditions'] = 'excessive'
            elif wind_speed > 15:
                analysis['wind_conditions'] = 'moderate'
            elif wind_speed < 5:
                analysis['wind_conditions'] = 'calm'
            else:
                analysis['wind_conditions'] = 'suitable'
            
            # Disease pressure
            derived = weather_data.get('derived_parameters', {})
            agri_indices = weather_data.get('agricultural_indices', {})
            
            disease_risk = agri_indices.get('disease_risk_index', 0.3)
            if disease_risk > 0.7:
                analysis['disease_pressure'] = 'high'
            elif disease_risk > 0.4:
                analysis['disease_pressure'] = 'medium'
            else:
                analysis['disease_pressure'] = 'low'
            
            # Overall favorability
            stress_factors = 0
            if analysis['temperature_stress'] in ['severe_cold', 'severe_heat']:
                stress_factors += 2
            elif analysis['temperature_stress'] in ['cold_stress', 'heat_stress']:
                stress_factors += 1
            
            if analysis['moisture_status'] in ['dry', 'excessive']:
                stress_factors += 1
            
            if analysis['wind_conditions'] == 'excessive':
                stress_factors += 1
            
            if analysis['disease_pressure'] == 'high':
                stress_factors += 1
            
            if stress_factors == 0:
                analysis['overall_favorability'] = 'excellent'
            elif stress_factors == 1:
                analysis['overall_favorability'] = 'good'
            elif stress_factors == 2:
                analysis['overall_favorability'] = 'fair'
            else:
                analysis['overall_favorability'] = 'poor'
        
        return analysis
    
    async def _analyze_weather_forecast(self, weather_data: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze weather forecast for planning"""
        
        forecast_analysis = {
            'trend': 'stable',
            'risk_periods': [],
            'favorable_periods': [],
            'precipitation_outlook': 'normal',
            'temperature_trend': 'stable'
        }
        
        forecast = weather_data.get('forecast_data', [])
        
        if len(forecast) >= 3:
            # Temperature trend analysis
            temps = [day.get('temperature_max', 25) for day in forecast[:5]]
            temp_trend = np.polyfit(range(len(temps)), temps, 1)[0]
            
            if temp_trend > 1:
                forecast_analysis['temperature_trend'] = 'increasing'
            elif temp_trend < -1:
                forecast_analysis['temperature_trend'] = 'decreasing'
            else:
                forecast_analysis['temperature_trend'] = 'stable'
            
            # Precipitation analysis
            rainfalls = [day.get('rainfall', 0) for day in forecast[:7]]
            total_rainfall = sum(rainfalls)
            
            if total_rainfall < 10:
                forecast_analysis['precipitation_outlook'] = 'dry'
            elif total_rainfall > 75:
                forecast_analysis['precipitation_outlook'] = 'wet'
            else:
                forecast_analysis['precipitation_outlook'] = 'normal'
            
            # Risk and favorable periods
            for i, day in enumerate(forecast[:7]):
                date = day.get('date', '')
                temp_max = day.get('temperature_max', 25)
                temp_min = day.get('temperature_min', 15)
                rainfall = day.get('rainfall', 0)
                humidity = day.get('humidity', 60)
                wind_speed = day.get('wind_speed', 10)
                
                risk_score = 0
                
                # Temperature risks
                if temp_max > 35 or temp_min < 5:
                    risk_score += 2
                elif temp_max > 32 or temp_min < 10:
                    risk_score += 1
                
                # Rainfall risks
                if rainfall > 50:
                    risk_score += 2
                elif rainfall > 25:
                    risk_score += 1
                
                # High humidity risk
                if humidity > 85:
                    risk_score += 1
                
                # Wind risk
                if wind_speed > 25:
                    risk_score += 2
                elif wind_speed > 15:
                    risk_score += 1
                
                if risk_score >= 3:
                    forecast_analysis['risk_periods'].append({
                        'date': date,
                        'risk_level': 'high',
                        'factors': self._identify_risk_factors(day)
                    })
                elif risk_score == 0:
                    forecast_analysis['favorable_periods'].append({
                        'date': date,
                        'favorability': 'high',
                        'recommended_activities': self._suggest_activities(day)
                    })
        
        return forecast_analysis
    
    async def _assess_agricultural_impact(self, weather_data: Dict[str, Any], current_analysis: Dict[str, Any], forecast_analysis: Dict[str, Any]) -> Dict[str, Any]:
        """Assess agricultural impact of weather conditions"""
        
        impact_assessment = {
            'crop_stress_level': 'low',
            'irrigation_need': 'normal',
            'pest_disease_risk': 'low',
            'field_operation_suitability': 'good',
            'harvest_timing_impact': 'none',
            'input_application_timing': 'suitable'
        }
        
        # Crop stress assessment
        temp_stress = current_analysis.get('temperature_stress', 'none')
        moisture_status = current_analysis.get('moisture_status', 'adequate')
        
        if temp_stress in ['severe_cold', 'severe_heat']:
            impact_assessment['crop_stress_level'] = 'high'
        elif temp_stress in ['cold_stress', 'heat_stress']:
            impact_assessment['crop_stress_level'] = 'medium'
        elif moisture_status in ['dry', 'excessive']:
            impact_assessment['crop_stress_level'] = 'medium'
        
        # Irrigation needs
        agri_indices = weather_data.get('agricultural_indices', {})
        drought_stress = agri_indices.get('drought_stress_index', 0.3)
        
        if drought_stress > 0.6:
            impact_assessment['irrigation_need'] = 'urgent'
        elif drought_stress > 0.4:
            impact_assessment['irrigation_need'] = 'increased'
        elif moisture_status == 'excessive':
            impact_assessment['irrigation_need'] = 'reduce'
        
        # Pest and disease risk
        disease_pressure = current_analysis.get('disease_pressure', 'low')
        impact_assessment['pest_disease_risk'] = disease_pressure
        
        # Field operation suitability
        wind_conditions = current_analysis.get('wind_conditions', 'suitable')
        current = weather_data.get('current_conditions', {})
        rainfall_24h = current.get('rainfall_24h', 0)
        
        if wind_conditions == 'excessive' or rainfall_24h > 10:
            impact_assessment['field_operation_suitability'] = 'poor'
        elif wind_conditions == 'moderate' or rainfall_24h > 2:
            impact_assessment['field_operation_suitability'] = 'fair'
        
        return impact_assessment
    
    async def _generate_weather_recommendations(self, weather_data: Dict[str, Any], impact_assessment: Dict[str, Any]) -> Dict[str, Any]:
        """Generate specific weather-based recommendations"""
        
        recommendations = {
            'overall': '',
            'irrigation': '',
            'pest_disease': {},
            'harvesting': '',
            'field_operations': []
        }
        
        # Overall recommendation
        crop_stress = impact_assessment.get('crop_stress_level', 'low')
        if crop_stress == 'high':
            recommendations['overall'] = "Take immediate protective measures. Current weather conditions are stressing crops significantly."
        elif crop_stress == 'medium':
            recommendations['overall'] = "Monitor crops closely. Weather conditions require attention and possible interventions."
        else:
            recommendations['overall'] = "Weather conditions are generally favorable. Continue normal farming operations with routine monitoring."
        
        # Irrigation recommendations
        irrigation_need = impact_assessment.get('irrigation_need', 'normal')
        if irrigation_need == 'urgent':
            recommendations['irrigation'] = "Apply irrigation immediately. Crops are experiencing drought stress."
        elif irrigation_need == 'increased':
            recommendations['irrigation'] = "Increase irrigation frequency by 25-50%. Monitor soil moisture closely."
        elif irrigation_need == 'reduce':
            recommendations['irrigation'] = "Reduce or skip irrigation. Excess moisture may lead to waterlogging and root problems."
        else:
            recommendations['irrigation'] = "Continue normal irrigation schedule based on crop stage and soil moisture."
        
        # Pest and disease recommendations
        pest_risk = impact_assessment.get('pest_disease_risk', 'low')
        current = weather_data.get('current_conditions', {})
        humidity = current.get('humidity', 60)
        temperature = current.get('temperature', 25)
        
        recommendations['pest_disease'] = {
            'risk_level': pest_risk,
            'monitoring_frequency': 'weekly' if pest_risk == 'low' else 'daily',
            'preventive_measures': []
        }
        
        if pest_risk == 'high':
            recommendations['pest_disease']['preventive_measures'].extend([
                "Apply preventive fungicide spray",
                "Improve field drainage",
                "Increase air circulation around plants",
                "Remove plant debris"
            ])
        elif pest_risk == 'medium':
            recommendations['pest_disease']['preventive_measures'].extend([
                "Monitor for early disease symptoms",
                "Ensure good field sanitation",
                "Consider preventive treatments for susceptible crops"
            ])
        
        # Field operations recommendations
        operation_suitability = impact_assessment.get('field_operation_suitability', 'good')
        agri_indices = weather_data.get('agricultural_indices', {})
        spray_conditions = agri_indices.get('spray_conditions_index', 0.7)
        
        if operation_suitability == 'poor':
            recommendations['field_operations'].extend([
                "Postpone all field operations until conditions improve",
                "Avoid machinery use in wet fields to prevent compaction"
            ])
        elif operation_suitability == 'fair':
            recommendations['field_operations'].extend([
                "Limit field operations to essential activities only",
                "Avoid pesticide/fungicide applications due to wind conditions"
            ])
        else:
            if spray_conditions > 0.8:
                recommendations['field_operations'].append("Excellent conditions for pesticide/fungicide applications")
            if current.get('humidity', 60) < 70:
                recommendations['field_operations'].append("Good conditions for harvest and post-harvest operations")
            if current.get('wind_speed', 10) < 15:
                recommendations['field_operations'].append("Suitable conditions for precision applications and spraying")
        
        # Harvesting recommendations
        forecast = weather_data.get('forecast_data', [])
        if len(forecast) >= 3:
            upcoming_rain = any(day.get('rainfall', 0) > 5 for day in forecast[:3])
            if upcoming_rain:
                recommendations['harvesting'] = "Consider advancing harvest schedule due to expected rainfall in next 3 days."
            else:
                recommendations['harvesting'] = "Weather conditions are suitable for harvest operations. Plan accordingly."
        else:
            recommendations['harvesting'] = "Monitor weather forecasts closely for harvest timing decisions."
        
        return recommendations
    
    async def _generate_weather_alerts(self, weather_data: Dict[str, Any], impact_assessment: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Generate weather alerts and warnings"""
        
        alerts = []
        current = weather_data.get('current_conditions', {})
        forecast = weather_data.get('forecast_data', [])
        thresholds = self.weather_thresholds
        
        if current:
            temp = current.get('temperature', 25)
            humidity = current.get('humidity', 60)
            wind_speed = current.get('wind_speed', 10)
            rainfall_24h = current.get('rainfall_24h', 0)
            
            # Temperature alerts
            if temp <= thresholds['temperature']['frost_warning']:
                alerts.append({
                    'type': 'frost_warning',
                    'severity': 'high',
                    'message': f"Frost warning: Temperature at {temp}°C. Protect sensitive crops.",
                    'recommended_actions': [
                        "Cover sensitive plants",
                        "Use frost protection methods",
                        "Avoid irrigation before dawn"
                    ]
                })
            elif temp >= thresholds['temperature']['extreme_heat']:
                alerts.append({
                    'type': 'extreme_heat',
                    'severity': 'high',
                    'message': f"Extreme heat alert: {temp}°C. Crops at risk of heat stress.",
                    'recommended_actions': [
                        "Increase irrigation frequency",
                        "Provide shade if possible",
                        "Avoid field work during peak hours"
                    ]
                })
            
            # Wind alerts
            if wind_speed >= thresholds['wind']['damage_risk']:
                alerts.append({
                    'type': 'high_wind',
                    'severity': 'medium',
                    'message': f"High wind alert: {wind_speed} km/h. Risk of crop damage.",
                    'recommended_actions': [
                        "Secure loose structures",
                        "Postpone spraying operations",
                        "Check for wind damage after conditions improve"
                    ]
                })
            
            # Disease risk alerts
            if humidity >= thresholds['humidity']['disease_risk_high'] and 15 <= temp <= 30:
                alerts.append({
                    'type': 'disease_risk',
                    'severity': 'medium',
                    'message': "High disease risk due to favorable conditions for pathogens.",
                    'recommended_actions': [
                        "Monitor crops for disease symptoms",
                        "Consider preventive fungicide application",
                        "Improve field ventilation"
                    ]
                })
        
        # Forecast-based alerts
        if len(forecast) >= 3:
            heavy_rain_days = [day for day in forecast[:7] if day.get('rainfall', 0) > 25]
            if heavy_rain_days:
                alerts.append({
                    'type': 'heavy_rain_forecast',
                    'severity': 'medium',
                    'message': f"Heavy rain forecasted in next {len(heavy_rain_days)} day(s).",
                    'recommended_actions': [
                        "Ensure proper field drainage",
                        "Harvest mature crops if possible",
                        "Postpone field operations",
                        "Protect stored produce"
                    ]
                })
            
            # Drought alert
            low_rain_period = sum(day.get('rainfall', 0) for day in forecast[:7]) < 5
            if low_rain_period:
                alerts.append({
                    'type': 'drought_risk',
                    'severity': 'low',
                    'message': "Extended dry period forecasted. Plan irrigation accordingly.",
                    'recommended_actions': [
                        "Check irrigation systems",
                        "Conserve water resources",
                        "Monitor soil moisture levels"
                    ]
                })
        
        return alerts
    
    def _calculate_confidence_score(self, weather_data: Dict[str, Any], recommendations: Dict[str, Any]) -> float:
        """Calculate confidence score for weather analysis"""
        
        confidence_factors = []
        
        # Data quality factor
        current = weather_data.get('current_conditions', {})
        forecast = weather_data.get('forecast_data', [])
        
        if current and len(current) >= 5:  # Good current data
            confidence_factors.append(0.9)
        elif current:
            confidence_factors.append(0.7)
        else:
            confidence_factors.append(0.3)
        
        if len(forecast) >= 5:  # Good forecast data
            confidence_factors.append(0.85)
        elif len(forecast) >= 3:
            confidence_factors.append(0.75)
        else:
            confidence_factors.append(0.5)
        
        # Crop context factor
        if weather_data.get('crop_context'):
            confidence_factors.append(0.9)
        else:
            confidence_factors.append(0.7)
        
        return np.mean(confidence_factors)
    
    def _identify_risk_factors(self, day_data: Dict[str, Any]) -> List[str]:
        """Identify specific risk factors for a day"""
        factors = []
        
        temp_max = day_data.get('temperature_max', 25)
        rainfall = day_data.get('rainfall', 0)
        wind_speed = day_data.get('wind_speed', 10)
        
        if temp_max > 35:
            factors.append("Extreme heat")
        if rainfall > 50:
            factors.append("Heavy rainfall")
        if wind_speed > 25:
            factors.append("High winds")
        
        return factors
    
    def _suggest_activities(self, day_data: Dict[str, Any]) -> List[str]:
        """Suggest suitable activities for favorable weather days"""
        activities = []
        
        temp_max = day_data.get('temperature_max', 25)
        rainfall = day_data.get('rainfall', 0)
        wind_speed = day_data.get('wind_speed', 10)
        humidity = day_data.get('humidity', 60)
        
        if rainfall < 2 and wind_speed < 15:
            activities.append("Pesticide/fungicide application")
        
        if temp_max < 30 and humidity < 70:
            activities.append("Harvesting operations")
        
        if wind_speed < 10 and rainfall < 1:
            activities.append("Field cultivation and soil preparation")
        
        return activities
    
    # Additional methods for field conditions analysis
    async def analyze_field_conditions(self, field_data: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze field-specific weather conditions"""
        # Implementation for field-specific analysis
        pass
    
    async def quick_weather_analysis(self, weather_data: Dict[str, Any]) -> Dict[str, Any]:
        """Quick weather analysis for real-time monitoring"""
        # Implementation for real-time weather analysis
        pass