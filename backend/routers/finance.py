from datetime import date
from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session
from database import get_db
from models import Cash, Order, Stock, User
from schemas import CashIn
from security import owner

router = APIRouter(prefix="/finance", tags=["Keuangan"])

@router.get("/summary")
def summary(u: User = Depends(owner), db: Session = Depends(get_db)):
    masuk = db.query(func.coalesce(func.sum(Cash.masuk), 0)).scalar()
    keluar = db.query(func.coalesce(func.sum(Cash.keluar), 0)).scalar()
    orders = [o.view() for o in db.query(Order)]
    return dict(masuk=masuk, keluar=keluar, bersih=masuk - keluar,
                active=sum(o["stage"] != "Diserahkan" for o in orders),
                receivables=sorted((o for o in orders if o["remaining"] > 0), key=lambda o: o["due"]),
                low_stock=[s.view() for s in db.query(Stock) if s.qty < s.min])

@router.get("/cashbook")
def cashbook(u: User = Depends(owner), db: Session = Depends(get_db)):
    return [c.view() for c in db.query(Cash).order_by(Cash.id.desc())]

@router.post("/cashbook")
def add_cash(b: CashIn, u: User = Depends(owner), db: Session = Depends(get_db)):
    c = Cash(date=str(date.today()), desc=b.desc, cat=b.cat,
             masuk=b.amount if b.direction == "masuk" else 0, keluar=b.amount if b.direction == "keluar" else 0)
    db.add(c); db.commit()
    return c.view()
