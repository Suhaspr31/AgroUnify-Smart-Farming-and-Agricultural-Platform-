#!/usr/bin/env python3
"""
Crop Disease Detection Model Training Script
Trains a CNN model for crop disease detection using image datasets
"""

import os
import sys
import argparse
from pathlib import Path

# Add current directory to path
sys.path.append('.')

from services.crop_analysis import EnhancedCropAnalysis

def main():
    parser = argparse.ArgumentParser(description='Train crop disease detection model')
    parser.add_argument('--dataset', '-d', required=True,
                       help='Path to dataset directory (with class subdirectories)')
    parser.add_argument('--epochs', '-e', type=int, default=50,
                       help='Number of training epochs (default: 50)')
    parser.add_argument('--batch-size', '-b', type=int, default=32,
                       help='Batch size for training (default: 32)')
    parser.add_argument('--model-path', '-m', default='ai/artifacts',
                       help='Path to save trained model (default: ai/artifacts)')

    args = parser.parse_args()

    # Validate dataset path
    if not os.path.exists(args.dataset):
        print(f"❌ Dataset path does not exist: {args.dataset}")
        return

    if not os.path.isdir(args.dataset):
        print(f"❌ Dataset path is not a directory: {args.dataset}")
        return

    # Check if dataset has class subdirectories
    subdirs = [d for d in os.listdir(args.dataset) if os.path.isdir(os.path.join(args.dataset, d))]
    if len(subdirs) < 2:
        print(f"❌ Dataset should have at least 2 class subdirectories. Found: {len(subdirs)}")
        print(f"   Subdirectories: {subdirs}")
        return

    print("🚀 Starting Crop Disease Detection Model Training")
    print(f"📁 Dataset: {args.dataset}")
    print(f"🏷️ Classes found: {len(subdirs)}")
    print(f"📊 Classes: {', '.join(subdirs)}")
    print(f"🎯 Epochs: {args.epochs}")
    print(f"📦 Batch size: {args.batch_size}")
    print(f"💾 Model save path: {args.model_path}")
    print("-" * 50)

    try:
        # Initialize crop analysis service
        crop_analyzer = EnhancedCropAnalysis(model_path=args.model_path)

        # Train the model
        history = crop_analyzer.train_disease_detection_model(
            dataset_path=args.dataset,
            epochs=args.epochs,
            batch_size=args.batch_size
        )

        print("\n✅ Training completed successfully!")
        print(f"📊 Final validation accuracy: {history.history['val_accuracy'][-1]:.4f}")
        print(f"📁 Model saved to: {args.model_path}")

    except Exception as e:
        print(f"❌ Training failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()