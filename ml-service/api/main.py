from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
import io

from inference.predictor import EwastePredictor

app = FastAPI(title="Kabadiwala Connect ML API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

predictor = EwastePredictor()


@app.get("/")
def root():
    return {
        "message": "Kabadiwala Connect ML API is running"
    }


@app.post("/api/ml/classify")
async def classify_material(file: UploadFile = File(...)):
    try:
        image_bytes = await file.read()
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")

        result = predictor.predict(image)

        print("PREDICTOR RESULT:", result)

        return {
             "material": result["predicted_material"],
              "confidence": result["confidence"] / 100

        }

    except Exception as e:
        return {
            "error": str(e)
        }