# Crop Disease Detection Model Training Guide

This guide explains how to train a machine learning model for crop disease detection using the Offline Crop Doctor system.

## 📋 Prerequisites

1. **Python Environment**: Python 3.8+
2. **Required Packages**:

   ```bash
   pip install tensorflow keras scikit-learn pillow opencv-python numpy pandas matplotlib
   ```

3. **Dataset**: Organized image dataset with disease classes

## 📁 Dataset Structure

Your dataset should be organized as follows:

```
dataset/
├── healthy/
│   ├── image1.jpg
│   ├── image2.jpg
│   └── ...
├── early_blight/
│   ├── image1.jpg
│   ├── image2.jpg
│   └── ...
├── late_blight/
│   ├── image1.jpg
│   ├── image2.jpg
│   └── ...
├── powdery_mildew/
│   ├── image1.jpg
│   ├── image2.jpg
│   └── ...
├── bacterial_spot/
│   ├── image1.jpg
│   ├── image2.jpg
│   └── ...
└── [other_disease_classes]/
    └── ...
```

### Dataset Requirements

- **Minimum images per class**: 100-200 images
- **Image format**: JPG, PNG
- **Image size**: Minimum 224x224 pixels (will be resized)
- **Class balance**: Try to have similar number of images per class
- **Quality**: Clear, well-lit images showing disease symptoms

## 🚀 Training the Model

### Step 1: Prepare Your Dataset

1. Download or collect crop disease images
2. Organize images into class folders as shown above
3. Ensure each class has sufficient images (minimum 100 per class)

### Step 2: Run Training Script

```bash
# Navigate to ai directory
cd ai

# Run training script
python train_crop_disease_model.py --dataset /path/to/your/dataset --epochs 50 --batch-size 32
```

### Training Parameters

- `--dataset, -d`: Path to dataset directory (required)
- `--epochs, -e`: Number of training epochs (default: 50)
- `--batch-size, -b`: Batch size for training (default: 32)
- `--model-path, -m`: Path to save trained model (default: ai/artifacts)

### Example Training Command

```bash
python train_crop_disease_model.py \
  --dataset ../datasets/plant_disease_dataset \
  --epochs 100 \
  --batch-size 16 \
  --model-path ai/artifacts
```

## 📊 Training Process

The training process includes:

1. **Data Loading**: Loads images from class directories
2. **Data Augmentation**: Applies rotations, flips, zooms for better generalization
3. **Model Building**: Uses MobileNetV2 as base with custom classification head
4. **Training**: Trains with early stopping and model checkpointing
5. **Evaluation**: Provides accuracy metrics and classification reports
6. **Model Saving**: Saves trained model and label encoders

## 📈 Expected Results

After training, you should see:

- **Training accuracy**: 90%+ on training data
- **Validation accuracy**: 85%+ on validation data
- **Model files saved**:
  - `crop_disease_model.h5` (trained model)
  - `label_encoders.pkl` (class encoders)

## 🔧 Troubleshooting

### Common Issues

1. **Low Accuracy**:

   - Check dataset quality and quantity
   - Ensure proper class balance
   - Increase training epochs

2. **Memory Errors**:

   - Reduce batch size
   - Use smaller images
   - Add more RAM or use GPU

3. **Class Imbalance**:
   - Ensure similar number of images per class
   - Use data augmentation
   - Consider class weighting

### Improving Model Performance

1. **More Data**: Collect more images per class
2. **Better Quality**: Use clear, well-lit images
3. **Data Augmentation**: Enable more augmentation techniques
4. **Transfer Learning**: Fine-tune more layers of the base model
5. **Ensemble Methods**: Combine multiple models

## 📋 Supported Datasets

The system works with any dataset organized by disease classes. Popular datasets include:

- **PlantVillage Dataset**: Comprehensive collection of crop diseases
- **Custom Farm Data**: Your own collected images
- **Public Datasets**: Kaggle plant disease datasets

## 🎯 Using the Trained Model

Once trained, the model will be automatically loaded by the Offline Crop Doctor system. The system will:

1. **Load the trained model** on startup
2. **Use ML predictions** for disease detection
3. **Fallback to feature analysis** if model fails
4. **Provide accurate results** based on your training data

## 📞 Support

If you encounter issues:

1. Check the dataset structure matches the requirements
2. Ensure all dependencies are installed
3. Verify you have sufficient computational resources
4. Check the training logs for specific error messages

The trained model will significantly improve the accuracy and reliability of the Offline Crop Doctor system! 🚀
