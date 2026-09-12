#!/usr/bin/env python3
"""
Kabadiwala Connect - E-Waste Dataset Verification Script
Verifies the local dataset directory structure, confirms target classes
(Battery, PCB, Mobile), and counts available images across splits.
"""

import argparse
import os
import sys
from pathlib import Path

# Target classes for SIH 2026 Prototype
TARGET_CLASSES = ["Battery", "PCB", "Mobile"]

# Other classes in the full dataset that will be ignored
IGNORED_CLASSES = [
    "Keyboard",
    "Microwave",
    "Mouse",
    "Player",
    "Printer",
    "Television",
    "Washing Machine",
]

IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".bmp", ".webp"}


def count_images_in_dir(directory_path: Path) -> int:
    """Counts valid image files within a specific folder."""
    if not directory_path.is_dir():
        return 0
    return sum(
        1
        for f in directory_path.iterdir()
        if f.is_file() and f.suffix.lower() in IMAGE_EXTENSIONS
    )


def check_dataset(data_dir_str: str) -> bool:
    """
    Inspects the dataset directory and prints a detailed breakdown.
    Returns True if the 3 target classes are present in train, val, and test splits.
    """
    data_dir = Path(data_dir_str).resolve()

    print("=" * 70)
    print("  KABADIWALA CONNECT - E-WASTE DATASET VERIFIER")
    print("  SIH 2026 Machine Learning Pipeline")
    print("=" * 70)
    print(f"Inspecting Dataset Path:\n  {data_dir}\n")

    if not data_dir.exists():
        print(f"[ERROR] Directory does not exist: {data_dir}")
        print("\nTip for Windows Users:")
        print('  Ensure you specify the path using quotes, e.g.:')
        print('  python check_dataset.py --data_dir "C:\\Users\\yourname\\modified-dataset"')
        print('  or place "modified-dataset" right inside the ml-service folder.')
        return False

    splits = ["train", "val", "test"]
    split_status = {}

    for split in splits:
        split_path = data_dir / split
        if not split_path.is_dir():
            split_status[split] = False
            print(f"[ERROR] Missing required split folder: '{split}' (expected at {split_path})")
        else:
            split_status[split] = True

    if not all(split_status.values()):
        print("\n[FAILED] One or more required split folders ('train', 'val', 'test') are missing.")
        return False

    # Check classes
    print("Target Classes Selected for Prototype:")
    for cls in TARGET_CLASSES:
        print(f"  [+] {cls}")
    print("\nIgnored Classes (Will NOT be trained in this prototype):")
    print(f"  {', '.join(IGNORED_CLASSES)}\n")

    # Image counts per split & class
    counts = {cls: {"train": 0, "val": 0, "test": 0} for cls in TARGET_CLASSES}
    missing_classes = []

    for split in splits:
        split_path = data_dir / split
        available_folders = [d.name for d in split_path.iterdir() if d.is_dir()]

        for cls in TARGET_CLASSES:
            class_folder = split_path / cls
            if not class_folder.is_dir():
                # Case-insensitive fallback check (e.g. battery vs Battery)
                matched_dir = None
                for d in available_folders:
                    if d.lower() == cls.lower():
                        matched_dir = split_path / d
                        break

                if matched_dir:
                    count = count_images_in_dir(matched_dir)
                    counts[cls][split] = count
                else:
                    missing_classes.append((split, cls))
            else:
                count = count_images_in_dir(class_folder)
                counts[cls][split] = count

    if missing_classes:
        print("[ERROR] The following target class folders were not found:")
        for split, cls in missing_classes:
            print(f"  - Split '{split}' missing class folder: '{cls}'")
        return False

    # Print Formatted Table
    header = f"{'Class Name':<18} | {'Train':<10} | {'Val':<10} | {'Test':<10} | {'Total':<10}"
    print("-" * len(header))
    print(header)
    print("-" * len(header))

    grand_total = 0
    split_totals = {"train": 0, "val": 0, "test": 0}

    for cls in TARGET_CLASSES:
        t = counts[cls]["train"]
        v = counts[cls]["val"]
        te = counts[cls]["test"]
        total_cls = t + v + te
        grand_total += total_cls
        split_totals["train"] += t
        split_totals["val"] += v
        split_totals["test"] += te
        print(f"{cls:<18} | {t:<10} | {v:<10} | {te:<10} | {total_cls:<10}")

    print("-" * len(header))
    print(
        f"{'TOTALS':<18} | {split_totals['train']:<10} | "
        f"{split_totals['val']:<10} | {split_totals['test']:<10} | {grand_total:<10}"
    )
    print("-" * len(header))

    # Check for empty folders
    has_empty = False
    for cls in TARGET_CLASSES:
        for split in splits:
            if counts[cls][split] == 0:
                print(f"[WARNING] Class '{cls}' in '{split}' split contains 0 images!")
                has_empty = True

    if has_empty:
        print("\n[WARNING] Some folders have 0 images. Please verify your dataset files before training.")
        return False

    print("\n[SUCCESS] Dataset verification passed!")
    print(f"  Total prototype images: {grand_total}")
    print("  Ready to train using: python train.py --data_dir \"" + str(data_dir) + "\"")
    print("=" * 70)
    return True


def resolve_default_data_dir() -> str:
    env_path = os.environ.get("DATASET_DIR")
    if env_path and Path(env_path).exists():
        return env_path
    parent_dir = Path(__file__).resolve().parent.parent / "modified-dataset"
    if parent_dir.is_dir():
        return str(parent_dir)
    local_dir = Path(__file__).resolve().parent / "modified-dataset"
    if local_dir.is_dir():
        return str(local_dir)
    return "../modified-dataset"


def main():
    parser = argparse.ArgumentParser(
        description="Verify local e-waste dataset for Kabadiwala Connect prototype."
    )
    parser.add_argument(
        "--data_dir",
        "-d",
        type=str,
        default=resolve_default_data_dir(),
        help="Path to the modified-dataset folder (default: ../modified-dataset, ./modified-dataset, or $DATASET_DIR)",
    )
    args = parser.parse_args()

    success = check_dataset(args.data_dir)
    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()
