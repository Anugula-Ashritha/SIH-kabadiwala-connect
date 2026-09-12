"""
Evaluation utilities: Test loss, test accuracy, classification report,
and confusion matrix generation for Kabadiwala Connect ML module (PyTorch).
"""

from pathlib import Path
from typing import Dict, List, Optional
import numpy as np
import torch
import torch.nn as nn
from torch.utils.data import DataLoader
from sklearn.metrics import classification_report, confusion_matrix


def evaluate_model(
    model: nn.Module,
    test_loader: DataLoader,
    classes: List[str],
    device: Optional[torch.device] = None,
    criterion: Optional[nn.Module] = None,
    output_dir: Optional[Path] = None,
) -> Dict[str, any]:
    """
    Evaluates the PyTorch model on the test dataset.
    Computes test loss, accuracy, classification report, and confusion matrix.
    Optionally saves evaluation report and confusion matrix plot.
    """
    if device is None:
        device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

    if criterion is None:
        criterion = nn.CrossEntropyLoss()

    model.to(device)
    model.eval()

    print("\n" + "=" * 60)
    print("  EVALUATING MODEL ON TEST SET (PyTorch)")
    print(f"  Device: {device}")
    print("=" * 60)

    running_loss = 0.0
    correct_count = 0
    total_samples = 0

    y_true = []
    y_pred = []

    with torch.no_grad():
        for images, labels in test_loader:
            images = images.to(device)
            labels = labels.to(device)

            outputs = model(images)
            loss = criterion(outputs, labels)

            running_loss += loss.item() * images.size(0)
            _, preds = torch.max(outputs, 1)

            correct_count += torch.sum(preds == labels.data).item()
            total_samples += labels.size(0)

            y_true.extend(labels.cpu().numpy().tolist())
            y_pred.extend(preds.cpu().numpy().tolist())

    test_loss = running_loss / max(total_samples, 1)
    test_accuracy = correct_count / max(total_samples, 1)

    print(f"\n[Test Results]")
    print(f"  Test Loss:     {test_loss:.4f}")
    print(f"  Test Accuracy: {test_accuracy * 100:.2f}%\n")

    # Classification Report
    print("-" * 60)
    print("CLASSIFICATION REPORT (Precision, Recall, F1-Score):")
    print("-" * 60)
    report_str = classification_report(
        y_true, y_pred, target_names=classes, digits=4
    )
    print(report_str)

    # Confusion Matrix
    print("-" * 60)
    print("CONFUSION MATRIX:")
    print("-" * 60)
    cm = confusion_matrix(y_true, y_pred)

    label_hdr = "True / Pred"
    header_col = f"{label_hdr:<14} | " + " | ".join(f"{c:<10}" for c in classes)
    print(header_col)
    print("-" * len(header_col))
    for i, row in enumerate(cm):
        row_str = f"{classes[i]:<14} | " + " | ".join(f"{val:<10}" for val in row)
        print(row_str)
    print("-" * len(header_col))

    # Save artifacts if output_dir provided
    if output_dir:
        output_dir = Path(output_dir)
        output_dir.mkdir(parents=True, exist_ok=True)

        report_file = output_dir / "evaluation_report.txt"
        with open(report_file, "w", encoding="utf-8") as f:
            f.write(f"Test Loss: {test_loss:.4f}\n")
            f.write(f"Test Accuracy: {test_accuracy * 100:.2f}%\n\n")
            f.write("Classification Report:\n")
            f.write(report_str)
            f.write("\nConfusion Matrix:\n")
            f.write(np.array2string(cm))
        print(f"\n[Saved] Text evaluation report: {report_file}")

        try:
            import matplotlib.pyplot as plt
            import seaborn as sns

            plt.figure(figsize=(6, 5))
            sns.heatmap(
                cm,
                annot=True,
                fmt="d",
                cmap="Greens",
                xticklabels=classes,
                yticklabels=classes,
                cbar=False,
            )
            plt.title(f"E-Waste Confusion Matrix (Test Acc: {test_accuracy*100:.1f}%)")
            plt.xlabel("Predicted Class")
            plt.ylabel("True Class")
            plt.tight_layout()

            cm_path = output_dir / "confusion_matrix.png"
            plt.savefig(cm_path, dpi=200)
            plt.close()
            print(f"[Saved] Confusion matrix plot:  {cm_path}")
        except Exception as e:
            print(f"[Note] Could not save graphical plot ({e}), text matrix generated.")

    print("=" * 60 + "\n")

    return {
        "test_loss": test_loss,
        "test_accuracy": test_accuracy,
        "classification_report": report_str,
        "confusion_matrix": cm.tolist(),
    }
