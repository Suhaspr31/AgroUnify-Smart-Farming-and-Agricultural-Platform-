import cv2
import numpy as np
from PIL import Image, ImageEnhance
import tensorflow as tf
from typing import Tuple, List

class ImageProcessor:
    def __init__(self):
        self.target_size = (224, 224)
    
    def enhance_contrast(self, image: np.ndarray) -> np.ndarray:
        """Enhance image contrast using CLAHE"""
        lab = cv2.cvtColor(image, cv2.COLOR_RGB2LAB)
        l, a, b = cv2.split(lab)
        
        # Apply CLAHE to L channel
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
        l = clahe.apply(l)
        
        # Merge channels
        enhanced = cv2.merge([l, a, b])
        enhanced = cv2.cvtColor(enhanced, cv2.COLOR_LAB2RGB)
        
        return enhanced
    
    def denoise_image(self, image: np.ndarray) -> np.ndarray:
        """Remove noise from image"""
        return cv2.bilateralFilter(image, 9, 75, 75)
    
    def segment_leaf(self, image: np.ndarray) -> np.ndarray:
        """Segment leaf area from background"""
        # Convert to HSV for better segmentation
        hsv = cv2.cvtColor(image, cv2.COLOR_RGB2HSV)
        
        # Define range for green colors
        lower_green = np.array([25, 40, 40])
        upper_green = np.array([85, 255, 255])
        
        # Create mask
        mask = cv2.inRange(hsv, lower_green, upper_green)
        
        # Apply morphological operations
        kernel = np.ones((5, 5), np.uint8)
        mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, kernel)
        mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN, kernel)
        
        # Apply mask to original image
        result = cv2.bitwise_and(image, image, mask=mask)
        
        return result
    
    def extract_disease_regions(self, image: np.ndarray) -> List[np.ndarray]:
        """Extract potential disease regions from leaf"""
        # Convert to different color spaces for analysis
        lab = cv2.cvtColor(image, cv2.COLOR_RGB2LAB)
        hsv = cv2.cvtColor(image, cv2.COLOR_RGB2HSV)
        
        # Detect brown/yellow spots (common disease symptoms)
        lower_brown = np.array([5, 50, 50])
        upper_brown = np.array([25, 255, 255])
        brown_mask = cv2.inRange(hsv, lower_brown, upper_brown)
        
        # Find contours
        contours, _ = cv2.findContours(brown_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        disease_regions = []
        for contour in contours:
            if cv2.contourArea(contour) > 100:  # Filter small noise
                x, y, w, h = cv2.boundingRect(contour)
                region = image[y:y+h, x:x+w]
                disease_regions.append(region)
        
        return disease_regions
    
    def calculate_disease_severity(self, image: np.ndarray) -> float:
        """Calculate disease severity percentage"""
        # Segment healthy vs diseased areas
        hsv = cv2.cvtColor(image, cv2.COLOR_RGB2HSV)
        
        # Healthy green area
        lower_green = np.array([35, 40, 40])
        upper_green = np.array([85, 255, 255])
        healthy_mask = cv2.inRange(hsv, lower_green, upper_green)
        
        # Diseased area (brown, yellow, black spots)
        lower_disease = np.array([0, 0, 0])
        upper_disease = np.array([30, 255, 200])
        disease_mask = cv2.inRange(hsv, lower_disease, upper_disease)
        
        healthy_pixels = np.sum(healthy_mask > 0)
        disease_pixels = np.sum(disease_mask > 0)
        total_pixels = healthy_pixels + disease_pixels
        
        if total_pixels == 0:
            return 0.0
        
        severity = (disease_pixels / total_pixels) * 100
        return min(severity, 100.0)
