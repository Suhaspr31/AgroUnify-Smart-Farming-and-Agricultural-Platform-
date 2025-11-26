import tensorflow as tf
from keras.applications import EfficientNetB4, ResNet50, DenseNet121
from keras.layers import GlobalAveragePooling2D, Dense, Dropout, Concatenate
from keras.models import Model
import numpy as np

class AdvancedCropDiseaseModel:
    def __init__(self, num_classes=50):
        self.num_classes = num_classes
        self.input_shape = (224, 224, 3)
        self.ensemble_model = None
        self.build_ensemble_model()
    
    def build_ensemble_model(self):
        """Build ensemble model with EfficientNet, ResNet50, and DenseNet121"""
        
        # Input layer
        input_layer = tf.keras.Input(shape=self.input_shape)
        
        # EfficientNetB4 branch
        efficientnet = EfficientNetB4(
            weights='imagenet',
            include_top=False,
            input_tensor=input_layer
        )
        efficientnet.trainable = False  # Freeze initially
        x1 = GlobalAveragePooling2D()(efficientnet.output)
        x1 = Dense(512, activation='relu')(x1)
        x1 = Dropout(0.3)(x1)
        
        # ResNet50 branch
        resnet = ResNet50(
            weights='imagenet',
            include_top=False,
            input_tensor=input_layer
        )
        resnet.trainable = False
        x2 = GlobalAveragePooling2D()(resnet.output)
        x2 = Dense(512, activation='relu')(x2)
        x2 = Dropout(0.3)(x2)
        
        # DenseNet121 branch
        densenet = DenseNet121(
            weights='imagenet',
            include_top=False,
            input_tensor=input_layer
        )
        densenet.trainable = False
        x3 = GlobalAveragePooling2D()(densenet.output)
        x3 = Dense(512, activation='relu')(x3)
        x3 = Dropout(0.3)(x3)
        
        # Ensemble fusion
        ensemble_features = Concatenate()([x1, x2, x3])
        ensemble_features = Dense(1024, activation='relu')(ensemble_features)
        ensemble_features = Dropout(0.4)(ensemble_features)
        ensemble_features = Dense(512, activation='relu')(ensemble_features)
        ensemble_features = Dropout(0.3)(ensemble_features)
        
        # Output layers
        disease_output = Dense(self.num_classes, activation='softmax', name='disease')(ensemble_features)
        severity_output = Dense(4, activation='softmax', name='severity')(ensemble_features)
        confidence_output = Dense(1, activation='sigmoid', name='confidence')(ensemble_features)
        
        self.ensemble_model = Model(
            inputs=input_layer,
            outputs={
                'disease': disease_output,
                'severity': severity_output,
                'confidence': confidence_output
            }
        )
        
        # Compile with multiple losses
        self.ensemble_model.compile(
            optimizer=tf.keras.optimizers.Adam(learning_rate=0.001),
            loss={
                'disease': 'categorical_crossentropy',
                'severity': 'categorical_crossentropy',
                'confidence': 'binary_crossentropy'
            },
            loss_weights={'disease': 1.0, 'severity': 0.5, 'confidence': 0.3},
            metrics=['accuracy']
        )
    
    def fine_tune_model(self):
        """Enable fine-tuning for better accuracy"""
        # Unfreeze last few layers of each backbone
        for layer in self.ensemble_model.layers:
            if hasattr(layer, 'layers'):
                for sublayer in layer.layers[-10:]:
                    sublayer.trainable = True
        
        # Lower learning rate for fine-tuning
        self.ensemble_model.compile(
            optimizer=tf.keras.optimizers.Adam(learning_rate=0.0001),
            loss={
                'disease': 'categorical_crossentropy',
                'severity': 'categorical_crossentropy',
                'confidence': 'binary_crossentropy'
            },
            loss_weights={'disease': 1.0, 'severity': 0.5, 'confidence': 0.3},
            metrics=['accuracy']
        )
