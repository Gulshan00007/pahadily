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

---

## ⚡ Quick Start & Development

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Full-Stack Development Server (Port 3000)
```bash
npm run dev
```
- App & API running at: [http://localhost:3000](http://localhost:3000)
- The Express server (`server.ts`) mounts Vite dev middleware and serves `/api/*` endpoints.

### 3. Production Build & Sitemap Generation
```bash
npm run build
```
- Automatically runs `node scripts/generate-sitemap.js` and `vite build`.
- Generates a production-ready static build in `dist/` containing `index.html`, assets, `robots.txt`, and canonical `sitemap.xml`.

---

## 🌐 Hosting & Deployment Architecture

Pahadily is designed to support both static edge deployment and containerized full-stack deployment:

### Option A: Static Edge Hosting (Vercel / Netlify)
- **Vercel**: Deploy directly with `npm run build` as build command and `dist` as output directory. `vercel.json` provides client-side SPA rewrites to `/index.html`. Vercel serves the static build via global CDN; **`server.ts` / `npm start` is not required**.
- **Netlify / Cloudflare Pages**: Supported out of the box via `public/_redirects` (`/* /index.html 200`).
- Configure `VITE_API_URL` to point to your deployed backend API (or leave empty if using serverless edge rewrites).
- Configure `VITE_SITE_URL=https://pahadily.com` for production canonical URLs and sitemap generation.

### Option B: Node.js / Full-Stack Hosting (Render / Railway / Docker)
- Deploy as a Node.js web service.
- Build command: `npm run build`
- Start command: `npm start` (executes `node server.ts`, which serves the `/api/*` REST endpoints and static files from `dist/`).

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
