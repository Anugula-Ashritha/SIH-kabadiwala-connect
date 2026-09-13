"""
Dataset loading and pipeline utilities for Kabadiwala Connect ML module.
Loads images strictly from the 3 designated prototype classes: Battery, Mobile, PCB.
Ignores all other classes present in the parent dataset directory.
"""

from pathlib import Path
from typing import Dict, List, Tuple
import tensorflow as tf

TARGET_CLASSES = ["Battery", "Mobile", "PCB"]
IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".bmp", ".webp"}


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


def parse_and_preprocess_image(file_path: tf.Tensor, label: tf.Tensor, img_size: int = 224):
    """Reads, decodes, and resizes an image file."""
    img_bytes = tf.io.read_file(file_path)
    # decode_image handles JPEG, PNG, BMP, GIF automatically
    img = tf.io.decode_image(img_bytes, channels=3, expand_animations=False)
    img = tf.image.resize(img, [img_size, img_size])
    img.set_shape([img_size, img_size, 3])
    return img, label


def create_dataset_from_paths(
    file_paths: List[str],
    labels: List[int],
    batch_size: int = 32,
    img_size: int = 224,
    shuffle: bool = True,
) -> tf.data.Dataset:
    """Builds a high-performance tf.data pipeline with batching and prefetching."""
    path_tensor = tf.constant(file_paths)
    label_tensor = tf.constant(labels, dtype=tf.int32)

    dataset = tf.data.Dataset.from_tensor_slices((path_tensor, label_tensor))

    if shuffle:
        # Buffer size capped to prevent memory explosion on entry-level machines
        buffer_size = min(len(file_paths), 1000)
        dataset = dataset.shuffle(buffer_size=buffer_size, reshuffle_each_iteration=True)

    dataset = dataset.map(
        lambda p, l: parse_and_preprocess_image(p, l, img_size=img_size),
        num_parallel_calls=tf.data.AUTOTUNE,
    )

    dataset = dataset.batch(batch_size)
    dataset = dataset.prefetch(buffer_size=tf.data.AUTOTUNE)

    return dataset


def load_datasets(
    data_dir: str,
    classes: List[str] = TARGET_CLASSES,
    img_size: int = 224,
    batch_size: int = 32,
) -> Tuple[tf.data.Dataset, tf.data.Dataset, tf.data.Dataset, Dict[str, any]]:
    """
    Loads train, val, and test datasets for the 3 target classes.
    Returns: (train_ds, val_ds, test_ds, metadata)
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

    train_ds = create_dataset_from_paths(
        train_paths, train_labels, batch_size=batch_size, img_size=img_size, shuffle=True
    )
    val_ds = create_dataset_from_paths(
        val_paths, val_labels, batch_size=batch_size, img_size=img_size, shuffle=False
    )
    test_ds = create_dataset_from_paths(
        test_paths, test_labels, batch_size=batch_size, img_size=img_size, shuffle=False
    )

    metadata = {
        "classes": classes,
        "train_count": len(train_paths),
        "val_count": len(val_paths),
        "test_count": len(test_paths),
        "test_paths": test_paths,
        "test_labels": test_labels,
    }

    return train_ds, val_ds, test_ds, metadata
