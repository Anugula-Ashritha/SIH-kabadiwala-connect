#!/usr/bin/env python3
"""
Kabadiwala Connect - E-Waste Classifier Training Script (PyTorch)
Trains a MobileNetV3Small transfer learning model on 3 classes:
- Battery
- PCB
- Mobile

Ignores all other classes in the dataset.
Saves model as: models/ewaste_classifier.pth
Saves classes as: models/classes.json
"""

import argparse
import json
import os
import sys
import time
from pathlib import Path
import torch
import torch.nn as nn

from training.dataset import TARGET_CLASSES, load_datasets
from training.model import create_model
from training.evaluate import evaluate_model


def resolve_default_data_dir() -> str:
    """Finds the existing modified-dataset directory, checking common relative paths."""
    env_path = os.environ.get("DATASET_DIR")
    if env_path and Path(env_path).exists():
        return env_path
    
    # Check parent directory (e.g. ../modified-dataset/)
    parent_dir = Path(__file__).resolve().parent.parent / "modified-dataset"
    if parent_dir.is_dir():
        return str(parent_dir)

    # Check local directory (e.g. ./modified-dataset/)
    local_dir = Path(__file__).resolve().parent / "modified-dataset"
    if local_dir.is_dir():
        return str(local_dir)

    # Default fallback
    return "../modified-dataset"


