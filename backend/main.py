import hashlib
import hmac
import json
import os
import secrets
import time
from datetime import date, datetime
from pathlib import Path
from typing import Optional

from fastapi import Depends, FastAPI, HTTPException, Header, Query, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, ConfigDict, Field
from sqlalchemy import Boolean, Date, DateTime, Float, Integer, String, Text, create_engine, select, text
from sqlalchemy.orm import DeclarativeBase, Mapped, Session, mapped_column, sessionmaker

from email_service import (
    send_booking_confirmation_email,
    send_welcome_email,
    print_banner_box,
    _safe_print,
)

BASE_DIR = Path(__file__).resolve().parent
DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite:///{BASE_DIR / 'pahadily.db'}")
SECRET_KEY = os.getenv("JWT_SECRET", "pahadily_secret_mountain_key_2026_super_secure")

if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql+psycopg://", 1)
elif DATABASE_URL.startswith("postgresql://"):
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+psycopg://", 1)

engine_kwargs = {"pool_pre_ping": True}
if DATABASE_URL.startswith("sqlite"):
    engine_kwargs["connect_args"] = {"check_same_thread": False}

engine = create_engine(DATABASE_URL, **engine_kwargs)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)


# --- Database Models ---

class Base(DeclarativeBase):
    pass


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(255))
    salt: Mapped[str] = mapped_column(String(64))
    full_name: Mapped[str] = mapped_column(String(120))
    phone: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    role: Mapped[str] = mapped_column(String(30), default="traveler")  # "traveler", "host", "admin"
    avatar: Mapped[Optional[str]] = mapped_column(String(300), nullable=True)
    bio: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class Place(Base):
    __tablename__ = "places"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(150))
    tagline: Mapped[str] = mapped_column(String(255))
    region: Mapped[str] = mapped_column(String(50), index=True)
    category: Mapped[str] = mapped_column(String(50), index=True)
    price: Mapped[str] = mapped_column(String(50), default="₹2,000")
    unit: Mapped[str] = mapped_column(String(30), default="/night")
    rating: Mapped[float] = mapped_column(Float, default=4.8)
    reviews: Mapped[int] = mapped_column(Integer, default=12)
    altitude: Mapped[str] = mapped_column(String(50), default="1,800m")
    tags_json: Mapped[str] = mapped_column(Text, default="[]")
    image: Mapped[str] = mapped_column(String(300), default="/images/destinations/tirthan-valley.jpg")
    description: Mapped[str] = mapped_column(Text, default="")
    host_name: Mapped[Optional[str]] = mapped_column(String(120), nullable=True)
    latitude: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    longitude: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    nearby_locations_json: Mapped[str] = mapped_column(Text, default="[]")
    stay_options_json: Mapped[str] = mapped_column(Text, default="[]")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class PlaceReview(Base):
    __tablename__ = "place_reviews"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    place_id: Mapped[int] = mapped_column(Integer, index=True)
    user_name: Mapped[str] = mapped_column(String(120), default="Himalayan Traveler")
    rating: Mapped[float] = mapped_column(Float, default=5.0)
    comment: Mapped[str] = mapped_column(Text, default="")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class Experience(Base):
    __tablename__ = "experiences"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    title: Mapped[str] = mapped_column(String(180))
    region: Mapped[str] = mapped_column(String(50), index=True)
    location: Mapped[str] = mapped_column(String(180))
    category: Mapped[str] = mapped_column(String(50), index=True)
    duration: Mapped[str] = mapped_column(String(50))
    difficulty: Mapped[str] = mapped_column(String(50), default="Easy")
    price: Mapped[str] = mapped_column(String(50))
    unit: Mapped[str] = mapped_column(String(30), default="per person")
    guide: Mapped[str] = mapped_column(String(120))
    rating: Mapped[float] = mapped_column(Float, default=4.8)
    reviews: Mapped[int] = mapped_column(Integer, default=10)
    image: Mapped[str] = mapped_column(String(300), default="/images/experiences/forest-walk.jpg")
    description: Mapped[str] = mapped_column(Text, default="")
    inclusions_json: Mapped[str] = mapped_column(Text, default="[]")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class Local(Base):
    __tablename__ = "locals"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    category: Mapped[str] = mapped_column(String(50), index=True)
    region: Mapped[str] = mapped_column(String(50), index=True)
    name: Mapped[str] = mapped_column(String(120))
    location: Mapped[str] = mapped_column(String(180))
    role: Mapped[str] = mapped_column(String(100))
    lang: Mapped[str] = mapped_column(String(150))
    rating: Mapped[float] = mapped_column(Float, default=4.8)
    reviews: Mapped[int] = mapped_column(Integer, default=15)
    price: Mapped[str] = mapped_column(String(50))
    unit: Mapped[str] = mapped_column(String(30), default="/day")
    tags_json: Mapped[str] = mapped_column(Text, default="[]")
    image: Mapped[Optional[str]] = mapped_column(String(300), nullable=True)
    verified: Mapped[bool] = mapped_column(Boolean, default=True)
    certified: Mapped[bool] = mapped_column(Boolean, default=False)
    gradient: Mapped[Optional[str]] = mapped_column(String(300), nullable=True)
    bio: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    phone: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    email: Mapped[Optional[str]] = mapped_column(String(120), nullable=True)
    latitude: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    longitude: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class Booking(Base):
    __tablename__ = "bookings"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    booking_type: Mapped[str] = mapped_column(String(30), default="place")  # "local", "place", "experience"
    item_id: Mapped[int] = mapped_column(Integer, index=True)
    item_title: Mapped[str] = mapped_column(String(180))
    item_image: Mapped[Optional[str]] = mapped_column(String(300), nullable=True)
    user_id: Mapped[Optional[int]] = mapped_column(Integer, index=True, nullable=True)
    traveler_name: Mapped[str] = mapped_column(String(120))
    traveler_email: Mapped[str] = mapped_column(String(255), index=True)
    traveler_phone: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    travel_date: Mapped[date] = mapped_column(Date)
    end_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    guests: Mapped[str] = mapped_column(String(30), default="2")
    nights: Mapped[int] = mapped_column(Integer, default=1)
    total_price: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    payment_method: Mapped[str] = mapped_column(String(50), default="upi")  # "upi", "card", "cash_on_arrival", "net_banking"
    payment_status: Mapped[str] = mapped_column(String(30), default="paid", index=True)  # "paid", "pending", "refunded", "failed"
    payment_id: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    transaction_ref: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    message: Mapped[str] = mapped_column(Text, default="")
    status: Mapped[str] = mapped_column(String(30), default="confirmed", index=True)  # "confirmed", "pending", "completed", "cancelled"
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class HostApplication(Base):
    __tablename__ = "host_applications"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(120))
    email: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    phone: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    region: Mapped[str] = mapped_column(String(120))
    skill: Mapped[str] = mapped_column(String(120), default="Host")
    bio: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    languages: Mapped[Optional[str]] = mapped_column(String(150), nullable=True)
    avatar: Mapped[Optional[str]] = mapped_column(String(300), nullable=True)
    user_id: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)

    # Location & Stay details
    property_name: Mapped[Optional[str]] = mapped_column(String(150), nullable=True)
    tagline: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    category: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    price: Mapped[Optional[str]] = mapped_column(String(50), default="₹2,500")
    unit: Mapped[Optional[str]] = mapped_column(String(30), default="/night")
    altitude: Mapped[Optional[str]] = mapped_column(String(50), default="1,800m")
    tags: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    image: Mapped[Optional[str]] = mapped_column(String(300), nullable=True)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    latitude: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    longitude: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    nearby_locations_json: Mapped[str] = mapped_column(Text, default="[]")
    stay_options_json: Mapped[str] = mapped_column(Text, default="[]")

    status: Mapped[str] = mapped_column(String(30), default="pending")  # pending, approved, rejected
    admin_notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    published_place_id: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class EmailNotification(Base):
    __tablename__ = "email_notifications"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    recipient_email: Mapped[str] = mapped_column(String(255), index=True)
    recipient_name: Mapped[str] = mapped_column(String(120), default="")
    subject: Mapped[str] = mapped_column(String(255))
    email_type: Mapped[str] = mapped_column(String(50), default="booking_confirmation")  # "booking_confirmation", "welcome_user"
    booking_id: Mapped[Optional[int]] = mapped_column(Integer, nullable=True, index=True)
    status: Mapped[str] = mapped_column(String(30), default="sent")  # "sent", "delivered", "simulated", "failed"
    preview: Mapped[str] = mapped_column(Text, default="")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class RegistrationOtp(Base):
    __tablename__ = "registration_otps"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    email: Mapped[str] = mapped_column(String(255), index=True)
    otp_code: Mapped[str] = mapped_column(String(10))
    full_name: Mapped[str] = mapped_column(String(120))
    phone: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    role: Mapped[str] = mapped_column(String(30), default="traveler")
    password_hash: Mapped[str] = mapped_column(String(255))
    salt: Mapped[str] = mapped_column(String(64))
    is_used: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


