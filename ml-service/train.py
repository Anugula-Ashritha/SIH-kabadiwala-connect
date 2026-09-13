#!/usr/bin/env python3
"""
Kabadiwala Connect - E-Waste Classifier Training Script
Trains a MobileNetV3Small transfer learning model on 3 classes:
- Battery
- Mobile
- PCB

Ignores all other classes in the dataset.
Saves model as: models/ewaste_classifier.keras
Saves classes as: models/classes.json
"""

import argparse
import json
import os
import sys
from pathlib import Path
import tensorflow as tf

from training.dataset import TARGET_CLASSES, load_datasets
from training.model import create_model
from training.evaluate import evaluate_model


def parse_args():
    parser = argparse.ArgumentParser(
        description="Train MobileNetV3Small for E-Waste Classification (Battery, Mobile, PCB)"
    )
    parser.add_argument(
        "--data_dir",
        "-d",
        type=str,
        default=os.environ.get("DATASET_DIR", "./modified-dataset"),
        help="Path to the modified-dataset directory (containing train/, val/, test/)",
    )
    parser.add_argument(
        "--epochs",
        "-e",
        type=int,
        default=15,
        help="Maximum training epochs (default: 15)",
    )
    parser.add_argument(
        "--batch_size",
        "-b",
        type=int,
        default=32,
        help="Batch size for training and evaluation (default: 32)",
    )
    parser.add_argument(
        "--img_size",
        type=int,
        default=224,
        help="Image size in pixels (default: 224 for MobileNetV3)",
    )
    parser.add_argument(
        "--lr",
        "--learning_rate",
        type=float,
        default=1e-3,
        help="Initial learning rate for Adam optimizer (default: 0.001)",
    )
    parser.add_argument(
        "--output_dir",
        "-o",
        type=str,
        default="./models",
        help="Directory where trained model and classes.json will be saved (default: ./models)",
    )
    return parser.parse_args()


def main():
    args = parse_args()
    data_dir = Path(args.data_dir).resolve()
    output_dir = Path(args.output_dir).resolve()
    output_dir.mkdir(parents=True, exist_ok=True)

    print("=" * 70)
    print("  KABADIWALA CONNECT - SIH 2026")
    print("  E-Waste Model Training Pipeline (MobileNetV3Small)")
    print("=" * 70)
    print(f"Dataset Path:    {data_dir}")
    print(f"Output Directory:{output_dir}")
    print(f"Target Classes:  {TARGET_CLASSES}")
    print(f"Batch Size:      {args.batch_size}")
    print(f"Image Resolution:{args.img_size}x{args.img_size}")
    print(f"Max Epochs:      {args.epochs}")
    print("=" * 70)

    # 1. Verify Dataset Path
    if not data_dir.exists():
        print(f"\n[ERROR] Dataset directory not found at: {data_dir}")
        print("Please provide the correct path using the --data_dir argument, e.g.:")
        print('  python train.py --data_dir "C:\\Users\\yourname\\modified-dataset"\n')
        sys.exit(1)

    # 2. Load Datasets (Filter ONLY Battery, Mobile, PCB)
    try:
        train_ds, val_ds, test_ds, meta = load_datasets(
            data_dir=str(data_dir),
            classes=TARGET_CLASSES,
            img_size=args.img_size,
            batch_size=args.batch_size,
        )
    except Exception as e:
        print(f"\n[ERROR] Failed to load dataset: {e}")
        sys.exit(1)

    print("\nDataset Summary:")
    print(f"  Training samples:   {meta['train_count']}")
    print(f"  Validation samples: {meta['val_count']}")
    print(f"  Testing samples:    {meta['test_count']}")

    # 3. Build Model Architecture
    print("\nBuilding MobileNetV3Small Transfer Learning Model...")
    model = create_model(
        num_classes=len(TARGET_CLASSES),
        input_shape=(args.img_size, args.img_size, 3),
        learning_rate=args.lr,
        freeze_base=True,
    )
    model.summary(print_fn=lambda x: print(f"  {x}"))

    # 4. Configure Training Callbacks
    model_save_path = output_dir / "ewaste_classifier.keras"
    classes_save_path = output_dir / "classes.json"

    callbacks = [
        # Save best model based on validation loss
        tf.keras.callbacks.ModelCheckpoint(
            filepath=str(model_save_path),
            monitor="val_loss",
            mode="min",
            save_best_only=True,
            verbose=1,
        ),
        # Stop early if model stops improving
        tf.keras.callbacks.EarlyStopping(
            monitor="val_loss",
            patience=5,
            restore_best_weights=True,
            verbose=1,
        ),
        # Decay learning rate when plateaus
        tf.keras.callbacks.ReduceLROnPlateau(
            monitor="val_loss",
            factor=0.5,
            patience=2,
            min_lr=1e-6,
            verbose=1,
        ),
    ]

    # 5. Train the Classifier
    print("\n" + "=" * 60)
    print("  COMMENCING MODEL TRAINING")
    print("=" * 60)

    try:
        history = model.fit(
            train_ds,
            validation_data=val_ds,
            epochs=args.epochs,
            callbacks=callbacks,
            verbose=1,
        )
    except KeyboardInterrupt:
        print("\n[WARNING] Training interrupted by user. Proceeding with evaluation of current model...")

    # 6. Save Class Names and Mapping for Inference
    with open(classes_save_path, "w", encoding="utf-8") as f:
        json.dump(TARGET_CLASSES, f, indent=2)
    print(f"\n[Saved] Class names saved to: {classes_save_path}")

    # Ensure the final/best model is written to models/ewaste_classifier.keras
    if not model_save_path.exists():
        model.save(str(model_save_path))
    print(f"[Saved] Trained model saved to: {model_save_path}")

    # 7. Evaluate on the Test Set
    # Load best checkpointed model for evaluation
    best_model = tf.keras.models.load_model(str(model_save_path))
    eval_results = evaluate_model(
        model=best_model,
        test_ds=test_ds,
        classes=TARGET_CLASSES,
        output_dir=output_dir,
    )

    print("\n" + "=" * 70)
    print("  TRAINING & EVALUATION COMPLETE")
    print("=" * 70)
    print(f"Model saved:   {model_save_path}")
    print(f"Classes saved: {classes_save_path}")
    print(f"Final Test Accuracy: {eval_results['test_accuracy'] * 100:.2f}%")
    print(f"Final Test Loss:     {eval_results['test_loss']:.4f}")
    print("\nYou can now test individual scrap images using:")
    print('  python predict.py --image "path\\to\\test_image.jpg"')
    print("=" * 70)


if __name__ == "__main__":
    main()
