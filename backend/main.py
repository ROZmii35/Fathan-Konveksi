"""FMK API. Jalankan: uvicorn main:app --reload  ->  Swagger di http://localhost:8000/docs"""
import os
from contextlib import asynccontextmanager
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import init_db
from routers import auth, finance, orders, stock, users

load_dotenv()

@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield

app = FastAPI(title="FMK API", description="Fathan Mubina Konveksi: pesanan, produksi, stok, keuangan.", lifespan=lifespan)
app.add_middleware(CORSMiddleware, allow_origins=os.getenv("CORS_ORIGINS", "http://localhost:5173").split(","),
                   allow_methods=["*"], allow_headers=["*"])
for r in (auth, orders, stock, finance, users):
    app.include_router(r.router)
