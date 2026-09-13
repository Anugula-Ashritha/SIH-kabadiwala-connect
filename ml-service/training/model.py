"""
MobileNetV3Small Transfer Learning Model Architecture for E-Waste Classification.
Includes built-in image preprocessing and data augmentation layers.
"""

from typing import Tuple
import tensorflow as tf
from tensorflow.keras import layers, models


def build_data_augmentation() -> tf.keras.Sequential:
    """Creates a sequential container for data augmentation layers (active only during training)."""
    return tf.keras.Sequential(
        [
            layers.RandomFlip("horizontal", name="aug_flip"),
            layers.RandomRotation(0.1, name="aug_rotation"),
            layers.RandomZoom(0.1, name="aug_zoom"),
            layers.RandomContrast(0.1, name="aug_contrast"),
            layers.RandomTranslation(0.05, 0.05, name="aug_translation"),
        ],
        name="data_augmentation",
    )


def create_model(
    num_classes: int = 3,
    input_shape: Tuple[int, int, int] = (224, 224, 3),
    learning_rate: float = 1e-3,
    freeze_base: bool = True,
) -> tf.keras.Model:
    """
    Builds a MobileNetV3Small transfer learning model.
    Inputs: Raw RGB images [0, 255]
    Outputs: Softmax probabilities across classes (Battery, Mobile, PCB)
    """
    inputs = layers.Input(shape=input_shape, name="image_input")

    # 1. Data Augmentation (active only during training)
    augmentation = build_data_augmentation()
    x = augmentation(inputs)

    # 2. Preprocessing: MobileNetV3 expects pixels scaled to [-1, 1]
    # tf.keras.applications.mobilenet_v3.preprocess_input maps [0, 255] to [-1, 1]
    x = layers.Lambda(
        tf.keras.applications.mobilenet_v3.preprocess_input,
        name="mobilenetv3_preprocess",
    )(x)

    # 3. Base MobileNetV3Small Pretrained Backbone
    base_model = tf.keras.applications.MobileNetV3Small(
        input_shape=input_shape,
        include_top=False,
        weights="imagenet",
        pooling="avg",
    )

    base_model.trainable = not freeze_base
    x = base_model(x, training=False)

    # 4. Dense Classification Head
    x = layers.Dropout(0.3, name="head_dropout_1")(x)
    x = layers.Dense(128, activation="relu", name="head_dense_1")(x)
    x = layers.BatchNormalization(name="head_batch_norm")(x)
    x = layers.Dropout(0.2, name="head_dropout_2")(x)

    outputs = layers.Dense(num_classes, activation="softmax", name="predictions")(x)

    model = models.Model(inputs=inputs, outputs=outputs, name="Ewaste_MobileNetV3Small")

    optimizer = tf.keras.optimizers.Adam(learning_rate=learning_rate)
    model.compile(
        optimizer=optimizer,
        loss="sparse_categorical_crossentropy",
        metrics=["accuracy"],
    )

    return model
