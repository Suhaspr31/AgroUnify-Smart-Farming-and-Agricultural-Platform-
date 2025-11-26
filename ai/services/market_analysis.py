"""
AgroUnify AI - Advanced Market Analysis Service
Market price prediction and agricultural economics analysis
"""

import asyncio
import numpy as np
import pandas as pd
from typing import Dict, List, Any, Optional, Tuple
from pydantic import BaseModel, Field
from loguru import logger
import time
import joblib
from datetime import datetime, timedelta
import requests
import yfinance as yf
from concurrent.futures import ThreadPoolExecutor
import hashlib

from utils.model_loader import ModelManager
from utils.data_validation import DataValidator

# Data Models
class MarketData(BaseModel):
    crop: str = Field(..., description="Crop name")
    variety: Optional[str] = None
    location: Dict[str, Any] = Field(..., description="Market location")
    season: str = Field(..., description="Current season")
    quantity: Optional[float] = None
    quality_grade: Optional[str] = None
    historical_data: Optional[Dict[str, Any]] = None

class PriceAnalysisResult(BaseModel):
    predicted_price: float
    confidence: float
    price_range: Tuple[float, float]
    trend: str  # 'increasing', 'decreasing', 'stable'
    market_factors: Dict[str, float]
    price_drivers: List[str]
    recommendations: List[Dict[str, Any]]
    forecast_period: str

