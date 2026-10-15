import express from "express";
import type { Request, Response, NextFunction } from "express";
import cors from "cors";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import pg from "pg";
import nodemailer from "nodemailer";

const { Pool } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getArg(flag: string): string | undefined {
  const idx = process.argv.indexOf(flag);
  return idx !== -1 && idx + 1 < process.argv.length ? process.argv[idx + 1] : undefined;
}

try {
  const envPath = path.resolve(process.cwd(), ".env");
  if (fs.existsSync(envPath) && typeof (process as any).loadEnvFile === "function") {
    (process as any).loadEnvFile(envPath);
  }
} catch {
  // Ignore missing or unreadable .env file
}

const PORT = Number(getArg("--port") || process.env.PORT) || 3000;
const HOST = getArg("--host") || "0.0.0.0";
const IS_PROD = process.env.NODE_ENV === "production";

// --- Secret Key Validation ---
const DEFAULT_DEV_SECRET = "pahadily_dev_secret_key_mountain_2026_secure_fallback";
let SECRET_KEY = process.env.JWT_SECRET || DEFAULT_DEV_SECRET;

if (IS_PROD) {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET === DEFAULT_DEV_SECRET || process.env.JWT_SECRET.length < 32) {
    console.error("FATAL: In production mode, a strong JWT_SECRET environment variable of at least 32 characters is strictly required.");
    // In production, refuse to run with insecure secret
    if (process.env.ENFORCE_PROD_SECURITY !== "false") {
      process.exit(1);
    }
  }
}

// --- Types ---
export interface User {
  id: number;
  email: string;
  password_hash: string;
  salt: string;
  full_name: string;
  phone?: string | null;
  role: "traveler" | "host" | "admin" | "guide";
  avatar?: string | null;
  bio?: string | null;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
}

export interface Place {
  id: number;
  name: string;
  tagline: string;
  region: string;
  district?: string;
  category: string;
  price: string;
  unit: string;
  rating: number;
  reviews: number;
  altitude: string;
  tags: string[];
  image: string;
  description: string;
  host_name?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  nearby_locations: any[];
  stay_options: any[];
  created_at: string;
}

export interface PlaceReview {
  id: number;
  place_id: number;
  user_name: string;
  rating: number;
  comment: string;
  created_at: string;
}

export interface Experience {
  id: number;
  title: string;
  region: string;
  location: string;
  category: string;
  duration: string;
  difficulty: string;
  price: string;
  unit: string;
  guide: string;
  rating: number;
  reviews: number;
  image: string;
  description: string;
  inclusions: string[];
  created_at: string;
}

export interface Local {
  id: number;
  category: string;
  region: string;
  name: string;
  location: string;
  role: string;
  lang: string;
  rating: number;
  reviews: number;
  price: string;
  unit: string;
  tags: string[];
  image?: string | null;
  verified: boolean;
  certified: boolean;
  gradient?: string | null;
  bio?: string | null;
  phone?: string | null;
  email?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  created_at: string;
}

export interface Booking {
  id: number;
  booking_type: string;
  item_id: number;
  item_title: string;
  item_image?: string | null;
  user_id?: number | null;
  traveler_name: string;
  traveler_email: string;
  traveler_phone?: string | null;
  travel_date: string;
  end_date?: string | null;
  time_slot?: "morning" | "afternoon" | "full_day" | string;
  activity_type?: string | null;
  guests: string;
  nights: number;
  total_price?: string | null;
  payment_method: string;
  payment_status: string;
  payment_id?: string | null;
  transaction_ref?: string | null;
  message: string;
  status: "pending" | "confirmed" | "declined" | "cancelled" | "completed" | string;
  provider_id?: number | null;
  provider_name?: string | null;
  provider_notes?: string | null;
  suggested_date?: string | null;
  notification_events?: string[];
  created_at: string;
}

export interface HostApplication {
  id: number;
  name: string;
  email?: string | null;
  phone?: string | null;
  region: string;
  skill: string;
  bio?: string | null;
  languages?: string | null;
  avatar?: string | null;
  user_id?: number | null;
  property_name?: string | null;
  tagline?: string | null;
  category?: string | null;
  price: string;
  unit: string;
  altitude: string;
  tags?: string | null;
  image?: string | null;
  description?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  nearby_locations: any[];
  stay_options: any[];
  status: "pending" | "approved" | "rejected";
  admin_notes?: string | null;
  published_place_id?: number | null;
  created_at: string;
}

export interface EmailNotification {
  id: number;
  recipient_email: string;
  recipient_name: string;
  subject: string;
  email_type: string;
  booking_id?: number | null;
  status: "accepted" | "sent" | "delivered" | "failed" | "unavailable";
  preview: string;
  created_at: string;
}

export interface LocationImage {
  id: string;
  url: string;
  caption?: string;
  credit?: string;
}

export interface LocationItem {
  id: number;
  name: string;
  slug: string;
  district: string;
  valley: string;
  village?: string;
  category: string;
  description: string;
  latitude: number | null;
  longitude: number | null;
  cover_image: string;
  gallery: LocationImage[];
  best_time?: string;
  difficulty?: string;
  safety_notes?: string;
  tags: string[];
  status: "draft" | "published" | "archived";
  created_at: string;
  updated_at: string;
}

export interface LocationCategory {
  id: string;
  name: string;
  icon?: string;
  description?: string;
  is_active: boolean;
  created_at: string;
}

export const DEFAULT_ADMIN_CATEGORIES: LocationCategory[] = [
  { id: "viewpoints", name: "Viewpoints", icon: "🏔️", description: "High-altitude mountain overlooks and sunrise ridges", is_active: true, created_at: new Date().toISOString() },
  { id: "waterfalls", name: "Waterfalls", icon: "🌊", description: "Secluded glacial cascades and mountain streams", is_active: true, created_at: new Date().toISOString() },
  { id: "villages", name: "Villages", icon: "🏡", description: "Ancient Himalayan settlement hamlets with traditional architecture", is_active: true, created_at: new Date().toISOString() },
  { id: "meadows", name: "Meadows", icon: "🌿", description: "Sacred high-altitude alpine grasslands and cedar glades", is_active: true, created_at: new Date().toISOString() },
  { id: "temples", name: "Temples", icon: "⛩️", description: "Historical pagoda-style devta shrines and sacred local sanctuaries", is_active: true, created_at: new Date().toISOString() },
  { id: "cultural-sites", name: "Cultural Sites", icon: "🪵", description: "Indigenous craft workshops, watermills, and living cultural heritage", is_active: true, created_at: new Date().toISOString() },
  { id: "trekking-destinations", name: "Trekking Destinations", icon: "🥾", description: "High-altitude mountain passes, alpine lakes, and backcountry walking trails", is_active: true, created_at: new Date().toISOString() },
];

// --- Storage Engine State & Dual-Mode Configuration ---
export let activeStorageType: "postgres" | "local_json" = "local_json";
let pgPool: pg.Pool | null = null;

const users = new Map<number, User>();
const places = new Map<number, Place>();
const placeReviews = new Map<number, PlaceReview>();
const experiences = new Map<number, Experience>();
const locals = new Map<number, Local>();
const bookings = new Map<number, Booking>();
const hostApplications = new Map<number, HostApplication>();
const locations = new Map<number, LocationItem>();
const categories = new Map<string, LocationCategory>();
const emailNotifications: EmailNotification[] = [];

let nextUserId = 1;
let nextPlaceId = 1;
let nextReviewId = 1;
let nextExperienceId = 1;
let nextLocalId = 1;
let nextBookingId = 1001;
let nextHostAppId = 1;
let nextNotificationId = 1;
let nextLocationId = 1;

// --- JSON Disk Persistence Path ---
const DB_FILE = path.resolve(__dirname, "data", "pahadily_db_state.json");

function saveDbState() {
  if (activeStorageType === "postgres") return; // PostgreSQL handles persistence
  try {
    const dir = path.dirname(DB_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const state = {
      users: Array.from(users.entries()),
      places: Array.from(places.entries()),
      placeReviews: Array.from(placeReviews.entries()),
      experiences: Array.from(experiences.entries()),
      locals: Array.from(locals.entries()),
      bookings: Array.from(bookings.entries()),
      hostApplications: Array.from(hostApplications.entries()),
      locations: Array.from(locations.entries()),
      categories: Array.from(categories.entries()),
      emailNotifications,
      nextUserId,
      nextPlaceId,
      nextReviewId,
      nextExperienceId,
      nextLocalId,
      nextBookingId,
      nextHostAppId,
      nextNotificationId,
      nextLocationId,
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(state, null, 2), "utf-8");
  } catch (err) {
    console.error("[Storage] Failed to persist state to JSON file:", err);
  }
}

function loadDbState(): boolean {
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, "utf-8");
      const state = JSON.parse(raw);
      if (state.users) for (const [k, v] of state.users) users.set(k, v);
      if (state.places) for (const [k, v] of state.places) places.set(k, v);
      if (state.placeReviews) for (const [k, v] of state.placeReviews) placeReviews.set(k, v);
      if (state.experiences) for (const [k, v] of state.experiences) experiences.set(k, v);
      if (state.locals) for (const [k, v] of state.locals) locals.set(k, v);
      if (state.bookings) for (const [k, v] of state.bookings) bookings.set(k, v);
      if (state.hostApplications) for (const [k, v] of state.hostApplications) hostApplications.set(k, v);
      if (state.locations) for (const [k, v] of state.locations) locations.set(k, v);
      if (state.categories) for (const [k, v] of state.categories) categories.set(k, v);
      if (Array.isArray(state.emailNotifications)) {
        emailNotifications.length = 0;
        emailNotifications.push(...state.emailNotifications);
      }
      if (state.nextUserId) nextUserId = Math.max(nextUserId, state.nextUserId);
      if (state.nextPlaceId) nextPlaceId = Math.max(nextPlaceId, state.nextPlaceId);
      if (state.nextReviewId) nextReviewId = Math.max(nextReviewId, state.nextReviewId);
      if (state.nextExperienceId) nextExperienceId = Math.max(nextExperienceId, state.nextExperienceId);
      if (state.nextLocalId) nextLocalId = Math.max(nextLocalId, state.nextLocalId);
      if (state.nextBookingId) nextBookingId = Math.max(nextBookingId, state.nextBookingId);
      if (state.nextHostAppId) nextHostAppId = Math.max(nextHostAppId, state.nextHostAppId);
      if (state.nextNotificationId) nextNotificationId = Math.max(nextNotificationId, state.nextNotificationId);
      if (state.nextLocationId) nextLocationId = Math.max(nextLocationId, state.nextLocationId);
      console.log(`[Storage] Loaded JSON persistence from ${DB_FILE} with ${locations.size} locations, ${categories.size} categories, and ${bookings.size} bookings.`);
      return true;
    }
  } catch (err) {
    console.warn("[Storage] Could not load JSON db state:", err);
  }
  return false;
}

// --- Seed Data Initializer ---
function initSeedData() {
  // Ensure Super Admin
  const adminSalt = crypto.randomBytes(16).toString("hex");
  const adminHash = hashPassword("Tgulshan@2", adminSalt).hash;
  const adminUser: User = {
    id: nextUserId++,
    email: "gulshany0001@gmail.com",
    password_hash: adminHash,
    salt: adminSalt,
    full_name: "Gulshan (Owner & Admin)",
    phone: "+91 98160 00001",
    role: "admin",
    bio: "Platform Owner & Master Administrator",
    avatar: null,
    is_active: true,
    is_verified: true,
    created_at: new Date().toISOString(),
  };
  if (!users.has(1)) {
    users.set(adminUser.id, adminUser);
  }

  // Load default categories if none exist
  if (categories.size === 0) {
    for (const cat of DEFAULT_ADMIN_CATEGORIES) {
      categories.set(cat.id, cat);
    }
  }
}

