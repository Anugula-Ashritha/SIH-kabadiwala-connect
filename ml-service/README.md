# Kabadiwala Connect — ML Module (SIH 2026)

Lightweight, transfer-learning machine learning module for automated e-waste classification. It uses **MobileNetV3Small** to identify collected scrap into 3 core prototype categories:

- **Battery**
- **Mobile**
- **PCB**

> **Note on Full Dataset:** The full dataset contains 10 categories (`Battery`, `Keyboard`, `Microwave`, `Mobile`, `Mouse`, `PCB`, `Player`, `Printer`, `Television`, `Washing Machine`). This module **automatically filters and trains exclusively on the 3 designated prototype classes**, safely ignoring the other 7 categories without requiring any manual deletion or file movement.

---

## 📁 Module Structure

```text
ml-service/
├── models/                     # Saved model artifacts (.keras, classes.json, plots)
│   └── .gitkeep
├── training/                   # Core pipeline modules
│   ├── __init__.py
│   ├── dataset.py              # Filtered dataset loader (Battery, PCB, Mobile only)
│   ├── model.py                # MobileNetV3Small transfer learning & augmentation
│   └── evaluate.py             # Accuracy, loss, classification report & confusion matrix
├── inference/                  # Prediction engine
│   ├── __init__.py
│   └── predictor.py            # EwastePredictor class with image preprocessing
├── check_dataset.py            # Pre-flight dataset checker & image counter
├── train.py                    # Main model training script
├── predict.py                  # CLI inference script
├── requirements.txt            # Python dependencies
└── README.md                   # This documentation
```

---

## 🛠️ Step 1: Environment Setup (Windows)

Open **PowerShell** or **Command Prompt** on your Windows laptop:

```powershell
# Navigate to the ml-service folder
cd path\to\Kabadiwala-Connect\ml-service

# Create a Python virtual environment
python -m venv venv

# Activate the virtual environment
# In PowerShell:
.\venv\Scripts\Activate.ps1
# In Command Prompt (cmd):
venv\Scripts\activate.bat

# Install dependencies
pip install -r requirements.txt
```

---

## 🔍 Step 2: Verify Your Local Dataset

Before starting model training, run the dataset checker to inspect your folder structure and count images in `Battery`, `PCB`, and `Mobile`:

```bash
# Provide the path to your local modified-dataset folder:
python check_dataset.py --data_dir "C:\Users\YourName\Documents\modified-dataset"
```

### What this script does:
1. Verifies that `train/`, `val/`, and `test/` exist.
2. Confirms that `Battery/`, `PCB/`, and `Mobile/` folders are present in each split.
3. Counts all valid image files (`.jpg`, `.jpeg`, `.png`, etc.) and prints an image count summary table.
4. Confirms that the other 7 folders are ignored.

---

## 🚀 Step 3: Train the Classifier

Train the **MobileNetV3Small** transfer learning model with data augmentation:

```bash
python train.py --data_dir "C:\Users\YourName\Documents\modified-dataset" --epochs 15 --batch_size 32
```

### Optional Command-Line Arguments:
| Flag | Default | Description |
|---|---|---|
| `--data_dir` | `./modified-dataset` | Path to your `modified-dataset` directory |
| `--epochs` | `15` | Maximum training epochs (early stopping stops early if converged) |
| `--batch_size` | `32` | Training batch size |
| `--img_size` | `224` | Image resolution (224x224 for MobileNetV3) |
| `--lr` | `0.001` | Initial Adam learning rate |
| `--output_dir` | `./models` | Directory to save the trained model and artifacts |

### What happens during training:
1. **Data Augmentation:** Applies random horizontal flips, subtle rotations, zooms, and contrast shifts to prevent overfitting.
2. **Preprocessing:** Preprocesses raw RGB images into the input domain required by MobileNetV3.
3. **Callbacks:**
   - `ModelCheckpoint`: Automatically saves the best model based on minimum validation loss to `models/ewaste_classifier.keras`.
   - `EarlyStopping`: Halts training if validation loss stops improving for 5 consecutive epochs.
   - `ReduceLROnPlateau`: Halves learning rate when progress plateaus.
4. **Test Evaluation:** Evaluates the best model on the independent `test/` set and prints:
   - Test Accuracy and Test Loss
   - Classification Report (Precision, Recall, F1-score for Battery, Mobile, PCB)
   - Confusion Matrix (printed as ASCII table and saved as `models/confusion_matrix.png`)
5. **Class Order:** Exports `models/classes.json` with the exact indexing needed for consistent inference.

---

## 🔮 Step 4: Run Inference on a Test Image

To classify any local scrap image and obtain the predicted material and confidence score:

```bash
python predict.py --image "C:\path\to\scrap_pcb.jpg"
```

### Example Output:
```text
Analyzing image: scrap_pcb.jpg
----------------------------------------
Predicted material: PCB
Confidence: 94.2%
----------------------------------------
```

To see the probability breakdown across all 3 classes, add the `--verbose` flag:
```bash
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
  Mobile    :   4.0%
  PCB       :  94.2%
----------------------------------------
```

---

## 🔄 Upcoming Phase: FastAPI Integration

In the next phase, we will expose this predictor via a lightweight FastAPI server (`/classify` POST endpoint) so the Collector App can send photographed lot pictures from the field and automatically populate category, weight estimates, and CPCB fair market value.
