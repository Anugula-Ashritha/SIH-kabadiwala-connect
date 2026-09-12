"""
MobileNetV3Small Transfer Learning Model Architecture for E-Waste Classification (PyTorch).
Uses torchvision's pretrained MobileNetV3Small with a customized classification head.
"""

from typing import Optional
import torch
import torch.nn as nn
import torchvision.models as models


def create_model(
    num_classes: int = 3,
    freeze_base: bool = True,
    pretrained: bool = True,
) -> nn.Module:
    """
    Builds a MobileNetV3Small transfer learning model in PyTorch.
    
    Args:
        num_classes: Number of target categories (default: 3 for Battery, Mobile, PCB)
        freeze_base: If True, freezes feature extractor backbone weights
        pretrained: If True, loads ImageNet pretrained weights

    Returns:
        torch.nn.Module: Configured PyTorch model
    """
    # Load pretrained MobileNetV3Small
    if pretrained:
        try:
            from torchvision.models import MobileNet_V3_Small_Weights
            weights = MobileNet_V3_Small_Weights.DEFAULT
            model = models.mobilenet_v3_small(weights=weights)
        except Exception:
            # Fallback for older torchvision versions
            model = models.mobilenet_v3_small(pretrained=True)
    else:
        model = models.mobilenet_v3_small(weights=None)

    # Optionally freeze backbone feature layers to prevent gradient updates
    if freeze_base:
        for param in model.features.parameters():
            param.requires_grad = False

    # MobileNetV3Small classifier structure in torchvision:
    # (0): Linear(576, 1024)
    # (1): Hardswish()
    # (2): Dropout(p=0.2)
    # (3): Linear(1024, 1000)
    in_features = model.classifier[3].in_features  # 1024

    # Replace the final linear layer with our custom 3-class head
    model.classifier[3] = nn.Linear(in_features, num_classes)

    return model
