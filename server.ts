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
  status: "sent" | "failed" | "unavailable";
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
  excludeBookingId?: number
): boolean {
  for (const b of bookings.values()) {
    if (excludeBookingId && b.id === excludeBookingId) continue;
    // Only accepted/confirmed bookings block the slot
    if (b.status !== "confirmed") continue;

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

// --- Real SMTP Email Dispatcher with Accurate Status Reporting ---
async function dispatchEmailNotification(
  recipientEmail: string,
  recipientName: string,
  subject: string,
  emailType: string,
  bookingId?: number | null,
  bodyText?: string
): Promise<EmailNotification> {
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = Number(process.env.SMTP_PORT) || 587;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASSWORD;
  const smtpFrom = process.env.SMTP_FROM || `"Pahadíly" <no-reply@pahadily.com>`;

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
      });

      await transporter.sendMail({
        from: smtpFrom,
        to: recipientEmail,
        subject,
        text: bodyText || subject,
        html: `<div style="font-family:sans-serif;padding:20px;color:#10251D;"><h2 style="color:#174D39;">Pahadíly</h2><p>${bodyText || subject}</p></div>`,
      });

      notif.status = "sent";
      notif.preview = `Dispatched successfully to ${recipientEmail}`;
    } catch (err: any) {
      console.warn(`[Email] SMTP delivery failed for ${recipientEmail}:`, err?.message);
      notif.status = "failed";
      notif.preview = `Delivery error: ${err?.message || "SMTP dispatch error"}`;
    }
  } else {
    // Honest reporting: SMTP is unconfigured. Never claim 'sent'!
    notif.status = "unavailable";
    notif.preview = `Email notification recorded. Outgoing SMTP service is not configured in this environment.`;
  }

  emailNotifications.push(notif);
  saveDbState();
  return notif;
}

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
  res.json(cats);
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

