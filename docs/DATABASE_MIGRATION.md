# Pahadíly — Database Architecture & PostgreSQL/Supabase Migration Guide

## 1. Storage Architecture Overview

Pahadíly employs an architecture supporting both zero-dependency local JSON state persistence and high-concurrency cloud PostgreSQL (e.g. Supabase, Neon, AWS RDS, Cloud SQL).

### Active Storage Detection

The server automatically selects the storage backend on startup:

| Condition | Active Engine | Behavior |
| :--- | :--- | :--- |
| `DATABASE_URL` is set | **PostgreSQL** (`postgres`) | Connects via connection pooling, creates schema tables if absent, executes parameterized SQL queries, and uses database transactions. |
| `DATABASE_URL` is absent | **Local JSON** (`local_json`) | Persists database state to disk at `data/pahadily_db_state.json`. Changes to users, places, bookings, applications, and reviews are atomically written to disk. |

You can verify the currently active engine at runtime by querying:
```http
GET /api/system/storage
```
Response:
```json
{
  "active_storage": "local_json",
  "database_url_configured": false,
  "persistence_file": "/app/applet/data/pahadily_db_state.json",
  "total_places": 8,
  "total_locals": 3,
  "total_experiences": 5,
  "total_bookings": 0,
  "total_users": 1,
  "total_applications": 0,
  "email_service_configured": false
}
```

---

## 2. PostgreSQL DDL Schema

When connecting to Supabase or any PostgreSQL instance, the server executes the following DDL automatically:

```sql
-- 1. Users & Accounts
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  salt VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  role VARCHAR(50) NOT NULL DEFAULT 'traveler', -- 'traveler', 'host', 'guide', 'admin'
  avatar TEXT,
  bio TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_verified BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Destinations & Stays
CREATE TABLE IF NOT EXISTS places (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  tagline TEXT,
  region VARCHAR(100) NOT NULL,
  district VARCHAR(100) DEFAULT 'Kullu',
  category VARCHAR(100),
  price VARCHAR(50),
  unit VARCHAR(50),
  rating NUMERIC(3, 1) DEFAULT 4.9,
  reviews INTEGER DEFAULT 0,
  altitude VARCHAR(50),
  tags JSONB DEFAULT '[]'::jsonb,
  image TEXT,
  description TEXT,
  host_name VARCHAR(255),
  latitude NUMERIC(10, 6),
  longitude NUMERIC(10, 6),
  nearby_locations JSONB DEFAULT '[]'::jsonb,
  stay_options JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Community Reviews
CREATE TABLE IF NOT EXISTS place_reviews (
  id SERIAL PRIMARY KEY,
  place_id INTEGER REFERENCES places(id) ON DELETE CASCADE,
  user_name VARCHAR(255) NOT NULL,
  rating INTEGER NOT NULL,
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Handcrafted Mountain Experiences
CREATE TABLE IF NOT EXISTS experiences (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  region VARCHAR(100) NOT NULL,
  location VARCHAR(255),
  category VARCHAR(100),
  duration VARCHAR(100),
  difficulty VARCHAR(50),
  price VARCHAR(50),
  unit VARCHAR(50),
  guide VARCHAR(255),
  rating NUMERIC(3, 1) DEFAULT 4.8,
  reviews INTEGER DEFAULT 0,
  image TEXT,
  description TEXT,
  inclusions JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Verified Local Companions & Guides
CREATE TABLE IF NOT EXISTS locals (
  id SERIAL PRIMARY KEY,
  category VARCHAR(100) DEFAULT 'companion',
  region VARCHAR(100) NOT NULL,
  name VARCHAR(255) NOT NULL,
  location VARCHAR(255),
  role VARCHAR(255),
  lang VARCHAR(255),
  rating NUMERIC(3, 1) DEFAULT 4.8,
  reviews INTEGER DEFAULT 0,
  price VARCHAR(50),
  unit VARCHAR(50),
  tags JSONB DEFAULT '[]'::jsonb,
  image TEXT,
  verified BOOLEAN DEFAULT true,
  certified BOOLEAN DEFAULT false,
  gradient TEXT,
  bio TEXT,
  phone VARCHAR(50),
  email VARCHAR(255),
  latitude NUMERIC(10, 6),
  longitude NUMERIC(10, 6),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Reservations & Itinerary Dispatch
CREATE TABLE IF NOT EXISTS bookings (
  id SERIAL PRIMARY KEY,
  booking_type VARCHAR(100) NOT NULL,
  item_id INTEGER NOT NULL,
  item_title VARCHAR(255) NOT NULL,
  item_image TEXT,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  traveler_name VARCHAR(255) NOT NULL,
  traveler_email VARCHAR(255) NOT NULL,
  traveler_phone VARCHAR(50),
  travel_date VARCHAR(50) NOT NULL,
  end_date VARCHAR(50),
  time_slot VARCHAR(50) DEFAULT 'full_day',
  activity_type VARCHAR(255),
  guests VARCHAR(50) DEFAULT '2',
  nights INTEGER DEFAULT 1,
  total_price VARCHAR(50),
  payment_method VARCHAR(100) DEFAULT 'pay_on_meetup',
  payment_status VARCHAR(50) DEFAULT 'pending',
  payment_id VARCHAR(100),
  transaction_ref VARCHAR(100),
  message TEXT,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  provider_id INTEGER,
  provider_name VARCHAR(255),
  provider_notes TEXT,
  suggested_date VARCHAR(50),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Host Onboarding Applications
CREATE TABLE IF NOT EXISTS host_applications (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  region VARCHAR(100) NOT NULL,
  skill VARCHAR(255) NOT NULL,
  bio TEXT,
  languages VARCHAR(255),
  avatar TEXT,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  property_name VARCHAR(255),
  tagline TEXT,
  category VARCHAR(100) DEFAULT 'Homestay',
  price VARCHAR(50) DEFAULT '₹2,500',
  unit VARCHAR(50) DEFAULT '/night',
  altitude VARCHAR(50) DEFAULT '1,800m',
  tags TEXT,
  image TEXT,
  description TEXT,
  latitude NUMERIC(10, 6),
  longitude NUMERIC(10, 6),
  nearby_locations JSONB DEFAULT '[]'::jsonb,
  stay_options JSONB DEFAULT '[]'::jsonb,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  admin_notes TEXT,
  published_place_id INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. Email Notifications Audit Log
CREATE TABLE IF NOT EXISTS email_notifications (
  id SERIAL PRIMARY KEY,
  recipient_email VARCHAR(255) NOT NULL,
  recipient_name VARCHAR(255) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  email_type VARCHAR(100) NOT NULL,
  booking_id INTEGER,
  status VARCHAR(50) NOT NULL,
  preview TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

## 3. Migration Steps: JSON State → Supabase / PostgreSQL

To transition from local JSON persistence to a remote PostgreSQL database without losing data:

1. **Obtain Connection String**:
   In your Supabase project settings, copy the URI string:
   `postgresql://postgres:[PASSWORD]@[HOST]:[PORT]/postgres`

2. **Configure Environment Variable**:
   Set `DATABASE_URL` in your `.env` or deployment secrets:
   ```bash
   DATABASE_URL=postgresql://postgres:[PASSWORD]@[HOST]:[PORT]/postgres
   ```

3. **Start the Application**:
   When restarted, the server detects `DATABASE_URL`, builds tables automatically, and initiates the data migration.

---

## 4. Backups and Restore

### Automated JSON Backups
- The file `data/pahadily_db_state.json` is updated synchronously whenever an application, booking, or account change occurs.
- To create a manual snapshot:
  ```bash
  cp data/pahadily_db_state.json data/pahadily_backup_$(date +%F).json
  ```

### PostgreSQL Backups
- To back up your cloud database:
  ```bash
  pg_dump "$DATABASE_URL" > pahadily_pg_backup.sql
  ```
- To restore:
  ```bash
  psql "$DATABASE_URL" < pahadily_pg_backup.sql
  ```