// --- PostgreSQL Initialization & Migration ---
async function initDatabase() {
  const dbUrl = process.env.DATABASE_URL;

  if (dbUrl) {
    try {
      console.log("[Storage] Attempting to connect to PostgreSQL...");
      pgPool = new Pool({
        connectionString: dbUrl,
        ssl: dbUrl.includes("localhost") || dbUrl.includes("127.0.0.1") ? false : { rejectUnauthorized: false },
      });

      // Test connection
      const testRes = await pgPool.query("SELECT NOW()");
      console.log(`[Storage] Connected to PostgreSQL at ${testRes.rows[0].now}`);
      activeStorageType = "postgres";

      // Initialize Tables
      await pgPool.query(`
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          email VARCHAR(255) UNIQUE NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          salt VARCHAR(255) NOT NULL,
          full_name VARCHAR(255) NOT NULL,
          phone VARCHAR(50),
          role VARCHAR(50) NOT NULL DEFAULT 'traveler',
          avatar TEXT,
          bio TEXT,
          is_active BOOLEAN NOT NULL DEFAULT true,
          is_verified BOOLEAN NOT NULL DEFAULT true,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );

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

        CREATE TABLE IF NOT EXISTS place_reviews (
          id SERIAL PRIMARY KEY,
          place_id INTEGER REFERENCES places(id) ON DELETE CASCADE,
          user_name VARCHAR(255) NOT NULL,
          rating INTEGER NOT NULL,
          comment TEXT,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );

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

        CREATE TABLE IF NOT EXISTS location_categories (
          id VARCHAR(100) PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          icon VARCHAR(50),
          description TEXT,
          is_active BOOLEAN NOT NULL DEFAULT true,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS locations (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          slug VARCHAR(255) NOT NULL,
          district VARCHAR(100) NOT NULL,
          valley VARCHAR(100) NOT NULL,
          village VARCHAR(255),
          category VARCHAR(100) NOT NULL,
          description TEXT,
          latitude NUMERIC(10, 6),
          longitude NUMERIC(10, 6),
          cover_image TEXT,
          gallery JSONB DEFAULT '[]'::jsonb,
          best_time VARCHAR(100),
          difficulty VARCHAR(100),
          safety_notes TEXT,
          tags JSONB DEFAULT '[]'::jsonb,
          status VARCHAR(50) NOT NULL DEFAULT 'draft',
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
      `);

      console.log("[Storage] PostgreSQL schema tables verified.");
    } catch (err) {
      console.error("[Storage] PostgreSQL initialization failed:", err);
      if (IS_PROD && process.env.ALLOW_LOCAL_STORAGE !== "true") {
        console.error("FATAL: In production, database connection failed and ALLOW_LOCAL_STORAGE is not true. Halting.");
        process.exit(1);
      }
      console.warn("[Storage] Falling back to local JSON persistence.");
      activeStorageType = "local_json";
    }
  } else {
    if (IS_PROD && process.env.ALLOW_LOCAL_STORAGE !== "true") {
      console.error("FATAL: DATABASE_URL is not configured in production mode. Set DATABASE_URL or set ALLOW_LOCAL_STORAGE=true.");
      process.exit(1);
    }
    console.log("[Storage] DATABASE_URL not set. Active storage: Local JSON persistence (data/pahadily_db_state.json).");
    activeStorageType = "local_json";
  }

  // Load state or seeds
  initSeedData();
  loadDbState();
  saveDbState();
}

// --- Crypto & Password Helpers ---
function hashPassword(password: string, salt?: string): { hash: string; salt: string } {
  const actualSalt = salt || crypto.randomBytes(16).toString("hex");
  const derivedKey = crypto.pbkdf2Sync(password, actualSalt, 100000, 32, "sha256");
  return { hash: derivedKey.toString("hex"), salt: actualSalt };
}

function verifyPassword(password: string, salt: string, expectedHash: string): boolean {
  try {
    const { hash } = hashPassword(password, salt);
    return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(expectedHash));
  } catch {
    return false;
  }
}

function createToken(user: User): string {
  const payload = {
    sub: user.id,
    email: user.email,
    role: user.role,
    name: user.full_name,
    exp: Math.floor(Date.now() / 1000) + 86400 * 30, // 30 days
    nonce: crypto.randomBytes(8).toString("hex"),
  };
  const payloadRaw = Buffer.from(JSON.stringify(payload)).toString("hex");
  const signature = crypto.createHmac("sha256", SECRET_KEY).update(payloadRaw).digest("hex");
  return `${payloadRaw}.${signature}`;
}

function decodeToken(token: string): any | null {
  try {
    if (!token || !token.includes(".")) return null;
    const [payloadHex, signature] = token.split(".");
    const expectedSig = crypto.createHmac("sha256", SECRET_KEY).update(payloadHex).digest("hex");
    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSig))) {
      return null;
    }
    const payloadStr = Buffer.from(payloadHex, "hex").toString("utf-8");
    const payload = JSON.parse(payloadStr);
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

// User output sanitizer: NEVER expose password_hash or salt
function userToOut(u: User) {
  const bCount = Array.from(bookings.values()).filter(
    (b) => b.user_id === u.id || b.traveler_email.toLowerCase() === u.email.toLowerCase()
  ).length;

  const hasPendingApp = Array.from(hostApplications.values()).some(
    (a) => (a.user_id === u.id || (a.email && a.email.toLowerCase() === u.email.toLowerCase())) && a.status === "pending"
  );

  return {
    id: u.id,
    email: u.email,
    full_name: u.full_name,
    phone: u.phone,
    role: u.role,
    avatar: u.avatar,
    bio: u.bio,
    is_active: u.is_active,
    is_verified: u.is_verified,
    created_at: u.created_at,
    bookings_count: bCount,
    has_pending_application: hasPendingApp,
  };
}

// --- Double-Booking Conflict Prevention Helper ---
function hasBookingConflict(
  providerIdOrName: number | string,
  travelDate: string,
  timeSlot: string = "full_day",
  excludeBookingId?: number,
  bookingType?: string
): boolean {
  for (const b of bookings.values()) {
    if (excludeBookingId && b.id === excludeBookingId) continue;
    // Only accepted/confirmed bookings block the slot
    if (b.status !== "confirmed") continue;

    if (bookingType && b.booking_type && b.booking_type !== bookingType) {
      continue;
    }

    const isSameProvider =
      (typeof providerIdOrName === "number" && b.item_id === providerIdOrName) ||
      (b.provider_id && typeof providerIdOrName === "number" && b.provider_id === providerIdOrName) ||
      (b.provider_name &&
        typeof providerIdOrName === "string" &&
        b.provider_name.toLowerCase().includes(providerIdOrName.toLowerCase())) ||
      (b.item_title &&
        typeof providerIdOrName === "string" &&
        b.item_title.toLowerCase().includes(providerIdOrName.toLowerCase()));

    if (!isSameProvider) continue;

    if (b.travel_date === travelDate) {
      if (b.time_slot === "full_day" || timeSlot === "full_day" || b.time_slot === timeSlot) {
        return true;
      }
    }
  }
  return false;
}

function escapeHtml(str?: string | null): string {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// --- Site URL Helper (Never outputs localhost in production emails) ---
function getSiteUrl(req?: Request): string {
  if (process.env.VITE_SITE_URL && !process.env.VITE_SITE_URL.includes("localhost")) {
    return process.env.VITE_SITE_URL.replace(/\/$/, "");
  }
  if (req) {
    const origin = req.get("origin");
    if (origin && !origin.includes("localhost")) {
      return origin.replace(/\/$/, "");
    }
    const host = req.get("host");
    if (host && !host.includes("localhost")) {
      const proto = req.protocol === "https" || req.get("x-forwarded-proto") === "https" ? "https" : "http";
      return `${proto}://${host}`;
    }
  }
  return "https://pahadily.com";
}

// --- Strict Pricing & Date Validation Helpers ---
function parseItemPrice(rawPrice?: string | null, fallback: number = 1800): number {
  if (!rawPrice) return fallback;
  const num = parseInt(String(rawPrice).replace(/[^0-9]/g, ""), 10);
  return !isNaN(num) && num > 0 ? num : fallback;
}

function calculateStayPricingAndDates(
  travelDate: string,
  nightsInput: any,
  guestsInput: any,
  matchedLocation?: LocationItem | null,
  matchedPlace?: Place | null
) {
  const nights = Math.min(30, Math.max(1, parseInt(String(nightsInput || "1"), 10) || 1));
  const guests = Math.min(20, Math.max(1, parseInt(String(guestsInput || "1"), 10) || 1));

  // Server-side UTC-safe date math
  const [y, m, d] = travelDate.split("-").map(Number);
  const checkInUtc = new Date(Date.UTC(y, m - 1, d));
  const checkOutUtc = new Date(checkInUtc);
  checkOutUtc.setUTCDate(checkOutUtc.getUTCDate() + nights);
  const end_date = checkOutUtc.toISOString().slice(0, 10);

  const rawPriceStr = (matchedLocation as any)?.price || matchedPlace?.price || "₹1,800";
  const unitStr = (matchedLocation as any)?.unit || matchedPlace?.unit || "/night";
  const baseRate = parseItemPrice(rawPriceStr, 1800);
  const isPerPerson = unitStr.toLowerCase().includes("person");

  const computedTotal = isPerPerson ? baseRate * guests * nights : baseRate * nights;
  const total_price = `₹${computedTotal.toLocaleString("en-IN")}`;

  return { nights, guests, end_date, total_price, baseRate };
}

// --- Real SMTP Email Dispatcher with Accurate Status Reporting & Deduplication ---
async function dispatchEmailNotification(
  recipientEmail: string,
  recipientName: string,
  subject: string,
  emailType: string,
  bookingId?: number | null,
  bodyText?: string,
  htmlContent?: string
): Promise<EmailNotification> {
  // Deduplication check: prevent identical dispatch within short window
  if (bookingId && emailType) {
    const existingRecent = emailNotifications.find(
      (n) => n.booking_id === bookingId && n.email_type === emailType && (n.status === "accepted" || n.status === "sent")
    );
    if (existingRecent) {
      console.log(`[Email] Skipping duplicate dispatch for booking #${bookingId} event '${emailType}' (already ${existingRecent.status})`);
      return existingRecent;
    }
  }

  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = Number(process.env.SMTP_PORT) || 587;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASSWORD;
  const senderName = process.env.SENDER_NAME || "Pahadíly";
  const smtpFrom = process.env.SMTP_FROM || `"${senderName}" <no-reply@pahadily.com>`;

  const notif: EmailNotification = {
    id: nextNotificationId++,
    recipient_email: recipientEmail,
    recipient_name: recipientName,
    subject,
    email_type: emailType,
    booking_id: bookingId || null,
    status: "unavailable",
    preview: "",
    created_at: new Date().toISOString(),
  };

  if (smtpHost && smtpUser && smtpPass) {
    try {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
        tls: {
          rejectUnauthorized: false,
        },
        connectionTimeout: 8000,
        greetingTimeout: 5000,
      });

      const defaultHtml = `<div style="font-family:sans-serif;padding:24px;background-color:#FAF8F2;color:#0C2017;"><div style="background-color:#10251D;padding:20px;border-radius:10px;text-align:center;"><h2 style="color:#FAF8F2;margin:0;">Pahadíly</h2><p style="color:#8EE49A;margin:4px 0 0 0;font-size:12px;">Himalayan Discovery</p></div><div style="background:#FFF;padding:20px;border-radius:10px;margin-top:16px;border:1px solid rgba(16,38,29,0.1);"><p style="font-size:15px;line-height:1.6;">${bodyText || subject}</p></div></div>`;

      const info = await transporter.sendMail({
        from: smtpFrom,
        to: recipientEmail,
        subject,
        text: bodyText || subject,
        html: htmlContent || defaultHtml,
      });

      // Nodemailer handoff to SMTP server accepted
      notif.status = "accepted";
      notif.preview = `Accepted by SMTP server for delivery to ${recipientEmail} (MsgID: ${info.messageId || "ok"})`;
    } catch (err: any) {
      console.warn(`[Email] SMTP delivery failed for ${recipientEmail}:`, err?.message);
      notif.status = "failed";
      notif.preview = `SMTP dispatch error: ${err?.message || "Delivery rejected"}`;
    }
  } else {
    // Honest reporting: SMTP is unconfigured. Never claim 'sent' or 'delivered'!
    notif.status = "unavailable";
    notif.preview = `Outgoing SMTP service is not configured in this environment. Notification recorded.`;
  }

  emailNotifications.push(notif);
  saveDbState();
  return notif;
}

// --- Reusable HTML & Text Email Template Generator ---
function renderStayEmailContent(params: {
  booking: Booking;
  location?: LocationItem | Place | null;
  siteUrl: string;
  headlineTitle: string;
  badgeText: string;
  badgeBg: string;
  badgeColor: string;
  statusLabel: string;
  statusColor: string;
  introMessage: string;
}) {
  const {
    booking,
    location,
    siteUrl,
    headlineTitle,
    badgeText,
    badgeBg,
    badgeColor,
    statusLabel,
    statusColor,
    introMessage,
  } = params;

  const propertyName = booking.item_title || (location as any)?.name || "Himalayan Homestay";
  const hostName = booking.provider_name || (location as any)?.host_name || (location as any)?.name || "Local Village Host";

  const locationParts: string[] = [];
  if ((location as any)?.village) locationParts.push((location as any).village);
  if ((location as any)?.valley) locationParts.push(`${(location as any).valley} Valley`);
  if ((location as any)?.district) locationParts.push((location as any).district);
  if ((location as any)?.region && locationParts.length === 0) locationParts.push((location as any).region);
  const stayLocationStr = locationParts.length > 0 ? locationParts.join(", ") : "Himachal Pradesh, India";

  const numNights = Math.max(1, Number(booking.nights) || 1);
  const checkOutDate = booking.end_date || "Next day";
  const voucherRef = booking.transaction_ref || booking.payment_id || `PHD-STAY-${booking.id}`;
  const mealPlan = booking.activity_type || "Traditional Homestay Living";
  const paymentSettlement = booking.payment_method === "pay_on_meetup"
    ? "Pay Direct to Host on Meetup / Arrival (Cash or UPI)"
    : String(booking.payment_method);

  const textBody = `
PAHADÍLY — HIMALAYAN HOMESTAY RESERVATION NOTICE
================================================
Voucher / Reference ID: #${booking.id} (${voucherRef})
Status: ${statusLabel}

Dear ${booking.traveler_name},

${introMessage}

STAY DETAILS
------------
Property: ${propertyName}
Host: ${hostName}
Location: ${stayLocationStr}
Check-in: ${booking.travel_date} (from 12:00 PM)
Check-out: ${checkOutDate} (by 11:00 AM)
Duration: ${numNights} Night(s)
Guests: ${booking.guests} Traveler(s)
Hospitality Plan: ${mealPlan}
Total Honorarium: ${booking.total_price || "₹1,800"}
Platform Fee: ₹0 (100% goes directly to the community)
Payment Settlement: ${paymentSettlement}

HOST & TRAVELER COORDINATION
----------------------------
Host Name: ${hostName}
Primary Traveler: ${booking.traveler_name}
Traveler Email: ${booking.traveler_email}
Traveler Phone: ${booking.traveler_phone || "Not provided"}
Special Requests: ${booking.message || "None"}

HIMALAYAN HOMESTAY LIVING GUIDELINES
------------------------------------
1. Kath-Kuni Architecture: Traditional timber-and-stone homes stay naturally insulated. Please remove outdoor footwear at the wooden threshold.
2. Zero-Waste Commitment: Please carry all non-biodegradable plastics back down to major roadheads. Leave no plastics in village streams.
3. Fresh Local Meals: Dishes are freshly prepared on traditional wood-fired hearths with local mountain grains, lentils, and garden greens.

View and manage your reservation anytime at: ${siteUrl}/my-bookings

Warm regards from the mountains,
The Pahadíly Community & Your Local Host
support@pahadily.com • Himachal Pradesh, India
`.trim();

  const htmlBody = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(headlineTitle)} - Pahadíly</title>
