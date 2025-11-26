"""
AgroUnify AI - Model Loader Utility
Efficient model loading and management with caching
"""

import os
import asyncio
import pickle
import joblib
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras.models import load_model
import numpy as np
from typing import Dict, Any, Optional
from loguru import logger
import time
from concurrent.futures import ThreadPoolExecutor
import threading

class ModelManager:
    """Efficient model loading and management system"""
    
    def __init__(self):
        self.loaded_models = {}
        self.model_metadata = {}
        self.loading_locks = {}
        self.executor = ThreadPoolExecutor(max_workers=2)
        self.performance_stats = {}
        
        # Model paths
        self.model_paths = {
            'crop_disease_detection': 'models/crop_disease_detection/model.h5',
            'yield_prediction': 'models/yield_prediction/model.pkl',
            'price_prediction': 'models/price_prediction/model.pkl'
        }
        
        logger.info("✅ ModelManager initialized")
    
    async def load_all_models(self):
        """Load all models asynchronously"""
        
        tasks = []
        for model_name in self.model_paths.keys():
            task = self.get_model(model_name)
            tasks.append(task)
        
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        loaded_count = 0
        for i, result in enumerate(results):
            model_name = list(self.model_paths.keys())[i]
            if not isinstance(result, Exception):
                loaded_count += 1
                logger.info(f"✅ Model loaded: {model_name}")
            else:
                logger.error(f"❌ Failed to load model {model_name}: {result}")
        
        logger.info(f"📊 Loaded {loaded_count}/{len(self.model_paths)} models successfully")
    
    async def get_model(self, model_name: str) -> Any:
        """Get model with lazy loading and caching"""
        
        if model_name in self.loaded_models:
            return self.loaded_models[model_name]
        
        # Use locks to prevent concurrent loading of the same model
        if model_name not in self.loading_locks:
            self.loading_locks[model_name] = threading.Lock()
        
        with self.loading_locks[model_name]:
            # Double-check after acquiring lock
            if model_name in self.loaded_models:
                return self.loaded_models[model_name]
            
            # Load the model
            model = await self._load_model(model_name)
            
            if model is not None:
                self.loaded_models[model_name] = model
                self.performance_stats[model_name] = {
                    'load_time': time.time(),
                    'inference_count': 0,
                    'total_inference_time': 0,
                    'avg_inference_time': 0
                }
            
            return model
    
    async def _load_model(self, model_name: str) -> Optional[Any]:
        """Load individual model"""
        
        if model_name not in self.model_paths:
            logger.error(f"Unknown model: {model_name}")
            return None
        
        model_path = self.model_paths[model_name]
        
        if not os.path.exists(model_path):
            logger.warning(f"Model file not found: {model_path}")
            # Return mock model for development
            return self._create_mock_model(model_name)
        
        try:
            start_time = time.time()
            
            if model_name == 'crop_disease_detection':
                # Load TensorFlow/Keras model
                loop = asyncio.get_event_loop()
                model = await loop.run_in_executor(
                    self.executor,
                    self._load_keras_model,
                    model_path
                )
            else:
                # Load scikit-learn/joblib model
                loop = asyncio.get_event_loop()
                model = await loop.run_in_executor(
                    self.executor,
                    joblib.load,
                    model_path
                )
            
            load_time = time.time() - start_time
            
            # Store metadata
            self.model_metadata[model_name] = {
                'path': model_path,
                'load_time': load_time,
                'loaded_at': time.time(),
                'model_type': type(model).__name__
            }
            
            logger.info(f"Model {model_name} loaded in {load_time:.3f}s")
            return model
            
        except Exception as e:
            logger.error(f"Failed to load model {model_name}: {e}")
            # Return mock model for development
            return self._create_mock_model(model_name)
    
    def _load_keras_model(self, model_path: str) -> tf.keras.Model:
        """Load Keras model in thread executor"""
        return load_model(model_path, compile=False)
    
    def _create_mock_model(self, model_name: str) -> Any:
        """Create mock model for development/testing"""
        
        class MockModel:
            def __init__(self, model_name):
                self.model_name = model_name
                self.is_mock = True
            
            def predict(self, X):
                if self.model_name == 'crop_disease_detection':
                    # Return mock disease predictions
                    batch_size = X.shape[0] if hasattr(X, 'shape') else 1
                    num_classes = 10  # Assuming 10 disease classes
                    predictions = np.random.rand(batch_size, num_classes)
                    predictions = predictions / predictions.sum(axis=1, keepdims=True)  # Normalize
                    return predictions
                
                elif self.model_name == 'yield_prediction':
                    # Return mock yield prediction
                    if hasattr(X, 'shape'):
                        return np.random.uniform(20, 50, X.shape[0])  # Yield in quintals
                    else:
                        return np.random.uniform(20, 50)
                
                elif self.model_name == 'price_prediction':
                    # Return mock price prediction
                    if hasattr(X, 'shape'):
                        return np.random.uniform(1000, 3000, X.shape[0])  # Price in INR
                    else:
                        return np.random.uniform(1000, 3000)
                
                return np.array([0.5])
            
            def predict_proba(self, X):
                # For models that support probability prediction
                return self.predict(X)
        
        logger.info(f"Created mock model for {model_name}")
        return MockModel(model_name)
    
    async def predict_with_stats(self, model_name: str, X: Any) -> Any:
        """Make prediction and track performance stats"""
        
        model = await self.get_model(model_name)
        if model is None:
            raise ValueError(f"Model {model_name} not available")
        
        start_time = time.time()
        
        # Make prediction
        prediction = model.predict(X)
        
        # Update stats
        inference_time = time.time() - start_time
        if model_name in self.performance_stats:
            stats = self.performance_stats[model_name]
            stats['inference_count'] += 1
            stats['total_inference_time'] += inference_time
            stats['avg_inference_time'] = stats['total_inference_time'] / stats['inference_count']
        
        return prediction
    
    async def get_model_status(self) -> Dict[str, Any]:
        """Get status of all models"""
        
        status = {}
        
        for model_name in self.model_paths.keys():
            is_loaded = model_name in self.loaded_models
            metadata = self.model_metadata.get(model_name, {})
            perf_stats = self.performance_stats.get(model_name, {})
            
            status[model_name] = {
                'loaded': is_loaded,
                'metadata': metadata,
                'performance': perf_stats,
                'is_mock': getattr(self.loaded_models.get(model_name), 'is_mock', False)
            }
        
        return status
    
    async def get_performance_stats(self) -> Dict[str, Any]:
        """Get detailed performance statistics"""
        
        return {
            'models_loaded': len(self.loaded_models),
            'total_models': len(self.model_paths),
            'individual_stats': self.performance_stats.copy()
        }
    
    def unload_model(self, model_name: str):
        """Unload model to free memory"""
        
        if model_name in self.loaded_models:
            del self.loaded_models[model_name]
            logger.info(f"Model {model_name} unloaded")
        
        if model_name in self.model_metadata:
            del self.model_metadata[model_name]
        
        if model_name in self.performance_stats:
            del self.performance_stats[model_name]
    
    def reload_model(self, model_name: str):
        """Reload a specific model"""
        
        self.unload_model(model_name)
        return self.get_model(model_name)
    
    async def warm_up_models(self):
        """Warm up all models with dummy data"""
        
        dummy_data = {
            'crop_disease_detection': np.random.rand(1, 224, 224, 3).astype(np.float32),
            'yield_prediction': np.random.rand(1, 50).astype(np.float32),
            'price_prediction': np.random.rand(1, 30).astype(np.float32)
        }
        
        for model_name, dummy_input in dummy_data.items():
            try:
                await self.predict_with_stats(model_name, dummy_input)
                logger.info(f"✅ Model {model_name} warmed up")
            except Exception as e:
                logger.warning(f"⚠️ Failed to warm up {model_name}: {e}")