from datetime import date
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session
from database import get_db
from models import Cash, Order, OrderRequest, Payment, User
from schemas import OrderIn, PayIn, RequestIn, StageIn
from security import current_user, need, staff

router = APIRouter(tags=["Pesanan"])
STAGES = ["Pesanan masuk", "Diproses", "Finishing", "Selesai", "Diserahkan"]

def get_order(db: Session, oid: int) -> Order:
    o = db.get(Order, oid)
    if not o:
        raise HTTPException(404, "Pesanan tidak ditemukan.")
    return o

def add_payment(db: Session, o: Order, amount: int, kind: str):
    """Catat pembayaran di pesanan sekaligus di buku kas."""
    today = str(date.today())
    db.add(Payment(order=o, date=today, kind=kind, amount=amount))
    db.add(Cash(date=today, desc=f"{kind} {o.customer.org or o.customer.name}", cat=kind, order_no=o.no, masuk=amount))

@router.get("/orders")
def list_orders(u: User = Depends(current_user), db: Session = Depends(get_db)):
    q = db.query(Order).order_by(Order.id)
    if u.role == "customer":
        q = q.filter(Order.customer_id == u.id)
    return [o.view() for o in q]

@router.post("/orders")
def create_order(b: OrderIn, u: User = Depends(staff), db: Session = Depends(get_db)):
    cust = db.get(User, b.customer_id)
    if not cust or cust.role != "customer":
        raise HTTPException(404, "Pelanggan tidak ditemukan.")
    colors = [c.model_dump() for c in b.colors if c.qty > 0]
    if not colors:
        raise HTTPException(422, "Isi jumlah untuk minimal satu warna.")
    n = db.query(func.count(Order.id)).scalar() + 1
    o = Order(no=f"FMK-{date.today():%y%m}-{n:03d}", customer=cust, product=b.product, material=b.material, size=b.size,
              colors=colors, price=b.price, due=str(b.due), note=b.note)
    db.add(o); db.flush()
    dp = o.price * sum(c["qty"] for c in colors) * b.dp_percent // 100
    if dp:
        add_payment(db, o, dp, "Uang muka" if b.dp_percent < 100 else "Pelunasan")
    db.commit()
    return o.view()

@router.patch("/orders/{oid}/stage")
def set_stage(oid: int, b: StageIn, u: User = Depends(staff), db: Session = Depends(get_db)):
    o = get_order(db, oid)
    if b.stage not in STAGES:
        raise HTTPException(422, "Tahap tidak dikenal.")
    if b.stage != "Pesanan masuk" and not o.payments:
        raise HTTPException(409, "Produksi dimulai setelah DP tercatat.")
    o.stage = b.stage
    db.commit()
    return o.view()

@router.post("/orders/{oid}/payments")
def pay(oid: int, b: PayIn, u: User = Depends(staff), db: Session = Depends(get_db)):
    o = get_order(db, oid)
    add_payment(db, o, b.amount, b.kind)
    db.commit()
    return o.view()

@router.post("/requests", tags=["Pengajuan"])
def new_request(b: RequestIn, u: User = Depends(need("customer")), db: Session = Depends(get_db)):
    r = OrderRequest(customer_id=u.id, **b.model_dump(mode="json"))
    db.add(r); db.commit()
    return r.view()

@router.get("/requests", tags=["Pengajuan"])
def list_requests(u: User = Depends(current_user), db: Session = Depends(get_db)):
    q = db.query(OrderRequest).order_by(OrderRequest.id)
    if u.role == "customer":
        q = q.filter(OrderRequest.customer_id == u.id)
    return [r.view() for r in q]