</head>
<body style="margin:0;padding:0;background-color:#FAF8F2;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#0C2017;-webkit-font-smoothing:antialiased;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#FAF8F2;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width:620px;background-color:#FFFFFF;border-radius:16px;overflow:hidden;border:1px solid rgba(16,38,29,0.08);box-shadow:0 8px 24px rgba(12,32,23,0.06);">
          
          <!-- Brand Header -->
          <tr>
            <td style="background-color:#10251D;padding:36px 32px 28px 32px;text-align:center;">
              <div style="color:#8EE49A;font-size:11px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;margin-bottom:8px;">
                PAHADÍLY • HIMALAYAN HOMESTAYS & RETREATS
              </div>
              <h1 style="color:#FAF8F2;font-family:Georgia,serif;font-size:24px;font-weight:700;margin:0 0 10px 0;letter-spacing:-0.01em;">
                ${escapeHtml(headlineTitle)}
              </h1>
              <div style="display:inline-block;background-color:${badgeBg};border:1px solid rgba(142,228,154,0.35);color:${badgeColor};padding:5px 16px;border-radius:9999px;font-size:12px;font-weight:700;">
                ${escapeHtml(badgeText)}
              </div>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding:32px;">
              <p style="font-size:15px;line-height:1.6;color:#2D4438;margin:0 0 16px 0;">
                Dear <strong>${escapeHtml(booking.traveler_name)}</strong>,
              </p>
              <p style="font-size:14.5px;line-height:1.65;color:#2D4438;margin:0 0 24px 0;">
                ${escapeHtml(introMessage)}
              </p>

              <!-- Reservation Summary Card -->
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#F7F5EE;border-radius:12px;border:1px solid rgba(16,38,29,0.08);margin-bottom:28px;">
                <tr>
                  <td style="padding:22px;">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;">
                      <span style="font-size:11px;font-weight:700;color:#688575;text-transform:uppercase;letter-spacing:0.12em;">
                        STAY RESERVATION DETAILS
                      </span>
                      <span style="font-size:12px;font-weight:700;color:${statusColor};">
                        ${escapeHtml(statusLabel)}
                      </span>
                    </div>

                    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                      <tr>
                        <td style="padding:6px 0;font-size:13.5px;color:#536B5E;width:40%;">Property:</td>
                        <td style="padding:6px 0;font-size:14px;font-weight:700;color:#0C2017;text-align:right;">${escapeHtml(propertyName)}</td>
                      </tr>
                      <tr>
                        <td style="padding:6px 0;font-size:13.5px;color:#536B5E;">Village / Region:</td>
                        <td style="padding:6px 0;font-size:13.5px;font-weight:600;color:#0C2017;text-align:right;">${escapeHtml(stayLocationStr)}</td>
                      </tr>
                      <tr>
                        <td style="padding:6px 0;font-size:13.5px;color:#536B5E;">Check-in:</td>
                        <td style="padding:6px 0;font-size:13.5px;font-weight:700;color:#174D39;text-align:right;">${escapeHtml(booking.travel_date)} (from 12:00 PM)</td>
                      </tr>
                      <tr>
                        <td style="padding:6px 0;font-size:13.5px;color:#536B5E;">Check-out:</td>
                        <td style="padding:6px 0;font-size:13.5px;font-weight:700;color:#174D39;text-align:right;">${escapeHtml(checkOutDate)} (by 11:00 AM)</td>
                      </tr>
                      <tr>
                        <td style="padding:6px 0;font-size:13.5px;color:#536B5E;">Duration:</td>
                        <td style="padding:6px 0;font-size:13.5px;font-weight:600;color:#0C2017;text-align:right;">${numNights} Night(s)</td>
                      </tr>
                      <tr>
                        <td style="padding:6px 0;font-size:13.5px;color:#536B5E;">Travelers:</td>
                        <td style="padding:6px 0;font-size:13.5px;font-weight:600;color:#0C2017;text-align:right;">${escapeHtml(booking.guests)} Guest(s)</td>
                      </tr>
                      <tr>
                        <td style="padding:6px 0;font-size:13.5px;color:#536B5E;">Hospitality Option:</td>
                        <td style="padding:6px 0;font-size:13.5px;font-weight:600;color:#0C2017;text-align:right;">${escapeHtml(mealPlan)}</td>
                      </tr>
                      <tr style="border-top:1px dashed rgba(16,38,29,0.15);">
                        <td style="padding:10px 0 4px 0;font-size:14px;font-weight:700;color:#0C2017;">Total Honorarium:</td>
                        <td style="padding:10px 0 4px 0;font-size:18px;font-weight:800;color:#174D39;text-align:right;">${escapeHtml(booking.total_price || "₹1,800")}</td>
                      </tr>
                      <tr>
                        <td style="padding:2px 0;font-size:12px;color:#688575;">Platform Fee:</td>
                        <td style="padding:2px 0;font-size:12px;font-weight:600;color:#205540;text-align:right;">₹0 (Fair Community Model)</td>
                      </tr>
                      <tr>
                        <td style="padding:2px 0;font-size:12px;color:#688575;">Payment Settlement:</td>
                        <td style="padding:2px 0;font-size:12px;font-weight:600;color:#688575;text-align:right;">${escapeHtml(paymentSettlement)}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Host & Arrival Info -->
              <div style="font-size:12px;font-weight:700;color:#10251D;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:10px;">
                Host & Arrival Coordination
              </div>
              <div style="background-color:#FFFFFF;border:1px solid rgba(16,38,29,0.1);border-radius:10px;padding:16px;margin-bottom:24px;">
                <div style="font-size:13.5px;color:#2D4438;margin-bottom:6px;">
                  <strong>Local Host:</strong> ${escapeHtml(hostName)}
                </div>
                <div style="font-size:13.5px;color:#2D4438;margin-bottom:6px;">
                  <strong>Primary Guest:</strong> ${escapeHtml(booking.traveler_name)} • ${escapeHtml(booking.traveler_phone || "Phone not specified")}
                </div>
                <div style="font-size:13.5px;color:#2D4438;margin-bottom:6px;">
                  <strong>Registered Email:</strong> ${escapeHtml(booking.traveler_email)}
                </div>
                ${booking.message ? `<div style="font-size:13px;color:#536B5E;margin-top:6px;font-style:italic;"><strong>Guest Notes:</strong> "${escapeHtml(booking.message)}"</div>` : ""}
              </div>

              <!-- Community Etiquette Section -->
              <div style="background-color:rgba(32,85,64,0.05);border-left:4px solid #205540;padding:16px;border-radius:0 10px 10px 0;margin-bottom:28px;">
                <div style="font-size:12.5px;font-weight:700;color:#205540;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:8px;">
                  🌿 Himalayan Homestay Guidelines
                </div>
                <ul style="margin:0;padding-left:18px;font-size:13px;line-height:1.65;color:#355344;">
                  <li><strong>Kath-Kuni Heritage:</strong> Our partner homes are built with native deodar timber and dry stone. Please remove shoes when entering interior living quarters.</li>
                  <li><strong>Zero-Waste Responsibility:</strong> Carry all non-biodegradable plastics back down to town roadheads. Do not leave packaging in village streams.</li>
                  <li><strong>Mountain Hospitality:</strong> Meals are freshly prepared on traditional wood-fired hearths with local mountain grains, lentils, and garden greens.</li>
                </ul>
              </div>

              <!-- CTA Button -->
              <div style="text-align:center;margin:32px 0 16px 0;">
                <a href="${siteUrl}/my-bookings" target="_blank" style="display:inline-block;background-color:#174D39;color:#FFFFFF;padding:13px 30px;border-radius:9999px;font-size:14px;font-weight:700;text-decoration:none;letter-spacing:0.02em;">
                  View Your Reservation on Pahadíly →
                </a>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#F7F5EE;padding:24px 32px;border-top:1px solid rgba(16,38,29,0.06);text-align:center;">
              <p style="margin:0 0 6px 0;font-size:12px;color:#688575;font-weight:600;">
                Pahadíly Automated Stay Notification Service • Rare Places. Real People. Lasting Stories.
              </p>
              <p style="margin:0;font-size:11.5px;color:#8A9F92;">
                Himachal Pradesh, India • This email was sent to ${escapeHtml(booking.traveler_email)}.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  return { textBody, htmlBody };
}

// 1. Initial Stay Request Received (Pending Host Review)
async function dispatchStayRequestReceivedEmail(
  booking: Booking,
  location?: LocationItem | Place | null,
  req?: Request
): Promise<EmailNotification> {
  const propertyName = booking.item_title || (location as any)?.name || "Himalayan Homestay";
  const hostName = booking.provider_name || (location as any)?.host_name || "Local Host";
  const siteUrl = getSiteUrl(req);

  const { textBody, htmlBody } = renderStayEmailContent({
    booking,
    location,
    siteUrl,
    headlineTitle: "Stay Reservation Request Received",
    badgeText: `Voucher #${booking.id} • Pending Host Acceptance`,
    badgeBg: "rgba(217, 154, 56, 0.25)",
    badgeColor: "#8a580a",
    statusLabel: "⏳ Pending Host Review",
    statusColor: "#99630c",
    introMessage: `Your reservation request for ${propertyName} has been received and dispatched to your host, ${hostName}. Once your host accepts the dates, an official confirmed stay voucher will be issued.`,
  });

  return dispatchEmailNotification(
    booking.traveler_email,
    booking.traveler_name,
    `Stay Request Received: ${propertyName} (Pending Host Review) | Pahadíly #${booking.id}`,
    "stay_request_received",
    booking.id,
    textBody,
    htmlBody
  );
}

// 2. Stay Booking Confirmed by Host (Confirmed Voucher Issued)
async function dispatchStayBookingConfirmedEmail(
  booking: Booking,
  location?: LocationItem | Place | null,
  req?: Request
): Promise<EmailNotification> {
  const propertyName = booking.item_title || (location as any)?.name || "Himalayan Homestay";
  const hostName = booking.provider_name || (location as any)?.host_name || "Local Host";
  const siteUrl = getSiteUrl(req);

  const { textBody, htmlBody } = renderStayEmailContent({
    booking,
    location,
    siteUrl,
    headlineTitle: "Stay Reservation Confirmed",
    badgeText: `✓ Confirmed Voucher #${booking.id}`,
    badgeBg: "rgba(142, 228, 154, 0.25)",
    badgeColor: "#174D39",
    statusLabel: "✓ Confirmed by Host",
    statusColor: "#174D39",
    introMessage: `Great news! Your stay at ${propertyName} has been officially confirmed by your host, ${hostName}. Your room is reserved for your dates. Below is your official stay voucher and arrival instructions.`,
  });

  return dispatchEmailNotification(
    booking.traveler_email,
    booking.traveler_name,
    `Confirmed: Stay Reservation at ${propertyName} | Pahadíly Voucher #${booking.id}`,
    "stay_confirmed",
    booking.id,
    textBody,
    htmlBody
  );
}

