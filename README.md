# Erasmus Connect – MVP

Društvena mreža za Erasmus studente.

## Brzo pokretanje (Windows)

```powershell
# 1. Backend
cd backend
python -m venv .venv
.\.venv\Scripts\pip install -r requirements.txt
cd ..
.\start-backend.ps1

# 2. Frontend (novi terminal)
.\start-frontend.ps1
```

Otvori **http://localhost:5173**

## Baza podataka

**Lokalno (default):** SQLite – radi odmah, bez instalacije.

**PostgreSQL (produkcija):**
```powershell
docker compose up -d
```
U `backend/.env` postavi:
```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/erasmus_connect
```

## Cloudinary (opcionalno)

Bez Cloudinary credencijala slike se spremaju lokalno u `backend/uploads/`.

Za produkciju dodaj u `backend/.env`:
```
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

## API

- Swagger docs: http://localhost:8000/docs
- Health: http://localhost:8000/api/health

## Struktura

```
erasmus-connect/
├── backend/          # FastAPI + SQLAlchemy
├── frontend/         # React + Vite + Tailwind
├── docker-compose.yml
├── start-backend.ps1
└── start-frontend.ps1
```

## MVP funkcionalnosti

- Registracija / prijava / odjava (JWT)
- Korisnički profil (slika, ime, država, grad, fakultet, opis, interesi)
- Feed objava (tekst + slika)
- Lajkovi i komentari
- Pretraga korisnika po imenu, gradu, državi
