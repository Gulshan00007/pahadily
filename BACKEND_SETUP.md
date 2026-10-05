# Pahadíly — Full Dynamic Backend & Prototype System

A full-stack, production-ready prototype for **Pahadíly** — Rare Places, Real People, Lasting Stories.

---

## 🏔️ Architecture Overview

- **Backend**: FastAPI + SQLAlchemy + SQLite / PostgreSQL (with zero external crypto dependencies using PBKDF2-SHA256 and signed bearer tokens).
- **Frontend**: React (Vite) + Context API (`AuthContext`) + Vanilla CSS.
- **Dynamic Content**: Places & Stays, Curated Experiences, Local Companions & Guides, Bookings, and Host Inquiries.

---

## ⚡ Super Admin & Demo Accounts

| Role | Email | Password | Permissions |
|---|---|---|---|
| **Super Admin (Owner)** | `gulshany0001@gmail.com` | `Tgulshan@2` | Full master administrator control over all bookings, users, finances, and listings |
| **Mountain Host** | `host@pahadily.com` | `pahadily123` | Host dashboard, publish sanctuaries/experiences |
| **Conscious Traveler** | `traveler@pahadily.com` | `pahadily123` | Book stays & experiences, manage "My Bookings" |


---

## 🚀 Key Features

### 1. 🔐 Authentication System
- `POST /api/auth/signup` — Sign up as Conscious Traveler or Mountain Host.
- `POST /api/auth/login` — Secure email + PBKDF2 password authentication.
- `POST /api/auth/demo-login` — Instant 1-click login for prototype showcases.
- `GET /api/auth/me` — Current authenticated user profile.
- Persistent session storage in `localStorage` with reactive Navbar user dropdown.

### 2. 📅 Universal Booking Engine
- Book any **Mountain Stay / Place**, **Curated Experience**, or **Local Companion / Guide**.
- Supports travel dates, party size, automatic cost calculation, host notes, and reference codes (`#PAH-0001`).
- `POST /api/bookings` — Creates booking connected to user account.
- `GET /api/bookings/my` — Shows personal reservations with live status (`Pending`, `Confirmed`, `Completed`, `Cancelled`).
- `PATCH /api/bookings/{id}/status` — Allows travelers to cancel and hosts/admins to approve or complete bookings.

### 3. 🛠️ Dynamic Backend Admin & Host Portal (`/admin`)
- Accessible directly from the Navbar via **"⚡ Host / Admin Portal"**.
- **Places / Stays Management**: Add new destinations with Title, Region, Tagline, Price, Altitude, Tags, Image, Description, and Host name.
- **Persons / Locals Management**: Register native guides, companions, weavers, and hosts with roles, languages, pricing, and bio.
- **Experiences Management**: Create guided treks, culinary feasts, and village walks.
- **Bookings Management**: Real-time table to review, approve, or cancel incoming traveler reservations.

---

## 🏃 Running Locally

### 1. Start the Backend (Port 8000)
```powershell
cd backend
python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```
Interactive API docs available at: `http://127.0.0.1:8000/docs`.

### 2. Start the Frontend (Port 5173 / 5174)
```powershell
npm run dev
```
Open `http://localhost:5173` or `http://localhost:5174`.

---

## 🌐 API Endpoints Quick Reference

- **Auth**: `/api/auth/signup`, `/api/auth/login`, `/api/auth/demo-login`, `/api/auth/me`
- **Places**: `GET /api/places`, `POST /api/places`, `PUT /api/places/{id}`, `DELETE /api/places/{id}`
- **Experiences**: `GET /api/experiences`, `POST /api/experiences`, `PUT /api/experiences/{id}`, `DELETE /api/experiences/{id}`
- **Locals**: `GET /api/locals`, `POST /api/locals`, `PUT /api/locals/{id}`, `DELETE /api/locals/{id}`
- **Bookings**: `POST /api/bookings`, `GET /api/bookings`, `GET /api/bookings/my`, `PATCH /api/bookings/{id}/status`
- **Stats**: `GET /api/stats`

---

## ☁️ Deploying Backend on Render (Render.com)

1. Sign into **[Render.com](https://render.com)** with GitHub.
2. Click **New +** → **Web Service** (or **Blueprint** to use `render.yaml`).
3. Select your repository: `Gulshan00007/pahadily`.
4. Configure the Web Service settings:
   - **Name**: `pahadily-api`
   - **Root Directory**: `backend`
   - **Runtime**: `Python`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - **Health Check Path**: `/healthz`
5. **Environment Variables**:
   - `PYTHON_VERSION`: `3.11.9`
   - `JWT_SECRET`: `pahadily_secret_mountain_key_2026_super_secure`
6. Click **Deploy Web Service**.
7. Copy your Render service URL (e.g., `https://pahadily-api.onrender.com`).
8. In **Vercel** (`pahadily.vercel.app`):
   - Go to **Project Settings** → **Environment Variables**
   - Add: `VITE_API_URL` = `https://pahadily-api.onrender.com`
   - Redeploy frontend on Vercel so it connects directly to your live Render backend!

