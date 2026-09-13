"""
Inference Predictor Engine for Kabadiwala Connect E-Waste Classifier.
Loads the trained MobileNetV3Small model, processes an input image,
and outputs the predicted material with confidence score.
"""

import json
from pathlib import Path
from typing import Dict, List, Optional, Tuple, Union
import numpy as np
import tensorflow as tf
from PIL import Image
from tensorflow.keras.applications.mobilenet_v3 import preprocess_input

DEFAULT_CLASSES = ["Battery", "Mobile", "PCB"]


class EwastePredictor:
    """Predictor class for e-waste image classification."""

    def __init__(
        self,
        model_path: Union[str, Path] = "models/ewaste_classifier.keras",
        classes_path: Optional[Union[str, Path]] = "models/classes.json",
        img_size: int = 224,
    ):
        self.model_path = Path(model_path).resolve()
        self.classes_path = Path(classes_path).resolve() if classes_path else None
        self.img_size = img_size

        if not self.model_path.exists():
            raise FileNotFoundError(
                f"Trained model not found at: {self.model_path}\n"
                f"Please train the model first by running:\n"
                f'  python train.py --data_dir "path\\to\\modified-dataset"'
            )

        print(f"Loading trained model from:\n  {self.model_path}")
       
        self.model = tf.keras.models.load_model(
            str(self.model_path),
            custom_objects={"preprocess_input": preprocess_input}
        )

        # Load class names
        self.classes: List[str] = self._load_classes()
        print(f"Loaded classes: {self.classes}")

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

    def preprocess_image(self, image_input: Union[str, Path, Image.Image]) -> np.ndarray:
        """
        Loads and prepares an image for inference:
        - Converts to RGB
        - Resizes to (img_size, img_size) using high-quality resampling
        - Adds batch dimension: (1, img_size, img_size, 3)
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

        img = img.resize((self.img_size, self.img_size), Image.Resampling.BILINEAR)
        img_array = np.array(img, dtype=np.float32)
        img_batch = np.expand_dims(img_array, axis=0)
        return img_batch

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
        img_batch = self.preprocess_image(image_input)
        preds = self.model.predict(img_batch, verbose=0)[0]

        best_idx = int(np.argmax(preds))
        predicted_class = self.classes[best_idx]
        confidence_pct = float(preds[best_idx] * 100.0)

        all_probs = {
            self.classes[i]: float(preds[i] * 100.0)
            for i in range(len(self.classes))
        }

        return {
            "predicted_material": predicted_class,
            "confidence": round(confidence_pct, 1),
            "confidence_str": f"{confidence_pct:.1f}%",
            "probabilities": all_probs,
        }
