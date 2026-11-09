# FMK - Fathan Mubina Konveksi

## Backend (FastAPI)
    cd backend && pip install -r requirements.txt
    uvicorn main:app --reload
Swagger: http://localhost:8000/docs (klik Authorize, isi username/password).

## Frontend (React + Vite)
    cd frontend && npm install && npm run dev
Buka http://localhost:5173 (API lain: set VITE_API di .env).

## Akun demo (kata sandi: fmk12345)
- Pemilik: owner@fmk.id
- Admin: siti@fmk.id
- Pelanggan: nadia.sehati@email.com

Catatan: data masih di memori (hilang saat server restart). Ganti ke database sebelum produksi, dan set FMK_SECRET.
