"""
Inference Predictor Engine for Kabadiwala Connect E-Waste Classifier (PyTorch).
Loads the trained MobileNetV3Small PyTorch model, processes an input image,
and outputs the predicted material with confidence score.
"""

import json
from pathlib import Path
from typing import Dict, List, Optional, Union
import numpy as np
import torch
import torch.nn as nn
from PIL import Image
from torchvision import transforms

from training.dataset import IMAGENET_MEAN, IMAGENET_STD
from training.model import create_model

DEFAULT_CLASSES = ["Battery", "PCB", "Mobile"]


class EwastePredictor:
    """Predictor class for e-waste image classification using PyTorch."""

    def __init__(
        self,
        model_path: Union[str, Path] = "models/ewaste_classifier.pth",
        classes_path: Optional[Union[str, Path]] = "models/classes.json",
        img_size: int = 224,
        device: Optional[str] = None,
    ):
        self.model_path = Path(model_path).resolve()
        self.classes_path = Path(classes_path).resolve() if classes_path else None
        self.img_size = img_size

        # Device selection: use GPU if available, else CPU
        if device:
            self.device = torch.device(device)
        else:
            self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

        if not self.model_path.exists():
            raise FileNotFoundError(
                f"Trained model not found at: {self.model_path}\n"
                f"Please train the model first by running:\n"
                f'  python train.py --data_dir "path\\to\\modified-dataset"'
            )

        # 1. Load class list
        self.classes: List[str] = self._load_classes()

        # 2. Reconstruct MobileNetV3Small architecture and load weights
        print(f"Loading trained PyTorch model from:\n  {self.model_path}")
        print(f"Target classes ({len(self.classes)}): {self.classes}")
        print(f"Inference device: {self.device}")

        self.model = create_model(
            num_classes=len(self.classes),
            freeze_base=False,
            pretrained=False,
        )

        checkpoint = torch.load(str(self.model_path), map_location=self.device)
        if isinstance(checkpoint, dict) and "state_dict" in checkpoint:
            self.model.load_state_dict(checkpoint["state_dict"])
            if "classes" in checkpoint and not self.classes_path:
                self.classes = checkpoint["classes"]
        elif isinstance(checkpoint, dict) and "model_state_dict" in checkpoint:
            self.model.load_state_dict(checkpoint["model_state_dict"])
        elif isinstance(checkpoint, dict):
            # Direct state_dict
            self.model.load_state_dict(checkpoint)
        elif isinstance(checkpoint, nn.Module):
            # Whole model object was saved
            self.model = checkpoint

        self.model.to(self.device)
        self.model.eval()

        # 3. Define deterministic preprocessing transform
        self.transform = transforms.Compose(
            [
                transforms.Resize((self.img_size, self.img_size)),
                transforms.ToTensor(),
                transforms.Normalize(mean=IMAGENET_MEAN, std=IMAGENET_STD),
            ]
        )

    def _load_classes(self) -> List[str]:
        if self.classes_path and self.classes_path.exists():
            try:
                with open(self.classes_path, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    if isinstance(data, list):
                        return data
                    elif isinstance(data, dict) and "classes" in data:
                        return data["classes"]
            except Exception as e:
                print(f"[Warning] Could not parse {self.classes_path} ({e}). Using default classes.")

        return list(DEFAULT_CLASSES)

    def preprocess_image(self, image_input: Union[str, Path, Image.Image]) -> torch.Tensor:
        """
        Loads and prepares an image for PyTorch inference:
        - Converts to RGB
        - Resizes and normalizes using ImageNet parameters
        - Returns batch tensor of shape: (1, 3, img_size, img_size)
        """
        if isinstance(image_input, (str, Path)):
            img_path = Path(image_input).resolve()
            if not img_path.exists():
                raise FileNotFoundError(f"Input image not found: {img_path}")
            img = Image.open(img_path).convert("RGB")
        elif isinstance(image_input, Image.Image):
            img = image_input.convert("RGB")
        else:
            raise ValueError("image_input must be a file path string, Path, or PIL Image.")

        tensor = self.transform(img)
        batch_tensor = tensor.unsqueeze(0)  # Shape: [1, 3, 224, 224]
        return batch_tensor

    def predict(self, image_input: Union[str, Path, Image.Image]) -> Dict[str, any]:
        """
        Runs model prediction on an image.
        Returns:
            Dict with:
                - predicted_material: str (e.g. 'PCB')
                - confidence: float (e.g. 94.2)
                - confidence_str: str (e.g. '94.2%')
                - probabilities: Dict[str, float]
        """
        batch_tensor = self.preprocess_image(image_input).to(self.device)

        with torch.no_grad():
            outputs = self.model(batch_tensor)
            probabilities = torch.softmax(outputs, dim=1)[0].cpu().numpy()

        best_idx = int(np.argmax(probabilities))
        predicted_class = self.classes[best_idx]
        confidence_pct = float(probabilities[best_idx] * 100.0)

        all_probs = {
            self.classes[i]: float(probabilities[i] * 100.0)
            for i in range(len(self.classes))
        }

        return {
            "predicted_material": predicted_class,
            "confidence": round(confidence_pct, 1),
            "confidence_str": f"{confidence_pct:.1f}%",
            "probabilities": all_probs,
        }
