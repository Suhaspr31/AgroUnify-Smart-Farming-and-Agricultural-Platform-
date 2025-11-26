"""
AgroUnify AI - Data Validation Utilities
Comprehensive data validation for agricultural AI inputs
"""

import re
from typing import Dict, List, Any, Optional, Union
from datetime import datetime, date
import numpy as np
import pandas as pd
from loguru import logger

class DataValidator:
    """Comprehensive data validation for agricultural AI"""
    
    def __init__(self):
        self.valid_crops = [
            'wheat', 'rice', 'corn', 'barley', 'oats', 'rye',
            'cotton', 'sugarcane', 'tobacco', 'jute', 'hemp',
            'tomato', 'potato', 'onion', 'garlic', 'carrot',
            'cabbage', 'cauliflower', 'broccoli', 'spinach',
            'apple', 'banana', 'mango', 'orange', 'grapes',
            'strawberry', 'papaya', 'guava', 'pomegranate',
            'soybean', 'groundnut', 'sunflower', 'mustard',
            'chickpea', 'lentil', 'kidney_bean', 'black_gram'
        ]
        
        self.valid_soil_types = [
            'clay', 'sandy', 'loamy', 'silt', 'peat', 'chalk',
            'clay-loam', 'sandy-loam', 'silty-clay', 'silty-loam'
        ]
        
        self.valid_irrigation_types = [
            'drip', 'sprinkler', 'flood', 'furrow', 'rainfed', 'micro-sprinkler'
        ]
        
        self.indian_states = [
            'andhra pradesh', 'arunachal pradesh', 'assam', 'bihar',
            'chhattisgarh', 'goa', 'gujarat', 'haryana', 'himachal pradesh',
            'jharkhand', 'karnataka', 'kerala', 'madhya pradesh',
            'maharashtra', 'manipur', 'meghalaya', 'mizoram',
            'nagaland', 'odisha', 'punjab', 'rajasthan', 'sikkim',
            'tamil nadu', 'telangana', 'tripura', 'uttar pradesh',
            'uttarakhand', 'west bengal'
        ]
    
    def validate_crop_data(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Validate crop-related data"""
        
        validated_data = data.copy()
        errors = []
        
        # Validate crop type
        crop_type = data.get('crop_type', '').lower().strip()
        if crop_type not in self.valid_crops:
            errors.append(f"Invalid crop type: {crop_type}")
            # Try to find closest match
            closest_crop = self._find_closest_match(crop_type, self.valid_crops)
            if closest_crop:
                validated_data['crop_type'] = closest_crop
                logger.warning(f"Auto-corrected crop type from '{crop_type}' to '{closest_crop}'")
            else:
                validated_data['crop_type'] = 'wheat'  # Default
        else:
            validated_data['crop_type'] = crop_type
        
        # Validate area
        area = data.get('area')
        if area is not None:
            try:
                area = float(area)
                if area <= 0:
                    errors.append("Area must be positive")
                    validated_data['area'] = 1.0
                elif area > 10000:
                    errors.append("Area seems too large (>10000 acres)")
                    validated_data['area'] = min(area, 1000)
                else:
                    validated_data['area'] = area
            except (ValueError, TypeError):
                errors.append("Area must be a number")
                validated_data['area'] = 1.0
        else:
            validated_data['area'] = 1.0
        
        # Validate soil type
        soil_type = data.get('soil_type', '').lower().strip()
        if soil_type and soil_type not in self.valid_soil_types:
            closest_soil = self._find_closest_match(soil_type, self.valid_soil_types)
            if closest_soil:
                validated_data['soil_type'] = closest_soil
                logger.warning(f"Auto-corrected soil type from '{soil_type}' to '{closest_soil}'")
            else:
                validated_data['soil_type'] = 'loamy'
        elif not soil_type:
            validated_data['soil_type'] = 'loamy'
        
        # Validate irrigation type
        irrigation_type = data.get('irrigation_type', '').lower().strip()
        if irrigation_type and irrigation_type not in self.valid_irrigation_types:
            closest_irrigation = self._find_closest_match(irrigation_type, self.valid_irrigation_types)
            if closest_irrigation:
                validated_data['irrigation_type'] = closest_irrigation
            else:
                validated_data['irrigation_type'] = 'drip'
        elif not irrigation_type:
            validated_data['irrigation_type'] = 'drip'
        
        # Validate planting date
        planting_date = data.get('planting_date')
        if planting_date:
            validated_date = self._validate_date(planting_date)
            if validated_date:
                validated_data['planting_date'] = validated_date
            else:
                errors.append("Invalid planting date format")
                validated_data['planting_date'] = datetime.now().strftime('%Y-%m-%d')
        else:
            validated_data['planting_date'] = datetime.now().strftime('%Y-%m-%d')
        
        # Validate location
        location = data.get('location', {})
        validated_location = self._validate_location(location)
        validated_data['location'] = validated_location
        
        # Validate weather data
        weather_data = data.get('weather_data', {})
        if weather_data:
            validated_weather = self._validate_weather_data(weather_data)
            validated_data['weather_data'] = validated_weather
        
        # Validate fertilizer usage
        fertilizer_usage = data.get('fertilizer_usage', {})
        if fertilizer_usage:
            validated_fertilizer = self._validate_fertilizer_data(fertilizer_usage)
            validated_data['fertilizer_usage'] = validated_fertilizer
        
        if errors:
            logger.warning(f"Crop data validation errors: {errors}")
        
        return validated_data
    
    def validate_market_data(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Validate market-related data"""
        
        validated_data = data.copy()
        errors = []
        
        # Validate crop
        crop = data.get('crop', '').lower().strip()
        if crop not in self.valid_crops:
            closest_crop = self._find_closest_match(crop, self.valid_crops)
            validated_data['crop'] = closest_crop if closest_crop else 'wheat'
        
        # Validate location
        location = data.get('location', {})
        validated_location = self._validate_location(location)
        validated_data['location'] = validated_location
        
        # Validate season
        season = data.get('season', '').lower().strip()
        valid_seasons = ['spring', 'summer', 'autumn', 'winter', 'kharif', 'rabi', 'zaid']
        if season not in valid_seasons:
            validated_data['season'] = 'kharif'  # Default
        
        # Validate quantity
        quantity = data.get('quantity')
        if quantity is not None:
            try:
                quantity = float(quantity)
                if quantity <= 0:
                    errors.append("Quantity must be positive")
                    validated_data['quantity'] = 100
                else:
                    validated_data['quantity'] = quantity
            except (ValueError, TypeError):
                errors.append("Quantity must be a number")
                validated_data['quantity'] = 100
        
        # Validate quality grade
        quality_grade = data.get('quality_grade', '').upper().strip()
        valid_grades = ['A', 'B', 'C']
        if quality_grade not in valid_grades:
            validated_data['quality_grade'] = 'A'  # Default to best grade
        
        if errors:
            logger.warning(f"Market data validation errors: {errors}")
        
        return validated_data
    
    def validate_weather_data(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Validate weather-related data"""
        
        validated_data = data.copy()
        errors = []
        
        # Validate location
        location = data.get('location', {})
        validated_location = self._validate_location(location)
        validated_data['location'] = validated_location
        
        # Validate current conditions
        current_conditions = data.get('current_conditions', {})
        if current_conditions:
            validated_current = self._validate_current_weather(current_conditions)
            validated_data['current_conditions'] = validated_current
        
        # Validate forecast data
        forecast_data = data.get('forecast_data', [])
        if forecast_data:
            validated_forecast = self._validate_forecast_data(forecast_data)
            validated_data['forecast_data'] = validated_forecast
        
        # Validate crop context
        crop_context = data.get('crop_context', '').lower().strip()
        if crop_context and crop_context not in self.valid_crops:
            closest_crop = self._find_closest_match(crop_context, self.valid_crops)
            validated_data['crop_context'] = closest_crop if closest_crop else None
        
        if errors:
            logger.warning(f"Weather data validation errors: {errors}")
        
        return validated_data
    
    def _validate_location(self, location: Dict[str, Any]) -> Dict[str, Any]:
        """Validate location data"""
        
        validated_location = {}
        
        # Validate coordinates
        lat = location.get('latitude')
        lng = location.get('longitude')
        
        if lat is not None:
            try:
                lat = float(lat)
                if -90 <= lat <= 90:
                    validated_location['latitude'] = lat
                else:
                    validated_location['latitude'] = 28.0  # Default to Delhi
            except (ValueError, TypeError):
                validated_location['latitude'] = 28.0
        else:
            validated_location['latitude'] = 28.0
        
        if lng is not None:
            try:
                lng = float(lng)
                if -180 <= lng <= 180:
                    validated_location['longitude'] = lng
                else:
                    validated_location['longitude'] = 77.0  # Default to Delhi
            except (ValueError, TypeError):
                validated_location['longitude'] = 77.0
        else:
            validated_location['longitude'] = 77.0
        
        # Validate elevation
        elevation = location.get('elevation')
        if elevation is not None:
            try:
                elevation = float(elevation)
                validated_location['elevation'] = max(0, min(elevation, 9000))  # Cap at reasonable limits
            except (ValueError, TypeError):
                validated_location['elevation'] = 200
        else:
            validated_location['elevation'] = 200
        
        # Validate city and state
        city = location.get('city', '').strip()
        state = location.get('state', '').lower().strip()
        
        validated_location['city'] = city if city else 'Unknown'
        
        if state in self.indian_states:
            validated_location['state'] = state.title()
        else:
            # Try to find closest match
            closest_state = self._find_closest_match(state, self.indian_states)
            validated_location['state'] = closest_state.title() if closest_state else 'Unknown'
        
        return validated_location
    
    def _validate_weather_data(self, weather_data: Dict[str, Any]) -> Dict[str, Any]:
        """Validate weather measurements"""
        
        validated_weather = {}
        
        # Temperature validation
        for temp_field in ['avg_temperature', 'min_temperature', 'max_temperature']:
            temp = weather_data.get(temp_field)
            if temp is not None:
                try:
                    temp = float(temp)
                    # Reasonable temperature range for India: -10 to 55°C
                    validated_weather[temp_field] = max(-10, min(temp, 55))
                except (ValueError, TypeError):
                    # Default temperatures
                    defaults = {'avg_temperature': 25, 'min_temperature': 15, 'max_temperature': 35}
                    validated_weather[temp_field] = defaults.get(temp_field, 25)
        
        # Rainfall validation
        rainfall_fields = ['total_rainfall', 'rainfall_24h']
        for rain_field in rainfall_fields:
            rainfall = weather_data.get(rain_field)
            if rainfall is not None:
                try:
                    rainfall = float(rainfall)
                    validated_weather[rain_field] = max(0, min(rainfall, 1000))  # Cap at 1000mm
                except (ValueError, TypeError):
                    validated_weather[rain_field] = 0
        
        # Humidity validation
        humidity = weather_data.get('humidity') or weather_data.get('avg_humidity')
        if humidity is not None:
            try:
                humidity = float(humidity)
                validated_weather['humidity'] = max(0, min(humidity, 100))
            except (ValueError, TypeError):
                validated_weather['humidity'] = 65
        
        # Wind speed validation
        wind_speed = weather_data.get('wind_speed')
        if wind_speed is not None:
            try:
                wind_speed = float(wind_speed)
                validated_weather['wind_speed'] = max(0, min(wind_speed, 200))  # Cap at 200 km/h
            except (ValueError, TypeError):
                validated_weather['wind_speed'] = 10
        
        # Sunshine hours validation
        sunshine = weather_data.get('sunshine_hours')
        if sunshine is not None:
            try:
                sunshine = float(sunshine)
                validated_weather['sunshine_hours'] = max(0, min(sunshine, 14))
            except (ValueError, TypeError):
                validated_weather['sunshine_hours'] = 8
        
        return validated_weather
    
    def _validate_current_weather(self, current: Dict[str, Any]) -> Dict[str, Any]:
        """Validate current weather conditions"""
        return self._validate_weather_data(current)
    
    def _validate_forecast_data(self, forecast: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Validate weather forecast data"""
        
        validated_forecast = []
        
        for day_data in forecast[:14]:  # Limit to 14 days
            if isinstance(day_data, dict):
                validated_day = self._validate_weather_data(day_data)
                
                # Validate date
                date_str = day_data.get('date')
                if date_str:
                    validated_date = self._validate_date(date_str)
                    if validated_date:
                        validated_day['date'] = validated_date
                
                validated_forecast.append(validated_day)
        
        return validated_forecast
    
    def _validate_fertilizer_data(self, fertilizer_data: Dict[str, Any]) -> Dict[str, Any]:
        """Validate fertilizer usage data"""
        
        validated_fertilizer = {}
        
        # Validate NPK values
        for nutrient in ['nitrogen', 'phosphorus', 'potassium']:
            value = fertilizer_data.get(nutrient)
            if value is not None:
                try:
                    value = float(value)
                    validated_fertilizer[nutrient] = max(0, min(value, 500))  # Cap at 500 kg/ha
                except (ValueError, TypeError):
                    validated_fertilizer[nutrient] = 0
        
        # Validate organic fertilizer
        organic = fertilizer_data.get('organic_fertilizer')
        if organic is not None:
            try:
                organic = float(organic)
                validated_fertilizer['organic_fertilizer'] = max(0, min(organic, 50))  # Cap at 50 tons/ha
            except (ValueError, TypeError):
                validated_fertilizer['organic_fertilizer'] = 0
        
        return validated_fertilizer
    
    def _validate_date(self, date_input: Union[str, datetime, date]) -> Optional[str]:
        """Validate and normalize date input"""
        
        if isinstance(date_input, (datetime, date)):
            return date_input.strftime('%Y-%m-%d')
        
        if isinstance(date_input, str):
            # Try different date formats
            date_formats = ['%Y-%m-%d', '%d-%m-%Y', '%d/%m/%Y', '%Y/%m/%d', '%m/%d/%Y']
            
            for fmt in date_formats:
                try:
                    parsed_date = datetime.strptime(date_input.strip(), fmt)
                    return parsed_date.strftime('%Y-%m-%d')
                except ValueError:
                    continue
        
        return None
    
    def _find_closest_match(self, input_str: str, valid_options: List[str], threshold: float = 0.6) -> Optional[str]:
        """Find closest match using simple string similarity"""
        
        if not input_str:
            return None
        
        input_str = input_str.lower().strip()
        best_match = None
        best_score = 0
        
        for option in valid_options:
            # Simple similarity based on common characters
            similarity = self._calculate_similarity(input_str, option)
            
            if similarity > best_score and similarity >= threshold:
                best_score = similarity
                best_match = option
        
        return best_match
    
    def _calculate_similarity(self, str1: str, str2: str) -> float:
        """Calculate simple string similarity"""
        
        if not str1 or not str2:
            return 0.0
        
        # Convert to sets of characters
        set1 = set(str1.lower())
        set2 = set(str2.lower())
        
        # Calculate Jaccard similarity
        intersection = len(set1.intersection(set2))
        union = len(set1.union(set2))
        
        if union == 0:
            return 0.0
        
        return intersection / union
    
    def validate_image_data(self, image_data: Any) -> Dict[str, Any]:
        """Validate image data"""
        
        validation_result = {
            'is_valid': True,
            'errors': [],
            'warnings': []
        }
        
        if isinstance(image_data, str):
            # File path validation
            if not image_data.lower().endswith(('.jpg', '.jpeg', '.png', '.webp')):
                validation_result['errors'].append("Unsupported image format")
                validation_result['is_valid'] = False
        
        elif hasattr(image_data, 'shape'):
            # NumPy array validation
            if len(image_data.shape) not in [2, 3]:
                validation_result['errors'].append("Image must be 2D or 3D array")
                validation_result['is_valid'] = False
            
            if len(image_data.shape) == 3 and image_data.shape[2] not in [1, 3, 4]:
                validation_result['errors'].append("Image must have 1, 3, or 4 channels")
                validation_result['is_valid'] = False
            
            # Check image size
            if hasattr(image_data, 'size'):
                size_mb = image_data.size * image_data.itemsize / (1024 * 1024)
                if size_mb > 50:  # 50MB limit
                    validation_result['warnings'].append("Image is very large (>50MB)")
        
        else:
            validation_result['errors'].append("Unsupported image data type")
            validation_result['is_valid'] = False
        
        return validation_result