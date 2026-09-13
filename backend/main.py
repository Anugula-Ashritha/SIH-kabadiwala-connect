from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from uuid import uuid4

import models
import schemas

from database import engine, get_db


models.Base.metadata.create_all(bind=engine)


app = FastAPI(
    title="Kabadiwala Connect Backend",
    description="Shared backend for Collector, Admin and Government dashboards"
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================================================
# ROOT
# =========================================================

@app.get("/")
def root():
    return {
        "message": "Kabadiwala Connect Backend is running"
    }


# =========================================================
# COLLECTORS
# =========================================================

@app.post(
    "/api/collectors",
    response_model=schemas.CollectorResponse
)
def create_collector(
    collector: schemas.CollectorCreate,
    db: Session = Depends(get_db)
):

    existing = db.query(models.Collector).filter(
        models.Collector.phone == collector.phone
    ).first()

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Collector already exists"
        )

    new_collector = models.Collector(
        name=collector.name,
        phone=collector.phone,
        location=collector.location,
        language=collector.language
    )

    db.add(new_collector)
    db.commit()
    db.refresh(new_collector)

    return new_collector


@app.get(
    "/api/collectors/{collector_id}",
    response_model=schemas.CollectorResponse
)
def get_collector(
    collector_id: int,
    db: Session = Depends(get_db)
):

    collector = db.query(models.Collector).filter(
        models.Collector.id == collector_id
    ).first()

    if not collector:
        raise HTTPException(
            status_code=404,
            detail="Collector not found"
        )

    return collector


@app.get(
    "/api/collectors",
    response_model=list[schemas.CollectorResponse]
)
def get_collectors(
    db: Session = Depends(get_db)
):

    return db.query(models.Collector).all()


# =========================================================
# LOTS
# =========================================================

@app.post(
    "/api/lots",
    response_model=schemas.LotResponse
)
def create_lot(
    lot: schemas.LotCreate,
    db: Session = Depends(get_db)
):

    collector = db.query(models.Collector).filter(
        models.Collector.id == lot.collector_id
    ).first()

    if not collector:
        raise HTTPException(
            status_code=404,
            detail="Collector not found"
        )

    generated_lot_id = (
        "LOT-2026-" +
        uuid4().hex[:6].upper()
    )

    new_lot = models.Lot(
        lot_id=generated_lot_id,
        collector_id=lot.collector_id,
        material=lot.material,
        weight=lot.weight,
        estimated_value=lot.estimated_value,
        quoted_price=lot.quoted_price,
        final_price=0,
        location=lot.location
    )

    db.add(new_lot)
    db.commit()
    db.refresh(new_lot)

    return new_lot


@app.get(
    "/api/lots/{lot_id}",
    response_model=schemas.LotResponse
)
def get_lot(
    lot_id: str,
    db: Session = Depends(get_db)
):

    lot = db.query(models.Lot).filter(
        models.Lot.lot_id == lot_id
    ).first()

    if not lot:
        raise HTTPException(
            status_code=404,
            detail="Lot not found"
        )

    return lot


@app.get(
    "/api/lots",
    response_model=list[schemas.LotResponse]
)
def get_lots(
    db: Session = Depends(get_db)
):

    return db.query(models.Lot).all()


@app.get(
    "/api/collectors/{collector_id}/lots",
    response_model=list[schemas.LotResponse]
)
def get_collector_lots(
    collector_id: int,
    db: Session = Depends(get_db)
):

    return db.query(models.Lot).filter(
        models.Lot.collector_id == collector_id
    ).all()


@app.patch("/api/lots/{lot_id}/status")
def update_lot_status(
    lot_id: str,
    update: schemas.LotStatusUpdate,
    db: Session = Depends(get_db)
):

    lot = db.query(models.Lot).filter(
        models.Lot.lot_id == lot_id
    ).first()

    if not lot:
        raise HTTPException(
            status_code=404,
            detail="Lot not found"
        )

    lot.status = update.status

    if update.recycler_id is not None:
        lot.recycler_id = update.recycler_id

    if update.final_price is not None:
        lot.final_price = update.final_price

    db.commit()

    return {
        "lot_id": lot_id,
        "status": lot.status
    }


# =========================================================
# RECYCLERS
# =========================================================

@app.get(
    "/api/recyclers",
    response_model=list[schemas.RecyclerResponse]
)
def get_recyclers(
    db: Session = Depends(get_db)
):

    return db.query(models.Recycler).all()


@app.post(
    "/api/recyclers",
    response_model=schemas.RecyclerResponse
)
def create_recycler(
    recycler: schemas.RecyclerCreate,
    db: Session = Depends(get_db)
):

    new_recycler = models.Recycler(
        organization_name=recycler.organization_name,
        location=recycler.location,
        materials_accepted=recycler.materials_accepted,
        authorization_status=recycler.authorization_status,
        pickup_available=recycler.pickup_available
    )

    db.add(new_recycler)
    db.commit()
    db.refresh(new_recycler)

    return new_recycler


