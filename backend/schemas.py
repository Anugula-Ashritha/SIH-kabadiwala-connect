from pydantic import BaseModel
from typing import Optional


class CollectorCreate(BaseModel):
    name: str
    phone: str
    location: Optional[str] = None
    language: str = "Hindi"


class CollectorResponse(CollectorCreate):
    id: int

    class Config:
        from_attributes = True


class LotCreate(BaseModel):
    collector_id: int
    material: str
    weight: float
    estimated_value: float = 0
    quoted_price: float = 0
    location: Optional[str] = None


class LotResponse(BaseModel):
    id: int
    lot_id: str
    collector_id: int
    material: str
    weight: float
    estimated_value: float
    quoted_price: float
    final_price: float
    recycler_id: Optional[int]
    status: str
    location: Optional[str]

    class Config:
        from_attributes = True


class RecyclerResponse(BaseModel):
    id: int
    organization_name: str
    location: Optional[str]
    materials_accepted: Optional[str]
    authorization_status: str
    pickup_available: int

    class Config:
        from_attributes = True


class LotStatusUpdate(BaseModel):
    status: str
    recycler_id: Optional[int] = None
    final_price: Optional[float] = None


class RecyclerCreate(BaseModel):
    organization_name: str
    location: Optional[str] = None
    materials_accepted: Optional[str] = None
    authorization_status: str = "VERIFIED"
    pickup_available: int = 1


class TransactionCreate(BaseModel):
    lot_id: str
    collector_id: int
    recycler_id: Optional[int] = None
    quoted_price: float = 0
    final_price: float = 0
    payment_status: str = "Pending"
    payment_method: str = "UPI"


class TransactionResponse(BaseModel):
    id: int
    transaction_id: str
    lot_id: str
    collector_id: int
    recycler_id: Optional[int]
    quoted_price: float
    final_price: float
    payment_status: str
    payment_method: str
    reference_utr: Optional[str]

    class Config:
        from_attributes = True


class PaymentUpdate(BaseModel):
    status: str
    utr: Optional[str] = None


class HandoverCreate(BaseModel):
    lot_id: str
    collector_id: int
    recycler_id: int
    weight_confirmed: float
    location: Optional[str] = None
    photo_reference: Optional[str] = None


class HandoverResponse(BaseModel):
    id: int
    handover_id: str
    lot_id: str
    collector_id: int
    recycler_id: int
    weight_confirmed: float
    location: Optional[str]
    recycler_confirmation: bool
    unique_reference: str
    status: str

    class Config:
        from_attributes = True