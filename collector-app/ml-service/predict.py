#!/usr/bin/env python3
"""
Kabadiwala Connect - E-Waste Inference Predictor Script (PyTorch)
Takes an image path as input, performs inference using the trained
PyTorch MobileNetV3Small model, and prints:
    Predicted material: <Class>
    Confidence: <Percentage>%
"""

import argparse
import os
import sys
from pathlib import Path

# Add current directory to path to enable local package imports
sys.path.insert(0, str(Path(__file__).parent.resolve()))

from inference.predictor import EwastePredictor


def parse_args():
    parser = argparse.ArgumentParser(
        description="Run E-Waste Image Inference with PyTorch MobileNetV3Small (Battery, PCB, Mobile)"
    )
    parser.add_argument(
        "--image",
        "-i",
        dest="image_path",
        type=str,
        required=True,
        help="Path to the scrap e-waste image file (.jpg, .jpeg, .png, etc.)",
    )
    parser.add_argument(
        "--model",
        "-m",
        dest="model_path",
        type=str,
        default="./models/ewaste_classifier.pth",
        help="Path to the trained .pth model (default: ./models/ewaste_classifier.pth)",
    )
    parser.add_argument(
        "--classes",
        "-c",
        dest="classes_path",
        type=str,
        default="./models/classes.json",
        help="Path to classes.json file (default: ./models/classes.json)",
    )
    parser.add_argument(
        "--device",
        type=str,
        default=None,
        help="Device to run inference on: 'cpu' or 'cuda' (default: auto-detect)",
    )
    parser.add_argument(
        "--verbose",
        "-v",
        action="store_true",
        help="Display full probability breakdown across all 3 classes",
    )
    return parser.parse_args()


def main():
    args = parse_args()
    img_path = Path(args.image_path).resolve()

    if not img_path.exists():
        print(f"[ERROR] Image file does not exist: {img_path}")
        print("Tip: Double-check your path and use quotes, e.g.:")
        print('  python predict.py --image "C:\\path\\to\\scrap.jpg"')
        print('  or: python predict.py --image "../modified-dataset/test/PCB/sample.jpg"')
        sys.exit(1)

    try:
        predictor = EwastePredictor(
            model_path=args.model_path,
            classes_path=args.classes_path,
            device=args.device,
        )
    except FileNotFoundError as e:
        print(f"[ERROR] {e}")
        sys.exit(1)
    except Exception as e:
        print(f"[ERROR] Failed to initialize model predictor: {e}")
        sys.exit(1)

    print(f"\nAnalyzing image: {img_path.name}")
    print("-" * 40)

    try:
        result = predictor.predict(img_path)
    except Exception as e:
        print(f"[ERROR] Inference failed: {e}")
        sys.exit(1)

    # EXACT requested output format:
    print(f"Predicted material: {result['predicted_material']}")
    print(f"Confidence: {result['confidence_str']}")
    print("-" * 40)

    if args.verbose:
        print("Probability Distribution:")
        for cls, prob in result["probabilities"].items():
            print(f"  {cls:<10}: {prob:5.1f}%")
        print("-" * 40)


if __name__ == "__main__":
    main()