// 3. Stay Booking Declined by Provider
async function dispatchStayBookingDeclinedEmail(
  booking: Booking,
  location?: LocationItem | Place | null,
  req?: Request
): Promise<EmailNotification> {
  const propertyName = booking.item_title || (location as any)?.name || "Himalayan Homestay";
  const hostName = booking.provider_name || "Local Host";
  const siteUrl = getSiteUrl(req);

  const { textBody, htmlBody } = renderStayEmailContent({
    booking,
    location,
    siteUrl,
    headlineTitle: "Stay Request Update: Dates Unavailable",
    badgeText: `Request #${booking.id} • Unavailable`,
    badgeBg: "rgba(200, 109, 81, 0.2)",
    badgeColor: "#a3391b",
    statusLabel: "✕ Dates Unavailable",
    statusColor: "#a3391b",
    introMessage: `Your host, ${hostName}, was unable to accept your stay reservation request for ${propertyName} on the requested dates. Provider note: ${booking.provider_notes || "Host was unavailable."}${booking.suggested_date ? ` Suggested alternate date: ${booking.suggested_date}` : ""}`,
  });

  return dispatchEmailNotification(
    booking.traveler_email,
    booking.traveler_name,
    `Update on Stay Request: ${propertyName} | Pahadíly #${booking.id}`,
    "stay_declined",
    booking.id,
    textBody,
    htmlBody
  );
}

// 4. Stay Booking Cancelled
async function dispatchStayBookingCancelledEmail(
  booking: Booking,
  location?: LocationItem | Place | null,
  req?: Request
): Promise<EmailNotification> {
  const propertyName = booking.item_title || "Himalayan Homestay";
  const siteUrl = getSiteUrl(req);

  const { textBody, htmlBody } = renderStayEmailContent({
    booking,
    location,
    siteUrl,
    headlineTitle: "Stay Reservation Cancelled",
    badgeText: `Voucher #${booking.id} • Cancelled`,
    badgeBg: "rgba(100, 100, 100, 0.2)",
    badgeColor: "#555555",
    statusLabel: "Cancelled",
    statusColor: "#555555",
    introMessage: `Your stay reservation for ${propertyName} (Voucher #${booking.id}) has been cancelled. If payment was made, your refund has been processed in accordance with our community policy.`,
  });

  return dispatchEmailNotification(
    booking.traveler_email,
    booking.traveler_name,
    `Stay Reservation Cancelled: ${propertyName} | Pahadíly #${booking.id}`,
    "stay_cancelled",
    booking.id,
    textBody,
    htmlBody
  );
}

// Backwards-compatible alias
const dispatchStayBookingConfirmationEmail = dispatchStayBookingConfirmedEmail;

// --- Express App Setup ---
const app = express();
app.use(cors());
app.use(express.json({ limit: "25mb" }));

// Persistent uploads directory for genuine location photos
const uploadsDir = path.resolve(__dirname, "public", "uploads", "locations");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use("/uploads", express.static(path.resolve(__dirname, "public", "uploads")));

// Basic IP rate limiting store for auth endpoints
const authAttemptTracker = new Map<string, { count: number; firstAttempt: number }>();

function rateLimitAuth(req: Request, res: Response, next: NextFunction) {
  const ip = req.ip || req.socket.remoteAddress || "unknown_ip";
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxAttempts = 30;

  const record = authAttemptTracker.get(ip);
  if (!record || now - record.firstAttempt > windowMs) {
    authAttemptTracker.set(ip, { count: 1, firstAttempt: now });
    return next();
  }

  record.count += 1;
  if (record.count > maxAttempts) {
    return res.status(429).json({
      detail: "Too many authentication requests from this IP. Please wait a few minutes before trying again.",
    });
  }
  next();
}

// --- Authentication Middleware ---
interface AuthenticatedRequest extends Request {
  user?: User;
}

function authMiddleware(optional: boolean = false) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      if (optional) return next();
      return res.status(401).json({ detail: "Authentication required. Please log in." });
    }
    const token = authHeader.replace(/^Bearer\s+/i, "").trim();
    const payload = decodeToken(token);
    if (!payload) {
      if (optional) return next();
      return res.status(401).json({ detail: "Invalid or expired session. Please log in again." });
    }
    const user = users.get(payload.sub);
    if (!user || !user.is_active) {
      if (optional) return next();
      return res.status(401).json({ detail: "User account not found or deactivated." });
    }
    req.user = user;
    next();
  };
}

// --- Health, System & Storage Endpoints ---
app.get("/healthz", (_req, res) => {
  res.json({
    status: "ok",
    storage: activeStorageType,
    database_url_configured: Boolean(process.env.DATABASE_URL),
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

app.get("/api/healthz", (_req, res) => {
  res.json({
    status: "ok",
    storage: activeStorageType,
    database_url_configured: Boolean(process.env.DATABASE_URL),
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

app.get("/api/system/storage", (_req, res) => {
  res.json({
    active_storage: activeStorageType,
    database_url_configured: Boolean(process.env.DATABASE_URL),
    persistence_file: activeStorageType === "local_json" ? DB_FILE : null,
    total_locations: locations.size,
    published_locations: Array.from(locations.values()).filter((l) => l.status === "published").length,
    total_categories: categories.size,
    total_places: places.size,
    total_locals: locals.size,
    total_experiences: experiences.size,
    total_bookings: bookings.size,
    total_users: users.size,
    total_applications: hostApplications.size,
    email_service_configured: Boolean(process.env.SMTP_HOST && process.env.SMTP_USER),
  });
});

app.get("/api/stats", (_req, res) => {
  const allBookings = Array.from(bookings.values());
  const allUsers = Array.from(users.values());
  const publishedLocs = Array.from(locations.values()).filter((l) => l.status === "published");

  const parseAmount = (priceStr?: string | null): number => {
    if (!priceStr) return 0;
    const cleaned = priceStr.replace(/[^0-9]/g, "");
    return cleaned ? parseInt(cleaned, 10) : 0;
  };

  const totalRev = allBookings
    .filter((b) => b.status !== "cancelled")
    .reduce((sum, b) => sum + parseAmount(b.total_price), 0);
  const paidRev = allBookings
    .filter((b) => b.payment_status === "paid" && b.status !== "cancelled")
    .reduce((sum, b) => sum + parseAmount(b.total_price), 0);
  const pendingRev = allBookings
    .filter((b) => b.payment_status === "pending" && b.status !== "cancelled")
    .reduce((sum, b) => sum + parseAmount(b.total_price), 0);

  res.json({
    locations: locations.size,
    published_locations: publishedLocs.length,
    categories: categories.size,
    places: publishedLocs.length,
    experiences: experiences.size,
    locals: Array.from(users.values()).filter((u) => ["host", "guide"].includes(u.role)).length,
    bookings: bookings.size,
    users: users.size,
    total_revenue: `₹${totalRev.toLocaleString()}`,
    total_revenue_raw: totalRev,
    paid_revenue: `₹${paidRev.toLocaleString()}`,
    pending_revenue: `₹${pendingRev.toLocaleString()}`,
    bookings_confirmed: allBookings.filter((b) => b.status === "confirmed").length,
    bookings_pending: allBookings.filter((b) => b.status === "pending").length,
    bookings_completed: allBookings.filter((b) => b.status === "completed").length,
    bookings_cancelled: allBookings.filter((b) => b.status === "cancelled").length,
    users_travelers: allUsers.filter((u) => u.role === "traveler").length,
    users_hosts: allUsers.filter((u) => u.role === "host").length,
    users_admins: allUsers.filter((u) => u.role === "admin").length,
  });
});

// --- Authentication Endpoints ---
app.post("/api/auth/signup", rateLimitAuth, (req, res) => {
  const { email, password, full_name, phone } = req.body;
  if (!email || !password || !full_name) {
    return res.status(400).json({ detail: "Email, password, and full name are required." });
  }
  const cleanEmail = String(email).trim().toLowerCase();
  if (!cleanEmail.includes("@") || !cleanEmail.includes(".")) {
    return res.status(400).json({ detail: "Please provide a valid email address." });
  }
  if (String(password).length < 6) {
    return res.status(400).json({ detail: "Password must be at least 6 characters long." });
  }

  const existing = Array.from(users.values()).find((u) => u.email.toLowerCase() === cleanEmail);
  if (existing) {
    return res.status(409).json({ detail: "An account with this email already exists. Please sign in." });
  }

  const { hash, salt } = hashPassword(password);
  // Security requirement: Users registering via signup can NEVER assign themselves admin or host roles.
  // Approved companion or host roles require application submission and administrator approval.
  const newUser: User = {
    id: nextUserId++,
    email: cleanEmail,
    password_hash: hash,
    salt,
    full_name: String(full_name).trim(),
    phone: phone ? String(phone).trim() : null,
    role: "traveler", // Strictly enforced
    avatar: null,
    bio: null,
    is_active: true,
    is_verified: true,
    created_at: new Date().toISOString(),
  };
  users.set(newUser.id, newUser);
  saveDbState();

  dispatchEmailNotification(
    newUser.email,
    newUser.full_name,
    `Welcome to Pahadíly, ${newUser.full_name}!`,
    "welcome_user",
    null,
    `Welcome to Pahadíly Himalayan Discovery. Your traveler account has been created.`
  );

  const token = createToken(newUser);
  res.status(201).json({
    token,
    user: userToOut(newUser),
    message: "Welcome to Pahadíly! Your account is created.",
  });
});

app.post("/api/auth/login", rateLimitAuth, (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ detail: "Email and password are required" });
  }
  const cleanEmail = String(email).trim().toLowerCase();
  const user = Array.from(users.values()).find((u) => u.email.toLowerCase() === cleanEmail);
  if (!user || !verifyPassword(password, user.salt, user.password_hash)) {
    return res.status(401).json({ detail: "Invalid email or password" });
  }
  if (!user.is_active) {
    return res.status(403).json({ detail: "This account has been deactivated. Please contact support." });
  }

  const token = createToken(user);
  res.json({
    token,
    user: userToOut(user),
    message: "Login successful",
  });
});

app.get("/api/auth/me", authMiddleware(), (req: AuthenticatedRequest, res) => {
  res.json(userToOut(req.user!));
});

// Demo login is provided strictly for verification and demonstration purposes in test environments.
app.post("/api/auth/demo-login", (req, res) => {
  if (IS_PROD && process.env.ALLOW_DEMO_LOGIN !== "true") {
    return res.status(403).json({ detail: "Demo login is disabled in production." });
  }
  const role = (req.query.role as string) || "traveler";
  let targetUser = Array.from(users.values()).find((u) => u.role === role);
  if (!targetUser) {
    const { hash, salt } = hashPassword("DemoPass123");
    targetUser = {
      id: nextUserId++,
      email: `demo.${role}@pahadily.com`,
      password_hash: hash,
      salt,
      full_name: `Demo ${role.charAt(0).toUpperCase() + role.slice(1)}`,
      role: ["traveler", "host", "admin", "guide"].includes(role) ? (role as any) : "traveler",
      is_active: true,
      is_verified: true,
      created_at: new Date().toISOString(),
    };
    users.set(targetUser.id, targetUser);
    saveDbState();
  }
  const token = createToken(targetUser);
  res.json({
    token,
    user: userToOut(targetUser),
    message: `Logged in as demo ${role}`,
  });
});

// --- Utility Helpers for Location Management ---
function haversineDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

function slugify(text: string): string {
  return String(text || "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
}

// --- Categories Endpoints (Admin Controlled, Public Read) ---
app.get("/api/categories", (req, res) => {
  const includeAll = req.query.all === "true" || req.query.include_inactive === "true";
  let cats = Array.from(categories.values());
  if (!includeAll) {
    cats = cats.filter((c) => c.is_active);
  }

  const publishedLocs = Array.from(locations.values()).filter((l) => l.status === "published");

  const results = cats.map((cat) => {
    const locsInCat = publishedLocs.filter(
      (l) => (l.category || "").toLowerCase() === cat.id.toLowerCase()
    );
    const firstWithImg = locsInCat.find((l) => l.cover_image || (l.gallery && l.gallery.length > 0));
    const sampleImage = firstWithImg ? (firstWithImg.cover_image || firstWithImg.gallery[0]?.url) : null;
    const sampleName = firstWithImg ? firstWithImg.name : (locsInCat[0]?.name || null);

    return {
      ...cat,
      published_count: locsInCat.length,
      sample_image: sampleImage,
      sample_location_name: sampleName,
    };
  });

  res.json(results);
});

// Real platform discovery statistics endpoint
app.get("/api/discovery/stats", (_req, res) => {
  const publishedLocs = Array.from(locations.values()).filter((l) => l.status === "published");
  const approvedCompanions = Array.from(users.values()).filter((u) => ["host", "guide"].includes(u.role));
  const certifiedGuides = Array.from(locals.values()).filter((l) => l.certified).length;
  const publishedStays = publishedLocs.filter(
    (l) => l.category === "homestays" || l.category === "villages" || (Array.isArray(l.tags) && l.tags.some((t) => t.toLowerCase().includes("stay") || t.toLowerCase().includes("homestay")))
  ).length;

  res.json({
    published_locations: publishedLocs.length,
    approved_companions: approvedCompanions.length,
    certified_guides: certifiedGuides,
    published_experiences: experiences.size,
    published_homestays: publishedStays,
  });
});

app.post("/api/categories", authMiddleware(), (req: AuthenticatedRequest, res) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ detail: "Administrator privileges required to create categories." });
  }
  const { name, icon, description, id: customId } = req.body;
  if (!name || !String(name).trim()) {
    return res.status(400).json({ detail: "Category name is required." });
  }
  const cleanName = String(name).trim();
  const slug = slugify(customId || cleanName);
  if (!slug) {
    return res.status(400).json({ detail: "A valid slug identifier could not be generated." });
  }
  if (categories.has(slug)) {
    return res.status(409).json({ detail: `Category with ID "${slug}" already exists.` });
  }

  const newCat: LocationCategory = {
    id: slug,
    name: cleanName,
    icon: icon ? String(icon).trim() : "🏔️",
    description: description ? String(description).trim() : "",
    is_active: true,
    created_at: new Date().toISOString(),
  };

  categories.set(newCat.id, newCat);
  saveDbState();
  res.status(201).json(newCat);
});

app.put("/api/categories/:id", authMiddleware(), (req: AuthenticatedRequest, res) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ detail: "Administrator privileges required to update categories." });
  }
  const catId = String(req.params.id).trim().toLowerCase();
  const cat = categories.get(catId);
  if (!cat) {
    return res.status(404).json({ detail: "Category not found." });
  }

  const { name, icon, description, is_active } = req.body;
  if (name !== undefined) {
    if (!String(name).trim()) return res.status(400).json({ detail: "Category name cannot be empty." });
    cat.name = String(name).trim();
  }
  if (icon !== undefined) cat.icon = String(icon).trim();
  if (description !== undefined) cat.description = String(description).trim();
  if (is_active !== undefined) cat.is_active = Boolean(is_active);

  saveDbState();
  res.json(cat);
});