// --- Bookings Endpoints (Strict Validation & Conflict Prevention) ---
app.post("/api/bookings", authMiddleware(true), (req: AuthenticatedRequest, res) => {
  const body = req.body;

  // 1. Validate required fields
  const travelerName = String(body.traveler_name || req.user?.full_name || "").trim();
  const travelerEmail = String(body.traveler_email || req.user?.email || "").trim().toLowerCase();
  const travelDate = String(body.travel_date || "").trim();
  const guestsNum = parseInt(String(body.guests || "1"), 10);
  const itemId = Number(body.item_id);

  if (!travelerName) {
    return res.status(400).json({ detail: "Traveler name is required." });
  }
  if (!travelerEmail || !travelerEmail.includes("@") || !travelerEmail.includes(".")) {
    return res.status(400).json({ detail: "A valid traveler email address is required." });
  }
  if (!travelDate) {
    return res.status(400).json({ detail: "A valid travel date is required." });
  }
  if (isNaN(guestsNum) || guestsNum < 1 || guestsNum > 20) {
    return res.status(400).json({ detail: "Guests count must be a valid number between 1 and 20." });
  }
  if (!itemId || isNaN(itemId)) {
    return res.status(400).json({ detail: "Valid item_id is required." });
  }

  // Check item existence
  const bookingType = body.booking_type || "companion";
  let matchedLocal: Local | undefined;
  let matchedPlace: Place | undefined;
  let matchedExp: Experience | undefined;

  if (["companion", "guide", "local"].includes(bookingType)) {
    matchedLocal = locals.get(itemId);
  } else if (bookingType === "experience") {
    matchedExp = experiences.get(itemId);
  } else {
    matchedPlace = places.get(itemId);
  }

  const timeSlot = body.time_slot || "full_day";

  // Double-booking conflict validation on confirmed reservations
  if (hasBookingConflict(itemId, travelDate, timeSlot)) {
    return res.status(409).json({
      detail: `This provider or experience is already booked and confirmed on ${travelDate} (${timeSlot}). Please choose another date or time slot.`,
      conflict: true,
    });
  }

  const providerName =
    body.provider_name ||
    matchedLocal?.name ||
    matchedExp?.guide ||
    matchedPlace?.host_name ||
    body.item_title ||
    "Local Provider";

  const payId = body.payment_id || `PHD-REQ-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
  const txnRef = body.transaction_ref || `REQ-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

  const newBooking: Booking = {
    id: nextBookingId++,
    booking_type: bookingType,
    item_id: itemId,
    item_title: body.item_title || matchedLocal?.name || matchedExp?.title || matchedPlace?.name || "Himalayan Experience",
    item_image: body.item_image || matchedLocal?.image || matchedExp?.image || matchedPlace?.image || null,
    user_id: req.user?.id || null,
    traveler_name: travelerName,
    traveler_email: travelerEmail,
    traveler_phone: body.traveler_phone || req.user?.phone || null,
    travel_date: travelDate,
    end_date: body.end_date || null,
    time_slot: timeSlot,
    activity_type: body.activity_type || "Valley Discovery",
    guests: String(guestsNum),
    nights: Math.max(1, Number(body.nights) || 1),
    total_price: body.total_price || matchedLocal?.price || matchedExp?.price || matchedPlace?.price || "₹500",
    payment_method: body.payment_method || "pay_on_meetup",
    payment_status: "pending",
    payment_id: payId,
    transaction_ref: txnRef,
    message: body.message || "",
    status: "pending", // Always pending provider review
    provider_id: matchedLocal?.id || null,
    provider_name: providerName,
    provider_notes: null,
    suggested_date: null,
    created_at: new Date().toISOString(),
  };

  bookings.set(newBooking.id, newBooking);
  saveDbState();

  dispatchEmailNotification(
    newBooking.traveler_email,
    newBooking.traveler_name,
    `Request Submitted: ${newBooking.item_title} | Pahadíly #${newBooking.id}`,
    "booking_request_submitted",
    newBooking.id,
    `Your request for ${newBooking.item_title} on ${travelDate} has been sent to provider ${providerName}.`
  );

  res.status(201).json(newBooking);
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

// All Bookings (Admin Console): Strictly restricted
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
    // Hosts and companions only see bookings assigned to them
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

// Provider Accept / Decline endpoint with conflict guard
app.patch("/api/bookings/:id/respond", authMiddleware(), (req: AuthenticatedRequest, res) => {
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
    if (hasBookingConflict(booking.item_id, booking.travel_date, booking.time_slot, booking.id)) {
      return res.status(409).json({
        detail: `Cannot accept: Another booking is already confirmed for this provider on ${booking.travel_date} (${booking.time_slot}).`,
        conflict: true,
      });
    }

    booking.status = "confirmed";
    booking.provider_notes = notes || "Booking request accepted! See you in the mountains.";
    saveDbState();

    dispatchEmailNotification(
      booking.traveler_email,
      booking.traveler_name,
      `Confirmed! Your booking with ${booking.provider_name} is accepted | #${booking.id}`,
      "booking_confirmed_by_provider",
      booking.id,
      `Your booking #${booking.id} has been confirmed by ${booking.provider_name}. Notes: ${booking.provider_notes}`
    );
  } else {
    booking.status = "declined";
    booking.provider_notes = notes || "Provider was unavailable on this date.";
    booking.suggested_date = suggested_date || null;
    saveDbState();

    dispatchEmailNotification(
      booking.traveler_email,
      booking.traveler_name,
      `Update on your Pahadíly request #${booking.id}`,
      "booking_declined",
      booking.id,
      `Provider declined request #${booking.id}. Notes: ${booking.provider_notes}`
    );
  }

  res.json(booking);
});

// Booking status update (Cancellation / Completion)
app.patch("/api/bookings/:id/status", authMiddleware(), (req: AuthenticatedRequest, res) => {
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
  }

  booking.status = newStatus;
  if (newStatus === "cancelled" && booking.payment_status === "paid") {
    booking.payment_status = "refunded";
  }
  saveDbState();
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
app.get("/api/notifications", authMiddleware(), (req: AuthenticatedRequest, res) => {
  let result = [...emailNotifications].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
  if (req.user?.role !== "admin") {
    const userEmail = req.user?.email.toLowerCase();
    result = result.filter((n) => n.recipient_email.toLowerCase() === userEmail);
  }
  res.json(result);
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
