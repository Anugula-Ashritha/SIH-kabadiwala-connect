from fastapi import FastAPI, UploadFile, File, HTTPException
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
    return {"message": "Kabadiwala Connect ML API is running"}


@app.get("/health")
def health():
    return {"status": "ok", "model": "loaded", "classes": predictor.classes}


@app.post("/api/ml/classify")
async def classify_material(file: UploadFile = File(...)):
    try:
        image_bytes = await file.read()
        if not image_bytes:
            raise HTTPException(status_code=400, detail="Empty image file")

        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        result = predictor.predict(image)

        return {
            "material": result["predicted_material"],
            "confidence": result["confidence"] / 100,
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
