"""FMK API. Jalankan: uvicorn main:app --reload  ->  Swagger di http://localhost:8000/docs
Data disimpan di memori (prototipe). Ganti ke database (SQLModel/PostgreSQL) sebelum produksi."""
import hashlib, os, time
from datetime import date
from typing import Optional
import jwt
from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel

SECRET = os.getenv("FMK_SECRET", "ganti-rahasia-ini")
STAGES = ["Pesanan masuk", "Diproses", "Finishing", "Selesai", "Diserahkan"]

app = FastAPI(title="FMK API", description="Fathan Mubina Konveksi: pesanan, produksi, stok, keuangan.")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])
oauth = OAuth2PasswordBearer(tokenUrl="auth/login")

def h(p): return hashlib.pbkdf2_hmac("sha256", p.encode(), b"fmk", 100_000).hex()
def nid(rows): return max([r["id"] for r in rows], default=0) + 1

USERS = [
    dict(id=1, name="Pemilik FMK", org="", email="owner@fmk.id", wa="0812-1100", role="owner", active=True, pw=h("fmk12345")),
    dict(id=2, name="Siti Rahmawati", org="", email="siti@fmk.id", wa="0813-2271", role="admin", active=True, pw=h("fmk12345")),
    dict(id=3, name="Nadia Putri", org="Komunitas Muslimah Sehati", email="nadia.sehati@email.com", wa="0812-7781", role="customer", active=True, pw=h("fmk12345")),
]
ORDERS = [
    dict(id=1, no="FMK-2610-024", customer_id=3, product="Hijab segi empat", material="Voal ultrafine", size="115 x 115 cm",
         colors=[dict(color="Sage", qty=120)], price=38000, due="2026-11-21", stage="Finishing", note="Kemas per 10 pcs.", payments=[dict(date="2026-10-23", kind="Uang muka", amount=3000000)]),
    dict(id=2, no="FMK-2610-023", customer_id=3, product="Bergo", material="Jersey premium", size="",
         colors=[dict(color="Mocca", qty=70)], price=33000, due="2026-11-18", stage="Diproses", note="", payments=[dict(date="2026-10-21", kind="Uang muka", amount=660000)]),
]
REQUESTS = []
STOCK = [
    dict(id=1, name="Voal ultrafine", color="Sage", qty=18, min=50, unit="m"),
    dict(id=2, name="Voal ultrafine", color="Navy", qty=145, min=50, unit="m"),
    dict(id=3, name="Voal ultrafine", color="Hijau botol", qty=62, min=50, unit="m"),
    dict(id=4, name="Benang jahit", color="Hitam", qty=4, min=10, unit="cone"),
    dict(id=5, name="Plastik kemasan 25x35", color="Bening", qty=120, min=300, unit="lembar"),
]
CASH = [
    dict(id=1, date="2026-11-02", desc="Voal ultrafine 300 m", cat="Bahan baku", order_no=None, masuk=0, keluar=4500000),
    dict(id=2, date="2026-11-04", desc="Upah jahit minggu pertama", cat="Upah jahit", order_no=None, masuk=0, keluar=2800000),
    dict(id=3, date="2026-11-05", desc="DP Klinik Pratama Amanah", cat="Uang muka (DP)", order_no="FMK-2611-003", masuk=1800000, keluar=0),
]

# ---------- auth ----------
def make_token(u): return jwt.encode({"sub": str(u["id"]), "exp": int(time.time()) + 7 * 86400}, SECRET, "HS256")

def current_user(token: str = Depends(oauth)):
    try:
        uid = int(jwt.decode(token, SECRET, ["HS256"])["sub"])
    except Exception:
        raise HTTPException(401, "Sesi tidak valid, silakan masuk lagi.")
    u = next((x for x in USERS if x["id"] == uid and x["active"]), None)
    if not u: raise HTTPException(401, "Akun tidak aktif.")
    return u

def need(*roles):
    def dep(u=Depends(current_user)):
        if u["role"] not in roles: raise HTTPException(403, "Anda tidak punya akses ke bagian ini.")
        return u
    return dep