# Create all tables if not yet created
Base.metadata.create_all(bind=engine)


# --- Password & Token Security ---

def hash_password(password: str, salt: Optional[str] = None) -> tuple[str, str]:
    if not salt:
        salt = secrets.token_hex(16)
    hashed = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt.encode("utf-8"), 100000)
    return hashed.hex(), salt


def verify_password(password: str, salt: str, expected_hash: str) -> bool:
    hashed, _ = hash_password(password, salt)
    return hmac.compare_digest(hashed, expected_hash)


def create_token(user: User) -> str:
    payload = {
        "sub": user.id,
        "email": user.email,
        "role": user.role,
        "name": user.full_name,
        "exp": int(time.time()) + 86400 * 30,  # 30 days
        "nonce": secrets.token_hex(8),
    }
    payload_raw = json.dumps(payload, sort_keys=True).encode("utf-8")
    signature = hmac.new(SECRET_KEY.encode("utf-8"), payload_raw, hashlib.sha256).hexdigest()
    token = f"{payload_raw.hex()}.{signature}"
    return token


def decode_token(token: str) -> Optional[dict]:
    try:
        if not token or "." not in token:
            return None
        payload_hex, signature = token.split(".", 1)
        payload_raw = bytes.fromhex(payload_hex)
        expected_sig = hmac.new(SECRET_KEY.encode("utf-8"), payload_raw, hashlib.sha256).hexdigest()
        if not hmac.compare_digest(signature, expected_sig):
            return None
        payload = json.loads(payload_raw.decode("utf-8"))
        if payload.get("exp", 0) < time.time():
            return None
        return payload
    except Exception:
        return None


# --- Pydantic Schemas ---

class UserSignup(BaseModel):
    email: str
    password: str = Field(min_length=6)
    full_name: str = Field(min_length=2)
    phone: Optional[str] = None
    role: str = "traveler"


class SendRegistrationOtpRequest(BaseModel):
    email: str
    password: str = Field(min_length=6)
    full_name: str = Field(min_length=2)
    phone: Optional[str] = None
    role: str = "traveler"


class VerifyRegistrationOtpRequest(BaseModel):
    email: str
    otp_code: str


class UserLogin(BaseModel):
    email: str
    password: str


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    email: str
    full_name: str
    phone: Optional[str] = None
    role: str
    avatar: Optional[str] = None
    bio: Optional[str] = None
    is_active: bool = True
    is_verified: bool = False
    created_at: datetime
    bookings_count: Optional[int] = 0


class UserRoleUpdate(BaseModel):
    role: str = Field(..., pattern="^(traveler|host|admin|guide)$")


class UserStatusUpdate(BaseModel):
    is_active: Optional[bool] = None
    is_verified: Optional[bool] = None


class AuthResponse(BaseModel):
    token: str
    user: UserOut
    message: str


class PlaceCreate(BaseModel):
    name: str
    tagline: str
    region: str
    category: str = "valley"
    price: str = "₹2,200"
    unit: str = "/night"
    rating: float = 4.8
    reviews: int = 12
    altitude: str = "1,800m"
    tags: list[str] = []
    image: str = "/images/destinations/tirthan-valley.jpg"
    description: str = ""
    host_name: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    nearby_locations: Optional[list[dict]] = None
    stay_options: Optional[list[dict]] = None


class PlaceOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str
    tagline: str
    region: str
    category: str
    price: str
    unit: str
    rating: float
    reviews: int
    altitude: str
    tags: list[str]
    image: str
    description: str
    host_name: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    nearby_locations: list[dict] = []
    stay_options: list[dict] = []


class PlaceDynamicDetailsUpdate(BaseModel):
    nearby_locations: Optional[list[dict]] = None
    stay_options: Optional[list[dict]] = None


class PlaceReviewCreate(BaseModel):
    rating: float = Field(ge=1.0, le=5.0, default=5.0)
    comment: str = ""
    user_name: Optional[str] = "Himalayan Traveler"


class PlaceReviewOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    place_id: int
    user_name: str
    rating: float
    comment: str
    created_at: datetime


class ExperienceCreate(BaseModel):
    title: str
    region: str
    location: str
    category: str = "nature"
    duration: str = "2–3 hours"
    difficulty: str = "Easy"
    price: str = "₹500"
    unit: str = "per person"
    guide: str
    rating: float = 4.8
    reviews: int = 15
    image: str = "/images/experiences/forest-walk.jpg"
    description: str = ""
    inclusions: list[str] = []


class ExperienceOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    title: str
    region: str
    location: str
    category: str
    duration: str
    difficulty: str
    price: str
    unit: str
    guide: str
    rating: float
    reviews: int
    image: str
    description: str
    inclusions: list[str]


class LocalCreate(BaseModel):
    category: str
    region: str
    name: str
    location: str
    role: str
    lang: str
    rating: float = 4.8
    reviews: int = 20
    price: str = "₹600"
    unit: str = "/day"
    tags: list[str] = []
    image: Optional[str] = None
    verified: bool = True
    certified: bool = False
    gradient: Optional[str] = None
    bio: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None


class LocalOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    category: str
    region: str
    name: str
    location: str
    role: str
    lang: str
    rating: float
    reviews: int
    price: str
    unit: str
    tags: list[str]
    image: Optional[str] = None
    verified: bool
    certified: bool
    gradient: Optional[str] = None
    bio: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None


class BookingCreate(BaseModel):
    booking_type: str = "place"
    item_id: int
    item_title: str
    item_image: Optional[str] = None
    traveler_name: str
    traveler_email: str
    traveler_phone: Optional[str] = None
    travel_date: date
    end_date: Optional[date] = None
    guests: str = "2"
    nights: int = 1
    total_price: Optional[str] = None
    payment_method: str = "upi"
    payment_status: str = "paid"
    payment_id: Optional[str] = None
    transaction_ref: Optional[str] = None
    message: str = ""


class BookingOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    booking_type: str
    item_id: int
    item_title: str
    item_image: Optional[str] = None
    user_id: Optional[int] = None
    traveler_name: str
    traveler_email: str
    traveler_phone: Optional[str] = None
    travel_date: date
    end_date: Optional[date] = None
    guests: str
    nights: int = 1
    total_price: Optional[str] = None
    payment_method: str = "upi"
    payment_status: str = "paid"
    payment_id: Optional[str] = None
    transaction_ref: Optional[str] = None
    message: str
    status: str
    created_at: datetime


class PaymentUpdate(BaseModel):
    payment_status: str = Field(..., pattern="^(paid|pending|refunded|failed)$")
    payment_method: Optional[str] = None
    transaction_ref: Optional[str] = None


class HostApplicationCreate(BaseModel):
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    region: str
    skill: Optional[str] = "Host"
    bio: Optional[str] = None
    languages: Optional[str] = None
    avatar: Optional[str] = None
    user_id: Optional[int] = None

    # Location & Stay details
    property_name: Optional[str] = None
    tagline: Optional[str] = None
    category: Optional[str] = None
    price: Optional[str] = "₹2,500"
    unit: Optional[str] = "/night"
    altitude: Optional[str] = "1,800m"
    tags: Optional[str] = None
    image: Optional[str] = None
    description: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    nearby_locations: Optional[list[dict]] = None
    stay_options: Optional[list[dict]] = None


class EmailNotificationOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    recipient_email: str
    recipient_name: str
    subject: str
    email_type: str
    booking_id: Optional[int] = None
    status: str
    preview: str
    created_at: datetime


# --- High-Visibility Backend Console Event Loggers ---

