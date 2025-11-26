import numpy as np
import cv2
from PIL import Image
import tensorflow as tf
from typing import Dict, List, Tuple, Optional
import json
import os
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import classification_report, confusion_matrix
import matplotlib.pyplot as plt
from pathlib import Path
# from models.crop_disease_detection.model import AdvancedCropDiseaseModel
# from models.disease_knowledge_base import DiseaseKnowledgeBase, DiseaseInfo
# from utils.image_processing import ImageProcessor  # Commented out due to missing module
# from services.weather_analysis import WeatherAnalysis  # Commented out due to missing module
import requests
from datetime import datetime

class EnhancedCropAnalysis:
    def __init__(self, model_path: str = None):
        # Initialize with ML model capabilities
        self.model_path = Path(model_path or "ai/artifacts")
        self.model_path.mkdir(parents=True, exist_ok=True)

        self.model = None
        self.knowledge_base = MockKnowledgeBase()
        self.image_processor = None
        self.weather_service = None

        # Load disease class mappings
        self.disease_classes = self.load_disease_classes()
        self.crop_classes = self.load_crop_classes()

        # Try to load trained model
        self.load_trained_model()

        # Initialize label encoders
        self.disease_encoder = LabelEncoder()
        self.crop_encoder = LabelEncoder()
    
    def load_trained_model(self):
        """Load pre-trained ML model for disease detection"""
        try:
            model_file = self.model_path / "crop_disease_model.h5"
            if model_file.exists():
                self.model = tf.keras.models.load_model(str(model_file))
                print(f"✅ Loaded trained disease detection model from {model_file}")

                # Load label encoders
                encoder_file = self.model_path / "label_encoders.pkl"
                if encoder_file.exists():
                    import joblib
                    encoders = joblib.load(str(encoder_file))
                    self.disease_encoder = encoders.get('disease', LabelEncoder())
                    self.crop_encoder = encoders.get('crop', LabelEncoder())
                    print("✅ Loaded label encoders")
            else:
                print("⚠️ No trained model found. Using feature-based analysis.")
                self.model = None
        except Exception as e:
            print(f"❌ Error loading model: {e}. Using feature-based analysis.")
            self.model = None
    
    def load_disease_classes(self) -> Dict[int, str]:
        """Load disease class mappings"""
        return {
            0: "Healthy",
            1: "Early Blight", 2: "Late Blight", 3: "Bacterial Spot",
            4: "Leaf Mold", 5: "Septoria Leaf Spot", 6: "Spider Mites",
            7: "Target Spot", 8: "Yellow Leaf Curl Virus", 9: "Mosaic Virus",
            # Add more disease classes...
        }
    
    def load_crop_classes(self) -> Dict[int, str]:
        """Load crop class mappings"""
        return {
            0: "Tomato", 1: "Potato", 2: "Pepper", 3: "Corn",
            4: "Rice", 5: "Wheat", 6: "Cotton", 7: "Soybean",
            # Add more crop classes...
        }
    
    def preprocess_image(self, image_path: str) -> np.ndarray:
        """Enhanced image preprocessing with multiple augmentations"""
        # Load and resize image
        image = cv2.imread(image_path)
        image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        image = cv2.resize(image, (224, 224))

        # Apply basic image enhancements (without image_processor)
        # Enhance contrast using CLAHE
        lab = cv2.cvtColor(image, cv2.COLOR_RGB2LAB)
        clahe = cv2.createCLAHE(clipLimit=3.0, tileGridSize=(8,8))
        lab[:, :, 0] = clahe.apply(lab[:, :, 0])
        image = cv2.cvtColor(lab, cv2.COLOR_LAB2RGB)

        # Basic denoising
        image = cv2.GaussianBlur(image, (3, 3), 0)

        # Normalize
        image = image.astype(np.float32) / 255.0

        return np.expand_dims(image, axis=0)
    
    def predict_disease(self, image_path: str) -> Dict:
        """Advanced disease prediction using ML model or feature analysis"""
        try:
            # Load and preprocess the image
            image = cv2.imread(image_path)
            if image is None:
                return self._get_fallback_prediction()

            # Determine crop type from image
            crop_type = self._identify_crop_from_image(image)

            # Try ML model prediction first
            if self.model is not None:
                try:
                    return self._predict_with_ml_model(image, crop_type)
                except Exception as e:
                    print(f"ML model prediction failed: {e}. Using feature analysis.")

            # Fallback to feature-based analysis
            return self._predict_with_features(image, crop_type)

        except Exception as e:
            print(f"Disease prediction error: {e}")
            return self._get_fallback_prediction()

    def _predict_with_ml_model(self, image: np.ndarray, crop_type: str) -> Dict:
        """Predict disease using trained ML model"""
        # Preprocess image for model
        processed_image = self.preprocess_image_for_model(image)

        # Make prediction
        predictions = self.model.predict(processed_image)[0]

        # Get top predictions
        top_indices = np.argsort(predictions)[-3:][::-1]
        top_3_diseases = []
        for idx in top_indices:
            disease_name = self.disease_encoder.inverse_transform([idx])[0]
            confidence = float(predictions[idx])
            top_3_diseases.append({
                "disease": disease_name,
                "probability": confidence
            })

        # Primary prediction
        primary_idx = np.argmax(predictions)
        primary_disease = self.disease_encoder.inverse_transform([primary_idx])[0]
        confidence = float(predictions[primary_idx])

        # Determine severity based on model confidence
        severity = self._calculate_model_severity(primary_disease, confidence)

        return {
            "disease_name": primary_disease,
            "crop_type": crop_type,
            "confidence": confidence,
            "severity": severity,
            "overall_confidence": confidence,
            "top_3_diseases": top_3_diseases,
            "method": "ml_model"
        }

    def _predict_with_features(self, image: np.ndarray, crop_type: str) -> Dict:
        """Predict disease using feature-based analysis"""
        # Extract disease features
        features = self._extract_disease_features(image)

        # Analyze disease indicators
        disease_analysis = self._analyze_disease_indicators(features)

        # Determine primary disease
        primary_disease = disease_analysis['primary_disease']
        confidence = disease_analysis['confidence']
        severity = disease_analysis['severity']

        # Generate top 3 predictions
        top_3_diseases = disease_analysis['top_predictions']

        return {
            "disease_name": primary_disease,
            "crop_type": crop_type,
            "confidence": confidence,
            "severity": severity,
            "overall_confidence": confidence,
            "top_3_diseases": top_3_diseases,
            "method": "feature_analysis"
        }

    def train_disease_detection_model(self, dataset_path: str, epochs: int = 50, batch_size: int = 32):
        """
        Train disease detection model using dataset

        Args:
            dataset_path: Path to dataset directory with class subdirectories
            epochs: Number of training epochs
            batch_size: Batch size for training
        """
        try:
            print("🚀 Starting disease detection model training...")

            # Load and prepare dataset
            train_data, val_data, self.disease_encoder, self.crop_encoder = self._prepare_dataset(dataset_path)

            # Build model
            self.model = self._build_disease_model(num_classes=len(self.disease_encoder.classes_))

            # Train model
            history = self._train_model(self.model, train_data, val_data, epochs, batch_size)

            # Save model and encoders
            self._save_trained_model()

            # Evaluate model
            self._evaluate_model(val_data)

            print("✅ Disease detection model training completed!")
            return history

        except Exception as e:
            print(f"❌ Training failed: {e}")
            raise

    def _prepare_dataset(self, dataset_path: str):
        """Prepare dataset for training"""
        from tensorflow.keras.preprocessing.image import ImageDataGenerator

        # Data augmentation
        train_datagen = ImageDataGenerator(
            rescale=1./255,
            rotation_range=20,
            width_shift_range=0.2,
            height_shift_range=0.2,
            shear_range=0.2,
            zoom_range=0.2,
            horizontal_flip=True,
            fill_mode='nearest',
            validation_split=0.2
        )

        # Load training data
        train_generator = train_datagen.flow_from_directory(
            dataset_path,
            target_size=(224, 224),
            batch_size=32,
            class_mode='categorical',
            subset='training'
        )

        # Load validation data
        val_generator = train_datagen.flow_from_directory(
            dataset_path,
            target_size=(224, 224),
            batch_size=32,
            class_mode='categorical',
            subset='validation'
        )

        # Create label encoders
        disease_encoder = LabelEncoder()
        disease_encoder.fit(list(train_generator.class_indices.keys()))

        crop_encoder = LabelEncoder()
        # Extract crop types from class names (assuming format: crop_disease)
        crop_types = list(set([cls.split('_')[0] for cls in train_generator.class_indices.keys()]))
        crop_encoder.fit(crop_types)

        return train_generator, val_generator, disease_encoder, crop_encoder

    def _build_disease_model(self, num_classes: int):
        """Build CNN model for disease detection"""
        from tensorflow.keras.applications import MobileNetV2
        from tensorflow.keras.layers import Dense, GlobalAveragePooling2D, Dropout
        from tensorflow.keras.models import Model

        # Use MobileNetV2 as base model
        base_model = MobileNetV2(weights='imagenet', include_top=False, input_shape=(224, 224, 3))

        # Freeze base model layers
        for layer in base_model.layers:
            layer.trainable = False

        # Add custom classification head
        x = base_model.output
        x = GlobalAveragePooling2D()(x)
        x = Dense(1024, activation='relu')(x)
        x = Dropout(0.5)(x)
        x = Dense(512, activation='relu')(x)
        x = Dropout(0.3)(x)
        predictions = Dense(num_classes, activation='softmax')(x)

        model = Model(inputs=base_model.input, outputs=predictions)

        # Compile model
        model.compile(
            optimizer='adam',
            loss='categorical_crossentropy',
            metrics=['accuracy']
        )

        return model

    def _train_model(self, model, train_data, val_data, epochs: int, batch_size: int):
        """Train the model"""
        from tensorflow.keras.callbacks import EarlyStopping, ModelCheckpoint

        # Callbacks
        early_stopping = EarlyStopping(
            monitor='val_accuracy',
            patience=10,
            restore_best_weights=True
        )

        checkpoint = ModelCheckpoint(
            str(self.model_path / 'best_model.h5'),
            monitor='val_accuracy',
            save_best_only=True,
            mode='max'
        )

        # Train model
        history = model.fit(
            train_data,
            epochs=epochs,
            validation_data=val_data,
            callbacks=[early_stopping, checkpoint],
            verbose=1
        )

        return history

    def _save_trained_model(self):
        """Save trained model and encoders"""
        import joblib

        # Save model
        self.model.save(str(self.model_path / 'crop_disease_model.h5'))

        # Save encoders
        encoders = {
            'disease': self.disease_encoder,
            'crop': self.crop_encoder
        }
        joblib.dump(encoders, str(self.model_path / 'label_encoders.pkl'))

        print(f"✅ Model saved to {self.model_path}")

    def _evaluate_model(self, val_data):
        """Evaluate trained model"""
        # Evaluate on validation data
        loss, accuracy = self.model.evaluate(val_data, verbose=0)
        print(".4f")

        # Generate predictions for detailed metrics
        val_data.reset()
        predictions = self.model.predict(val_data)
        y_pred = np.argmax(predictions, axis=1)
        y_true = val_data.classes

        # Classification report
        target_names = list(val_data.class_indices.keys())
        report = classification_report(y_true, y_pred, target_names=target_names)
        print("\n📊 Classification Report:")
        print(report)

        return accuracy

    def preprocess_image_for_model(self, image: np.ndarray) -> np.ndarray:
        """Preprocess image for ML model input"""
        # Resize to model input size
        image = cv2.resize(image, (224, 224))

        # Convert to RGB if needed
        if image.shape[2] == 3:
            image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)

        # Normalize
        image = image.astype(np.float32) / 255.0

        # Add batch dimension
        return np.expand_dims(image, axis=0)

    def _calculate_model_severity(self, disease: str, confidence: float) -> str:
        """Calculate severity level based on model confidence"""
        if disease == "Healthy":
            return "None"

        if confidence > 0.8:
            return "Severe"
        elif confidence > 0.6:
            return "Moderate"
        elif confidence > 0.4:
            return "Mild"
        else:
            return "Very Mild"

    def _extract_disease_features(self, image: np.ndarray) -> Dict:
        """Extract features for disease detection"""
        features = {}

        # Convert to HSV for better disease visibility
        hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)
        lab = cv2.cvtColor(image, cv2.COLOR_BGR2LAB)

        # Color analysis for disease indicators
        features['yellow_pixels'] = np.sum((hsv[:,:,0] >= 25) & (hsv[:,:,0] <= 35))
        features['brown_pixels'] = np.sum((hsv[:,:,0] >= 10) & (hsv[:,:,0] <= 20))
        features['white_pixels'] = np.sum(hsv[:,:,2] > 200)
        features['dark_pixels'] = np.sum(hsv[:,:,2] < 50)

        # Spot detection using thresholding
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        _, thresh = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
        contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

        features['num_spots'] = len(contours)
        features['total_spot_area'] = sum(cv2.contourArea(c) for c in contours)
        features['avg_spot_size'] = features['total_spot_area'] / max(features['num_spots'], 1)

        # Texture analysis
        features['contrast'] = np.std(gray)
        features['homogeneity'] = 1.0 / (1.0 + np.var(gray))

        # Edge analysis
        edges = cv2.Canny(gray, 100, 200)
        features['edge_density'] = np.sum(edges) / (edges.shape[0] * edges.shape[1])

        return features

    def _analyze_disease_indicators(self, features: Dict) -> Dict:
        """Analyze features to determine disease"""
        diseases = {
            'Healthy': 0.0,
            'Early Blight': 0.0,
            'Late Blight': 0.0,
            'Powdery Mildew': 0.0,
            'Bacterial Spot': 0.0,
            'Leaf Curl': 0.0,
            'Mosaic Virus': 0.0
        }

        # Early Blight indicators (brown/yellow spots, irregular shapes)
        if features['brown_pixels'] > 1000 and features['num_spots'] > 5:
            diseases['Early Blight'] = min(0.9, (features['brown_pixels'] / 5000) + (features['num_spots'] / 20))

        # Late Blight indicators (dark wet lesions, rapid spread)
        if features['dark_pixels'] > 2000 and features['contrast'] > 60:
            diseases['Late Blight'] = min(0.95, (features['dark_pixels'] / 10000) + (features['contrast'] / 100))

        # Powdery Mildew indicators (white powdery coating)
        if features['white_pixels'] > 1500 and features['homogeneity'] > 0.8:
            diseases['Powdery Mildew'] = min(0.85, (features['white_pixels'] / 8000) + features['homogeneity'])

        # Bacterial Spot indicators (small dark spots, water-soaked)
        if features['num_spots'] > 10 and features['avg_spot_size'] < 500:
            diseases['Bacterial Spot'] = min(0.8, (features['num_spots'] / 30) + (500 - features['avg_spot_size']) / 500)

        # Leaf Curl indicators (distorted leaves, color changes)
        if features['yellow_pixels'] > 2000 and features['edge_density'] > 0.1:
            diseases['Leaf Curl'] = min(0.75, (features['yellow_pixels'] / 10000) + features['edge_density'])

        # Mosaic Virus indicators (yellow/green mottling)
        if features['yellow_pixels'] > 3000 and features['contrast'] < 40:
            diseases['Mosaic Virus'] = min(0.7, (features['yellow_pixels'] / 15000) + (40 - features['contrast']) / 40)

        # Determine if healthy (low disease indicators)
        max_disease_score = max(diseases.values())
        if max_disease_score < 0.3:
            diseases['Healthy'] = 0.9
        else:
            diseases['Healthy'] = max(0.1, 0.8 - max_disease_score)

        # Get top predictions
        sorted_diseases = sorted(diseases.items(), key=lambda x: x[1], reverse=True)
        top_3 = sorted_diseases[:3]

        # Determine severity based on disease score
        primary_disease, primary_score = top_3[0]
        if primary_disease == 'Healthy':
            severity = 'None'
        elif primary_score > 0.8:
            severity = 'Severe'
        elif primary_score > 0.6:
            severity = 'Moderate'
        elif primary_score > 0.4:
            severity = 'Mild'
        else:
            severity = 'Very Mild'

        return {
            'primary_disease': primary_disease,
            'confidence': primary_score,
            'severity': severity,
            'top_predictions': [
                {'disease': disease, 'probability': score}
                for disease, score in top_3
            ]
        }

    def _identify_crop_from_image(self, image: np.ndarray) -> str:
        """Identify crop type from image characteristics"""
        hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)

        # Color-based crop identification
        avg_hue = np.mean(hsv[:,:,0])
        avg_saturation = np.mean(hsv[:,:,1])
        avg_brightness = np.mean(hsv[:,:,2])

        # Tomato: Reddish, high saturation
        if 0 <= avg_hue <= 10 and avg_saturation > 100:
            return "Tomato"

        # Potato: Brownish, medium saturation
        elif 10 <= avg_hue <= 25 and avg_saturation > 80:
            return "Potato"

        # Corn/Maize: Yellow-green
        elif 25 <= avg_hue <= 45 and avg_brightness > 120:
            return "Corn"

        # Rice: Light green
        elif 45 <= avg_hue <= 75 and avg_brightness > 140:
            return "Rice"

        # Wheat: Pale green
        elif 75 <= avg_hue <= 95 and avg_saturation < 100:
            return "Wheat"

        # Cotton: White/green
        elif avg_brightness > 160:
            return "Cotton"

        # Default to Tomato for unknown
        return "Tomato"

    def _get_fallback_prediction(self) -> Dict:
        """Fallback prediction when analysis fails"""
        return {
            "disease_name": "Unknown",
            "crop_type": "Unknown",
            "confidence": 0.0,
            "severity": "Unknown",
            "overall_confidence": 0.0,
            "top_3_diseases": [
                {"disease": "Unknown", "probability": 0.0},
                {"disease": "Healthy", "probability": 0.0},
                {"disease": "Early Blight", "probability": 0.0}
            ]
        }
    
    def detect_crop_type(self, image: np.ndarray) -> str:
        """Detect crop type from image - can be enhanced with separate model"""
        # For now, return default - can be enhanced with crop classification model
        return "Tomato"
    
    def get_top_predictions(self, probabilities: np.ndarray, top_k: int) -> List[Dict]:
        """Get top-k disease predictions"""
        top_indices = np.argsort(probabilities)[-top_k:][::-1]
        return [
            {
                "disease": self.disease_classes.get(idx, "Unknown"),
                "probability": float(probabilities[idx])
            }
            for idx in top_indices
        ]
    
    def get_comprehensive_analysis(self, image_path: str, location: str = None) -> Dict:
        """Generate comprehensive disease analysis report"""
        # Get disease prediction
        prediction = self.predict_disease(image_path)

        # Get detailed disease information from mock knowledge base
        disease_info = self.knowledge_base.get_disease_info(
            prediction["disease_name"],
            prediction["crop_type"]
        )

        # Get weather data if location provided (mock for now)
        weather_data = None
        if location:
            weather_data = self.get_mock_weather_data(location)

        # Generate comprehensive report
        analysis_report = {
            "detection_results": prediction,
            "disease_information": self.format_disease_info(disease_info) if disease_info else {},
            "treatment_recommendations": self.generate_treatment_plan(disease_info, prediction["severity"]),
            "prevention_strategies": self.get_prevention_strategies(disease_info),
            "pesticide_recommendations": self.get_pesticide_recommendations(disease_info, prediction["severity"]),
            "environmental_analysis": self.analyze_environmental_factors(weather_data, disease_info),
            "economic_impact": self.calculate_economic_impact(disease_info, prediction["severity"]),
            "monitoring_schedule": self.generate_monitoring_schedule(disease_info),
            "organic_alternatives": self.get_organic_treatments(disease_info),
            "resistance_management": self.get_resistance_management_tips(disease_info),
            "timestamp": datetime.now().isoformat()
        }

        return analysis_report

    def get_mock_weather_data(self, location: str) -> Dict:
        """Get mock weather data for demonstration"""
        return {
            "temperature": 25.0,
            "humidity": 65.0,
            "location": location,
            "description": "Partly cloudy"
        }

    def format_disease_info(self, disease_info) -> Dict:
        """Format disease information for display"""
        return {
            "disease_name": disease_info.disease_name,
            "scientific_name": getattr(disease_info, 'scientific_name', ''),
            "crop_type": disease_info.crop_type,
            "symptoms": disease_info.symptoms,
            "causes": disease_info.causes,
            "description": f"This is a {disease_info.severity_level.lower()} severity disease affecting {disease_info.crop_type}.",
            "pathogen_type": self.determine_pathogen_type(disease_info.disease_name)
        }
    
    def generate_treatment_plan(self, disease_info, severity: str) -> Dict:
        """Generate detailed treatment plan based on severity"""
        if not disease_info:
            return {}
        
        base_treatments = disease_info.treatment_methods
        
        # Adjust treatment based on severity
        if severity in ["Severe", "Critical"]:
            treatment_plan = {
                "immediate_actions": [
                    "Remove and destroy infected plant parts immediately",
                    "Apply systemic fungicide/bactericide",
                    "Increase monitoring frequency to daily"
                ],
                "chemical_treatments": disease_info.pesticides[:2],  # Use most effective
                "cultural_practices": [
                    "Improve air circulation",
                    "Reduce humidity around plants",
                    "Adjust irrigation schedule"
                ],
                "followup_schedule": "Apply treatments every 7 days for 3 weeks"
            }
        else:
            treatment_plan = {
                "immediate_actions": [
                    "Remove infected leaves",
                    "Apply preventive treatments"
                ],
                "chemical_treatments": disease_info.pesticides[-1:],  # Use milder options
                "cultural_practices": disease_info.prevention_strategies[:3],
                "followup_schedule": "Monitor weekly and apply treatments as needed"
            }
        
        return treatment_plan
    
    def get_pesticide_recommendations(self, disease_info, severity: str) -> List[Dict]:
        """Get detailed pesticide recommendations"""
        if not disease_info:
            return []
        
        recommendations = []
        for pesticide in disease_info.pesticides:
            recommendation = {
                **pesticide,
                "application_timing": self.get_application_timing(severity),
                "mixing_instructions": f"Mix {pesticide['application_rate']} in clean water",
                "safety_precautions": [
                    "Wear protective clothing",
                    "Apply during calm weather",
                    "Avoid spraying during flowering if bees are present"
                ],
                "cost_estimate": self.estimate_pesticide_cost(pesticide),
                "effectiveness_rating": self.rate_pesticide_effectiveness(pesticide, severity)
            }
            recommendations.append(recommendation)
        
        return sorted(recommendations, key=lambda x: x["effectiveness_rating"], reverse=True)
    
    def get_application_timing(self, severity: str) -> str:
        """Get optimal application timing"""
        timing_map = {
            "Mild": "Apply in early morning or late evening",
            "Moderate": "Apply every 7-10 days, early morning preferred",
            "Severe": "Apply immediately, repeat every 5-7 days",
            "Critical": "Apply immediately and every 3-5 days until controlled"
        }
        return timing_map.get(severity, "Apply as recommended on label")
    
    def estimate_pesticide_cost(self, pesticide: Dict) -> str:
        """Estimate pesticide application cost"""
        # Basic cost estimation - can be enhanced with real market data
        base_costs = {
            "Mancozeb": 150,  # Cost per hectare in INR
            "Azoxystrobin": 300,
            "Copper Hydroxide": 120,
            "Carbendazim": 200
        }
        
        active_ingredient = pesticide.get("active_ingredient", "")
        cost = base_costs.get(active_ingredient, 180)
        return f"₹{cost}-{cost+50} per hectare"
    
    def rate_pesticide_effectiveness(self, pesticide: Dict, severity: str) -> float:
        """Rate pesticide effectiveness based on active ingredient and severity"""
        effectiveness_map = {
            "Mancozeb": {"Mild": 8.5, "Moderate": 9.0, "Severe": 8.0, "Critical": 7.5},
            "Azoxystrobin": {"Mild": 9.0, "Moderate": 9.5, "Severe": 9.0, "Critical": 8.5},
            "Copper Hydroxide": {"Mild": 8.0, "Moderate": 8.5, "Severe": 7.5, "Critical": 7.0}
        }
        
        active_ingredient = pesticide.get("active_ingredient", "")
        return effectiveness_map.get(active_ingredient, {}).get(severity, 7.0)
    
    def analyze_environmental_factors(self, weather_data: Dict, disease_info) -> Dict:
        """Analyze environmental factors affecting disease development"""
        if not weather_data or not disease_info:
            return {}
        
        optimal_conditions = disease_info.environmental_conditions
        current_temp = weather_data.get("temperature", 25)
        current_humidity = weather_data.get("humidity", 60)
        
        risk_factors = {
            "temperature_risk": self.assess_temperature_risk(current_temp, optimal_conditions.get("optimal_temp", "25°C")),
            "humidity_risk": self.assess_humidity_risk(current_humidity, optimal_conditions.get("humidity", "60%")),
            "overall_risk": "Medium",
            "recommendations": [
                "Monitor weather conditions closely",
                "Adjust irrigation based on humidity levels",
                "Consider protective measures during high-risk periods"
            ]
        }
        
        return risk_factors
    
    def assess_temperature_risk(self, current_temp: float, optimal_range: str) -> str:
        """Assess temperature-based disease risk"""
        # Parse optimal range (e.g., "24-29°C")
        try:
            range_parts = optimal_range.replace("°C", "").split("-")
            min_temp = float(range_parts[0])
            max_temp = float(range_parts[1]) if len(range_parts) > 1 else min_temp + 5
            
            if min_temp <= current_temp <= max_temp:
                return "High Risk"
            elif abs(current_temp - min_temp) <= 3 or abs(current_temp - max_temp) <= 3:
                return "Medium Risk"
            else:
                return "Low Risk"
        except:
            return "Medium Risk"
    
    def assess_humidity_risk(self, current_humidity: float, optimal_humidity: str) -> str:
        """Assess humidity-based disease risk"""
        try:
            threshold = float(optimal_humidity.replace("%", "").replace(">", "").replace("<", ""))
            
            if ">" in optimal_humidity and current_humidity > threshold:
                return "High Risk"
            elif current_humidity > 80:
                return "High Risk"
            elif current_humidity > 60:
                return "Medium Risk"
            else:
                return "Low Risk"
        except:
            return "Medium Risk"
    
    def generate_monitoring_schedule(self, disease_info) -> Dict:
        """Generate disease monitoring schedule"""
        if not disease_info:
            return {}
        
        return {
            "daily_monitoring": [
                "Check for new symptoms on leaves",
                "Monitor weather conditions",
                "Inspect treated areas for improvement"
            ],
            "weekly_monitoring": [
                "Assess overall plant health",
                "Check effectiveness of treatments",
                "Scout for disease spread to other plants"
            ],
            "monthly_monitoring": [
                "Evaluate long-term disease management strategy",
                "Plan preventive measures for next season",
                "Document lessons learned"
            ]
        }
    
    def get_organic_treatments(self, disease_info) -> List[Dict]:
        """Get organic treatment alternatives"""
        if not disease_info:
            return []
        
        organic_treatments = []
        for treatment in disease_info.organic_treatments:
            organic_treatments.append({
                "treatment": treatment,
                "preparation": self.get_organic_preparation_method(treatment),
                "application_method": "Spray on affected plants in early morning or evening",
                "frequency": "Every 7-10 days",
                "effectiveness": "Moderate to Good for early-stage infections"
            })
        
        return organic_treatments
    
    def get_organic_preparation_method(self, treatment: str) -> str:
        """Get preparation method for organic treatments"""
        methods = {
            "Neem oil spray": "Mix 5ml neem oil + 2ml liquid soap in 1L water",
            "Baking soda solution": "Mix 5g baking soda in 1L water",
            "Compost tea": "Steep mature compost in water for 24-48 hours, strain",
            "Trichoderma": "Mix as per manufacturer instructions"
        }
        
        for key, method in methods.items():
            if key.lower() in treatment.lower():
                return method
        
        return "Follow package instructions for preparation"
    
    def determine_pathogen_type(self, disease_name: str) -> str:
        """Determine pathogen type from disease name"""
        fungal_diseases = ["blight", "mold", "rust", "mildew", "spot"]
        bacterial_diseases = ["bacterial", "canker", "wilt"]
        viral_diseases = ["virus", "mosaic", "curl"]
        
        disease_lower = disease_name.lower()
        
        if any(fungal in disease_lower for fungal in fungal_diseases):
            return "Fungal"
        elif any(bacterial in disease_lower for bacterial in bacterial_diseases):
            return "Bacterial"
        elif any(viral in disease_lower for viral in viral_diseases):
            return "Viral"
        else:
            return "Unknown"


