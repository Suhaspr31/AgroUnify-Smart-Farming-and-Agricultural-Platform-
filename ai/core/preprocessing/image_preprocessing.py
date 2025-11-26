"""
AgroUnify AI - Crop Disease Detection Preprocessing
Advanced image preprocessing for disease detection model
"""

import cv2
import numpy as np
from PIL import Image, ImageEnhance, ImageFilter
import albumentations as A
from typing import Tuple, Optional, Union
import tensorflow as tf

class CropImagePreprocessor:
    """Advanced preprocessing for crop disease detection"""
    
    def __init__(self, target_size: Tuple[int, int] = (224, 224)):
        self.target_size = target_size
        self.augmentation_pipeline = self._create_augmentation_pipeline()
        self.normalization_params = {
            'mean': [0.485, 0.456, 0.406],
            'std': [0.229, 0.224, 0.225]
        }
    
    def _create_augmentation_pipeline(self) -> A.Compose:
        """Create advanced augmentation pipeline for robust training"""
        return A.Compose([
            # Geometric transformations
            A.RandomRotate90(p=0.3),
            A.Flip(p=0.3),
            A.Transpose(p=0.2),
            A.ShiftScaleRotate(
                shift_limit=0.1,
                scale_limit=0.15,
                rotate_limit=15,
                p=0.5
            ),
            
            # Color and lighting augmentations
            A.OneOf([
                A.RandomBrightnessContrast(brightness_limit=0.2, contrast_limit=0.2),
                A.RandomGamma(gamma_limit=(80, 120)),
                A.CLAHE(clip_limit=2.0, tile_grid_size=(8, 8)),
            ], p=0.5),
            
            A.HueSaturationValue(
                hue_shift_limit=10,
                sat_shift_limit=20,
                val_shift_limit=15,
                p=0.3
            ),
            
            # Noise and blur augmentations
            A.OneOf([
                A.GaussNoise(var_limit=(10.0, 50.0)),
                A.ISONoise(color_shift=(0.01, 0.05), intensity=(0.1, 0.5)),
                A.MultiplicativeNoise(multiplier=(0.9, 1.1), elementwise=True),
            ], p=0.3),
            
            A.OneOf([
                A.MotionBlur(blur_limit=3),
                A.MedianBlur(blur_limit=3),
                A.GaussianBlur(blur_limit=3),
            ], p=0.2),
            
            # Distortion augmentations
            A.OneOf([
                A.OpticalDistortion(distort_limit=0.05, shift_limit=0.05),
                A.GridDistortion(num_steps=5, distort_limit=0.05),
                A.ElasticTransform(alpha=1, sigma=50, alpha_affine=50),
            ], p=0.2),
            
            # Cutout and masking
            A.CoarseDropout(
                max_holes=8,
                max_height=32,
                max_width=32,
                min_holes=1,
                fill_value=0,
                p=0.2
            ),
            
            # Final resize and normalization
            A.Resize(self.target_size[0], self.target_size[1]),
            A.Normalize(
                mean=self.normalization_params['mean'],
                std=self.normalization_params['std']
            )
        ])
    
    def preprocess_for_inference(self, image: Union[np.ndarray, str]) -> np.ndarray:
        """Preprocess image for model inference"""
        
        # Load image if path is provided
        if isinstance(image, str):
            image = cv2.imread(image)
            if image is None:
                raise ValueError(f"Could not load image from {image}")
            image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        
        # Basic preprocessing pipeline for inference
        preprocess_pipeline = A.Compose([
            A.Resize(self.target_size[0], self.target_size[1]),
            A.Normalize(
                mean=self.normalization_params['mean'],
                std=self.normalization_params['std']
            )
        ])
        
        # Apply preprocessing
        processed = preprocess_pipeline(image=image)
        processed_image = processed['image']
        
        # Add batch dimension
        return np.expand_dims(processed_image, axis=0).astype(np.float32)
    
    def preprocess_for_training(self, image: np.ndarray, apply_augmentation: bool = True) -> np.ndarray:
        """Preprocess image for model training with augmentations"""
        
        if apply_augmentation:
            processed = self.augmentation_pipeline(image=image)
        else:
            # Just resize and normalize for validation
            pipeline = A.Compose([
                A.Resize(self.target_size[0], self.target_size[1]),
                A.Normalize(
                    mean=self.normalization_params['mean'],
                    std=self.normalization_params['std']
                )
            ])
            processed = pipeline(image=image)
        
        return processed['image'].astype(np.float32)
    
    def enhance_image_quality(self, image: np.ndarray) -> np.ndarray:
        """Enhance image quality for better disease detection"""
        
        # Convert to PIL for advanced processing
        pil_image = Image.fromarray(image)
        
        # Enhance sharpness
        enhancer = ImageEnhance.Sharpness(pil_image)
        pil_image = enhancer.enhance(1.2)
        
        # Enhance contrast
        enhancer = ImageEnhance.Contrast(pil_image)
        pil_image = enhancer.enhance(1.1)
        
        # Apply unsharp mask
        pil_image = pil_image.filter(ImageFilter.UnsharpMask(radius=1, percent=150, threshold=3))
        
        return np.array(pil_image)
    
    def extract_leaf_regions(self, image: np.ndarray) -> np.ndarray:
        """Extract leaf regions from the image using color segmentation"""
        
        # Convert to HSV for better color segmentation
        hsv = cv2.cvtColor(image, cv2.COLOR_RGB2HSV)
        
        # Define range for green colors (leaves)
        lower_green1 = np.array([40, 40, 40])
        upper_green1 = np.array([80, 255, 255])
        
        lower_green2 = np.array([80, 40, 40])
        upper_green2 = np.array([180, 255, 255])
        
        # Create masks for green regions
        mask1 = cv2.inRange(hsv, lower_green1, upper_green1)
        mask2 = cv2.inRange(hsv, lower_green2, upper_green2)
        mask = cv2.bitwise_or(mask1, mask2)
        
        # Apply morphological operations to clean up the mask
        kernel = np.ones((5, 5), np.uint8)
        mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, kernel)
        mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN, kernel)
        
        # Apply mask to original image
        result = cv2.bitwise_and(image, image, mask=mask)
        
        return result
    
    def detect_and_crop_leaves(self, image: np.ndarray) -> list:
        """Detect individual leaves and crop them"""
        
        # Extract leaf regions
        leaf_mask = self.extract_leaf_regions(image)
        
        # Convert to grayscale for contour detection
        gray = cv2.cvtColor(leaf_mask, cv2.COLOR_RGB2GRAY)
        
        # Find contours
        contours, _ = cv2.findContours(gray, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        # Filter and crop leaves
        leaf_crops = []
        min_area = 1000  # Minimum area for a valid leaf
        
        for contour in contours:
            area = cv2.contourArea(contour)
            if area > min_area:
                # Get bounding rectangle
                x, y, w, h = cv2.boundingRect(contour)
                
                # Add padding
                padding = 20
                x = max(0, x - padding)
                y = max(0, y - padding)
                w = min(image.shape[1] - x, w + 2 * padding)
                h = min(image.shape[0] - y, h + 2 * padding)
                
                # Crop the leaf
                leaf_crop = image[y:y+h, x:x+w]
                
                # Only keep crops that are reasonably sized
                if leaf_crop.shape[0] > 50 and leaf_crop.shape[1] > 50:
                    leaf_crops.append(leaf_crop)
        
        return leaf_crops