app.delete("/api/categories/:id", authMiddleware(), (req: AuthenticatedRequest, res) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ detail: "Administrator privileges required to delete categories." });
  }
  const catId = String(req.params.id).trim().toLowerCase();
  if (!categories.has(catId)) {
    return res.status(404).json({ detail: "Category not found." });
  }
  const inUse = Array.from(locations.values()).some((l) => l.category === catId);
  if (inUse) {
    const cat = categories.get(catId)!;
    cat.is_active = false;
    saveDbState();
    return res.json({ message: "Category is in use by existing locations; it has been deactivated rather than deleted.", deactivated: true });
  }
  categories.delete(catId);
  saveDbState();
  res.json({ message: "Category deleted successfully." });
});

// --- Locations Endpoints (Admin Managed Source of Truth, Public Read for Published) ---
app.get("/api/locations", authMiddleware(true), (req: AuthenticatedRequest, res) => {
  const { district, valley, category, q, status, with_drafts } = req.query;
  const user = req.user;
  const isAdminUser = user?.role === "admin";

  let result = Array.from(locations.values());

  // Non-admins can strictly only see published locations
  if (!isAdminUser) {
    result = result.filter((l) => l.status === "published");
  } else if (status && status !== "all") {
    result = result.filter((l) => l.status === status);
  } else if (!with_drafts && !status) {
    result = result.filter((l) => l.status === "published");
  }

  if (district && district !== "all") {
    const dStr = String(district).toLowerCase();
    result = result.filter((l) => l.district.toLowerCase() === dStr || l.district.toLowerCase().includes(dStr));
  }

  if (valley && valley !== "all") {
    const vStr = String(valley).toLowerCase();
    result = result.filter((l) => l.valley.toLowerCase() === vStr || l.valley.toLowerCase().includes(vStr));
  }

  if (category && category !== "all") {
    const cStr = String(category).toLowerCase();
    result = result.filter((l) => l.category.toLowerCase() === cStr);
  }

  if (q) {
    const query = String(q).trim().toLowerCase();
    result = result.filter(
      (l) =>
        l.name.toLowerCase().includes(query) ||
        l.slug.toLowerCase().includes(query) ||
        l.district.toLowerCase().includes(query) ||
        l.valley.toLowerCase().includes(query) ||
        (l.village && l.village.toLowerCase().includes(query)) ||
        l.description.toLowerCase().includes(query) ||
        l.tags.some((t) => t.toLowerCase().includes(query))
    );
  }

  res.json(result);
});

app.get("/api/locations/:idOrSlug", authMiddleware(true), (req: AuthenticatedRequest, res) => {
  const idOrSlug = String(req.params.idOrSlug).trim();
  const isNumeric = /^\d+$/.test(idOrSlug);
  const user = req.user;
  const isAdminUser = user?.role === "admin";

  let loc: LocationItem | undefined;
  if (isNumeric) {
    loc = locations.get(Number(idOrSlug));
  }
  if (!loc) {
    loc = Array.from(locations.values()).find((l) => l.slug.toLowerCase() === idOrSlug.toLowerCase());
  }

  if (!loc) {
    return res.status(404).json({ detail: "Location not found." });
  }

  if (loc.status !== "published" && !isAdminUser) {
    return res.status(404).json({ detail: "Location not found or not published." });
  }

  res.json(loc);
});

app.post("/api/locations", authMiddleware(), (req: AuthenticatedRequest, res) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ detail: "Administrator privileges required to create locations." });
  }

  const body = req.body;
  if (!body.name || !String(body.name).trim()) {
    return res.status(400).json({ detail: "Location name is required." });
  }
  const cleanName = String(body.name).trim();
  const slug = slugify(body.slug || cleanName);
  if (!slug) {
    return res.status(400).json({ detail: "A valid slug identifier could not be generated." });
  }

  const existingSlug = Array.from(locations.values()).find(
    (l) => l.slug.toLowerCase() === slug.toLowerCase()
  );
  if (existingSlug) {
    return res.status(409).json({ detail: `A location with the slug "${slug}" already exists.` });
  }

  // Coordinate validation
  let lat: number | null = null;
  if (body.latitude !== undefined && body.latitude !== null && body.latitude !== "") {
    lat = Number(body.latitude);
    if (isNaN(lat) || lat < -90 || lat > 90) {
      return res.status(400).json({ detail: "Latitude must be a valid number between -90 and 90." });
    }
  }

  let lon: number | null = null;
  if (body.longitude !== undefined && body.longitude !== null && body.longitude !== "") {
    lon = Number(body.longitude);
    if (isNaN(lon) || lon < -180 || lon > 180) {
      return res.status(400).json({ detail: "Longitude must be a valid number between -180 and 180." });
    }
  }

  const status = ["draft", "published", "archived"].includes(body.status) ? body.status : "draft";

  // Gallery validation & normalization
  const gallery: LocationImage[] = [];
  if (Array.isArray(body.gallery)) {
    for (let i = 0; i < body.gallery.length; i++) {
      const img = body.gallery[i];
      if (typeof img === "string" && img.trim()) {
        gallery.push({ id: `img-${Date.now()}-${i}`, url: img.trim() });
      } else if (img && typeof img === "object" && img.url) {
        gallery.push({
          id: img.id || `img-${Date.now()}-${i}`,
          url: String(img.url).trim(),
          caption: img.caption ? String(img.caption).trim() : undefined,
          credit: img.credit ? String(img.credit).trim() : undefined,
        });
      }
    }
  }

  const coverImage = body.cover_image
    ? String(body.cover_image).trim()
    : gallery.length > 0
    ? gallery[0].url
    : "";

  const newLocation: LocationItem = {
    id: nextLocationId++,
    name: cleanName,
    slug,
    district: String(body.district || "Kullu").trim(),
    valley: String(body.valley || "Tirthan Valley").trim(),
    village: body.village ? String(body.village).trim() : undefined,
    category: String(body.category || "viewpoints").trim(),
    description: String(body.description || "").trim(),
    latitude: lat,
    longitude: lon,
    cover_image: coverImage,
    gallery,
    best_time: body.best_time ? String(body.best_time).trim() : undefined,
    difficulty: body.difficulty ? String(body.difficulty).trim() : undefined,
    safety_notes: body.safety_notes ? String(body.safety_notes).trim() : undefined,
    tags: Array.isArray(body.tags) ? body.tags.map((t: any) => String(t).trim()).filter(Boolean) : [],
    status,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  locations.set(newLocation.id, newLocation);
  saveDbState();
  res.status(201).json(newLocation);
});

app.put("/api/locations/:id", authMiddleware(), (req: AuthenticatedRequest, res) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ detail: "Administrator privileges required to update locations." });
  }

  const id = Number(req.params.id);
  const loc = locations.get(id);
  if (!loc) {
    return res.status(404).json({ detail: "Location not found." });
  }

  const body = req.body;
  if (body.name !== undefined) {
    if (!String(body.name).trim()) return res.status(400).json({ detail: "Location name cannot be empty." });
    loc.name = String(body.name).trim();
  }

  if (body.slug !== undefined) {
    const slug = slugify(body.slug);
    if (!slug) return res.status(400).json({ detail: "Invalid slug." });
    const existing = Array.from(locations.values()).find(
      (l) => l.slug.toLowerCase() === slug.toLowerCase() && l.id !== id
    );
    if (existing) {
      return res.status(409).json({ detail: `Slug "${slug}" is already in use by another location.` });
    }
    loc.slug = slug;
  }

  if (body.district !== undefined) loc.district = String(body.district).trim();
  if (body.valley !== undefined) loc.valley = String(body.valley).trim();
  if (body.village !== undefined) loc.village = body.village ? String(body.village).trim() : undefined;
  if (body.category !== undefined) loc.category = String(body.category).trim();
  if (body.description !== undefined) loc.description = String(body.description).trim();

  if (body.latitude !== undefined) {
    if (body.latitude === null || body.latitude === "") {
      loc.latitude = null;
    } else {
      const lat = Number(body.latitude);
      if (isNaN(lat) || lat < -90 || lat > 90) {
        return res.status(400).json({ detail: "Latitude must be a valid number between -90 and 90." });
      }
      loc.latitude = lat;
    }
  }

  if (body.longitude !== undefined) {
    if (body.longitude === null || body.longitude === "") {
      loc.longitude = null;
    } else {
      const lon = Number(body.longitude);
      if (isNaN(lon) || lon < -180 || lon > 180) {
        return res.status(400).json({ detail: "Longitude must be a valid number between -180 and 180." });
      }
      loc.longitude = lon;
    }
  }

  if (body.cover_image !== undefined) loc.cover_image = String(body.cover_image).trim();

  if (body.gallery !== undefined && Array.isArray(body.gallery)) {
    loc.gallery = body.gallery.map((img: any, i: number) => {
      if (typeof img === "string") {
        return { id: `img-${Date.now()}-${i}`, url: img.trim() };
      }
      return {
        id: img.id || `img-${Date.now()}-${i}`,
        url: String(img.url || "").trim(),
        caption: img.caption ? String(img.caption).trim() : undefined,
        credit: img.credit ? String(img.credit).trim() : undefined,
      };
    }).filter((img: LocationImage) => Boolean(img.url));
  }

  if (body.best_time !== undefined) loc.best_time = body.best_time ? String(body.best_time).trim() : undefined;
  if (body.difficulty !== undefined) loc.difficulty = body.difficulty ? String(body.difficulty).trim() : undefined;
  if (body.safety_notes !== undefined) loc.safety_notes = body.safety_notes ? String(body.safety_notes).trim() : undefined;
  if (body.tags !== undefined && Array.isArray(body.tags)) {
    loc.tags = body.tags.map((t: any) => String(t).trim()).filter(Boolean);
  }
  if (body.status !== undefined && ["draft", "published", "archived"].includes(body.status)) {
    loc.status = body.status;
  }

  loc.updated_at = new Date().toISOString();
  saveDbState();
  res.json(loc);
});

app.patch("/api/locations/:id/status", authMiddleware(), (req: AuthenticatedRequest, res) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ detail: "Administrator privileges required to change location status." });
  }

  const id = Number(req.params.id);
  const loc = locations.get(id);
  if (!loc) {
    return res.status(404).json({ detail: "Location not found." });
  }

  const status = req.body.status || req.query.status;
  if (!["draft", "published", "archived"].includes(status)) {
    return res.status(400).json({ detail: "Status must be 'draft', 'published', or 'archived'." });
  }

  loc.status = status;
  loc.updated_at = new Date().toISOString();
  saveDbState();
  res.json(loc);
});

app.delete("/api/locations/:id", authMiddleware(), (req: AuthenticatedRequest, res) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ detail: "Administrator privileges required to delete locations." });
  }
  const id = Number(req.params.id);
  if (!locations.has(id)) {
    return res.status(404).json({ detail: "Location not found." });
  }
  locations.delete(id);
  saveDbState();
  res.json({ message: "Location deleted successfully." });
});

// Nearby Locations Endpoint (Strict Haversine, never invents distance)
app.get("/api/locations/:idOrSlug/nearby", (req, res) => {
  const idOrSlug = String(req.params.idOrSlug).trim();
  const isNumeric = /^\d+$/.test(idOrSlug);

  let loc: LocationItem | undefined;
  if (isNumeric) loc = locations.get(Number(idOrSlug));
  if (!loc) {
    loc = Array.from(locations.values()).find((l) => l.slug.toLowerCase() === idOrSlug.toLowerCase());
  }

  if (!loc) return res.status(404).json({ detail: "Location not found." });

  // If the target location does not have real coordinates, do not fabricate distance!
  if (loc.latitude == null || loc.longitude == null) {
    return res.json([]);
  }

  const targetLat = loc.latitude;
  const targetLon = loc.longitude;
  const maxDistanceKm = Number(req.query.max_distance_km) || 60; // 60km search radius

  const nearbyList = Array.from(locations.values())
    .filter((other) => other.id !== loc!.id && other.status === "published" && other.latitude != null && other.longitude != null)
    .map((other) => {
      const distance = haversineDistanceKm(targetLat, targetLon, other.latitude!, other.longitude!);
      return {
        location: other,
        distance_km: distance,
      };
    })
    .filter((item) => item.distance_km <= maxDistanceKm)
    .sort((a, b) => a.distance_km - b.distance_km)
    .slice(0, 8);

  res.json(nearbyList);
});