# =========================================================
# TRANSACTIONS
# =========================================================

@app.post(
    "/api/transactions",
    response_model=schemas.TransactionResponse
)
def create_transaction(
    transaction: schemas.TransactionCreate,
    db: Session = Depends(get_db)
):

    transaction_id = (
        "TXN-" +
        uuid4().hex[:8].upper()
    )

    new_transaction = models.Transaction(
        transaction_id=transaction_id,
        lot_id=transaction.lot_id,
        collector_id=transaction.collector_id,
        recycler_id=transaction.recycler_id,
        quoted_price=transaction.quoted_price,
        final_price=transaction.final_price,
        payment_status=transaction.payment_status,
        payment_method=transaction.payment_method
    )

    db.add(new_transaction)
    db.commit()
    db.refresh(new_transaction)

    return new_transaction


@app.get(
    "/api/transactions",
    response_model=list[schemas.TransactionResponse]
)
def get_transactions(
    db: Session = Depends(get_db)
):

    return db.query(models.Transaction).all()


@app.patch(
    "/api/transactions/{transaction_id}/payment"
)
def update_transaction_payment(
    transaction_id: str,
    update: schemas.PaymentUpdate,
    db: Session = Depends(get_db)
):

    transaction = db.query(
        models.Transaction
    ).filter(
        models.Transaction.transaction_id == transaction_id
    ).first()

    if not transaction:
        raise HTTPException(
            status_code=404,
            detail="Transaction not found"
        )

    transaction.payment_status = update.status

    if update.utr:
        transaction.reference_utr = update.utr

    db.commit()

    return {
        "transaction_id": transaction_id,
        "payment_status": transaction.payment_status
    }


# =========================================================
# HANDOVERS
# =========================================================

@app.post(
    "/api/handovers",
    response_model=schemas.HandoverResponse
)
def create_handover(
    handover: schemas.HandoverCreate,
    db: Session = Depends(get_db)
):

    handover_id = (
        "HND-" +
        uuid4().hex[:8].upper()
    )

    reference = (
        "KBC-" +
        uuid4().hex[:10].upper()
    )

    new_handover = models.Handover(
        handover_id=handover_id,
        lot_id=handover.lot_id,
        collector_id=handover.collector_id,
        recycler_id=handover.recycler_id,
        weight_confirmed=handover.weight_confirmed,
        location=handover.location,
        photo_reference=handover.photo_reference,
        unique_reference=reference
    )

    db.add(new_handover)
    db.commit()
    db.refresh(new_handover)

    return new_handover


@app.get(
    "/api/handovers",
    response_model=list[schemas.HandoverResponse]
)
def get_handovers(
    db: Session = Depends(get_db)
):

    return db.query(models.Handover).all()


# =========================================================
# ANALYTICS — SHARED BY GOVERNMENT + ADMIN
# =========================================================

@app.get("/api/analytics/overview")
def analytics_overview(
    db: Session = Depends(get_db)
):

    lots = db.query(models.Lot).all()

    total_weight = sum(
        lot.weight for lot in lots
    )

    total_value = sum(
        lot.final_price or lot.quoted_price or 0
        for lot in lots
    )

    completed = [
        lot for lot in lots
        if lot.status.upper() == "COMPLETED"
    ]

    completed_weight = sum(
        lot.weight for lot in completed
    )

    formal_rate = (
        (completed_weight / total_weight) * 100
        if total_weight else 0
    )

    return {
        "total_lots": len(lots),
        "total_weight_kg": total_weight,
        "completed_lots": len(completed),
        "completed_weight_kg": completed_weight,
        "transaction_value": total_value,
        "formal_channel_rate": round(formal_rate, 2)
    }


@app.get("/api/analytics/materials")
def analytics_materials(
    db: Session = Depends(get_db)
):

    lots = db.query(models.Lot).all()

    result = {}

    for lot in lots:

        material = lot.material

        if material not in result:
            result[material] = {
                "material": material,
                "total_weight_kg": 0,
                "lot_count": 0,
                "transaction_value": 0
            }

        result[material]["total_weight_kg"] += lot.weight
        result[material]["lot_count"] += 1

        result[material]["transaction_value"] += (
            lot.final_price or
            lot.quoted_price or
            lot.estimated_value or
            0
        )

    return list(result.values())


@app.get("/api/analytics/collections")
def analytics_collections(
    db: Session = Depends(get_db)
):

    lots = db.query(models.Lot).all()

    result = {}

    for lot in lots:

        location = lot.location or "Unknown"

        if location not in result:
            result[location] = {
                "location": location,
                "lots_collected": 0,
                "total_weight_kg": 0,
                "transaction_value": 0
            }

        result[location]["lots_collected"] += 1
        result[location]["total_weight_kg"] += lot.weight

        result[location]["transaction_value"] += (
            lot.final_price or
            lot.quoted_price or
            lot.estimated_value or
            0
        )

    return list(result.values())