class MarketAnalysisService:
    """Advanced market analysis service for agricultural price prediction"""
    
    def __init__(self, model_manager: ModelManager):
        self.model_manager = model_manager
        self.data_validator = DataValidator()
        self.executor = ThreadPoolExecutor(max_workers=4)
        
        # Market data sources and parameters
        self.market_data_sources = self._initialize_data_sources()
        self.crop_market_parameters = self._load_market_parameters()
        
        # Caching for performance
        self.price_cache = {}
        self.market_data_cache = {}
        
        logger.info("✅ MarketAnalysisService initialized successfully")
    
    def _initialize_data_sources(self) -> Dict[str, Dict]:
        """Initialize external market data sources"""
        return {
            'government_portals': {
                'enam': 'https://enam.gov.in/web/api',
                'agmarknet': 'https://agmarknet.gov.in/api',
                'commodity_board': 'https://commodityboard.nic.in/api'
            },
            'private_sources': {
                'commodity_exchanges': ['NCDEX', 'MCX'],
                'price_reporting_agencies': []
            },
            'international': {
                'fao': 'http://www.fao.org/giews/food-prices/tool/public/api',
                'world_bank': 'https://api.worldbank.org/v2/country/IND/indicator'
            }
        }
    
    def _load_market_parameters(self) -> Dict[str, Dict]:
        """Load crop-specific market parameters"""
        return {
            'wheat': {
                'seasonality': {'peak_months': [4, 5], 'low_months': [10, 11]},
                'price_volatility': 0.15,
                'major_markets': ['Punjab', 'Haryana', 'UP', 'MP'],
                'export_dependency': 0.1,
                'government_intervention': True,
                'msp_applicable': True,
                'storage_capacity': 'high',
                'price_correlations': {'rice': 0.7, 'corn': 0.6}
            },
            'rice': {
                'seasonality': {'peak_months': [10, 11], 'low_months': [6, 7]},
                'price_volatility': 0.12,
                'major_markets': ['Punjab', 'Haryana', 'AP', 'Telangana'],
                'export_dependency': 0.25,
                'government_intervention': True,
                'msp_applicable': True,
                'storage_capacity': 'high',
                'price_correlations': {'wheat': 0.7, 'corn': 0.5}
            },
            'cotton': {
                'seasonality': {'peak_months': [12, 1], 'low_months': [7, 8]},
                'price_volatility': 0.25,
                'major_markets': ['Gujarat', 'Maharashtra', 'AP', 'Haryana'],
                'export_dependency': 0.4,
                'government_intervention': True,
                'msp_applicable': True,
                'storage_capacity': 'medium',
                'price_correlations': {'sugarcane': 0.3}
            },
            'sugarcane': {
                'seasonality': {'peak_months': [2, 3], 'low_months': [9, 10]},
                'price_volatility': 0.1,
                'major_markets': ['UP', 'Maharashtra', 'Karnataka'],
                'export_dependency': 0.05,
                'government_intervention': True,
                'msp_applicable': True,
                'storage_capacity': 'low',
                'price_correlations': {'wheat': 0.4}
            },
            'tomato': {
                'seasonality': {'peak_months': [1, 2, 11, 12], 'low_months': [6, 7, 8]},
                'price_volatility': 0.4,
                'major_markets': ['Karnataka', 'AP', 'Maharashtra', 'MP'],
                'export_dependency': 0.02,
                'government_intervention': False,
                'msp_applicable': False,
                'storage_capacity': 'very_low',
                'price_correlations': {'onion': 0.3, 'potato': 0.25}
            },
            'onion': {
                'seasonality': {'peak_months': [1, 2], 'low_months': [7, 8]},
                'price_volatility': 0.5,
                'major_markets': ['Maharashtra', 'Karnataka', 'AP', 'MP'],
                'export_dependency': 0.15,
                'government_intervention': True,
                'msp_applicable': False,
                'storage_capacity': 'medium',
                'price_correlations': {'tomato': 0.3, 'potato': 0.4}
            }
        }
    
    async def predict_price(self, market_data: Dict[str, Any]) -> PriceAnalysisResult:
        """
        Predict market price using advanced ML models and market intelligence
        
        Args:
            market_data: Comprehensive market and crop data
            
        Returns:
            PriceAnalysisResult with prediction and market analysis
        """
        start_time = time.time()
        
        try:
            # Validate input data
            validated_data = self.data_validator.validate_market_data(market_data)
            
            # Generate cache key
            cache_key = f"price_{hashlib.md5(str(sorted(market_data.items())).encode()).hexdigest()}"
            
            # Check cache
            if cache_key in self.price_cache:
                logger.info(f"Cache hit for price prediction: {cache_key}")
                return self.price_cache[cache_key]
            
            # Gather market intelligence
            market_intelligence = await self._gather_market_intelligence(validated_data)
            
            # Engineer features for price prediction
            features = await self._engineer_price_features(validated_data, market_intelligence)
            
            # Get price prediction model
            price_model = await self.model_manager.get_model('price_prediction')
            
            # Run prediction
            prediction_result = await self._run_price_inference(price_model, features)
            
            # Analyze market factors
            market_factors = await self._analyze_market_factors(validated_data, market_intelligence)
            
            # Identify price drivers
            price_drivers = await self._identify_price_drivers(validated_data, market_factors)
            
            # Generate market recommendations
            recommendations = await self._generate_market_recommendations(
                validated_data, prediction_result, market_factors
            )
            
            # Determine price trend
            trend = await self._analyze_price_trend(validated_data, prediction_result, market_intelligence)
            
            result = PriceAnalysisResult(
                predicted_price=float(prediction_result['price']),
                confidence=float(prediction_result['confidence']),
                price_range=(
                    float(prediction_result['price'] * 0.9),
                    float(prediction_result['price'] * 1.1)
                ),
                trend=trend,
                market_factors=market_factors,
                price_drivers=price_drivers,
                recommendations=recommendations,
                forecast_period='7_days'
            )
            
            # Cache result
            self.price_cache[cache_key] = result
            
            processing_time = time.time() - start_time
            logger.info(f"Price prediction completed in {processing_time:.3f}s")
            
            return result
            
        except Exception as e:
            logger.error(f"Price prediction failed: {e}")
            raise
    
    async def _gather_market_intelligence(self, market_data: Dict[str, Any]) -> Dict[str, Any]:
        """Gather comprehensive market intelligence from multiple sources"""
        
        intelligence = {
            'current_prices': {},
            'historical_trends': {},
            'supply_data': {},
            'demand_indicators': {},
            'external_factors': {},
            'government_policies': {}
        }
        
        crop = market_data.get('crop', '').lower()
        location = market_data.get('location', {})
        
        try:
            # Gather current market prices from multiple sources
            tasks = [
                self._fetch_government_prices(crop, location),
                self._fetch_commodity_exchange_prices(crop),
                self._fetch_mandi_prices(crop, location),
                self._fetch_international_prices(crop),
                self._analyze_supply_demand(crop, location),
                self._check_government_policies(crop)
            ]
            
            results = await asyncio.gather(*tasks, return_exceptions=True)
            
            # Process results
            for i, result in enumerate(results):
                if not isinstance(result, Exception) and result:
                    if i == 0:  # Government prices
                        intelligence['current_prices'].update(result)
                    elif i == 1:  # Commodity exchange
                        intelligence['current_prices'].update(result)
                    elif i == 2:  # Mandi prices
                        intelligence['current_prices'].update(result)
                    elif i == 3:  # International prices
                        intelligence['external_factors']['international_prices'] = result
                    elif i == 4:  # Supply-demand
                        intelligence['supply_data'] = result.get('supply', {})
                        intelligence['demand_indicators'] = result.get('demand', {})
                    elif i == 5:  # Government policies
                        intelligence['government_policies'] = result
            
        except Exception as e:
            logger.warning(f"Failed to gather complete market intelligence: {e}")
        
        return intelligence
    
    async def _fetch_government_prices(self, crop: str, location: Dict[str, Any]) -> Dict[str, Any]:
        """Fetch prices from government sources"""
        
        def _fetch():
            try:
                # Mock implementation - replace with actual API calls
                base_prices = {
                    'wheat': 2000,
                    'rice': 2500,
                    'cotton': 5500,
                    'sugarcane': 350,
                    'tomato': 25,
                    'onion': 30
                }
                
                base_price = base_prices.get(crop, 1000)
                
                # Add some variation based on location and season
                import random
                variation = random.uniform(0.9, 1.15)
                
                return {
                    'government_msp': base_price,
                    'average_market_price': base_price * variation,
                    'source': 'government_api',
                    'last_updated': datetime.now().isoformat()
                }
                
            except Exception as e:
                logger.warning(f"Failed to fetch government prices: {e}")
                return {}
        
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(self.executor, _fetch)
    
    async def _fetch_commodity_exchange_prices(self, crop: str) -> Dict[str, Any]:
        """Fetch prices from commodity exchanges"""
        
        def _fetch():
            try:
                # Mock implementation for commodity exchange prices
                futures_prices = {
                    'wheat': 2100,
                    'rice': 2600,
                    'cotton': 5800,
                    'sugarcane': 380
                }
                
                if crop in futures_prices:
                    return {
                        'futures_price': futures_prices[crop],
                        'spot_price': futures_prices[crop] * 0.98,
                        'exchange': 'NCDEX',
                        'volume': 1000,
                        'last_updated': datetime.now().isoformat()
                    }
                
                return {}
                
            except Exception as e:
                logger.warning(f"Failed to fetch commodity exchange prices: {e}")
                return {}
        
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(self.executor, _fetch)
    
    async def _fetch_mandi_prices(self, crop: str, location: Dict[str, Any]) -> Dict[str, Any]:
        """Fetch prices from local mandis"""
        
        def _fetch():
            try:
                state = location.get('state', 'Punjab')
                city = location.get('city', 'Ludhiana')
                
                # Mock mandi prices with regional variation
                base_prices = {
                    'wheat': 1950,
                    'rice': 2450,
                    'cotton': 5400,
                    'sugarcane': 340,
                    'tomato': 28,
                    'onion': 32
                }
                
                # Regional price multipliers
                regional_multipliers = {
                    'Punjab': 1.05,
                    'Haryana': 1.03,
                    'UP': 0.98,
                    'MP': 0.95,
                    'Maharashtra': 1.02,
                    'Karnataka': 1.01,
                    'AP': 0.97,
                    'Telangana': 0.97
                }
                
                base_price = base_prices.get(crop, 1000)
                multiplier = regional_multipliers.get(state, 1.0)
                
                return {
                    'mandi_price': base_price * multiplier,
                    'mandi_name': f"{city} Mandi",
                    'state': state,
                    'arrival_quantity': 500,  # MT
                    'last_updated': datetime.now().isoformat()
                }
                
            except Exception as e:
                logger.warning(f"Failed to fetch mandi prices: {e}")
                return {}
        
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(self.executor, _fetch)
    
    async def _fetch_international_prices(self, crop: str) -> Dict[str, Any]:
        """Fetch international commodity prices"""
        
        def _fetch():
            try:
                # Mock international prices
                international_prices = {
                    'wheat': 250,  # USD/MT
                    'rice': 400,
                    'cotton': 1800,
                    'sugarcane': 350
                }
                
                if crop in international_prices:
                    # Convert USD to INR (approximate rate)
                    usd_to_inr = 83.0
                    price_inr = international_prices[crop] * usd_to_inr
                    
                    return {
                        'international_price_usd': international_prices[crop],
                        'international_price_inr': price_inr,
                        'exchange_rate': usd_to_inr,
                        'source': 'international_market',
                        'last_updated': datetime.now().isoformat()
                    }
                
                return {}
                
            except Exception as e:
                logger.warning(f"Failed to fetch international prices: {e}")
                return {}
        
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(self.executor, _fetch)
    
    async def _analyze_supply_demand(self, crop: str, location: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze supply and demand factors"""
        
        def _analyze():
            try:
                # Mock supply-demand analysis
                crop_params = self.crop_market_parameters.get(crop, {})
                
                # Current month
                current_month = datetime.now().month
                
                # Seasonal supply analysis
                peak_months = crop_params.get('seasonality', {}).get('peak_months', [])
                low_months = crop_params.get('seasonality', {}).get('low_months', [])
                
                if current_month in peak_months:
                    supply_level = 'high'
                    supply_score = 0.8
                elif current_month in low_months:
                    supply_level = 'low'
                    supply_score = 0.3
                else:
                    supply_level = 'medium'
                    supply_score = 0.6
                
                # Demand analysis (simplified)
                demand_factors = {
                    'seasonal_demand': 0.7,
                    'export_demand': crop_params.get('export_dependency', 0.1),
                    'processing_demand': 0.5,
                    'retail_demand': 0.6
                }
                
                overall_demand = np.mean(list(demand_factors.values()))
                
                return {
                    'supply': {
                        'level': supply_level,
                        'score': supply_score,
                        'factors': ['seasonal_production', 'storage_levels', 'imports']
                    },
                    'demand': {
                        'level': 'medium' if overall_demand > 0.5 else 'low',
                        'score': overall_demand,
                        'factors': demand_factors
                    },
                    'supply_demand_balance': supply_score - overall_demand
                }
                
            except Exception as e:
                logger.warning(f"Failed to analyze supply-demand: {e}")
                return {}
        
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(self.executor, _analyze)
    
    async def _check_government_policies(self, crop: str) -> Dict[str, Any]:
        """Check relevant government policies and interventions"""
        
        def _check():
            try:
                crop_params = self.crop_market_parameters.get(crop, {})
                
                policies = {
                    'msp_applicable': crop_params.get('msp_applicable', False),
                    'government_intervention': crop_params.get('government_intervention', False),
                    'export_restrictions': False,  # Dynamic check needed
                    'import_duties': 0.1,  # Simplified
                    'subsidies': {
                        'fertilizer_subsidy': True,
                        'seed_subsidy': True,
                        'crop_insurance': True
                    }
                }
                
                # MSP information
                if policies['msp_applicable']:
                    msp_prices = {
                        'wheat': 2125,
                        'rice': 2183,
                        'cotton': 5515,
                        'sugarcane': 305
                    }
                    policies['current_msp'] = msp_prices.get(crop, 0)
                
                return policies
                
            except Exception as e:
                logger.warning(f"Failed to check government policies: {e}")
                return {}
        
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(self.executor, _check)
    
    async def _engineer_price_features(self, market_data: Dict[str, Any], intelligence: Dict[str, Any]) -> np.ndarray:
        """Engineer features for price prediction model"""
        
        features = []
        
        crop = market_data.get('crop', '').lower()
        location = market_data.get('location', {})
        
        # Basic crop features
        crop_types = ['wheat', 'rice', 'cotton', 'sugarcane', 'tomato', 'onion', 'potato']
        for crop_type in crop_types:
            features.append(1.0 if crop == crop_type else 0.0)
        
        # Location features
        states = ['punjab', 'haryana', 'up', 'mp', 'maharashtra', 'karnataka', 'ap', 'telangana']
        state = location.get('state', '').lower()
        for state_name in states:
            features.append(1.0 if state == state_name else 0.0)
        
        # Seasonal features
        current_month = datetime.now().month
        features.extend([
            current_month,
            np.sin(2 * np.pi * current_month / 12),
            np.cos(2 * np.pi * current_month / 12)
        ])
        
        # Market intelligence features
        current_prices = intelligence.get('current_prices', {})
        features.extend([
            current_prices.get('average_market_price', 1000),
            current_prices.get('government_msp', 1000),
            current_prices.get('futures_price', 1000),
            current_prices.get('mandi_price', 1000)
        ])
        
        # Supply-demand features
        supply_data = intelligence.get('supply_data', {})
        demand_data = intelligence.get('demand_indicators', {})
        features.extend([
            supply_data.get('score', 0.5),
            demand_data.get('score', 0.5),
            supply_data.get('score', 0.5) - demand_data.get('score', 0.5)  # Balance
        ])
        
        # External factors
        external_factors = intelligence.get('external_factors', {})
        international_price = external_factors.get('international_prices', {})
        features.append(international_price.get('international_price_inr', 50000))
        
        # Government policy features
        policies = intelligence.get('government_policies', {})
        features.extend([
            1.0 if policies.get('msp_applicable', False) else 0.0,
            1.0 if policies.get('government_intervention', False) else 0.0,
            policies.get('current_msp', 0)
        ])
        
        # Quality and quantity features
        features.extend([
            market_data.get('quantity', 100),
            1.0 if market_data.get('quality_grade', 'A') == 'A' else 0.5
        ])
        
        # Time-based features
        day_of_week = datetime.now().weekday()
        features.extend([
            day_of_week,
            1.0 if day_of_week < 5 else 0.0  # Weekday vs weekend
        ])
        
        return np.array(features, dtype=np.float32).reshape(1, -1)
    
    async def _run_price_inference(self, model, features: np.ndarray) -> Dict[str, float]:
        """Run price prediction inference"""
        
        def _infer():
            try:
                if hasattr(model, 'predict'):
                    # Scikit-learn model
                    prediction = model.predict(features)[0]
                    
                    # Calculate confidence based on model properties
                    if hasattr(model, 'predict_proba'):
                        # For classification models
                        confidence = 0.85
                    elif hasattr(model, 'feature_importances_'):
                        # For tree-based models
                        feature_importance_sum = np.sum(model.feature_importances_ * np.abs(features[0]))
                        confidence = min(0.95, 0.65 + feature_importance_sum / 100)
                    else:
                        confidence = 0.8
                else:
                    # Neural network model
                    prediction = model.predict(features)[0][0]
                    confidence = 0.82
                
                return {
                    'price': max(0, prediction),
                    'confidence': confidence
                }
                
            except Exception as e:
                logger.error(f"Price inference failed: {e}")
                # Fallback prediction
                return {'price': 1000, 'confidence': 0.5}
        
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(self.executor, _infer)
    
    async def _analyze_market_factors(self, market_data: Dict[str, Any], intelligence: Dict[str, Any]) -> Dict[str, float]:
        """Analyze factors affecting market prices"""
        
        factors = {
            'supply_impact': 0.0,
            'demand_impact': 0.0,
            'seasonal_impact': 0.0,
            'government_impact': 0.0,
            'international_impact': 0.0,
            'quality_impact': 0.0,
            'location_impact': 0.0
        }
        
        crop = market_data.get('crop', '').lower()
        crop_params = self.crop_market_parameters.get(crop, {})
        
        # Supply impact
        supply_data = intelligence.get('supply_data', {})
        supply_score = supply_data.get('score', 0.5)
        factors['supply_impact'] = 1.0 - supply_score  # High supply = lower prices
        
        # Demand impact
        demand_data = intelligence.get('demand_indicators', {})
        demand_score = demand_data.get('score', 0.5)
        factors['demand_impact'] = demand_score  # High demand = higher prices
        
        # Seasonal impact
        current_month = datetime.now().month
        peak_months = crop_params.get('seasonality', {}).get('peak_months', [])
        low_months = crop_params.get('seasonality', {}).get('low_months', [])
        
        if current_month in peak_months:
            factors['seasonal_impact'] = -0.2  # Peak season = lower prices
        elif current_month in low_months:
            factors['seasonal_impact'] = 0.3   # Off season = higher prices
        else:
            factors['seasonal_impact'] = 0.0
        
        # Government impact
        policies = intelligence.get('government_policies', {})
        if policies.get('msp_applicable', False):
            current_prices = intelligence.get('current_prices', {})
            market_price = current_prices.get('average_market_price', 1000)
            msp = policies.get('current_msp', 1000)
            
            if market_price < msp * 1.1:  # Near MSP
                factors['government_impact'] = 0.3  # Government support
            else:
                factors['government_impact'] = 0.1
        else:
            factors['government_impact'] = 0.0
        
        # International impact
        export_dependency = crop_params.get('export_dependency', 0.1)
        factors['international_impact'] = export_dependency * 0.5
        
        # Quality impact
        quality_grade = market_data.get('quality_grade', 'A')
        quality_multipliers = {'A': 0.2, 'B': 0.0, 'C': -0.2}
        factors['quality_impact'] = quality_multipliers.get(quality_grade, 0.0)
        
        # Location impact (simplified)
        location = market_data.get('location', {})
        state = location.get('state', '').lower()
        major_markets = [market.lower() for market in crop_params.get('major_markets', [])]
        
        if state in major_markets:
            factors['location_impact'] = 0.1  # Major market = slight premium
        else:
            factors['location_impact'] = -0.05  # Minor market = slight discount
        
        # Normalize factors
        for factor in factors:
            factors[factor] = max(-1.0, min(1.0, factors[factor]))
        
        return factors
    
    async def _identify_price_drivers(self, market_data: Dict[str, Any], factors: Dict[str, float]) -> List[str]:
        """Identify key price drivers based on factor analysis"""
        
        drivers = []
        
        # Sort factors by impact
        sorted_factors = sorted(factors.items(), key=lambda x: abs(x[1]), reverse=True)
        
        for factor_name, impact in sorted_factors[:5]:  # Top 5 factors
            if abs(impact) > 0.1:  # Significant impact
                if factor_name == 'supply_impact':
                    if impact > 0:
                        drivers.append("Limited supply pushing prices higher")
                    else:
                        drivers.append("Abundant supply keeping prices low")
                
                elif factor_name == 'demand_impact':
                    if impact > 0:
                        drivers.append("Strong demand supporting price increases")
                    else:
                        drivers.append("Weak demand pressuring prices downward")
                
                elif factor_name == 'seasonal_impact':
                    if impact > 0:
                        drivers.append("Off-season premium increasing prices")
                    else:
                        drivers.append("Peak season harvest reducing prices")
                
                elif factor_name == 'government_impact':
                    if impact > 0:
                        drivers.append("Government support policies stabilizing prices")
                
                elif factor_name == 'international_impact':
                    if impact > 0:
                        drivers.append("Export opportunities supporting domestic prices")
        
        # Add crop-specific drivers
        crop = market_data.get('crop', '').lower()
        if crop == 'tomato':
            drivers.append("Perishable nature causing price volatility")
        elif crop == 'onion':
            drivers.append("Storage and export dynamics affecting prices")
        elif crop in ['wheat', 'rice']:
            drivers.append("MSP and procurement policies providing price floor")
        
        return drivers[:6]  # Limit to 6 drivers
    
    async def _generate_market_recommendations(self, market_data: Dict[str, Any], prediction: Dict[str, float], factors: Dict[str, float]) -> List[Dict[str, Any]]:
        """Generate market recommendations based on analysis"""
        
        recommendations = []
        
        crop = market_data.get('crop', '').lower()
        predicted_price = prediction['price']
        confidence = prediction['confidence']
        
        # Price-based recommendations
        current_market_price = 1000  # Simplified - should come from intelligence
        
        if predicted_price > current_market_price * 1.1:
            recommendations.append({
                'type': 'selling_strategy',
                'action': 'Hold for better prices',
                'priority': 'high',
                'description': f'Prices expected to rise by {((predicted_price/current_market_price-1)*100):.1f}%',
                'timeframe': '1-2 weeks'
            })
        elif predicted_price < current_market_price * 0.9:
            recommendations.append({
                'type': 'selling_strategy',
                'action': 'Sell immediately',
                'priority': 'high',
                'description': f'Prices expected to fall by {((1-predicted_price/current_market_price)*100):.1f}%',
                'timeframe': 'Immediate'
            })
        
        # Factor-based recommendations
        supply_impact = factors.get('supply_impact', 0)
        if supply_impact > 0.3:
            recommendations.append({
                'type': 'market_timing',
                'action': 'Consider delayed marketing',
                'priority': 'medium',
                'description': 'Current supply constraints may push prices higher',
                'timeframe': '2-4 weeks'
            })
        
        seasonal_impact = factors.get('seasonal_impact', 0)
        if seasonal_impact < -0.2:
            recommendations.append({
                'type': 'storage_strategy',
                'action': 'Consider storage if feasible',
                'priority': 'medium',
                'description': 'Peak season prices are low, off-season may offer better returns',
                'timeframe': '3-6 months'
            })
        
        # Quality-based recommendations
        quality_grade = market_data.get('quality_grade', 'A')
        if quality_grade != 'A':
            recommendations.append({
                'type': 'quality_improvement',
                'action': 'Improve quality standards',
                'priority': 'medium',
                'description': 'Premium quality can command 10-20% higher prices',
                'timeframe': 'Next season'
            })
        
        # Market-specific recommendations
        if crop in ['tomato', 'onion']:
            recommendations.append({
                'type': 'risk_management',
                'action': 'Diversify marketing channels',
                'priority': 'high',
                'description': 'Use multiple channels to reduce price volatility risk',
                'timeframe': 'Ongoing'
            })
        
        return recommendations[:5]  # Limit to 5 recommendations
    
    async def _analyze_price_trend(self, market_data: Dict[str, Any], prediction: Dict[str, float], intelligence: Dict[str, Any]) -> str:
        """Analyze price trend direction"""
        
        try:
            current_prices = intelligence.get('current_prices', {})
            current_price = current_prices.get('average_market_price', 1000)
            predicted_price = prediction['price']
            
            price_change = (predicted_price - current_price) / current_price
            
            if price_change > 0.05:
                return 'increasing'
            elif price_change < -0.05:
                return 'decreasing'
            else:
                return 'stable'
                
        except:
            return 'stable'
    
    # Additional methods for comprehensive market analysis
    async def analyze_field_economics(self, field_data: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze field-level economics and profitability"""
        # Implementation for field economics analysis
        pass
    
    async def get_market_alerts(self, crop: str, location: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Get market alerts and notifications"""
        # Implementation for market alerts
        pass