// Location Companion Discovery (Genuine approved companions for this location/valley)
app.get("/api/locations/:idOrSlug/companions", (req, res) => {
  const idOrSlug = String(req.params.idOrSlug).trim();
  const isNumeric = /^\d+$/.test(idOrSlug);

  let loc: LocationItem | undefined;
  if (isNumeric) loc = locations.get(Number(idOrSlug));
  if (!loc) {
    loc = Array.from(locations.values()).find((l) => l.slug.toLowerCase() === idOrSlug.toLowerCase());
  }

  if (!loc) return res.status(404).json({ detail: "Location not found." });

  const valleyStr = loc.valley.toLowerCase();
  const districtStr = loc.district.toLowerCase();

  const matchingCompanions: any[] = [];

  for (const user of users.values()) {
    if (["guide", "host"].includes(user.role) && user.is_active && user.is_verified) {
      const appRecord = Array.from(hostApplications.values()).find(
        (a) => (a.user_id === user.id || a.email?.toLowerCase() === user.email.toLowerCase()) && a.status === "approved"
      );

      const userRegion = (appRecord?.region || user.bio || "").toLowerCase();
      const matchesArea =
        userRegion.includes(valleyStr) ||
        userRegion.includes(districtStr) ||
        valleyStr.includes(userRegion) ||
        !userRegion;

      if (matchesArea) {
        matchingCompanions.push({
          id: user.id,
          name: user.full_name,
          role: user.role === "guide" ? "Certified Mountain Guide" : "Local Companion",
          certified: user.role === "guide",
          verified: user.is_verified,
          bio: user.bio || appRecord?.bio || "Native local resident ready to share mountain footpaths.",
          avatar: user.avatar || appRecord?.avatar || null,
          languages: appRecord?.languages || "Hindi, English, Pahadi",
          price: appRecord?.price || "₹500",
          unit: appRecord?.unit || "/day",
          service_area: appRecord?.region || loc.valley,
        });
      }
    }
  }

  res.json(matchingCompanions);
});

// --- Photo Upload Endpoint (Admin Only, Saves to Persistent Local Disk, Returns Public URL) ---
app.post("/api/upload", authMiddleware(), (req: AuthenticatedRequest, res) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ detail: "Administrator privileges required to upload media." });
  }
  const { data, filename } = req.body;
  if (!data || !filename) {
    return res.status(400).json({ detail: "Image data and filename are required." });
  }

  const ext = path.extname(filename).toLowerCase();
  const allowed = [".jpg", ".jpeg", ".png", ".webp", ".svg", ".avif"];
  if (!allowed.includes(ext)) {
    return res.status(400).json({ detail: "Invalid image format. Allowed formats: JPG, PNG, WebP, SVG, AVIF." });
  }

  try {
    const base64Data = data.includes(";base64,") ? data.split(";base64,")[1] : data;
    const buffer = Buffer.from(base64Data, "base64");
    if (buffer.length > 10 * 1024 * 1024) {
      return res.status(400).json({ detail: "Image file exceeds maximum allowed size (10MB)." });
    }

    const safeBase = slugify(path.basename(filename, ext)) || "photo";
    const safeName = `${Date.now()}-${safeBase}${ext}`;
    const targetPath = path.join(uploadsDir, safeName);
    fs.writeFileSync(targetPath, buffer);

    const publicUrl = `/uploads/locations/${safeName}`;
    res.status(201).json({
      url: publicUrl,
      filename: safeName,
      size: buffer.length,
    });
  } catch (err: any) {
    res.status(500).json({ detail: `Failed to save image: ${err?.message || "Unknown error"}` });
  }
});

// --- Legacy Places Endpoint (Powered by Real Published Locations) ---
app.get("/api/places", (req, res) => {
  const { region, category, q } = req.query;
  let result = Array.from(locations.values()).filter((l) => l.status === "published");

  if (region && region !== "all") {
    const regStr = String(region).toLowerCase();
    result = result.filter((l) => l.valley.toLowerCase().includes(regStr) || l.district.toLowerCase().includes(regStr));
  }
  if (category && category !== "all") {
    const catStr = String(category).toLowerCase();
    result = result.filter((l) => l.category.toLowerCase() === catStr);
  }
  if (q) {
    const query = String(q).trim().toLowerCase();
    result = result.filter(
      (l) =>
        l.name.toLowerCase().includes(query) ||
        l.valley.toLowerCase().includes(query) ||
        l.district.toLowerCase().includes(query) ||
        l.description.toLowerCase().includes(query)
    );
  }

  const mapped = result.map((l) => ({
    id: l.id,
    name: l.name,
    tagline: l.village ? `${l.village}, ${l.valley}` : l.valley,
    region: l.valley.toLowerCase().replace(/\s+/g, "-"),
    district: l.district,
    category: l.category,
    price: "₹1,800",
    unit: "/night",
    rating: null,
    reviews: 0,
    altitude: l.best_time || "Himalayan",
    tags: l.tags || [],
    image: l.cover_image || (l.gallery?.[0]?.url ?? ""),
    description: l.description,
    latitude: l.latitude,
    longitude: l.longitude,
    nearby_locations: [],
    stay_options: [],
    created_at: l.created_at,
  }));

  res.json(mapped);
});

app.get("/api/places/:id", (req, res) => {
  const id = Number(req.params.id);
  const loc = locations.get(id);
  if (loc && loc.status === "published") {
    return res.json({
      id: loc.id,
      name: loc.name,
      tagline: loc.village ? `${loc.village}, ${loc.valley}` : loc.valley,
      region: loc.valley.toLowerCase().replace(/\s+/g, "-"),
      district: loc.district,
      category: loc.category,
      price: "₹1,800",
      unit: "/night",
      rating: null,
      reviews: 0,
      altitude: loc.best_time || "Himalayan",
      tags: loc.tags || [],
      image: loc.cover_image || (loc.gallery?.[0]?.url ?? ""),
      description: loc.description,
      latitude: loc.latitude,
      longitude: loc.longitude,
      nearby_locations: [],
      stay_options: [],
      created_at: loc.created_at,
    });
  }
  const place = places.get(id);
  if (!place) return res.status(404).json({ detail: "Place not found" });
  res.json(place);
});

// --- Experiences Endpoints (Real Experiences Only) ---
app.get("/api/experiences", (req, res) => {
  const { region, category, q } = req.query;
  let result = Array.from(experiences.values());

  if (region && region !== "all") {
    result = result.filter((e) => e.region.toLowerCase() === String(region).toLowerCase());
  }
  if (category && category !== "all") {
    result = result.filter((e) => e.category.toLowerCase() === String(category).toLowerCase());
  }
  if (q) {
    const query = String(q).trim().toLowerCase();
    result = result.filter(
      (e) =>
        e.title.toLowerCase().includes(query) ||
        e.location.toLowerCase().includes(query) ||
        e.guide.toLowerCase().includes(query) ||
        e.description.toLowerCase().includes(query)
    );
  }
  res.json(result);
});

app.get("/api/experiences/:id", (req, res) => {
  const id = Number(req.params.id);
  const exp = experiences.get(id);
  if (!exp) return res.status(404).json({ detail: "Experience not found" });
  res.json(exp);
});

// --- Locals / Native Companions Endpoints (Real Approved Profiles Only) ---
app.get("/api/locals", (req, res) => {
  const { category, region, q } = req.query;
  const realLocals: any[] = [];

  for (const user of users.values()) {
    if (["guide", "host"].includes(user.role) && user.is_active && user.is_verified) {
      const appRecord = Array.from(hostApplications.values()).find(
        (a) => (a.user_id === user.id || a.email?.toLowerCase() === user.email.toLowerCase()) && a.status === "approved"
      );

      const reg = (appRecord?.region || "Kullu").toLowerCase();
      const roleName = user.role === "guide" ? "Certified Mountain Guide" : "Local Companion";
      const cat = user.role === "guide" ? "trek-guides" : "companions";

      if (category && category !== "all" && cat !== category) continue;
      if (region && region !== "all" && !reg.includes(String(region).toLowerCase())) continue;

      if (q) {
        const query = String(q).trim().toLowerCase();
        if (!user.full_name.toLowerCase().includes(query) && !reg.includes(query)) continue;
      }

      realLocals.push({
        id: user.id,
        category: cat,
        region: reg,
        name: user.full_name,
        location: `${reg.charAt(0).toUpperCase() + reg.slice(1)}, Himachal Pradesh`,
        role: roleName,
        lang: appRecord?.languages || "Hindi, English, Pahadi",
        rating: null,
        reviews: 0,
        price: appRecord?.price || "₹500",
        unit: appRecord?.unit || "/day",
        tags: ["Verified Local", user.role === "guide" ? "High Alpine Escort" : "Village Walks"],
        image: user.avatar || appRecord?.avatar || null,
        verified: user.is_verified,
        certified: user.role === "guide",
        bio: user.bio || appRecord?.bio || "Native local resident ready to share authentic mountain trails.",
      });
    }
  }

  res.json(realLocals);
});

app.get("/api/locals/:id", (req, res) => {
  const id = Number(req.params.id);
  const user = users.get(id);
  if (user && ["guide", "host"].includes(user.role) && user.is_active && user.is_verified) {
    const appRecord = Array.from(hostApplications.values()).find(
      (a) => (a.user_id === user.id || a.email?.toLowerCase() === user.email.toLowerCase()) && a.status === "approved"
    );
    const reg = (appRecord?.region || "Kullu").toLowerCase();
    return res.json({
      id: user.id,
      category: user.role === "guide" ? "trek-guides" : "companions",
      region: reg,
      name: user.full_name,
      location: `${reg.charAt(0).toUpperCase() + reg.slice(1)}, Himachal Pradesh`,
      role: user.role === "guide" ? "Certified Mountain Guide" : "Local Companion",
      lang: appRecord?.languages || "Hindi, English, Pahadi",
      rating: null,
      reviews: 0,
      price: appRecord?.price || "₹500",
      unit: appRecord?.unit || "/day",
      tags: ["Verified Local", user.role === "guide" ? "High Alpine Escort" : "Village Walks"],
      image: user.avatar || appRecord?.avatar || null,
      verified: user.is_verified,
      certified: user.role === "guide",
      bio: user.bio || appRecord?.bio || "Native local resident ready to share authentic mountain trails.",
    });
  }
  const local = locals.get(id);
  if (!local) return res.status(404).json({ detail: "Local companion not found" });
  res.json(local);
});

app.get("/api/locals/:id/busy-dates", (req, res) => {
  const id = Number(req.params.id);
  const busySlots: Array<{ date: string; time_slot: string }> = [];

  for (const b of bookings.values()) {
    if (b.status === "confirmed" && (b.item_id === id || b.provider_id === id)) {
      busySlots.push({
        date: b.travel_date,
        time_slot: b.time_slot || "full_day",
      });
    }
  }
  res.json(busySlots);
});

