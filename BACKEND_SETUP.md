# Pahadíly — Full Dynamic Backend & Prototype System

A full-stack, production-ready prototype for **Pahadíly** — Rare Places, Real People, Lasting Stories.

---

## 🏔️ Architecture Overview

- **Backend**: FastAPI + SQLAlchemy + SQLite / PostgreSQL (with zero external crypto dependencies using PBKDF2-SHA256 and signed bearer tokens).
- **Frontend**: React (Vite) + Context API (`AuthContext`) + Vanilla CSS.
- **Dynamic Content**: Places & Stays, Curated Experiences, Local Companions & Guides, Bookings, and Host Inquiries.

---

## ⚡ Demo Accounts (1-Click Login Built-In)

You can log in instantly using the demo buttons in the login modal, or with these credentials:

| Role | Email | Password | Permissions |
|---|---|---|---|
| **Admin** | `admin@pahadily.com` | `pahadily123` | Add/Edit/Delete Places, Persons, Experiences & Manage All Bookings |
| **Host** | `host@pahadily.com` | `pahadily123` | Host dashboard, add stays/experiences |
| **Traveler** | `traveler@pahadily.com` | `pahadily123` | Book stays, experiences & view "My Bookings" |

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
