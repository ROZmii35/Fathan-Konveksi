import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

load_dotenv()
URL = os.getenv("DATABASE_URL", "sqlite:///./fmk.db")
engine = create_engine(URL, connect_args={"check_same_thread": False} if URL.startswith("sqlite") else {})
SessionLocal = sessionmaker(engine, autoflush=False)

class Base(DeclarativeBase):
    pass

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    """Buat tabel, lalu isi data contoh jika database masih kosong."""
    import models
    Base.metadata.create_all(engine)
    with SessionLocal() as db:
        if db.query(models.User).first() is None:
            seed(db)

def seed(db):
    from models import Cash, Order, Payment, Stock, User
    from security import hash_pw
    pw = hash_pw("fmk12345")
    owner = User(name="Pemilik FMK", email="owner@fmk.id", wa="0812-1100", role="owner", pw=pw)
    siti = User(name="Siti Rahmawati", email="siti@fmk.id", wa="0813-2271", role="admin", pw=pw)
    nadia = User(name="Nadia Putri", org="Komunitas Muslimah Sehati", email="nadia.sehati@email.com", wa="0812-7781", role="customer", pw=pw)
    db.add_all([owner, siti, nadia]); db.flush()
    db.add_all([
        Order(no="FMK-2610-024", customer_id=nadia.id, product="Hijab segi empat", material="Voal ultrafine", size="115 x 115 cm",
              colors=[{"color": "Sage", "qty": 120}], price=38000, due="2026-11-21", stage="Finishing", note="Kemas per 10 pcs.",
              payments=[Payment(date="2026-10-23", kind="Uang muka", amount=3000000)]),
        Order(no="FMK-2610-023", customer_id=nadia.id, product="Bergo", material="Jersey premium",
              colors=[{"color": "Mocca", "qty": 70}], price=33000, due="2026-11-18", stage="Diproses",
              payments=[Payment(date="2026-10-21", kind="Uang muka", amount=660000)]),
        Stock(name="Voal ultrafine", color="Sage", qty=18, min=50, unit="m"),
        Stock(name="Voal ultrafine", color="Navy", qty=145, min=50, unit="m"),
        Stock(name="Voal ultrafine", color="Hijau botol", qty=62, min=50, unit="m"),
        Stock(name="Benang jahit", color="Hitam", qty=4, min=10, unit="cone"),
        Stock(name="Plastik kemasan 25x35", color="Bening", qty=120, min=300, unit="lembar"),
        Cash(date="2026-10-23", desc="Uang muka Komunitas Muslimah Sehati", cat="Uang muka", order_no="FMK-2610-024", masuk=3000000),
        Cash(date="2026-11-02", desc="Voal ultrafine 300 m", cat="Bahan baku", keluar=4500000),
        Cash(date="2026-11-04", desc="Upah jahit minggu pertama", cat="Upah jahit", keluar=2800000),
    ])
    db.commit()
