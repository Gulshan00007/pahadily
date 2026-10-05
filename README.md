# 🏔️ Pahadíly — Rare Places. Real People. Lasting Stories.

A modern, high-aesthetic travel platform connecting conscious wanderers with authentic Himalayan homestays, native guides, local artisans, and slow mountain experiences.

---

## 📁 Clean Project Structure

```
PAHADILY/pahadily/
├── backend/                  # FastAPI Backend API & Database
│   ├── main.py               # API endpoints, models, auth & business logic
│   ├── seed_data.json        # Curated Himalayan places, locals & experiences
│   ├── test_system.py        # Automated 15-point integration test suite
│   ├── requirements.txt      # Python dependencies (FastAPI, SQLAlchemy, Uvicorn)
│   └── .env.example          # Backend environment variables template
│
├── public/                   # Static media assets & images
│   ├── favicon.svg
│   └── images/
│       ├── destinations/     # High-res mountain stay & destination photos
│       ├── experiences/      # Curated hike, foraging & feast imagery
│       ├── locals/           # Native host & guide portrait assets
│       └── logo/             # Pahadíly branding assets
│
├── src/                      # React Frontend (Vite)
│   ├── components/
│   │   ├── auth/             # AuthModal with 1-Click Demo Logins
│   │   ├── booking/          # Universal BookingModal & MyBookingsModal
│   │   ├── common/           # Toast notification & UI utilities
│   │   ├── experiences/      # FeaturedExperiences & Experience categories
│   │   ├── explore/          # ExploreDestinationsGrid, Hero & Map sidebar
│   │   ├── locals/           # LocalsGrid, LocalProfileModal & Filters
│   │   ├── FeaturedDestinations.jsx
│   │   ├── Footer.jsx
│   │   ├── Hero.jsx
│   │   ├── ImpactSection.jsx
│   │   └── Navbar.jsx        # Navigation bar with reactive user menu
│   │
│   ├── context/
│   │   └── AuthContext.jsx   # Global auth, roles, modal triggers & state
│   │
│   ├── lib/
│   │   └── api.js            # Unified frontend API client
│   │
│   ├── pages/
│   │   ├── ExplorePage.jsx   # Stays & Valley destinations
│   │   ├── ExperiencesPage.jsx # Slow journeys, hikes & culinary feasts
│   │   ├── LocalsPage.jsx    # Local guides, artisans & hosts
│   │   └── AdminPage.jsx     # Dynamic Host & Admin management portal
│   │
│   ├── App.css               # Modern glassmorphism & component styles
│   ├── App.jsx               # Routes & global modal providers
│   ├── index.css             # Design tokens, typography & base layouts
│   └── main.jsx              # React DOM root entrypoint
│
├── .env.example              # Frontend environment variables template
├── .gitignore                # Production ignore rules
├── BACKEND_SETUP.md          # Detailed backend documentation
├── index.html                # HTML entrypoint
├── package.json              # Frontend npm dependencies & scripts
└── vite.config.js            # Vite bundler configuration
```

---

## ⚡ Quick Start

### 1. Start Backend Server (Port 8000)
```powershell
cd backend
python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```
*Interactive Swagger API Documentation: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)*

### 2. Start Frontend Server (Port 5173)
```powershell
npm install
npm run dev
```
*Frontend URL: [http://localhost:5173](http://localhost:5173)*

### 3. Run Automated Test Suite
```powershell
python backend/test_system.py
```

---

## 🔑 Demo Access Profiles

The application includes built-in 1-click login buttons in the login modal:

| Profile | Email | Password | Role & Permissions |
|---|---|---|---|
| **Admin** | `admin@pahadily.com` | `pahadily123` | Full access to add/edit/delete places, persons, experiences & manage bookings |
| **Host** | `host@pahadily.com` | `pahadily123` | Host dashboard access & booking management |
| **Traveler** | `traveler@pahadily.com` | `pahadily123` | Book stays/guides and view *My Bookings* |

---

## 🚀 Key Modules

1. **🔐 Authentication & Session Control**: Token-based authentication using PBKDF2 password security and reactive user menu.
2. **🏔️ Dynamic Places & Stays (`/api/places`)**: Real-time CRUD for mountain destinations, pricing, altitude, and amenities.
3. **🌲 Dynamic Persons & Guides (`/api/locals`)**: Live profiles for native mountain guides, artisans, and homestay hosts.
4. **🎒 Curated Experiences (`/api/experiences`)**: Guided forest walks, traditional feasts, and high-ridge treks.
5. **📅 Universal Booking Engine (`/api/bookings`)**: Reservation lifecycle management (`Pending` ➔ `Confirmed` ➔ `Completed` / `Cancelled`).
6. **⚙️ Host & Admin Control Portal (`/admin`)**: Interactive interface for adding content dynamically without database manipulation.
