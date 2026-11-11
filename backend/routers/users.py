from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import or_
from sqlalchemy.orm import Session
from database import get_db
from models import Order, User
from schemas import StaffIn
from security import hash_pw, owner, staff

router = APIRouter(tags=["Pengguna"])

@router.get("/users")
def list_users(u: User = Depends(owner), db: Session = Depends(get_db)):
    return [x.public() for x in db.query(User).order_by(User.id)]

@router.post("/users")
def add_staff(b: StaffIn, u: User = Depends(owner), db: Session = Depends(get_db)):
    if db.query(User).filter(or_(User.email == b.email, User.wa == b.wa)).first():
        raise HTTPException(409, "Email atau WhatsApp sudah terdaftar.")
    n = User(name=b.name, email=b.email, wa=b.wa, role="admin", pw=hash_pw(b.password))
    db.add(n); db.commit()
    return n.public()

@router.patch("/users/{uid}/toggle")
def toggle(uid: int, u: User = Depends(owner), db: Session = Depends(get_db)):
    t = db.get(User, uid)
    if not t or t.role == "owner":
        raise HTTPException(404, "Akun tidak bisa diubah.")
    t.active = not t.active
    db.commit()
    return t.public()

@router.get("/customers", tags=["Pelanggan"])
def customers(u: User = Depends(staff), db: Session = Depends(get_db)):
    out = []
    for c in db.query(User).filter(User.role == "customer").order_by(User.id):
        os_ = [o.view() for o in db.query(Order).filter(Order.customer_id == c.id)]
        out.append({**c.public(), "orders": len(os_), "spent": sum(o["total"] for o in os_)})
    return out