def parse_args():
    parser = argparse.ArgumentParser(
        description="Train MobileNetV3Small for E-Waste Classification in PyTorch (Battery, PCB, Mobile)"
    )
    parser.add_argument(
        "--data_dir",
        "-d",
        type=str,
        default=resolve_default_data_dir(),
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
        "--patience",
        type=int,
        default=5,
        help="Early stopping patience in epochs (default: 5)",
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

    # Determine execution hardware (GPU if CUDA is available, else CPU)
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

    print("=" * 70)
    print("  KABADIWALA CONNECT - SIH 2026")
    print("  E-Waste Model Training Pipeline (PyTorch MobileNetV3Small)")
    print("=" * 70)
    print(f"Device:          {device} ({torch.cuda.get_device_name(0) if torch.cuda.is_available() else 'CPU Mode'})")
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
        print('  python train.py --data_dir "../modified-dataset"')
        print('  or on Windows: python train.py --data_dir "C:\\path\\to\\modified-dataset"\n')
        sys.exit(1)

    # 2. Load Datasets (Filter ONLY Battery, PCB, Mobile)
    try:
        train_loader, val_loader, test_loader, meta = load_datasets(
            data_dir=str(data_dir),
            classes=TARGET_CLASSES,
            img_size=args.img_size,
            batch_size=args.batch_size,
            num_workers=0,  # Safe default on Windows
        )
    except Exception as e:
        print(f"\n[ERROR] Failed to load dataset: {e}")
        sys.exit(1)

    print("\nDataset Summary:")
    print(f"  Training samples:   {meta['train_count']}")
    print(f"  Validation samples: {meta['val_count']}")
    print(f"  Testing samples:    {meta['test_count']}")

    # 3. Build Model Architecture
    print("\nInitializing MobileNetV3Small Pretrained Transfer Learning Model...")
    model = create_model(
        num_classes=len(TARGET_CLASSES),
        freeze_base=True,
        pretrained=True,
    )
    model.to(device)

    total_params = sum(p.numel() for p in model.parameters())
    trainable_params = sum(p.numel() for p in model.parameters() if p.requires_grad)
    print(f"  Total Parameters:     {total_params:,}")
    print(f"  Trainable Parameters: {trainable_params:,} (classifier head)")

    # 4. Loss, Optimizer and Scheduler
    criterion = nn.CrossEntropyLoss()
    optimizer = torch.optim.Adam(
        filter(lambda p: p.requires_grad, model.parameters()),
        lr=args.lr,
    )
    scheduler = torch.optim.lr_scheduler.ReduceLROnPlateau(
        optimizer,
        mode="min",
        factor=0.5,
        patience=2,
        min_lr=1e-6,
    )

    # Checkpoint file paths
    model_save_path = output_dir / "ewaste_classifier.pth"
    classes_save_path = output_dir / "classes.json"

    # 5. Training Loop with Early Stopping & Validation Checkpointing
    print("\n" + "=" * 60)
    print("  COMMENCING PYTORCH MODEL TRAINING")
    print("=" * 60)

    best_val_loss = float("inf")
    best_val_acc = 0.0
    patience_counter = 0

    try:
        for epoch in range(1, args.epochs + 1):
            epoch_start = time.time()

            # --- Training Phase ---
            model.train()
            train_loss = 0.0
            train_correct = 0
            train_total = 0

            for images, labels in train_loader:
                images = images.to(device)
                labels = labels.to(device)

                optimizer.zero_grad()
                outputs = model(images)
                loss = criterion(outputs, labels)
                loss.backward()
                optimizer.step()

                train_loss += loss.item() * images.size(0)
                _, preds = torch.max(outputs, 1)
                train_correct += torch.sum(preds == labels.data).item()
                train_total += labels.size(0)

            epoch_train_loss = train_loss / max(train_total, 1)
            epoch_train_acc = train_correct / max(train_total, 1)

            # --- Validation Phase ---
            model.eval()
            val_loss = 0.0
            val_correct = 0
            val_total = 0

            with torch.no_grad():
                for images, labels in val_loader:
                    images = images.to(device)
                    labels = labels.to(device)

                    outputs = model(images)
                    loss = criterion(outputs, labels)

                    val_loss += loss.item() * images.size(0)
                    _, preds = torch.max(outputs, 1)
                    val_correct += torch.sum(preds == labels.data).item()
                    val_total += labels.size(0)

            epoch_val_loss = val_loss / max(val_total, 1)
            epoch_val_acc = val_correct / max(val_total, 1)
            elapsed = time.time() - epoch_start

            # Step learning rate scheduler
            scheduler.step(epoch_val_loss)
            current_lr = optimizer.param_groups[0]["lr"]

            # Status log
            print(
                f"Epoch [{epoch:02d}/{args.epochs:02d}] ({elapsed:.1f}s) | "
                f"Train Loss: {epoch_train_loss:.4f} Acc: {epoch_train_acc*100:5.1f}% | "
                f"Val Loss: {epoch_val_loss:.4f} Acc: {epoch_val_acc*100:5.1f}% | "
                f"LR: {current_lr:.6f}"
            )

            # Checkpoint best model based on validation loss
            if epoch_val_loss < best_val_loss:
                best_val_loss = epoch_val_loss
                best_val_acc = epoch_val_acc
                patience_counter = 0

                # Save checkpoint with model weights and class labels
                checkpoint = {
                    "epoch": epoch,
                    "state_dict": model.state_dict(),
                    "val_loss": best_val_loss,
                    "val_acc": best_val_acc,
                    "classes": TARGET_CLASSES,
                    "img_size": args.img_size,
                }
                torch.save(checkpoint, str(model_save_path))
                print(f"  --> Checkpoint saved (val_loss improved to {best_val_loss:.4f})")
            else:
                patience_counter += 1
                if patience_counter >= args.patience:
                    print(f"\n[Early Stopping] No improvement for {args.patience} epochs. Stopping training.")
                    break

    except KeyboardInterrupt:
        print("\n[WARNING] Training interrupted by user. Proceeding with evaluation...")

    # 6. Save Classes JSON mapping
    with open(classes_save_path, "w", encoding="utf-8") as f:
        json.dump(TARGET_CLASSES, f, indent=2)
    print(f"\n[Saved] Class names saved to: {classes_save_path}")

    # Ensure a model file exists
    if not model_save_path.exists():
        torch.save(
            {
                "state_dict": model.state_dict(),
                "classes": TARGET_CLASSES,
                "img_size": args.img_size,
            },
            str(model_save_path),
        )
    print(f"[Saved] Trained PyTorch weights saved to: {model_save_path}")

    # 7. Evaluate Best Checkpoint on Test Set
    print("\nLoading best model checkpoint for evaluation on test set...")
    best_checkpoint = torch.load(str(model_save_path), map_location=device)
    model.load_state_dict(best_checkpoint["state_dict"])

    eval_results = evaluate_model(
        model=model,
        test_loader=test_loader,
        classes=TARGET_CLASSES,
        device=device,
        criterion=criterion,
        output_dir=output_dir,
    )

    print("\n" + "=" * 70)
    print("  TRAINING & EVALUATION COMPLETE")
    print("=" * 70)
    print(f"PyTorch model saved: {model_save_path}")
    print(f"Classes saved:       {classes_save_path}")
    print(f"Final Test Accuracy: {eval_results['test_accuracy'] * 100:.2f}%")
    print(f"Final Test Loss:     {eval_results['test_loss']:.4f}")
    print("\nYou can now test individual scrap images using:")
    print('  python predict.py --image "path\\to\\test_image.jpg"')
    print("=" * 70)


if __name__ == "__main__":
    main()