def log_new_user_event(user: User):
    print_banner_box(
        "NEW USER REGISTERED (BACKEND EVENT)",
        [
            f"User ID:        #{user.id}",
            f"Full Name:      {user.full_name}",
            f"Email Address:  {user.email}",
            f"Phone Number:   {user.phone or 'Not provided'}",
            f"Role:           {user.role} (Himalayan Community)",
            f"Account Status: {'Active' if user.is_active else 'Inactive'} (Verified: {user.is_verified})",
            f"Registered At:  {user.created_at.strftime('%Y-%m-%d %H:%M:%S UTC')}",
        ],
        icon="👤 [NEW USER REGISTERED]"
    )


def log_payment_event(booking: Booking):
    print_banner_box(
        "PAYMENT RECEIVED & VERIFIED (BACKEND EVENT)",
        [
            f"Payment ID:     {booking.payment_id or 'N/A'}",
            f"Amount Paid:    {booking.total_price or '₹0'}",
            f"Payment Method: {(booking.payment_method or 'upi').upper()}",
            f"Payment Status: {(booking.payment_status or 'paid').upper()}",
            f"Txn Reference:  {booking.transaction_ref or 'N/A'}",
            f"Payer:          {booking.traveler_name} <{booking.traveler_email}>",
            f"Booking Link:   Booking #{booking.id} - {booking.item_title}",
            f"Timestamp:      {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S UTC')}",
        ],
        icon="💳 [PAYMENT PROCESSED]"
    )


def log_booking_event(booking: Booking):
    dates_str = (
        f"{booking.travel_date} to {booking.end_date} ({booking.nights} nights)"
        if booking.end_date
        else str(booking.travel_date)
    )
    print_banner_box(
        "BOOKING CONFIRMED & RESERVED (BACKEND EVENT)",
        [
            f"Booking Ref:    #{booking.id}",
            f"Category:       {booking.booking_type.upper()}",
            f"Sanctuary:      {booking.item_title}",
            f"Traveler:       {booking.traveler_name} ({booking.guests})",
            f"Email:          {booking.traveler_email}",
            f"Phone:          {booking.traveler_phone or 'N/A'}",
            f"Travel Dates:   {dates_str}",
            f"Total Fare:     {booking.total_price or '₹0'}",
            f"Status:         {booking.status.upper()}",
            f"Host Notice:    Reservation locked in database",
        ],
        icon="🏔️ [BOOKING CONFIRMED]"
    )


# --- Helper Functions ---

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_current_user_optional(
    authorization: Optional[str] = Header(default=None),
    db: Session = Depends(get_db),
) -> Optional[User]:
    if not authorization:
        return None
    token = authorization.replace("Bearer ", "").strip()
    payload = decode_token(token)
    if not payload:
        return None
    user = db.get(User, payload["sub"])
    return user


def get_current_user(
    user: Optional[User] = Depends(get_current_user_optional),
) -> User:
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required. Please log in.",
        )
    return user


def place_to_dict(place: Place) -> dict:
    return {
        "id": place.id,
        "name": place.name,
        "tagline": place.tagline,
        "region": place.region,
        "category": place.category,
        "price": place.price,
        "unit": place.unit,
        "rating": place.rating,
        "reviews": place.reviews,
        "altitude": place.altitude,
        "tags": json.loads(place.tags_json or "[]"),
        "image": place.image,
        "description": place.description,
        "host_name": place.host_name,
        "latitude": place.latitude,
        "longitude": place.longitude,
        "nearby_locations": json.loads(place.nearby_locations_json or "[]"),
        "stay_options": json.loads(place.stay_options_json or "[]"),
    }


def experience_to_dict(exp: Experience) -> dict:
    return {
        "id": exp.id,
        "title": exp.title,
        "region": exp.region,
        "location": exp.location,
        "category": exp.category,
        "duration": exp.duration,
        "difficulty": exp.difficulty,
        "price": exp.price,
        "unit": exp.unit,
        "guide": exp.guide,
        "rating": exp.rating,
        "reviews": exp.reviews,
        "image": exp.image,
        "description": exp.description,
        "inclusions": json.loads(exp.inclusions_json or "[]"),
    }


def local_to_dict(local: Local) -> dict:
    return {
        "id": local.id,
        "category": local.category,
        "region": local.region,
        "name": local.name,
        "location": local.location,
        "role": local.role,
        "lang": local.lang,
        "rating": local.rating,
        "reviews": local.reviews,
        "price": local.price,
        "unit": local.unit,
        "tags": json.loads(local.tags_json or "[]"),
        "image": local.image,
        "verified": local.verified,
        "certified": local.certified,
        "gradient": local.gradient,
        "bio": local.bio,
        "phone": local.phone,
        "email": local.email,
        "latitude": local.latitude,
        "longitude": local.longitude,
    }


def host_application_to_dict(app: HostApplication) -> dict:
    return {
        "id": app.id,
        "name": app.name,
        "email": app.email,
        "phone": app.phone,
        "region": app.region,
        "skill": app.skill,
        "bio": app.bio,
        "languages": app.languages,
        "avatar": app.avatar,
        "user_id": app.user_id,
        "property_name": app.property_name,
        "tagline": app.tagline,
        "category": app.category,
        "price": app.price,
        "unit": app.unit,
        "altitude": app.altitude,
        "tags": app.tags,
        "image": app.image,
        "description": app.description,
        "latitude": app.latitude,
        "longitude": app.longitude,
        "nearby_locations": json.loads(app.nearby_locations_json or "[]"),
        "stay_options": json.loads(app.stay_options_json or "[]"),
        "status": app.status,
        "admin_notes": app.admin_notes,
        "published_place_id": app.published_place_id,
        "created_at": app.created_at.isoformat() if app.created_at else None,
    }


# --- App Initialization ---

