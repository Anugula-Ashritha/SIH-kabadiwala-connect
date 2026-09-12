# Kabadiwala Connect — ML Module (SIH 2026)

Lightweight, transfer-learning machine learning module for automated e-waste classification using **PyTorch** and **torchvision**. It uses **MobileNetV3Small** to identify collected scrap into 3 core prototype categories:

- **Battery**
- **PCB**
- **Mobile**

> **Note on Windows Compatibility:** This implementation is 100% PyTorch and torchvision. It completely avoids the Windows DLL block / Application Control policy issue that often affects TensorFlow on managed Windows laptops.

> **Note on Dataset:** The full dataset may contain up to 10 categories (`Battery`, `Keyboard`, `Microwave`, `Mobile`, `Mouse`, `PCB`, `Player`, `Printer`, `Television`, `Washing Machine`). This module **automatically filters and trains strictly on the 3 prototype classes (`Battery`, `PCB`, `Mobile`)**, cleanly ignoring the other 7 categories without requiring manual file moves or deletions.

---

## 📁 Module Structure

```text
ml-service/
├── models/                     # Saved PyTorch model artifacts (.pth, classes.json, plots)
│   └── .gitkeep
├── training/                   # Core pipeline modules
│   ├── __init__.py
│   ├── dataset.py              # PyTorch Dataset & DataLoader (Battery, PCB, Mobile only)
│   ├── model.py                # MobileNetV3Small transfer learning architecture
│   └── evaluate.py             # Accuracy, loss, classification report & confusion matrix
├── inference/                  # Prediction engine
│   ├── __init__.py
│   └── predictor.py            # EwastePredictor PyTorch engine with image preprocessing
├── check_dataset.py            # Pre-flight dataset checker & image counter
├── train.py                    # PyTorch model training script (validation, early stopping, save)
├── predict.py                  # CLI inference script
├── requirements.txt            # PyTorch & computer vision dependencies
└── README.md                   # This documentation
```

---

## 🛠️ Step 1: Environment Setup (Windows)

Open **PowerShell** or **Command Prompt** on your Windows laptop and navigate to `ml-service`:

```powershell
# Navigate into ml-service
cd path\to\Kabadiwala-Connect\ml-service

# Create a Python virtual environment (Python 3.9 - 3.12 recommended)
python -m venv venv

# Activate the virtual environment
# In PowerShell:
.\venv\Scripts\Activate.ps1
# In Command Prompt (cmd.exe):
venv\Scripts\activate.bat

# Install PyTorch and required dependencies
pip install -r requirements.txt
```

> **Tip for Windows:** If you ever need to install CPU-only PyTorch explicitly, you can run:
> ```powershell
> pip install torch torchvision --index-url https://download.pytorch.org/whl/cpu
> ```

---

## 🔍 Step 2: Verify Your Local Dataset

The scripts automatically detect `../modified-dataset` (located in the project root alongside `ml-service`). You can also specify any custom path with `--data_dir`.

Run the dataset checker before starting training:

```powershell
# Auto-detects ../modified-dataset:
python check_dataset.py

# Or provide your custom Windows path:
python check_dataset.py --data_dir "C:\Users\YourName\modified-dataset"
```

### What this script does:
1. Verifies that `train/`, `val/`, and `test/` exist.
2. Confirms that `Battery/`, `PCB/`, and `Mobile/` folders exist in each split.
3. Counts all valid images (`.jpg`, `.jpeg`, `.png`, etc.) and displays a formatted summary table.
4. Confirms that all other classes in the dataset are ignored.

---

## 🚀 Step 3: Train the PyTorch Classifier

Train the **MobileNetV3Small** transfer learning model:

```powershell
# Default auto-detects ../modified-dataset:
python train.py --epochs 15 --batch_size 32

# Or specify your dataset path:
python train.py --data_dir "C:\Users\YourName\modified-dataset" --epochs 15 --batch_size 32
```

### Configurable Command-Line Arguments:
| Flag | Default | Description |
|---|---|---|
| `--data_dir` | `../modified-dataset` | Path to the `modified-dataset` folder |
| `--epochs` | `15` | Maximum training epochs |
| `--batch_size` | `32` | Training batch size (16 or 32 recommended) |
| `--img_size` | `224` | Image resolution (224x224 for MobileNetV3) |
| `--lr` | `0.001` | Initial Adam learning rate |
| `--patience` | `5` | Early stopping patience (stops if val_loss doesn't improve) |
| `--output_dir` | `./models` | Directory to save `ewaste_classifier.pth` and `classes.json` |

### What happens during training:
1. **Data Augmentation:** Real-time horizontal flip, rotation (±10°), and color jitter to avoid overfitting.
2. **Transfer Learning:** Freezes the pretrained MobileNetV3 feature extractor and trains a custom 3-class classifier head.
3. **Validation & Checkpointing:** Evaluates on `val/` after every epoch, automatically saving the best model state to `models/ewaste_classifier.pth`.
4. **Learning Rate Decay:** Automatically decays the learning rate (`ReduceLROnPlateau`) when validation loss plateaus.
5. **Test Evaluation:** Evaluates the best checkpoint on the independent `test/` dataset, printing:
   - Final Test Loss & Accuracy
   - Classification Report (Precision, Recall, F1-Score for Battery, PCB, Mobile)
   - Confusion Matrix (ASCII table and saved to `models/confusion_matrix.png`)
6. **Class Mapping:** Exports `models/classes.json` to keep labels synchronized.

---

## 🔮 Step 4: Run Inference on Any Scrap Image

Classify any local scrap photo using the trained PyTorch model:

```powershell
python predict.py --image "C:\path\to\scrap_pcb.jpg"
```

### Exact Output:
```text
Analyzing image: scrap_pcb.jpg
----------------------------------------
Predicted material: PCB
Confidence: 94.2%
----------------------------------------
```

### Optional Detailed Breakdown:
Add `--verbose` to view the probability breakdown across all 3 classes:

```powershell
python predict.py --image "C:\path\to\scrap_pcb.jpg" --verbose
```

Output:
```text
Analyzing image: scrap_pcb.jpg
----------------------------------------
Predicted material: PCB
Confidence: 94.2%
----------------------------------------
Probability Distribution:
  Battery   :   1.8%
  PCB       :  94.2%
  Mobile    :   4.0%
----------------------------------------
```

---

## 🔍 Verification Checklist

- [x] Pure PyTorch and torchvision (`torch>=2.0.0`, `torchvision>=0.15.0`)
- [x] Zero TensorFlow/Keras references or dependencies
- [x] Strict 3-class scope (`Battery`, `PCB`, `Mobile`)
- [x] Auto-resolves `../modified-dataset/` or custom `--data_dir`
- [x] MobileNetV3Small transfer learning architecture
- [x] Saves to `models/ewaste_classifier.pth` and `models/classes.json`
- [x] Evaluates with loss, accuracy, classification report & confusion matrix
- [x] Prediction outputs `Predicted material` and `Confidence`
