import os, time
import bcrypt, jwt
from dotenv import load_dotenv
from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from database import get_db
from models import User

load_dotenv()
SECRET = os.getenv("FMK_SECRET", "dev-only-ganti-di-env")
oauth = OAuth2PasswordBearer(tokenUrl="auth/login")

def hash_pw(p: str) -> str:
    return bcrypt.hashpw(p.encode(), bcrypt.gensalt()).decode()

def verify_pw(p: str, hashed: str) -> bool:
    return bcrypt.checkpw(p.encode(), hashed.encode())

def make_token(u: User) -> str:
    return jwt.encode({"sub": str(u.id), "exp": int(time.time()) + 7 * 86400}, SECRET, "HS256")

def current_user(token: str = Depends(oauth), db: Session = Depends(get_db)) -> User:
    try:
        uid = int(jwt.decode(token, SECRET, ["HS256"])["sub"])
    except Exception:
        raise HTTPException(401, "Sesi tidak valid, silakan masuk lagi.")
    u = db.get(User, uid)
    if not u or not u.active:
        raise HTTPException(401, "Akun tidak aktif.")
    return u

def need(*roles: str):
    def dep(u: User = Depends(current_user)) -> User:
        if u.role not in roles:
            raise HTTPException(403, "Anda tidak punya akses ke bagian ini.")
        return u
    return dep

staff = need("owner", "admin")
owner = need("owner")