staff = need("owner", "admin"); owner = need("owner")
def pub(u): return {k: v for k, v in u.items() if k != "pw"}

class RegisterIn(BaseModel):
    name: str; org: str = ""; wa: str; email: str; password: str

@app.post("/auth/register", tags=["Akun"])
def register(b: RegisterIn):
    if len(b.password) < 8: raise HTTPException(422, "Kata sandi minimal 8 karakter.")
    if any(u["email"] == b.email or u["wa"] == b.wa for u in USERS): raise HTTPException(409, "Email atau WhatsApp sudah terdaftar.")
    u = dict(id=nid(USERS), name=b.name, org=b.org, email=b.email, wa=b.wa, role="customer", active=True, pw=h(b.password))
    USERS.append(u)
    return {"access_token": make_token(u), "user": pub(u)}

@app.post("/auth/login", tags=["Akun"])
def login(f: OAuth2PasswordRequestForm = Depends()):
    u = next((x for x in USERS if f.username in (x["email"], x["wa"]) and x["pw"] == h(f.password)), None)
    if not u or not u["active"]: raise HTTPException(401, "Email/WhatsApp atau kata sandi salah.")
    return {"access_token": make_token(u), "user": pub(u)}

@app.get("/auth/me", tags=["Akun"])
def me(u=Depends(current_user)): return pub(u)

# ---------- pesanan ----------
def view(o):
    total = o["price"] * sum(c["qty"] for c in o["colors"]); paid = sum(p["amount"] for p in o["payments"])
    c = next((x for x in USERS if x["id"] == o["customer_id"]), {})
    return {**o, "total": total, "paid": paid, "remaining": total - paid, "customer": c.get("org") or c.get("name", "-")}

class ColorQty(BaseModel): color: str; qty: int
class OrderIn(BaseModel):
    customer_id: int; product: str; material: str; size: str = ""; colors: list[ColorQty]
    price: int; due: date; note: str = ""; dp_percent: int = 0

@app.get("/orders", tags=["Pesanan"])
def orders(u=Depends(current_user)):
    return [view(o) for o in ORDERS if u["role"] != "customer" or o["customer_id"] == u["id"]]

@app.post("/orders", tags=["Pesanan"])
def create_order(b: OrderIn, u=Depends(staff)):
    if not any(x["id"] == b.customer_id and x["role"] == "customer" for x in USERS): raise HTTPException(404, "Pelanggan tidak ditemukan.")
    no = f"FMK-{date.today():%y%m}-{len(ORDERS) + 1:03d}"
    o = dict(id=nid(ORDERS), no=no, **b.model_dump(exclude={"dp_percent", "due"}), due=str(b.due), stage="Pesanan masuk", payments=[])
    o["colors"] = [c for c in o["colors"] if c["qty"] > 0]
    ORDERS.append(o)
    dp = o["price"] * sum(c["qty"] for c in o["colors"]) * b.dp_percent // 100
    if dp: pay(o["id"], PayIn(amount=dp, kind="Uang muka"), u)
    return view(o)

class StageIn(BaseModel): stage: str
@app.patch("/orders/{oid}/stage", tags=["Pesanan"])
def set_stage(oid: int, b: StageIn, u=Depends(staff)):
    o = next((x for x in ORDERS if x["id"] == oid), None)
    if not o: raise HTTPException(404, "Pesanan tidak ditemukan.")
    if b.stage not in STAGES: raise HTTPException(422, "Tahap tidak dikenal.")
    if b.stage != "Pesanan masuk" and not o["payments"]: raise HTTPException(409, "Produksi dimulai setelah DP tercatat.")
    o["stage"] = b.stage
    return view(o)

class PayIn(BaseModel): amount: int; kind: str = "Cicilan"
@app.post("/orders/{oid}/payments", tags=["Pesanan"])
def pay(oid: int, b: PayIn, u=Depends(staff)):
    o = next((x for x in ORDERS if x["id"] == oid), None)
    if not o: raise HTTPException(404, "Pesanan tidak ditemukan.")
    o["payments"].append(dict(date=str(date.today()), kind=b.kind, amount=b.amount))
    CASH.append(dict(id=nid(CASH), date=str(date.today()), desc=f"{b.kind} {view(o)['customer']}", cat=b.kind, order_no=o["no"], masuk=b.amount, keluar=0))
    return view(o)

