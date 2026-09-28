from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from app.model import predictor

app = FastAPI(
    title="OptiFreight AI/ML Waiting-Time Prediction Service",
    description="OptiFreight Scikit-learn Random Forest Model Inference Endpoint",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class PredictionRequest(BaseModel):
    centerId: Optional[str] = "KPC-001"
    farmersAhead: int = 6
    queueSize: int = 7
    totalQuantityAhead: float = 90.0
    farmerQuantity: float = 24.0
    averageProcessingMinutes: float = 7.5
    activeCounters: int = 4
    centerCapacity: float = 1000.0
    expectedArrivals: int = 120
    hourOfDay: Optional[int] = 11

@app.get("/health")
def health_check():
    return {"status": "OK", "model": "Scikit-Learn Random Forest Regressor", "version": "1.0.0"}

@app.post("/predict")
def predict_wait_time(req: PredictionRequest):
    result = predictor.predict(
        farmers_ahead=req.farmersAhead,
        queue_size=req.queueSize,
        total_qty_ahead=req.totalQuantityAhead,
        farmer_qty=req.farmerQuantity,
        avg_speed=req.averageProcessingMinutes,
        active_counters=req.activeCounters,
        center_capacity=req.centerCapacity,
        hour=req.hourOfDay or 11
    )
    return result