// --- Bookings Endpoints (Strict Validation, Server-Side Recalculation & Lifecycle) ---
app.post("/api/bookings", authMiddleware(true), async (req: AuthenticatedRequest, res) => {
  const body = req.body;

  // 1. Validate required traveler inputs
  const travelerName = String(body.traveler_name || req.user?.full_name || "").trim();
  const travelerEmail = String(body.traveler_email || req.user?.email || "").trim().toLowerCase();
  const travelDate = String(body.travel_date || "").trim();
  const rawGuests = parseInt(String(body.guests || "1"), 10);
  const itemId = Number(body.item_id);

  if (!travelerName || travelerName.length < 2 || travelerName.length > 100) {
    return res.status(400).json({ detail: "A valid traveler name (2-100 characters) is required." });
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!travelerEmail || !emailRegex.test(travelerEmail)) {
    return res.status(400).json({ detail: "A valid traveler email address is required for voucher delivery." });
  }

  // Strict Calendar Date Format & Boundary Validation
  if (!/^\d{4}-\d{2}-\d{2}$/.test(travelDate)) {
    return res.status(400).json({ detail: "Travel date must be formatted as YYYY-MM-DD." });
  }
  const [ty, tm, td] = travelDate.split("-").map(Number);
  const parsedTravelDate = new Date(Date.UTC(ty, tm - 1, td));
  if (
    isNaN(parsedTravelDate.getTime()) ||
    parsedTravelDate.getUTCFullYear() !== ty ||
    parsedTravelDate.getUTCMonth() !== tm - 1 ||
    parsedTravelDate.getUTCDate() !== td
  ) {
    return res.status(400).json({ detail: "The specified travel date is an invalid calendar day." });
  }

  const todayUtcStr = new Date().toISOString().slice(0, 10);
  if (travelDate < todayUtcStr) {
    return res.status(400).json({ detail: "Travel date cannot be in the past." });
  }

  if (isNaN(rawGuests) || rawGuests < 1 || rawGuests > 20) {
    return res.status(400).json({ detail: "Party size must be a valid number of travelers between 1 and 20." });
  }
  const guestsNum = Math.min(20, Math.max(1, rawGuests));

  if (!itemId || isNaN(itemId)) {
    return res.status(400).json({ detail: "Valid item_id is required." });
  }

  const bookingType = body.booking_type || "companion";
  const timeSlot = body.time_slot || (bookingType === "stay" ? "overnight" : "full_day");

  // Prevent duplicate submissions from double clicks or network retries (60-second window)
  const duplicateWindow = Date.now() - 60 * 1000;
  const existingRecentBooking = Array.from(bookings.values()).find(
    (b) =>
      b.traveler_email.toLowerCase() === travelerEmail &&
      b.item_id === itemId &&
      b.travel_date === travelDate &&
      b.time_slot === timeSlot &&
      b.booking_type === bookingType &&
      new Date(b.created_at).getTime() > duplicateWindow
  );
  if (existingRecentBooking) {
    return res.status(200).json(existingRecentBooking);
  }

  // Look up genuine catalog items
  let matchedLocal: Local | undefined;
  let matchedPlace: Place | undefined;
  let matchedExp: Experience | undefined;
  let matchedLocation: LocationItem | undefined;

  if (["companion", "guide", "local"].includes(bookingType)) {
    matchedLocal = locals.get(itemId);
  } else if (bookingType === "experience") {
    matchedExp = experiences.get(itemId);
  } else if (bookingType === "stay") {
    matchedLocation = locations.get(itemId);
    if (!matchedLocation) matchedPlace = places.get(itemId);
  } else {
    matchedPlace = places.get(itemId);
    matchedLocation = locations.get(itemId);
  }

  // Double-booking conflict validation on confirmed reservations
  if (hasBookingConflict(itemId, travelDate, timeSlot, undefined, bookingType)) {
    return res.status(409).json({
      detail: `This provider or stay is already booked and confirmed on ${travelDate} (${timeSlot}). Please choose another date.`,
      conflict: true,
    });
  }

  const providerName =
    body.provider_name ||
    (matchedLocation as any)?.host_name ||
    matchedLocation?.name ||
    matchedPlace?.host_name ||
    matchedPlace?.name ||
    matchedLocal?.name ||
    matchedExp?.guide ||
    body.item_title ||
    (bookingType === "stay" ? "Local Homestay Host" : "Local Provider");

  const payId = body.payment_id || `PHD-REQ-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
  const txnRef = body.transaction_ref || `REQ-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

  // Server-side recalculation of dates, duration, party size & price
  let stayNights = 1;
  let stayEndDate: string | null = null;
  let calculatedTotalPrice: string;

  if (bookingType === "stay") {
    const pricing = calculateStayPricingAndDates(
      travelDate,
      body.nights,
      guestsNum,
      matchedLocation,
      matchedPlace
    );
    stayNights = pricing.nights;
    stayEndDate = pricing.end_date;
    calculatedTotalPrice = pricing.total_price;
  } else if (bookingType === "experience") {
    const expBase = parseItemPrice(matchedExp?.price, 1200);
    calculatedTotalPrice = `₹${(expBase * guestsNum).toLocaleString("en-IN")}`;
  } else {
    const compBase = parseItemPrice(matchedLocal?.price, 1500);
    calculatedTotalPrice = `₹${compBase.toLocaleString("en-IN")}`;
  }

  // Consistent booking lifecycle: All new reservation requests start as 'pending'
  // Stay bookings require host review before an official confirmed voucher is issued.
  const newBooking: Booking = {
    id: nextBookingId++,
    booking_type: bookingType,
    item_id: itemId,
    item_title: body.item_title || matchedLocation?.name || matchedPlace?.name || matchedLocal?.name || matchedExp?.title || (bookingType === "stay" ? "Himalayan Homestay" : "Himalayan Experience"),
    item_image: body.item_image || matchedLocation?.cover_image || matchedPlace?.image || matchedLocal?.image || matchedExp?.image || null,
    user_id: req.user?.id || null,
    traveler_name: travelerName,
    traveler_email: travelerEmail,
    traveler_phone: body.traveler_phone || req.user?.phone || null,
    travel_date: travelDate,
    end_date: stayEndDate,
    time_slot: timeSlot,
    activity_type: body.activity_type || (bookingType === "stay" ? "Authentic Homestay Living" : "Valley Discovery"),
    guests: String(guestsNum),
    nights: stayNights,
    total_price: calculatedTotalPrice,
    payment_method: body.payment_method || "pay_on_meetup",
    payment_status: "pending",
    payment_id: payId,
    transaction_ref: txnRef,
    message: String(body.message || "").trim(),
    status: "pending",
    provider_id: matchedLocation?.id || matchedPlace?.id || matchedLocal?.id || null,
    provider_name: providerName,
    provider_notes: null,
    suggested_date: null,
    created_at: new Date().toISOString(),
  };

  // 1. Ensure booking persistence succeeds independently of SMTP delivery
  bookings.set(newBooking.id, newBooking);
  saveDbState();

  // 2. Safe email notification dispatch (isolated error boundary)
  let emailNotif: EmailNotification | null = null;
  try {
    if (bookingType === "stay") {
      emailNotif = await dispatchStayRequestReceivedEmail(newBooking, matchedLocation || matchedPlace, req);
    } else {
      emailNotif = await dispatchEmailNotification(
        newBooking.traveler_email,
        newBooking.traveler_name,
        `Request Submitted: ${newBooking.item_title} | Pahadíly #${newBooking.id}`,
        "booking_request_submitted",
        newBooking.id,
        `Your request for ${newBooking.item_title} on ${travelDate} has been sent to provider ${providerName}.`
      );
    }
  } catch (err: any) {
    console.warn(`[Booking] Non-fatal notification dispatch issue for #${newBooking.id}:`, err?.message);
  }

  // Return the persisted booking along with genuine email dispatch status
  res.status(201).json({
    ...newBooking,
    email_delivery: {
      status: emailNotif?.status || (process.env.SMTP_HOST ? "failed" : "unavailable"),
      message: emailNotif?.preview || "Notification recorded in system",
    },
  });
});

// Traveler Bookings endpoint: Strictly isolated to authenticated user
app.get("/api/bookings/my", authMiddleware(), (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  const userEmail = user.email.toLowerCase();
  const result = Array.from(bookings.values())
    .filter((b) => b.user_id === user.id || b.traveler_email.toLowerCase() === userEmail)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  res.json(result);
});

// Provider dispatch requests: Restricted to assigned providers and administrators
app.get("/api/bookings/provider-requests", authMiddleware(), (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  if (!["host", "admin", "guide"].includes(user.role)) {
    return res.status(403).json({ detail: "Companion or Host access required." });
  }

  let result = Array.from(bookings.values()).sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  if (user.role !== "admin") {
    const uName = user.full_name.toLowerCase();
    result = result.filter(
      (b) =>
        b.provider_id === user.id ||
        (b.provider_name && b.provider_name.toLowerCase().includes(uName)) ||
        (b.item_title && b.item_title.toLowerCase().includes(uName))
    );
  }
  res.json(result);
});

// All Bookings (Admin Console / Assigned Providers): Strictly role-enforced
app.get("/api/bookings", authMiddleware(), (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  if (user.role === "traveler") {
    return res.status(403).json({
      detail: "Travelers can only access their own bookings via /api/bookings/my.",
    });
  }

  let result = Array.from(bookings.values()).sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  if (user.role !== "admin") {
    const uName = user.full_name.toLowerCase();
    result = result.filter(
      (b) =>
        b.provider_id === user.id ||
        (b.provider_name && b.provider_name.toLowerCase().includes(uName))
    );
  }

  const { status_filter, payment_status, q } = req.query;
  if (status_filter && status_filter !== "all") {
    result = result.filter((b) => b.status === status_filter);
  }
  if (payment_status && payment_status !== "all") {
    result = result.filter((b) => b.payment_status === payment_status);
  }
  if (q) {
    const query = String(q).trim().toLowerCase();
    result = result.filter(
      (b) =>
        b.traveler_name.toLowerCase().includes(query) ||
        b.traveler_email.toLowerCase().includes(query) ||
        b.item_title.toLowerCase().includes(query) ||
        (b.provider_name && b.provider_name.toLowerCase().includes(query))
    );
  }
  res.json(result);
});

// Single Booking Details endpoint: Role-isolated
app.get("/api/bookings/:id", authMiddleware(), (req: AuthenticatedRequest, res) => {
  const id = Number(req.params.id);
  const booking = bookings.get(id);
  if (!booking) return res.status(404).json({ detail: "Booking not found" });

  const user = req.user!;
  const isOwner = booking.user_id === user.id || booking.traveler_email.toLowerCase() === user.email.toLowerCase();
  const isAssigned =
    user.role === "admin" ||
    booking.provider_id === user.id ||
    (booking.provider_name && user.full_name && booking.provider_name.toLowerCase().includes(user.full_name.toLowerCase()));

  if (!isOwner && !isAssigned && user.role !== "admin") {
    return res.status(403).json({ detail: "Access denied. You do not have permission to view this booking." });
  }

  res.json(booking);
});

// Provider Accept / Decline endpoint with conflict guard & notification deduplication
app.patch("/api/bookings/:id/respond", authMiddleware(), async (req: AuthenticatedRequest, res) => {
  const id = Number(req.params.id);
  const booking = bookings.get(id);
  if (!booking) return res.status(404).json({ detail: "Booking request not found" });

  const { decision, notes, suggested_date } = req.body;
  if (!["accept", "decline"].includes(decision)) {
    return res.status(400).json({ detail: "Decision must be 'accept' or 'decline'" });
  }

  // Authorization: Must be admin or the assigned provider
  const user = req.user!;
  const isAuthorized =
    user.role === "admin" ||
    (booking.provider_id && booking.provider_id === user.id) ||
    (booking.provider_name && user.full_name && booking.provider_name.toLowerCase().includes(user.full_name.toLowerCase())) ||
    (["host", "guide"].includes(user.role) && booking.provider_name?.toLowerCase().includes(user.full_name.toLowerCase()));

  if (!isAuthorized) {
    return res.status(403).json({ detail: "Not authorized to respond to this booking request" });
  }

  if (decision === "accept") {
    // Idempotency: If already confirmed, do not re-send confirmation emails
    if (booking.status === "confirmed") {
      return res.json(booking);
    }

    if (hasBookingConflict(booking.item_id, booking.travel_date, booking.time_slot, booking.id, booking.booking_type)) {
      return res.status(409).json({
        detail: `Cannot accept: Another booking is already confirmed for this provider on ${booking.travel_date} (${booking.time_slot}).`,
        conflict: true,
      });
    }

    booking.status = "confirmed";
    booking.provider_notes = notes || "Booking request accepted! See you in the mountains.";
    saveDbState();

    try {
      if (booking.booking_type === "stay") {
        await dispatchStayBookingConfirmedEmail(booking, locations.get(booking.item_id) || places.get(booking.item_id), req);
      } else {
        await dispatchEmailNotification(
          booking.traveler_email,
          booking.traveler_name,
          `Confirmed! Your booking with ${booking.provider_name} is accepted | #${booking.id}`,
          "booking_confirmed_by_provider",
          booking.id,
          `Your booking #${booking.id} has been confirmed by ${booking.provider_name}. Notes: ${booking.provider_notes}`
        );
      }
    } catch (err: any) {
      console.warn(`[Respond Accept] Non-fatal email error for #${booking.id}:`, err?.message);
    }
  } else {
    // Idempotency: If already declined, do not re-send decline emails
    if (booking.status === "declined") {
      return res.json(booking);
    }

    booking.status = "declined";
    booking.provider_notes = notes || "Provider was unavailable on this date.";
    booking.suggested_date = suggested_date || null;
    saveDbState();

    try {
      if (booking.booking_type === "stay") {
        await dispatchStayBookingDeclinedEmail(booking, locations.get(booking.item_id) || places.get(booking.item_id), req);
      } else {
        await dispatchEmailNotification(
          booking.traveler_email,
          booking.traveler_name,
          `Update on your Pahadíly request #${booking.id}`,
          "booking_declined",
          booking.id,
          `Provider declined request #${booking.id}. Notes: ${booking.provider_notes}`
        );
      }
    } catch (err: any) {
      console.warn(`[Respond Decline] Non-fatal email error for #${booking.id}:`, err?.message);
    }
  }

  res.json(booking);
});