class RequestIn(BaseModel):
    product: str; material: str; colors: list[str]; qty: int; size: str = ""; needed: Optional[date] = None; note: str = ""
@app.post("/requests", tags=["Pengajuan"])
def new_request(b: RequestIn, u=Depends(need("customer"))):
    r = dict(id=nid(REQUESTS), customer_id=u["id"], status="Menunggu penawaran", **b.model_dump(mode="json")); REQUESTS.append(r); return r

@app.get("/requests", tags=["Pengajuan"])
def requests(u=Depends(current_user)):
    return [r for r in REQUESTS if u["role"] != "customer" or r["customer_id"] == u["id"]]

# ---------- pelanggan & stok ----------
@app.get("/customers", tags=["Pelanggan"])
def customers(u=Depends(staff)):
    out = []
    for c in (x for x in USERS if x["role"] == "customer"):
        os_ = [view(o) for o in ORDERS if o["customer_id"] == c["id"]]
        out.append({**pub(c), "orders": len(os_), "spent": sum(o["total"] for o in os_)})
    return out

@app.get("/stock", tags=["Stok"])
def stock(u=Depends(staff)): return [{**s, "low": s["qty"] < s["min"]} for s in STOCK]

class MoveIn(BaseModel): stock_id: int; qty: float; direction: str
@app.post("/stock/move", tags=["Stok"])
def move(b: MoveIn, u=Depends(staff)):
    s = next((x for x in STOCK if x["id"] == b.stock_id), None)
    if not s: raise HTTPException(404, "Bahan tidak ditemukan.")
    s["qty"] += b.qty if b.direction == "masuk" else -b.qty
    if s["qty"] < 0: raise HTTPException(409, "Stok tidak cukup.")
    return s

# ---------- keuangan (khusus pemilik) ----------
@app.get("/finance/summary", tags=["Keuangan"])
def summary(u=Depends(owner)):
    masuk = sum(c["masuk"] for c in CASH); keluar = sum(c["keluar"] for c in CASH)
    ov = [view(o) for o in ORDERS if o["stage"] != "Diserahkan" or view(o)["remaining"] > 0]
    return dict(masuk=masuk, keluar=keluar, bersih=masuk - keluar, active=sum(o["stage"] != "Diserahkan" for o in ORDERS),
                receivables=sorted([o for o in ov if o["remaining"] > 0], key=lambda o: o["due"]),
                low_stock=[s for s in STOCK if s["qty"] < s["min"]])

@app.get("/finance/cashbook", tags=["Keuangan"])
def cashbook(u=Depends(owner)): return list(reversed(CASH))

class CashIn(BaseModel): desc: str; cat: str; amount: int; direction: str
@app.post("/finance/cashbook", tags=["Keuangan"])
def add_cash(b: CashIn, u=Depends(owner)):
    CASH.append(dict(id=nid(CASH), date=str(date.today()), desc=b.desc, cat=b.cat, order_no=None,
                     masuk=b.amount if b.direction == "masuk" else 0, keluar=b.amount if b.direction == "keluar" else 0))
    return CASH[-1]

# ---------- pengguna (khusus pemilik) ----------
class StaffIn(BaseModel): name: str; email: str; wa: str; password: str
@app.get("/users", tags=["Pengguna"])
def users(u=Depends(owner)): return [pub(x) for x in USERS]

@app.post("/users", tags=["Pengguna"])
def add_staff(b: StaffIn, u=Depends(owner)):
    n = dict(id=nid(USERS), name=b.name, org="", email=b.email, wa=b.wa, role="admin", active=True, pw=h(b.password))
    USERS.append(n); return pub(n)

@app.patch("/users/{uid}/toggle", tags=["Pengguna"])
def toggle(uid: int, u=Depends(owner)):
    t = next((x for x in USERS if x["id"] == uid), None)
    if not t or t["role"] == "owner": raise HTTPException(404, "Akun tidak bisa diubah.")
    t["active"] = not t["active"]; return pub(t)
