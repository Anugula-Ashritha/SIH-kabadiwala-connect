"""
Evaluation utilities: Test loss, test accuracy, classification report,
and confusion matrix generation for Kabadiwala Connect ML module.
"""

from pathlib import Path
from typing import Dict, List
import numpy as np
import tensorflow as tf
from sklearn.metrics import classification_report, confusion_matrix


def evaluate_model(
    model: tf.keras.Model,
    test_ds: tf.data.Dataset,
    classes: List[str],
    output_dir: Path = None,
) -> Dict[str, any]:
    """
    Evaluates the model on the test dataset.
    Prints test loss, test accuracy, classification report, and confusion matrix.
    Optionally saves confusion matrix plot to output_dir.
    """
    print("\n" + "=" * 60)
    print("  EVALUATING MODEL ON TEST SET")
    print("=" * 60)

    # 1. Compute Test Loss & Accuracy
    results = model.evaluate(test_ds, verbose=1)
    test_loss = float(results[0])
    test_accuracy = float(results[1])

    print(f"\n[Test Results]")
    print(f"  Test Loss:     {test_loss:.4f}")
    print(f"  Test Accuracy: {test_accuracy * 100:.2f}%\n")

    # 2. Collect True Labels and Model Predictions
    y_true = []
    y_pred_probs = []

    for images, labels in test_ds:
        preds = model.predict(images, verbose=0)
        y_pred_probs.extend(preds)
        y_true.extend(labels.numpy())

    y_true = np.array(y_true)
    y_pred = np.argmax(np.array(y_pred_probs), axis=1)

    # 3. Classification Report
    print("-" * 60)
    print("CLASSIFICATION REPORT (Precision, Recall, F1-Score):")
    print("-" * 60)
    report_str = classification_report(
        y_true, y_pred, target_names=classes, digits=4
    )
    print(report_str)

    # 4. Confusion Matrix
    print("-" * 60)
    print("CONFUSION MATRIX:")
    print("-" * 60)
    cm = confusion_matrix(y_true, y_pred)

    # Pretty print ASCII confusion matrix
    header_col = f"{'True \\ Pred':<14} | " + " | ".join(f"{c:<10}" for c in classes)
    print(header_col)
    print("-" * len(header_col))
    for i, row in enumerate(cm):
        row_str = f"{classes[i]:<14} | " + " | ".join(f"{val:<10}" for val in row)
        print(row_str)
    print("-" * len(header_col))

    # 5. Save Confusion Matrix Plot and text report if output_dir provided
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