// Booking status update (Cancellation / Completion) with RBAC & notification deduplication
app.patch("/api/bookings/:id/status", authMiddleware(), async (req: AuthenticatedRequest, res) => {
  const id = Number(req.params.id);
  const booking = bookings.get(id);
  if (!booking) return res.status(404).json({ detail: "Booking not found" });

  const newStatus = (req.query.new_status || req.body.new_status) as string;
  if (!["pending", "confirmed", "completed", "cancelled"].includes(newStatus)) {
    return res.status(400).json({ detail: "Invalid status value" });
  }

  const user = req.user!;
  // Travelers can only cancel their own bookings
  if (user.role === "traveler") {
    const isOwner = booking.user_id === user.id || booking.traveler_email.toLowerCase() === user.email.toLowerCase();
    if (!isOwner) {
      return res.status(403).json({ detail: "Not authorized to update another traveler's booking." });
    }
    if (newStatus !== "cancelled") {
      return res.status(403).json({ detail: "Travelers can only cancel their bookings." });
    }
  } else if (user.role !== "admin") {
    // Hosts and companions can only update status of their assigned bookings
    const isAssigned =
      booking.provider_id === user.id ||
      (booking.provider_name && booking.provider_name.toLowerCase().includes(user.full_name.toLowerCase()));
    if (!isAssigned) {
      return res.status(403).json({ detail: "Not authorized to update this provider's booking status." });
    }
  }

  // Idempotency check: No repeated actions or duplicate notifications if status is unchanged
  if (booking.status === newStatus) {
    return res.json(booking);
  }

  const prevStatus = booking.status;
  booking.status = newStatus;
  if (newStatus === "cancelled" && booking.payment_status === "paid") {
    booking.payment_status = "refunded";
  }
  saveDbState();

  try {
    if (newStatus === "confirmed" && prevStatus !== "confirmed") {
      if (booking.booking_type === "stay") {
        await dispatchStayBookingConfirmedEmail(booking, locations.get(booking.item_id) || places.get(booking.item_id), req);
      }
    } else if (newStatus === "cancelled" && prevStatus !== "cancelled") {
      if (booking.booking_type === "stay") {
        await dispatchStayBookingCancelledEmail(booking, locations.get(booking.item_id) || places.get(booking.item_id), req);
      }
    }
  } catch (err: any) {
    console.warn(`[Status Update] Non-fatal notification dispatch issue for #${booking.id}:`, err?.message);
  }

  res.json(booking);
});

// --- Host Applications Endpoints ---
app.post("/api/host-applications", authMiddleware(true), (req: AuthenticatedRequest, res) => {
  const body = req.body;
  const name = String(body.name || req.user?.full_name || "").trim();
  const region = String(body.region || "Himachal").trim();
  const skill = String(body.skill || "Host").trim();

  if (!name) return res.status(400).json({ detail: "Applicant name is required." });
  if (!region) return res.status(400).json({ detail: "Region is required." });

  const newApp: HostApplication = {
    id: nextHostAppId++,
    name,
    email: (body.email || req.user?.email || null)?.toLowerCase(),
    phone: body.phone || req.user?.phone || null,
    region,
    skill,
    bio: body.bio || null,
    languages: body.languages || null,
    avatar: body.avatar || null,
    user_id: req.user?.id || null,
    property_name: body.property_name || null,
    tagline: body.tagline || null,
    category: body.category || "Homestay",
    price: body.price || "₹2,500",
    unit: body.unit || "/night",
    altitude: body.altitude || "1,800m",
    tags: body.tags || null,
    image: body.image || null,
    description: body.description || null,
    latitude: body.latitude ?? null,
    longitude: body.longitude ?? null,
    nearby_locations: Array.isArray(body.nearby_locations) ? body.nearby_locations : [],
    stay_options: Array.isArray(body.stay_options) ? body.stay_options : [],
    status: "pending",
    admin_notes: null,
    published_place_id: null,
    created_at: new Date().toISOString(),
  };

  hostApplications.set(newApp.id, newApp);
  saveDbState();

  res.status(201).json({
    id: newApp.id,
    status: newApp.status,
    message: "Application submitted successfully! Your listing is pending administrator review.",
    application: newApp,
  });
});

app.get("/api/host-applications", authMiddleware(), (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  let result = Array.from(hostApplications.values()).sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  if (user.role !== "admin") {
    // Non-admin only sees their own applications
    const userEmail = user.email?.toLowerCase();
    result = result.filter(
      (a) => a.user_id === user.id || (a.email && a.email.toLowerCase() === userEmail)
    );
  }
  res.json(result);
});

app.get("/api/host-applications/my-submissions", authMiddleware(), (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  const userEmail = user.email.toLowerCase();
  const result = Array.from(hostApplications.values())
    .filter((a) => a.user_id === user.id || (a.email && a.email.toLowerCase() === userEmail))
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  res.json(result);
});

// Status change: Strictly restricted to administrators
app.patch("/api/host-applications/:id/status", authMiddleware(), (req: AuthenticatedRequest, res) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({
      detail: "Administrator privileges required to review and approve host applications.",
    });
  }
  const id = Number(req.params.id);
  const appObj = hostApplications.get(id);
  if (!appObj) return res.status(404).json({ detail: "Application not found" });

  const statusVal = (req.query.status_val || req.body.status_val || req.body.status) as "pending" | "approved" | "rejected";
  if (!["pending", "approved", "rejected"].includes(statusVal)) {
    return res.status(400).json({ detail: "Status must be 'pending', 'approved', or 'rejected'" });
  }

  appObj.status = statusVal;
  if (req.query.admin_notes || req.body.admin_notes) {
    appObj.admin_notes = String(req.query.admin_notes || req.body.admin_notes);
  }

  let publishedId = appObj.published_place_id;

  if (statusVal === "approved") {
    // 1. Upgrade user account to host/guide
    let targetUser: User | undefined;
    if (appObj.user_id) targetUser = users.get(appObj.user_id);
    if (!targetUser && appObj.email) {
      targetUser = Array.from(users.values()).find(
        (u) => u.email.toLowerCase() === appObj.email!.toLowerCase()
      );
    }
    if (targetUser) {
      targetUser.role = "host";
      targetUser.is_verified = true;
    }

    // 2. Publish as live Place if property details were provided
    if (appObj.property_name && !appObj.published_place_id) {
      const tagsList = (appObj.tags || "Mountain Sanctuary, Handcrafted, Local Meals")
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const newPlace: Place = {
        id: nextPlaceId++,
        name: appObj.property_name,
        tagline: appObj.tagline || `Authentic sanctuary hosted by ${appObj.name}`,
        region: (appObj.region || "himachal").toLowerCase().replace(/\s+/g, "-"),
        category: appObj.category || "Homestay",
        price: appObj.price || "₹2,500",
        unit: appObj.unit || "/night",
        rating: 5.0,
        reviews: 1,
        altitude: appObj.altitude || "1,800m",
        tags: tagsList,
        image: appObj.image || "/images/destinations/tirthan-valley.jpg",
        description: appObj.description || `Welcome to ${appObj.property_name}. Experience the Himalayas with local host ${appObj.name}.`,
        host_name: appObj.name,
        latitude: appObj.latitude,
        longitude: appObj.longitude,
        nearby_locations: appObj.nearby_locations || [],
        stay_options: appObj.stay_options || [],
        created_at: new Date().toISOString(),
      };
      places.set(newPlace.id, newPlace);
      appObj.published_place_id = newPlace.id;
      publishedId = newPlace.id;
    }
  }

  saveDbState();

  res.json({
    id: appObj.id,
    status: appObj.status,
    published_place_id: publishedId,
    message: `Host application marked as ${statusVal}${publishedId && statusVal === "approved" ? ` and published as Place #${publishedId}!` : "."}`,
    application: appObj,
  });
});

// Notifications audit log: Admin or user-filtered
app.get(["/api/notifications", "/api/email/notifications"], authMiddleware(), (req: AuthenticatedRequest, res) => {
  let result = [...emailNotifications].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
  if (req.user?.role !== "admin") {
    const userEmail = req.user?.email.toLowerCase();
    result = result.filter((n) => n.recipient_email.toLowerCase() === userEmail);
  }
  res.json(result);
});

// Email Service Status & Diagnostics
app.get("/api/email/status", (_req, res) => {
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = Number(process.env.SMTP_PORT) || 587;
  const smtpUser = process.env.SMTP_USER;
  const hasPass = Boolean(process.env.SMTP_PASSWORD);
  const senderName = process.env.SENDER_NAME || "Pahadíly";
  const smtpFrom = process.env.SMTP_FROM || `"${senderName}" <no-reply@pahadily.com>`;

  res.json({
    configured: Boolean(smtpHost && smtpUser && hasPass),
    host: smtpHost || null,
    port: smtpPort,
    user: smtpUser ? `${smtpUser.slice(0, 3)}***` : null,
    from: smtpFrom,
    sender_name: senderName,
    notifications_logged: emailNotifications.length,
    last_notification: emailNotifications[emailNotifications.length - 1] || null,
  });
});

// Admin Test SMTP Dispatch (Strictly Admin-Only & Sanitized Diagnostics)
app.post("/api/email/test-smtp", authMiddleware(), async (req: AuthenticatedRequest, res) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ detail: "Administrator access required to test SMTP service." });
  }

  const targetEmail = String(req.body.target_email || req.user.email).trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!targetEmail || !emailRegex.test(targetEmail)) {
    return res.status(400).json({ detail: "A valid recipient email address is required for SMTP test." });
  }

  const testBooking: Booking = {
    id: 9999,
    booking_type: "stay",
    item_id: 1,
    item_title: "Test Himalayan Homestay Reservation",
    item_image: null,
    user_id: req.user.id,
    traveler_name: req.user.full_name || "Pahadíly Traveler",
    traveler_email: targetEmail,
    traveler_phone: "+91 98000 00000",
    travel_date: new Date().toISOString().slice(0, 10),
    end_date: new Date(Date.now() + 2 * 86400000).toISOString().slice(0, 10),
    time_slot: "overnight",
    activity_type: "Traditional Kath-Kuni Homestay Immersion",
    guests: "2",
    nights: 2,
    total_price: "₹3,600",
    payment_method: "pay_on_meetup",
    payment_status: "pending",
    payment_id: "PHD-TEST-9999",
    transaction_ref: "TXN-TEST-SMTP",
    message: "Automated SMTP integration verification test.",
    status: "confirmed",
    provider_id: null,
    provider_name: "Tirthan River Valley Host",
    provider_notes: null,
    suggested_date: null,
    created_at: new Date().toISOString(),
  };

  try {
    const notif = await dispatchStayBookingConfirmedEmail(testBooking, null, req);
    // Sanitize response: Never expose passwords, internal ports, or raw secrets
    res.json({
      status: notif.status,
      message:
        notif.status === "accepted"
          ? `Test confirmation email accepted by SMTP server for delivery to ${targetEmail}.`
          : notif.status === "unavailable"
          ? "SMTP credentials are not configured in this environment. Outgoing email skipped."
          : "SMTP server rejected the email transmission. Check SMTP host settings.",
      recipient: targetEmail,
      booking_id: testBooking.id,
      notification_id: notif.id,
    });
  } catch (err: any) {
    res.status(500).json({
      status: "failed",
      detail: "Unexpected error during test SMTP dispatch.",
    });
  }
});

// API Root info
app.get("/api", (_req, res) => {
  res.json({
    name: "Pahadíly API",
    version: "2.0.0",
    status: "online",
    active_storage: activeStorageType,
    tagline: "Rare Places. Real People. Lasting Stories.",
  });
});

// Sitemap & Robots
app.get("/robots.txt", (_req, res) => {
  const robotsPath = path.resolve(__dirname, "public", "robots.txt");
  if (fs.existsSync(robotsPath)) {
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    return res.sendFile(robotsPath);
  }
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.send("User-agent: *\nAllow: /\nSitemap: https://pahadily.com/sitemap.xml\n");
});

app.get("/sitemap.xml", (_req, res) => {
  const sitemapPath = path.resolve(__dirname, "public", "sitemap.xml");
  if (fs.existsSync(sitemapPath)) {
    res.setHeader("Content-Type", "application/xml; charset=utf-8");
    return res.sendFile(sitemapPath);
  }
  res.status(404).send("Sitemap not found");
});

// --- Frontend Mounting (Vite in Dev Mode or Static in Prod) ---
async function startServer() {
  await initDatabase();

  const isProduction = process.env.NODE_ENV === "production";
  const distPath = path.resolve(__dirname, "dist");
  const hasDist = fs.existsSync(path.join(distPath, "index.html"));

  if (isProduction && hasDist) {
    app.use(express.static(distPath));
    app.use((_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  } else {
    // Development mode with Vite dev middleware
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        host: HOST,
        port: PORT,
        hmr: false,
      },
      appType: "spa",
    });
    app.use(vite.middlewares);

    // Fallback for SPA routing in development mode
    app.use(async (req, res, next) => {
      const url = req.originalUrl;
      if (url.startsWith("/api/")) {
        return next();
      }
      try {
        const indexPath = path.resolve(__dirname, "index.html");
        let template = fs.readFileSync(indexPath, "utf-8");
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ "Content-Type": "text/html" }).end(template);
      } catch (e: any) {
        vite.ssrFixStacktrace(e);
        next(e);
      }
    });
  }

  const server = app.listen(PORT, HOST, () => {
    console.log(`[Pahadíly] Server running on http://${HOST}:${PORT} (Storage: ${activeStorageType})`);
  });

  server.on("error", (err: any) => {
    if (err.code === "EADDRINUSE") {
      console.warn(`[Pahadíly] Port ${PORT} in use, retrying or supervisor will handle.`);
    } else {
      console.error("[Pahadíly] Server listen error:", err);
    }
  });
}

startServer();
