from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy import or_
from sqlalchemy.orm import Session
from database import get_db
from models import User
from schemas import RegisterIn
from security import current_user, hash_pw, make_token, verify_pw

router = APIRouter(prefix="/auth", tags=["Akun"])

@router.post("/register")
def register(b: RegisterIn, db: Session = Depends(get_db)):
    if len(b.password) < 8:
        raise HTTPException(422, "Kata sandi minimal 8 karakter.")
    if db.query(User).filter(or_(User.email == b.email, User.wa == b.wa)).first():
        raise HTTPException(409, "Email atau WhatsApp sudah terdaftar.")
    u = User(name=b.name, org=b.org, email=b.email, wa=b.wa, role="customer", pw=hash_pw(b.password))
    db.add(u); db.commit()
    return {"access_token": make_token(u), "user": u.public()}

@router.post("/login")
def login(f: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    u = db.query(User).filter(or_(User.email == f.username, User.wa == f.username)).first()
    if not u or not u.active or not verify_pw(f.password, u.pw):
        raise HTTPException(401, "Email/WhatsApp atau kata sandi salah.")
    return {"access_token": make_token(u), "user": u.public()}

@router.get("/me")
def me(u: User = Depends(current_user)):
    return u.public()
