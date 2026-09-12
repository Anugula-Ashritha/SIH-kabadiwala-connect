"""
PyTorch Dataset and DataLoader pipeline for Kabadiwala Connect ML module.
Loads images strictly from the 3 designated prototype classes: Battery, Mobile, PCB.
Ignores all other classes present in the parent dataset directory.
"""

from pathlib import Path
from typing import Dict, List, Tuple
from PIL import Image
import torch
from torch.utils.data import Dataset, DataLoader
from torchvision import transforms

TARGET_CLASSES = ["Battery", "PCB", "Mobile"]
IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".bmp", ".webp"}

# Standard ImageNet normalization parameters (required by MobileNetV3)
IMAGENET_MEAN = [0.485, 0.456, 0.406]
IMAGENET_STD = [0.229, 0.224, 0.225]


def get_transforms(img_size: int = 224, is_train: bool = True) -> transforms.Compose:
    """
    Returns torchvision transforms for training (with data augmentation)
    or evaluation/inference (deterministic resize and normalization).
    """
    if is_train:
        return transforms.Compose(
            [
                transforms.Resize((img_size, img_size)),
                transforms.RandomHorizontalFlip(p=0.5),
                transforms.RandomRotation(degrees=10),
                transforms.ColorJitter(brightness=0.1, contrast=0.1),
                transforms.ToTensor(),
                transforms.Normalize(mean=IMAGENET_MEAN, std=IMAGENET_STD),
            ]
        )
    else:
        return transforms.Compose(
            [
                transforms.Resize((img_size, img_size)),
                transforms.ToTensor(),
                transforms.Normalize(mean=IMAGENET_MEAN, std=IMAGENET_STD),
            ]
        )


class EwasteDataset(Dataset):
    """PyTorch Dataset for e-waste scrap image classification."""

    def __init__(self, file_paths: List[str], labels: List[int], transform=None):
        self.file_paths = file_paths
        self.labels = labels
        self.transform = transform

    def __len__(self) -> int:
        return len(self.file_paths)

    def __getitem__(self, idx: int) -> Tuple[torch.Tensor, int]:
        img_path = self.file_paths[idx]
        label = self.labels[idx]

        # Open image safely and ensure 3-channel RGB
        try:
            image = Image.open(img_path).convert("RGB")
        except Exception as e:
            # Fallback for corrupted image files
            print(f"[Warning] Failed to load image {img_path}: {e}. Replacing with blank canvas.")
            image = Image.new("RGB", (224, 224), (0, 0, 0))

        if self.transform:
            image = self.transform(image)

        return image, label


def find_class_dir(split_dir: Path, target_name: str) -> Path:
    """Case-insensitive directory resolution for robust cross-platform loading."""
    direct = split_dir / target_name
    if direct.is_dir():
        return direct
    for child in split_dir.iterdir():
        if child.is_dir() and child.name.lower() == target_name.lower():
            return child
    raise FileNotFoundError(
        f"Could not find folder for class '{target_name}' inside '{split_dir}'."
    )


def collect_file_paths_and_labels(
    split_dir: Path, classes: List[str]
) -> Tuple[List[str], List[int]]:
    """
    Scans only the requested target class folders, ignoring any other class folders
    (e.g., Keyboard, Microwave, Mouse, Player, Printer, Television, Washing Machine).
    """
    file_paths = []
    labels = []

    for label_idx, class_name in enumerate(classes):
        class_folder = find_class_dir(split_dir, class_name)
        count = 0
        for entry in class_folder.iterdir():
            if entry.is_file() and entry.suffix.lower() in IMAGE_EXTENSIONS:
                file_paths.append(str(entry.resolve()))
                labels.append(label_idx)
                count += 1

        print(f"  [{class_name:<7}] Found {count} images in '{split_dir.name}'")

    return file_paths, labels


def load_datasets(
    data_dir: str,
    classes: List[str] = TARGET_CLASSES,
    img_size: int = 224,
    batch_size: int = 32,
    num_workers: int = 0,
) -> Tuple[DataLoader, DataLoader, DataLoader, Dict[str, any]]:
    """
    Loads train, val, and test DataLoaders for the 3 target classes.
    Note: num_workers=0 defaults to safe execution on Windows machines.
    Returns: (train_loader, val_loader, test_loader, metadata)
    """
    root = Path(data_dir).resolve()
    train_dir = root / "train"
    val_dir = root / "val"
    test_dir = root / "test"

    for d in [train_dir, val_dir, test_dir]:
        if not d.is_dir():
            raise FileNotFoundError(f"Missing required dataset split directory: {d}")

    print("\nScanning dataset splits for target classes:", classes)
    print("-" * 50)
    print("Loading Train split:")
    train_paths, train_labels = collect_file_paths_and_labels(train_dir, classes)

    print("\nLoading Val split:")
    val_paths, val_labels = collect_file_paths_and_labels(val_dir, classes)

    print("\nLoading Test split:")
    test_paths, test_labels = collect_file_paths_and_labels(test_dir, classes)
    print("-" * 50)

    train_transform = get_transforms(img_size=img_size, is_train=True)
    eval_transform = get_transforms(img_size=img_size, is_train=False)

    train_dataset = EwasteDataset(train_paths, train_labels, transform=train_transform)
    val_dataset = EwasteDataset(val_paths, val_labels, transform=eval_transform)
    test_dataset = EwasteDataset(test_paths, test_labels, transform=eval_transform)

    train_loader = DataLoader(
        train_dataset,
        batch_size=batch_size,
        shuffle=True,
        num_workers=num_workers,
        pin_memory=torch.cuda.is_available(),
    )
    val_loader = DataLoader(
        val_dataset,
        batch_size=batch_size,
        shuffle=False,
        num_workers=num_workers,
        pin_memory=torch.cuda.is_available(),
    )
    test_loader = DataLoader(
        test_dataset,
        batch_size=batch_size,
        shuffle=False,
        num_workers=num_workers,
        pin_memory=torch.cuda.is_available(),
    )

    metadata = {
        "classes": classes,
        "train_count": len(train_paths),
        "val_count": len(val_paths),
        "test_count": len(test_paths),
        "test_paths": test_paths,
        "test_labels": test_labels,
    }

    return train_loader, val_loader, test_loader, metadata
