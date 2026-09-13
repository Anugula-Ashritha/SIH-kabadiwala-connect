from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean
from datetime import datetime

from database import Base


class Collector(Base):
    __tablename__ = "collectors"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    phone = Column(String, unique=True, nullable=False)
    location = Column(String)
    language = Column(String, default="Hindi")


class Lot(Base):
    __tablename__ = "lots"

    id = Column(Integer, primary_key=True, index=True)
    lot_id = Column(String, unique=True, nullable=False)
    collector_id = Column(Integer, nullable=False)

    material = Column(String, nullable=False)
    weight = Column(Float, nullable=False)

    estimated_value = Column(Float, default=0)
    quoted_price = Column(Float, default=0)
    final_price = Column(Float, default=0)

    recycler_id = Column(Integer, nullable=True)

    status = Column(String, default="CREATED")

    location = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)


class Recycler(Base):
    __tablename__ = "recyclers"

    id = Column(Integer, primary_key=True, index=True)
    organization_name = Column(String, nullable=False)
    location = Column(String)

    materials_accepted = Column(String)

    authorization_status = Column(
        String,
        default="VERIFIED"
    )

    pickup_available = Column(Integer, default=1)


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    transaction_id = Column(String, unique=True, nullable=False)

    lot_id = Column(String, nullable=False)
    collector_id = Column(Integer, nullable=False)
    recycler_id = Column(Integer, nullable=True)

    quoted_price = Column(Float, default=0)
    final_price = Column(Float, default=0)

    payment_status = Column(String, default="Pending")
    payment_method = Column(String, default="UPI")

    transaction_date = Column(
        DateTime,
        default=datetime.utcnow
    )

    reference_utr = Column(String, nullable=True)


class Handover(Base):
    __tablename__ = "handovers"

    id = Column(Integer, primary_key=True, index=True)
    handover_id = Column(String, unique=True, nullable=False)

    lot_id = Column(String, nullable=False)
    collector_id = Column(Integer, nullable=False)
    recycler_id = Column(Integer, nullable=False)

    weight_confirmed = Column(Float, default=0)
    location = Column(String)

    handover_date_time = Column(
        DateTime,
        default=datetime.utcnow
    )

    photo_reference = Column(String, nullable=True)

    recycler_confirmation = Column(
        Boolean,
        default=False
    )

    unique_reference = Column(String, nullable=False)

    status = Column(
        String,
        default="Scheduled"
    )

    discrepancy_kg = Column(Float, nullable=True)
    manifest_signoff_by = Column(String, nullable=True)


class Price(Base):
    __tablename__ = "prices"

    id = Column(Integer, primary_key=True, index=True)
    price_id = Column(String, unique=True, nullable=False)

    material = Column(String, nullable=False)
    subcategory = Column(String, default="General")

    location = Column(String, default="All India")

    buying_price_per_kg = Column(Float, default=0)
    market_min = Column(Float, default=0)
    market_max = Column(Float, default=0)

    recycler_id = Column(Integer, nullable=True)

    effective_date = Column(
        DateTime,
        default=datetime.utcnow
    )

    source_type = Column(
        String,
        default="Recycler Quotation"
    )


class FlaggedRecord(Base):
    __tablename__ = "flagged_records"

    id = Column(Integer, primary_key=True, index=True)
    issue_id = Column(String, unique=True, nullable=False)

    issue_type = Column(String, nullable=False)
    entity_type = Column(String, nullable=False)
    entity_id = Column(String, nullable=False)

    description = Column(String)

    severity = Column(
        String,
        default="Medium"
    )

    reported_date = Column(
        DateTime,
        default=datetime.utcnow
    )

    status = Column(
        String,
        default="Open"
    )

    resolution_notes = Column(String, nullable=True)
    resolved_by = Column(String, nullable=True)
    resolved_at = Column(DateTime, nullable=True)