app = FastAPI(
    title="Pahadíly API",
    version="1.0.0",
    description="Full dynamic backend for Pahadíly — authentic Himalayan journeys, locals, stays, experiences and bookings.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def seed_database(db: Session):
    # Ensure Super Admin Account (Gulshan) exists and is up to date
    admin_user = db.scalar(select(User).where(User.email == "gulshany0001@gmail.com"))
    admin_h, admin_s = hash_password("Tgulshan@2")
    if not admin_user:
        db.add(User(
            email="gulshany0001@gmail.com",
            password_hash=admin_h,
            salt=admin_s,
            full_name="Gulshan (Owner & Admin)",
            role="admin",
            phone="+91 98160 00001",
            bio="Platform Owner & Master Administrator",
            is_active=True,
            is_verified=True,
        ))
        db.commit()
    else:
        admin_user.password_hash = admin_h
        admin_user.salt = admin_s
        admin_user.role = "admin"
        admin_user.is_active = True
        admin_user.is_verified = True
        db.commit()

    # Seed catalog data (genuine Himalayan valleys, stays, experiences and locals)
    seed_path = BASE_DIR / "seed_data.json"
    if seed_path.exists():
        try:
            data = json.loads(seed_path.read_text(encoding="utf-8"))

            # Places
            if db.scalar(select(Place.id).limit(1)) is None and "places" in data:
                for p in data["places"]:
                    db.add(Place(
                        id=p.get("id"),
                        name=p["name"],
                        tagline=p["tagline"],
                        region=p["region"],
                        category=p.get("category", "valley"),
                        price=p.get("price", "₹2,000"),
                        unit=p.get("unit", "/night"),
                        rating=float(p.get("rating", 4.8)),
                        reviews=int(p.get("reviews", 10)),
                        altitude=p.get("altitude", "1,800m"),
                        tags_json=json.dumps(p.get("tags", []), ensure_ascii=False),
                        image=p.get("image", "/images/destinations/tirthan-valley.jpg"),
                        description=p.get("description", ""),
                        host_name=p.get("host_name"),
                        latitude=p.get("latitude"),
                        longitude=p.get("longitude"),
                    ))
                db.commit()

            # Experiences
            if db.scalar(select(Experience.id).limit(1)) is None and "experiences" in data:
                for exp in data["experiences"]:
                    db.add(Experience(
                        id=exp.get("id"),
                        title=exp["title"],
                        region=exp["region"],
                        location=exp["location"],
                        category=exp.get("category", "nature"),
                        duration=exp.get("duration", "2–3 hours"),
                        difficulty=exp.get("difficulty", "Easy"),
                        price=exp.get("price", "₹500"),
                        unit=exp.get("unit", "per person"),
                        guide=exp.get("guide", "Local Host"),
                        rating=float(exp.get("rating", 4.8)),
                        reviews=int(exp.get("reviews", 10)),
                        image=exp.get("image", "/images/experiences/forest-walk.jpg"),
                        description=exp.get("description", ""),
                        inclusions_json=json.dumps(exp.get("inclusions", []), ensure_ascii=False),
                    ))
                db.commit()

            # Locals
            if db.scalar(select(Local.id).limit(1)) is None and "locals" in data:
                for item in data["locals"]:
                    db.add(Local(
                        id=item.get("id"),
                        category=item["category"],
                        region=item["region"],
                        name=item["name"],
                        location=item["location"],
                        role=item["role"],
                        lang=item["lang"],
                        rating=float(item.get("rating", 4.8)),
                        reviews=int(item.get("reviews", 10)),
                        price=item.get("price", "₹600"),
                        unit=item.get("unit", "/day"),
                        tags_json=json.dumps(item.get("tags", []), ensure_ascii=False),
                        image=item.get("image"),
                        verified=bool(item.get("verified", True)),
                        certified=bool(item.get("certified", False)),
                        gradient=item.get("gradient"),
                        bio=item.get("bio"),
                        phone=item.get("phone"),
                        email=item.get("email"),
                        latitude=item.get("latitude"),
                        longitude=item.get("longitude"),
                    ))
                db.commit()

        except Exception as e:
            print("Seed warning:", e)


@app.on_event("startup")
def startup():
    Base.metadata.create_all(bind=engine)
    # Dynamic SQLite migration for new columns on existing database
    with engine.connect() as conn:
        for tbl, col, col_type, default_val in [
            ("users", "is_active", "BOOLEAN", "1"),
            ("users", "is_verified", "BOOLEAN", "0"),
            ("bookings", "payment_method", "VARCHAR(50)", "'upi'"),
            ("bookings", "payment_status", "VARCHAR(30)", "'paid'"),
            ("bookings", "payment_id", "VARCHAR(100)", "NULL"),
            ("bookings", "transaction_ref", "VARCHAR(100)", "NULL"),
            ("bookings", "nights", "INTEGER", "1"),
            ("places", "nearby_locations_json", "TEXT", "'[]'"),
            ("places", "stay_options_json", "TEXT", "'[]'"),
            ("host_applications", "skill", "VARCHAR(120)", "'Host'"),
            ("host_applications", "languages", "VARCHAR(150)", "NULL"),
            ("host_applications", "avatar", "VARCHAR(300)", "NULL"),
            ("host_applications", "user_id", "INTEGER", "NULL"),
            ("host_applications", "property_name", "VARCHAR(150)", "NULL"),
            ("host_applications", "tagline", "VARCHAR(255)", "NULL"),
            ("host_applications", "category", "VARCHAR(50)", "NULL"),
            ("host_applications", "price", "VARCHAR(50)", "'₹2,500'"),
            ("host_applications", "unit", "VARCHAR(30)", "'/night'"),
            ("host_applications", "altitude", "VARCHAR(50)", "'1,800m'"),
            ("host_applications", "tags", "VARCHAR(255)", "NULL"),
            ("host_applications", "image", "VARCHAR(300)", "NULL"),
            ("host_applications", "description", "TEXT", "NULL"),
            ("host_applications", "latitude", "FLOAT", "NULL"),
            ("host_applications", "longitude", "FLOAT", "NULL"),
            ("host_applications", "nearby_locations_json", "TEXT", "'[]'"),
            ("host_applications", "stay_options_json", "TEXT", "'[]'"),
            ("host_applications", "admin_notes", "TEXT", "NULL"),
            ("host_applications", "published_place_id", "INTEGER", "NULL"),
        ]:
            try:
                conn.execute(text(f"ALTER TABLE {tbl} ADD COLUMN {col} {col_type} DEFAULT {default_val}"))
                conn.commit()
            except Exception:
                pass

    with SessionLocal() as db:
        seed_database(db)


# --- System & Health ---

@app.get("/", tags=["system"])
def root():
    return {
        "name": "Pahadíly API",
        "version": "1.0.0",
        "status": "online",
        "tagline": "Rare Places. Real People. Lasting Stories."
    }


@app.get("/healthz", tags=["system"])
def healthz():
    return {"status": "ok"}


@app.get("/api/stats", tags=["system"])
def get_stats(db: Session = Depends(get_db)):
    places = list(db.scalars(select(Place)).all())
    experiences = list(db.scalars(select(Experience)).all())
    locals_list = list(db.scalars(select(Local)).all())
    bookings = list(db.scalars(select(Booking)).all())
    users = list(db.scalars(select(User)).all())

    # Revenue calculation helper
    def parse_amount(price_str: Optional[str]) -> int:
        if not price_str:
            return 0
        cleaned = "".join(ch for ch in str(price_str) if ch.isdigit())
        return int(cleaned) if cleaned else 0

    total_rev = sum(parse_amount(b.total_price) for b in bookings if b.status != "cancelled")
    paid_rev = sum(parse_amount(b.total_price) for b in bookings if b.payment_status == "paid" and b.status != "cancelled")
    pending_rev = sum(parse_amount(b.total_price) for b in bookings if b.payment_status == "pending" and b.status != "cancelled")

    return {
        "places": len(places),
        "experiences": len(experiences),
        "locals": len(locals_list),
        "bookings": len(bookings),
        "users": len(users),
        "total_revenue": f"₹{total_rev:,}",
        "total_revenue_raw": total_rev,
        "paid_revenue": f"₹{paid_rev:,}",
        "pending_revenue": f"₹{pending_rev:,}",
        "bookings_confirmed": sum(1 for b in bookings if b.status == "confirmed"),
        "bookings_pending": sum(1 for b in bookings if b.status == "pending"),
        "bookings_completed": sum(1 for b in bookings if b.status == "completed"),
        "bookings_cancelled": sum(1 for b in bookings if b.status == "cancelled"),
        "users_travelers": sum(1 for u in users if u.role == "traveler"),
        "users_hosts": sum(1 for u in users if u.role == "host"),
        "users_admins": sum(1 for u in users if u.role == "admin"),
    }


# --- Auth Endpoints ---

@app.post("/api/auth/signup", response_model=AuthResponse, status_code=201, tags=["auth"])
def signup(payload: UserSignup, db: Session = Depends(get_db)):
    existing = db.scalar(select(User).where(User.email == payload.email.lower()))
    if existing:
        raise HTTPException(status_code=400, detail="Account with this email already exists")

    h, s = hash_password(payload.password)
    user = User(
        email=payload.email.lower(),
        password_hash=h,
        salt=s,
        full_name=payload.full_name,
        phone=payload.phone,
        role=payload.role if payload.role in ["traveler", "host", "admin"] else "traveler"
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # 1. High-visibility console log for backend
    log_new_user_event(user)

    # 2. Dispatch welcome email to user & record notification
    try:
        welcome_res = send_welcome_email({
            "full_name": user.full_name,
            "email": user.email,
            "role": user.role,
        })
        email_record = EmailNotification(
            recipient_email=user.email,
            recipient_name=user.full_name,
            subject=f"Welcome to Pahadíly, {user.full_name}!",
            email_type="welcome_user",
            status=welcome_res.get("status", "sent"),
            preview=f"Welcome email dispatched for newly registered {user.role} #{user.id}",
        )
        db.add(email_record)
        db.commit()
    except Exception as e:
        _safe_print(f"[WELCOME EMAIL NOTICE] Could not record notification: {e}")

    token = create_token(user)
    return AuthResponse(
        token=token,
        user=UserOut.model_validate(user),
        message="Welcome to Pahadíly! Your account is created."
    )


@app.post("/api/auth/send-registration-otp", tags=["auth"])
def send_registration_otp(payload: SendRegistrationOtpRequest, db: Session = Depends(get_db)):
    existing = db.scalar(select(User).where(User.email == payload.email.lower()))
    if existing:
        raise HTTPException(status_code=400, detail="An account with this email already exists. Please log in.")

    # Generate 6-digit cryptographically secure OTP
    otp_code = str(secrets.randbelow(900000) + 100000)
    h, s = hash_password(payload.password)

    # Invalidate older unused OTPs for this email
    older_otps = list(db.scalars(select(RegistrationOtp).where(
        RegistrationOtp.email == payload.email.lower(),
        RegistrationOtp.is_used == False,
    )).all())
    for o in older_otps:
        o.is_used = True

    otp_record = RegistrationOtp(
        email=payload.email.lower(),
        otp_code=otp_code,
        full_name=payload.full_name,
        phone=payload.phone,
        role=payload.role if payload.role in ["traveler", "host", "admin"] else "traveler",
        password_hash=h,
        salt=s,
        is_used=False,
    )
    db.add(otp_record)
    db.commit()

    # Print high-visibility banner in console
    print_banner_box(
        "REGISTRATION OTP DISPATCHED (VERIFICATION CODE)",
        [
            f"Recipient:  {payload.email.lower()}",
            f"Name:       {payload.full_name}",
            f"Role:       {payload.role.upper()}",
            f"OTP CODE:   {otp_code}",
            f"Valid For:  15 Minutes",
            f"Notice:     Use this 6-digit OTP code to complete registration",
        ],
        icon="🔐 [OTP AUTHENTICATION]"
    )

    return {
        "message": f"Verification code sent to {payload.email.lower()}!",
        "email": payload.email.lower(),
        "otp_preview": otp_code,
    }


@app.post("/api/auth/verify-registration-otp", response_model=AuthResponse, tags=["auth"])
def verify_registration_otp(payload: VerifyRegistrationOtpRequest, db: Session = Depends(get_db)):
    stmt = (
        select(RegistrationOtp)
        .where(
            RegistrationOtp.email == payload.email.lower(),
            RegistrationOtp.is_used == False,
        )
        .order_by(RegistrationOtp.created_at.desc())
    )
    otp_record = db.scalar(stmt)
    if not otp_record:
        raise HTTPException(
            status_code=400,
            detail="No pending verification request found for this email. Please request a new code.",
        )

    if otp_record.otp_code.strip() != payload.otp_code.strip():
        raise HTTPException(
            status_code=400,
            detail="Invalid verification code. Please check and try again.",
        )

    # Check if user already exists
    existing = db.scalar(select(User).where(User.email == payload.email.lower()))
    if existing:
        otp_record.is_used = True
        db.commit()
        token = create_token(existing)
        return AuthResponse(
            token=token,
            user=UserOut.model_validate(existing),
            message="Email verified! Logged in successfully.",
        )

    # Mark OTP as used
    otp_record.is_used = True

    user = User(
        email=otp_record.email,
        password_hash=otp_record.password_hash,
        salt=otp_record.salt,
        full_name=otp_record.full_name,
        phone=otp_record.phone,
        role=otp_record.role,
        is_active=True,
        is_verified=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    log_new_user_event(user)

    try:
        welcome_res = send_welcome_email({
            "full_name": user.full_name,
            "email": user.email,
            "role": user.role,
        })
        email_record = EmailNotification(
            recipient_email=user.email,
            recipient_name=user.full_name,
            subject=f"Welcome to Pahadíly, {user.full_name}!",
            email_type="welcome_user",
            status=welcome_res.get("status", "sent"),
            preview=f"Welcome email dispatched for newly registered {user.role} #{user.id}",
        )
        db.add(email_record)
        db.commit()
    except Exception as e:
        _safe_print(f"[WELCOME EMAIL NOTICE] Could not record notification: {e}")

    token = create_token(user)
    return AuthResponse(
        token=token,
        user=UserOut.model_validate(user),
        message="Account verified and registered successfully! Welcome to Pahadíly.",
    )


@app.post("/api/auth/login", response_model=AuthResponse, tags=["auth"])
def login(payload: UserLogin, db: Session = Depends(get_db)):
    user = db.scalar(select(User).where(User.email == payload.email.lower()))
    if not user or not verify_password(payload.password, user.salt, user.password_hash):
        _safe_print(f"[AUTH FAILED] Failed login attempt for email: {payload.email.lower()}")
        raise HTTPException(status_code=401, detail="Invalid email or password")

    _safe_print(f"\n[USER LOGIN SUCCESS] {user.full_name} ({user.email}) logged in successfully. Role: {user.role}")
    token = create_token(user)
    return AuthResponse(
        token=token,
        user=UserOut.model_validate(user),
        message="Login successful"
    )


@app.post("/api/auth/demo-login", response_model=AuthResponse, tags=["auth"])
def demo_login(role: str = Query(default="traveler"), db: Session = Depends(get_db)):
    raise HTTPException(
        status_code=400,
        detail="Demo logins have been replaced with real user authentication. Please register a real account or log in with your credentials."
    )


@app.get("/api/auth/me", response_model=UserOut, tags=["auth"])
def get_me(current_user: User = Depends(get_current_user)):
    return UserOut.model_validate(current_user)


# --- Places / Stays Endpoints (Dynamic) ---

@app.get("/api/places", response_model=list[PlaceOut], tags=["places"])
def list_places(
    region: Optional[str] = None,
    category: Optional[str] = None,
    q: Optional[str] = None,
    db: Session = Depends(get_db),
):
    stmt = select(Place)
    if region and region != "all" and isinstance(region, str):
        stmt = stmt.where(Place.region == region.lower())
    if category and category != "all" and isinstance(category, str):
        stmt = stmt.where(Place.category == category.lower())

    places = list(db.scalars(stmt).all())
    if q and isinstance(q, str):
        needle = q.strip().lower()
        places = [
            p for p in places
            if needle in p.name.lower()
            or needle in p.tagline.lower()
            or needle in p.region.lower()
            or needle in p.description.lower()
            or any(needle in tag.lower() for tag in json.loads(p.tags_json or "[]"))
        ]
    return [place_to_dict(p) for p in places]


@app.get("/api/places/{place_id}", response_model=PlaceOut, tags=["places"])
def get_place(place_id: int, db: Session = Depends(get_db)):
    place = db.get(Place, place_id)
    if not place:
        raise HTTPException(status_code=404, detail="Place not found")
    return place_to_dict(place)


@app.post("/api/places/{place_id}/rate", response_model=PlaceOut, tags=["places"])
@app.post("/api/places/{place_id}/reviews", response_model=PlaceOut, tags=["places"])
def rate_place(
    place_id: int,
    payload: PlaceReviewCreate,
    db: Session = Depends(get_db),
):
    place = db.get(Place, place_id)
    if not place:
        raise HTTPException(status_code=404, detail="Place not found")

    review = PlaceReview(
        place_id=place_id,
        user_name=payload.user_name or "Himalayan Traveler",
        rating=float(payload.rating),
        comment=payload.comment or "",
    )
    db.add(review)
    db.commit()

    # Recalculate live dynamic rating & review count
    reviews = list(db.scalars(select(PlaceReview).where(PlaceReview.place_id == place_id)).all())
    if reviews:
        total_rating = sum(r.rating for r in reviews)
        place.rating = round(total_rating / len(reviews), 1)
        place.reviews = len(reviews)
    db.commit()
    db.refresh(place)
    return place_to_dict(place)


@app.get("/api/places/{place_id}/reviews", response_model=list[PlaceReviewOut], tags=["places"])
def list_place_reviews(place_id: int, db: Session = Depends(get_db)):
    reviews = list(
        db.scalars(
            select(PlaceReview)
            .where(PlaceReview.place_id == place_id)
            .order_by(PlaceReview.created_at.desc())
        ).all()
    )
    return reviews


@app.post("/api/places", response_model=PlaceOut, status_code=201, tags=["places"])
def create_place(
    payload: PlaceCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    place = Place(
        name=payload.name,
        tagline=payload.tagline,
        region=payload.region.lower(),
        category=payload.category.lower(),
        price=payload.price,
        unit=payload.unit,
        rating=payload.rating,
        reviews=payload.reviews,
        altitude=payload.altitude,
        tags_json=json.dumps(payload.tags, ensure_ascii=False),
        image=payload.image or "/images/destinations/tirthan-valley.jpg",
        description=payload.description,
        host_name=payload.host_name or current_user.full_name,
        latitude=payload.latitude,
        longitude=payload.longitude,
    )
    db.add(place)
    db.commit()
    db.refresh(place)
    return place_to_dict(place)


@app.put("/api/places/{place_id}", response_model=PlaceOut, tags=["places"])
def update_place(
    place_id: int,
    payload: PlaceCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    place = db.get(Place, place_id)
    if not place:
        raise HTTPException(status_code=404, detail="Place not found")

    place.name = payload.name
    place.tagline = payload.tagline
    place.region = payload.region.lower()
    place.category = payload.category.lower()
    place.price = payload.price
    place.unit = payload.unit
    place.rating = payload.rating
    place.reviews = payload.reviews
    place.altitude = payload.altitude
    place.tags_json = json.dumps(payload.tags, ensure_ascii=False)
    if payload.image:
        place.image = payload.image
    place.description = payload.description
    if payload.host_name:
        place.host_name = payload.host_name
    place.latitude = payload.latitude
    place.longitude = payload.longitude

    db.commit()
    db.refresh(place)
    return place_to_dict(place)


@app.delete("/api/places/{place_id}", tags=["places"])
def delete_place(
    place_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    place = db.get(Place, place_id)
    if not place:
        raise HTTPException(status_code=404, detail="Place not found")
    db.delete(place)
    db.commit()
    return {"message": "Place deleted successfully"}


@app.patch("/api/places/{place_id}/dynamic-details", response_model=PlaceOut, tags=["places"])
def update_place_dynamic_details(
    place_id: int,
    payload: PlaceDynamicDetailsUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update nearby locations and stay options for a place (editable from admin)."""
    place = db.get(Place, place_id)
    if not place:
        raise HTTPException(status_code=404, detail="Place not found")

    if payload.nearby_locations is not None:
        place.nearby_locations_json = json.dumps(payload.nearby_locations, ensure_ascii=False)
    if payload.stay_options is not None:
        place.stay_options_json = json.dumps(payload.stay_options, ensure_ascii=False)

    db.commit()
    db.refresh(place)
    return place_to_dict(place)



@app.get("/api/experiences", response_model=list[ExperienceOut], tags=["experiences"])
def list_experiences(
    region: Optional[str] = None,
    category: Optional[str] = None,
    q: Optional[str] = None,
    db: Session = Depends(get_db),
):
    stmt = select(Experience)
    if region and region != "all" and isinstance(region, str):
        stmt = stmt.where(Experience.region == region.lower())
    if category and category != "all" and isinstance(category, str):
        stmt = stmt.where(Experience.category == category.lower())

    exps = list(db.scalars(stmt).all())
    if q and isinstance(q, str):
        needle = q.strip().lower()
        exps = [
            e for e in exps
            if needle in e.title.lower()
            or needle in e.location.lower()
            or needle in e.guide.lower()
            or needle in e.description.lower()
            or any(needle in inc.lower() for inc in json.loads(e.inclusions_json or "[]"))
        ]
    return [experience_to_dict(e) for e in exps]


@app.get("/api/experiences/{exp_id}", response_model=ExperienceOut, tags=["experiences"])
def get_experience(exp_id: int, db: Session = Depends(get_db)):
    exp = db.get(Experience, exp_id)
    if not exp:
        raise HTTPException(status_code=404, detail="Experience not found")
    return experience_to_dict(exp)


@app.post("/api/experiences", response_model=ExperienceOut, status_code=201, tags=["experiences"])
def create_experience(
    payload: ExperienceCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    exp = Experience(
        title=payload.title,
        region=payload.region.lower(),
        location=payload.location,
        category=payload.category.lower(),
        duration=payload.duration,
        difficulty=payload.difficulty,
        price=payload.price,
        unit=payload.unit,
        guide=payload.guide or f"With {current_user.full_name}",
        rating=payload.rating,
        reviews=payload.reviews,
        image=payload.image or "/images/experiences/forest-walk.jpg",
        description=payload.description,
        inclusions_json=json.dumps(payload.inclusions, ensure_ascii=False),
    )
    db.add(exp)
    db.commit()
    db.refresh(exp)
    return experience_to_dict(exp)


@app.put("/api/experiences/{exp_id}", response_model=ExperienceOut, tags=["experiences"])
def update_experience(
    exp_id: int,
    payload: ExperienceCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    exp = db.get(Experience, exp_id)
    if not exp:
        raise HTTPException(status_code=404, detail="Experience not found")

    exp.title = payload.title
    exp.region = payload.region.lower()
    exp.location = payload.location
    exp.category = payload.category.lower()
    exp.duration = payload.duration
    exp.difficulty = payload.difficulty
    exp.price = payload.price
    exp.unit = payload.unit
    exp.guide = payload.guide
    exp.rating = payload.rating
    exp.reviews = payload.reviews
    if payload.image:
        exp.image = payload.image
    exp.description = payload.description
    exp.inclusions_json = json.dumps(payload.inclusions, ensure_ascii=False)

    db.commit()
    db.refresh(exp)
    return experience_to_dict(exp)


@app.delete("/api/experiences/{exp_id}", tags=["experiences"])
def delete_experience(
    exp_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    exp = db.get(Experience, exp_id)
    if not exp:
        raise HTTPException(status_code=404, detail="Experience not found")
    db.delete(exp)
    db.commit()
    return {"message": "Experience deleted successfully"}


# --- Locals / Persons Endpoints (Dynamic) ---

@app.get("/api/locals", response_model=list[LocalOut], tags=["locals"])
def list_locals(
    category: Optional[str] = None,
    region: Optional[str] = None,
    q: Optional[str] = None,
    db: Session = Depends(get_db),
):
    statement = select(Local)
    if category and category != "all" and isinstance(category, str):
        statement = statement.where(Local.category == category.lower())
    if region and region != "all" and isinstance(region, str):
        statement = statement.where(Local.region == region.lower())

    locals_list = list(db.scalars(statement).all())
    if q and isinstance(q, str):
        needle = q.strip().lower()
        locals_list = [
            local
            for local in locals_list
            if needle in local.name.lower()
            or needle in local.location.lower()
            or needle in local.role.lower()
            or any(needle in tag.lower() for tag in json.loads(local.tags_json or "[]"))
        ]

    return [local_to_dict(local) for local in locals_list]


@app.get("/api/locals/{local_id}", response_model=LocalOut, tags=["locals"])
def get_local(local_id: int, db: Session = Depends(get_db)):
    local = db.get(Local, local_id)
    if not local:
        raise HTTPException(status_code=404, detail="Local person not found")
    return local_to_dict(local)


@app.post("/api/locals", response_model=LocalOut, status_code=201, tags=["locals"])
def create_local(
    payload: LocalCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    local = Local(
        category=payload.category.lower(),
        region=payload.region.lower(),
        name=payload.name,
        location=payload.location,
        role=payload.role,
        lang=payload.lang,
        rating=payload.rating,
        reviews=payload.reviews,
        price=payload.price,
        unit=payload.unit,
        tags_json=json.dumps(payload.tags, ensure_ascii=False),
        image=payload.image,
        verified=payload.verified,
        certified=payload.certified,
        gradient=payload.gradient or "linear-gradient(135deg, #174231, #78caa0)",
        bio=payload.bio,
        phone=payload.phone,
        email=payload.email,
        latitude=payload.latitude,
        longitude=payload.longitude,
    )
    db.add(local)
    db.commit()
    db.refresh(local)
    return local_to_dict(local)


@app.put("/api/locals/{local_id}", response_model=LocalOut, tags=["locals"])
def update_local(
    local_id: int,
    payload: LocalCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    local = db.get(Local, local_id)
    if not local:
        raise HTTPException(status_code=404, detail="Local not found")

    local.category = payload.category.lower()
    local.region = payload.region.lower()
    local.name = payload.name
    local.location = payload.location
    local.role = payload.role
    local.lang = payload.lang
    local.rating = payload.rating
    local.reviews = payload.reviews
    local.price = payload.price
    local.unit = payload.unit
    local.tags_json = json.dumps(payload.tags, ensure_ascii=False)
    if payload.image is not None:
        local.image = payload.image
    local.verified = payload.verified
    local.certified = payload.certified
    if payload.gradient:
        local.gradient = payload.gradient
    local.bio = payload.bio
    local.phone = payload.phone
    local.email = payload.email
    local.latitude = payload.latitude
    local.longitude = payload.longitude

    db.commit()
    db.refresh(local)
    return local_to_dict(local)


@app.delete("/api/locals/{local_id}", tags=["locals"])
def delete_local(
    local_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    local = db.get(Local, local_id)
    if not local:
        raise HTTPException(status_code=404, detail="Local not found")
    db.delete(local)
    db.commit()
    return {"message": "Local person deleted successfully"}


# --- User & Account Management Endpoints (Admin / Host) ---

@app.get("/api/users", response_model=list[UserOut], tags=["users"])
def list_users(
    role: Optional[str] = None,
    q: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role not in ["admin", "host"]:
        raise HTTPException(status_code=403, detail="Admin or Host access required")

    stmt = select(User).order_by(User.created_at.desc())
    if role and role != "all":
        stmt = stmt.where(User.role == role)
    users = list(db.scalars(stmt).all())

    if q:
        needle = q.strip().lower()
        users = [
            u for u in users
            if needle in u.full_name.lower()
            or needle in u.email.lower()
            or (u.phone and needle in u.phone)
        ]

    res = []
    for u in users:
        b_count = len(list(db.scalars(select(Booking).where(
            (Booking.user_id == u.id) | (Booking.traveler_email == u.email.lower())
        )).all()))
        res.append({
            "id": u.id,
            "email": u.email,
            "full_name": u.full_name,
            "phone": u.phone,
            "role": u.role,
            "avatar": u.avatar,
            "bio": u.bio,
            "is_active": u.is_active,
            "is_verified": u.is_verified,
            "created_at": u.created_at,
            "bookings_count": b_count,
        })
    return res


@app.get("/api/users/{user_id}", response_model=UserOut, tags=["users"])
def get_user_details(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role not in ["admin", "host"] and current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Unauthorized")

    u = db.get(User, user_id)
    if not u:
        raise HTTPException(status_code=404, detail="User not found")
    b_count = len(list(db.scalars(select(Booking).where(
        (Booking.user_id == u.id) | (Booking.traveler_email == u.email.lower())
    )).all()))
    return {
        "id": u.id,
        "email": u.email,
        "full_name": u.full_name,
        "phone": u.phone,
        "role": u.role,
        "avatar": u.avatar,
        "bio": u.bio,
        "is_active": u.is_active,
        "is_verified": u.is_verified,
        "created_at": u.created_at,
        "bookings_count": b_count,
    }


@app.patch("/api/users/{user_id}/role", response_model=UserOut, tags=["users"])
def update_user_role(
    user_id: int,
    payload: UserRoleUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin privileges required to change user roles")

    target_user = db.get(User, user_id)
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")
    target_user.role = payload.role
    db.commit()
    db.refresh(target_user)
    return UserOut.model_validate(target_user)


@app.patch("/api/users/{user_id}/status", response_model=UserOut, tags=["users"])
def update_user_status(
    user_id: int,
    payload: UserStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role not in ["admin", "host"]:
        raise HTTPException(status_code=403, detail="Unauthorized")

    target_user = db.get(User, user_id)
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")
    if payload.is_active is not None:
        target_user.is_active = payload.is_active
    if payload.is_verified is not None:
        target_user.is_verified = payload.is_verified
    db.commit()
    db.refresh(target_user)
    return UserOut.model_validate(target_user)


@app.delete("/api/users/{user_id}", tags=["users"])
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin privileges required to delete accounts")
    if user_id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot delete your own active admin account")

    target_user = db.get(User, user_id)
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")
    db.delete(target_user)
    db.commit()
    return {"message": "User account deleted successfully"}


# --- Unified Bookings & Payment Endpoints ---

@app.post("/api/bookings", response_model=BookingOut, status_code=201, tags=["bookings"])
def create_booking(
    payload: BookingCreate,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional),
):
    user_id = current_user.id if current_user else None

    # Generate unique payment ID and transaction reference if not present
    pay_id = payload.payment_id or f"PHD-PAY-{secrets.token_hex(4).upper()}"
    txn_ref = payload.transaction_ref or f"UPI-{int(time.time())}-{secrets.randbelow(9999):04d}"

    booking = Booking(
        booking_type=payload.booking_type,
        item_id=payload.item_id,
        item_title=payload.item_title,
        item_image=payload.item_image,
        user_id=user_id,
        traveler_name=payload.traveler_name,
        traveler_email=payload.traveler_email.lower(),
        traveler_phone=payload.traveler_phone,
        travel_date=payload.travel_date,
        end_date=payload.end_date,
        guests=payload.guests,
        nights=payload.nights or 1,
        total_price=payload.total_price,
        payment_method=payload.payment_method or "upi",
        payment_status=payload.payment_status or "paid",
        payment_id=pay_id,
        transaction_ref=txn_ref,
        message=payload.message,
        status="confirmed" if payload.payment_status == "paid" else "pending",
    )
    db.add(booking)
    db.commit()
    db.refresh(booking)

    # 1. High-visibility backend payment logging
    log_payment_event(booking)

    # 2. High-visibility backend booking confirmation logging
    log_booking_event(booking)

    # 3. Automated booking confirmation voucher email dispatch
    try:
        email_res = send_booking_confirmation_email({
            "id": booking.id,
            "item_title": booking.item_title,
            "traveler_name": booking.traveler_name,
            "traveler_email": booking.traveler_email,
            "traveler_phone": booking.traveler_phone,
            "travel_date": booking.travel_date,
            "end_date": booking.end_date,
            "nights": booking.nights,
            "guests": booking.guests,
            "total_price": booking.total_price,
            "payment_method": booking.payment_method,
            "payment_status": booking.payment_status,
            "payment_id": booking.payment_id,
            "transaction_ref": booking.transaction_ref,
        })
        email_record = EmailNotification(
            recipient_email=booking.traveler_email,
            recipient_name=booking.traveler_name,
            subject=f"Booking Confirmed: {booking.item_title} | Pahadíly Voucher #{booking.id}",
            email_type="booking_confirmation",
            booking_id=booking.id,
            status=email_res.get("status", "sent"),
            preview=f"Voucher #{booking.id} for {booking.item_title} ({booking.total_price} via {booking.payment_method})",
        )
        db.add(email_record)
        db.commit()
    except Exception as e:
        _safe_print(f"[BOOKING EMAIL NOTICE] Could not dispatch email voucher: {e}")

    return booking


@app.get("/api/bookings", response_model=list[BookingOut], tags=["bookings"])
def list_all_bookings(
    status_filter: Optional[str] = None,
    payment_status: Optional[str] = None,
    q: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    stmt = select(Booking).order_by(Booking.created_at.desc())
    if status_filter and status_filter != "all" and isinstance(status_filter, str):
        stmt = stmt.where(Booking.status == status_filter)
    if payment_status and payment_status != "all" and isinstance(payment_status, str):
        stmt = stmt.where(Booking.payment_status == payment_status)

    bookings = list(db.scalars(stmt).all())
    if q:
        needle = q.strip().lower()
        bookings = [
            b for b in bookings
            if needle in b.traveler_name.lower()
            or needle in b.traveler_email.lower()
            or needle in b.item_title.lower()
            or (b.payment_id and needle in b.payment_id.lower())
            or (b.transaction_ref and needle in b.transaction_ref.lower())
        ]
    return bookings


@app.get("/api/bookings/my", response_model=list[BookingOut], tags=["bookings"])
def list_my_bookings(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    stmt = select(Booking).where(
        (Booking.user_id == current_user.id) | (Booking.traveler_email == current_user.email.lower())
    ).order_by(Booking.created_at.desc())
    return list(db.scalars(stmt).all())


@app.patch("/api/bookings/{booking_id}/status", response_model=BookingOut, tags=["bookings"])
def update_booking_status(
    booking_id: int,
    new_status: str = Query(..., pattern="^(pending|confirmed|completed|cancelled)$"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    booking = db.get(Booking, booking_id)
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    if current_user.role == "traveler" and booking.user_id != current_user.id and booking.traveler_email != current_user.email:
        raise HTTPException(status_code=403, detail="Not authorized to update this booking")

    booking.status = new_status
    if new_status == "cancelled" and booking.payment_status == "paid":
        booking.payment_status = "refunded"

    db.commit()
    db.refresh(booking)
    return booking


@app.patch("/api/bookings/{booking_id}/payment", response_model=BookingOut, tags=["bookings"])
def update_booking_payment(
    booking_id: int,
    payload: PaymentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role not in ["admin", "host"]:
        raise HTTPException(status_code=403, detail="Unauthorized")

    booking = db.get(Booking, booking_id)
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    was_pending = (booking.payment_status != "paid")
    booking.payment_status = payload.payment_status
    if payload.payment_method:
        booking.payment_method = payload.payment_method
    if payload.transaction_ref:
        booking.transaction_ref = payload.transaction_ref

    if payload.payment_status == "paid" and booking.status == "pending":
        booking.status = "confirmed"
    elif payload.payment_status == "refunded":
        booking.status = "cancelled"

    db.commit()
    db.refresh(booking)

    # If status transitioned to paid, log backend payment event & dispatch confirmation voucher
    if payload.payment_status == "paid" and was_pending:
        log_payment_event(booking)
        log_booking_event(booking)
        try:
            email_res = send_booking_confirmation_email({
                "id": booking.id,
                "item_title": booking.item_title,
                "traveler_name": booking.traveler_name,
                "traveler_email": booking.traveler_email,
                "traveler_phone": booking.traveler_phone,
                "travel_date": booking.travel_date,
                "end_date": booking.end_date,
                "nights": booking.nights,
                "guests": booking.guests,
                "total_price": booking.total_price,
                "payment_method": booking.payment_method,
                "payment_status": booking.payment_status,
                "payment_id": booking.payment_id,
                "transaction_ref": booking.transaction_ref,
            })
            email_record = EmailNotification(
                recipient_email=booking.traveler_email,
                recipient_name=booking.traveler_name,
                subject=f"Booking Confirmed: {booking.item_title} | Pahadíly Voucher #{booking.id}",
                email_type="booking_confirmation",
                booking_id=booking.id,
                status=email_res.get("status", "sent"),
                preview=f"Payment settlement confirmed for Voucher #{booking.id}",
            )
            db.add(email_record)
            db.commit()
        except Exception as e:
            _safe_print(f"[BOOKING EMAIL NOTICE] Could not dispatch voucher: {e}")

    return booking


@app.delete("/api/bookings/{booking_id}", tags=["bookings"])
def delete_booking(
    booking_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role not in ["admin", "host"]:
        raise HTTPException(status_code=403, detail="Unauthorized")

    booking = db.get(Booking, booking_id)
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    db.delete(booking)
    db.commit()
    return {"message": "Booking removed successfully"}


# --- Host Applications ---

@app.post("/api/host-applications", status_code=201, tags=["hosts"])
def create_host_application(
    payload: HostApplicationCreate,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional),
):
    data = payload.model_dump()
    nearby = data.pop("nearby_locations", None) or []
    stay_opts = data.pop("stay_options", None) or []

    application = HostApplication(**data)
    if current_user and not application.user_id:
        application.user_id = current_user.id
        if not application.email and current_user.email:
            application.email = current_user.email

    application.nearby_locations_json = json.dumps(nearby, ensure_ascii=False)
    application.stay_options_json = json.dumps(stay_opts, ensure_ascii=False)
    application.status = "pending"

    db.add(application)
    db.commit()
    db.refresh(application)
    return {
        "id": application.id,
        "status": application.status,
        "message": "Host & Location details submitted successfully! Your listing is now pending administrator review.",
        "application": host_application_to_dict(application),
    }


@app.get("/api/host-applications", tags=["hosts"])
def list_host_applications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    stmt = select(HostApplication).order_by(HostApplication.created_at.desc())
    if current_user.role != "admin":
        stmt = stmt.where(
            (HostApplication.user_id == current_user.id) |
            (HostApplication.email == current_user.email.lower())
        )
    apps = list(db.scalars(stmt).all())
    return [host_application_to_dict(a) for a in apps]


@app.get("/api/host-applications/my-submissions", tags=["hosts"])
def get_my_host_submissions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    stmt = select(HostApplication).where(
        (HostApplication.user_id == current_user.id) |
        (HostApplication.email == current_user.email.lower())
    ).order_by(HostApplication.created_at.desc())
    apps = list(db.scalars(stmt).all())
    return [host_application_to_dict(a) for a in apps]


@app.patch("/api/host-applications/{app_id}/status", tags=["hosts"])
def update_host_application_status(
    app_id: int,
    status_val: str = Query(..., pattern="^(pending|approved|rejected)$"),
    admin_notes: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Administrator privileges required to review host applications.")

    app_obj = db.get(HostApplication, app_id)
    if not app_obj:
        raise HTTPException(status_code=404, detail="Application not found")

    app_obj.status = status_val
    if admin_notes is not None:
        app_obj.admin_notes = admin_notes

    published_id = app_obj.published_place_id

    # When approved:
    if status_val == "approved":
        # 1. Upgrade user role if matching account exists
        matching_user = None
        if app_obj.user_id:
            matching_user = db.get(User, app_obj.user_id)
        if not matching_user and app_obj.email:
            matching_user = db.scalar(select(User).where(User.email == app_obj.email.lower()))

        if matching_user:
            matching_user.role = "host"
            matching_user.is_verified = True

        # 2. If property_name was provided and not published yet, publish it as a live Place!
        if app_obj.property_name and not app_obj.published_place_id:
            tags_list = [t.strip() for t in (app_obj.tags or "Mountain Sanctuary, Handcrafted, Local Meals").split(",") if t.strip()]
            new_place = Place(
                name=app_obj.property_name,
                tagline=app_obj.tagline or f"Authentic sanctuary hosted by {app_obj.name}",
                region=(app_obj.region or "himachal").lower().replace(" ", "-"),
                category=app_obj.category or "Homestay",
                price=app_obj.price or "₹2,500",
                unit=app_obj.unit or "/night",
                rating=5.0,
                reviews=1,
                altitude=app_obj.altitude or "1,800m",
                tags_json=json.dumps(tags_list, ensure_ascii=False),
                image=app_obj.image or "/images/destinations/tirthan-valley.jpg",
                description=app_obj.description or f"Welcome to {app_obj.property_name}. Experience the Himalayas with local host {app_obj.name}.",
                host_name=app_obj.name,
                latitude=app_obj.latitude,
                longitude=app_obj.longitude,
                nearby_locations_json=app_obj.nearby_locations_json or "[]",
                stay_options_json=app_obj.stay_options_json or "[]",
            )
            db.add(new_place)
            db.flush()
            app_obj.published_place_id = new_place.id
            published_id = new_place.id

    db.commit()
    db.refresh(app_obj)
    return {
        "id": app_obj.id,
        "status": app_obj.status,
        "published_place_id": published_id,
        "message": f"Host application marked as {status_val}" + (f" and published as Place #{published_id}!" if published_id and status_val == "approved" else "."),
        "application": host_application_to_dict(app_obj),
    }


@app.delete("/api/host-applications/{app_id}", tags=["hosts"])
def delete_host_application(
    app_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Unauthorized")
    app_obj = db.get(HostApplication, app_id)
    if not app_obj:
        raise HTTPException(status_code=404, detail="Application not found")
    db.delete(app_obj)
    db.commit()
    return {"message": "Host application deleted successfully"}


# --- Email & Notification Audit Endpoints ---

@app.post("/api/bookings/{booking_id}/resend-email", tags=["bookings"])
def resend_booking_email(
    booking_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    booking = db.get(Booking, booking_id)
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    if current_user.role != "admin" and booking.traveler_email.lower() != current_user.email.lower():
        raise HTTPException(status_code=403, detail="Unauthorized")

    email_res = send_booking_confirmation_email({
        "id": booking.id,
        "item_title": booking.item_title,
        "traveler_name": booking.traveler_name,
        "traveler_email": booking.traveler_email,
        "traveler_phone": booking.traveler_phone,
        "travel_date": booking.travel_date,
        "end_date": booking.end_date,
        "nights": booking.nights,
        "guests": booking.guests,
        "total_price": booking.total_price,
        "payment_method": booking.payment_method,
        "payment_status": booking.payment_status,
        "payment_id": booking.payment_id,
        "transaction_ref": booking.transaction_ref,
    })
    email_record = EmailNotification(
        recipient_email=booking.traveler_email,
        recipient_name=booking.traveler_name,
        subject=f"Re-sent: Booking Confirmed: {booking.item_title} | Pahadíly Voucher #{booking.id}",
        email_type="booking_confirmation",
        booking_id=booking.id,
        status=email_res.get("status", "sent"),
        preview=f"Voucher #{booking.id} re-dispatched to {booking.traveler_email}",
    )
    db.add(email_record)
    db.commit()
    return {"message": f"Confirmation voucher sent to {booking.traveler_email}"}


@app.get("/api/notifications", response_model=list[EmailNotificationOut], tags=["notifications"])
def list_email_notifications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    stmt = select(EmailNotification).order_by(EmailNotification.created_at.desc())
    if current_user.role != "admin":
        stmt = stmt.where(EmailNotification.recipient_email == current_user.email.lower())
    return list(db.scalars(stmt).all())