class MockKnowledgeBase:
    """Mock knowledge base for demonstration purposes"""

    def get_disease_info(self, disease_name: str, crop_type: str):
        """Return mock disease information"""
        if disease_name.lower() == "healthy":
            return MockDiseaseInfo(
                disease_name="Healthy",
                crop_type=crop_type,
                symptoms=["No visible symptoms", "Normal growth", "Healthy green leaves"],
                causes=["No disease present"],
                treatment_methods=["No treatment needed", "Continue good farming practices"],
                pesticides=[],
                prevention_strategies=["Maintain proper irrigation", "Ensure good soil nutrition", "Regular monitoring"],
                organic_treatments=["No treatment needed"],
                severity_level="None",
                environmental_conditions={"optimal_temp": "20-30°C", "humidity": "40-70%"}
            )
        else:
            # Return mock info for other diseases
            return MockDiseaseInfo(
                disease_name=disease_name,
                crop_type=crop_type,
                symptoms=["Mock symptoms for " + disease_name],
                causes=["Mock causes"],
                treatment_methods=["Mock treatment"],
                pesticides=[{"name": "Mock Pesticide", "active_ingredient": "Mock", "application_rate": "Mock rate"}],
                prevention_strategies=["Mock prevention"],
                organic_treatments=["Mock organic treatment"],
                severity_level="Moderate",
                environmental_conditions={"optimal_temp": "25°C", "humidity": "60%"}
            )


class MockDiseaseInfo:
    """Mock disease info class"""
    def __init__(self, disease_name, crop_type, symptoms, causes, treatment_methods,
                 pesticides, prevention_strategies, organic_treatments, severity_level, environmental_conditions):
        self.disease_name = disease_name
        self.crop_type = crop_type
        self.symptoms = symptoms
        self.causes = causes
        self.treatment_methods = treatment_methods
        self.pesticides = pesticides
        self.prevention_strategies = prevention_strategies
        self.organic_treatments = organic_treatments
        self.severity_level = severity_level
        self.environmental_conditions = environmental_conditions
