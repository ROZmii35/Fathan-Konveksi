from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Stock, User
from schemas import MoveIn
from security import staff

router = APIRouter(prefix="/stock", tags=["Stok"])

@router.get("")
def list_stock(u: User = Depends(staff), db: Session = Depends(get_db)):
    return [s.view() for s in db.query(Stock).order_by(Stock.id)]

@router.post("/move")
def move(b: MoveIn, u: User = Depends(staff), db: Session = Depends(get_db)):
    s = db.get(Stock, b.stock_id)
    if not s:
        raise HTTPException(404, "Bahan tidak ditemukan.")
    if b.direction not in ("masuk", "keluar"):
        raise HTTPException(422, "Arah harus 'masuk' atau 'keluar'.")
    new = s.qty + b.qty if b.direction == "masuk" else s.qty - b.qty
    if new < 0:
        raise HTTPException(409, "Stok tidak cukup.")
    s.qty = new
    db.commit()
    return s.view()
