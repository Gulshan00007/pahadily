import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { EXPLORE_DESTINATIONS } from "./src/data/exploreDestinationsData.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;
const HOST = "0.0.0.0";
const SECRET_KEY = process.env.JWT_SECRET || "pahadily_secret_mountain_key_2026_super_secure";

// --- Types ---
interface User {
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

interface Place {
  id: number;
  name: string;
  tagline: string;
  region: string;
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

interface PlaceReview {
  id: number;
  place_id: number;
  user_name: string;
  rating: number;
  comment: string;
  created_at: string;
}

interface Experience {
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

interface Local {
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

interface Booking {
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
  guests: string;
  nights: number;
  total_price?: string | null;
  payment_method: string;
  payment_status: string;
  payment_id?: string | null;
  transaction_ref?: string | null;
  message: string;
  status: string;
  created_at: string;
}

interface HostApplication {
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

interface EmailNotification {
  id: number;
  recipient_email: string;
  recipient_name: string;
  subject: string;
  email_type: string;
  booking_id?: number | null;
  status: string;
  preview: string;
  created_at: string;
}

interface RegistrationOtp {
  id: number;
  email: string;
  otp_code: string;
  full_name: string;
  phone?: string | null;
  role: "traveler" | "host" | "admin";
  password_hash: string;
  salt: string;
  is_used: boolean;
  created_at: string;
}

// --- In-Memory Stores ---
const users = new Map<number, User>();
const places = new Map<number, Place>();
const placeReviews = new Map<number, PlaceReview>();
const experiences = new Map<number, Experience>();
const locals = new Map<number, Local>();
const bookings = new Map<number, Booking>();
const hostApplications = new Map<number, HostApplication>();
const emailNotifications: EmailNotification[] = [];
const registrationOtps: RegistrationOtp[] = [];

let nextUserId = 1;
let nextPlaceId = 1;
let nextReviewId = 1;
let nextExperienceId = 1;
let nextLocalId = 1;
let nextBookingId = 1001;
let nextHostAppId = 1;
let nextNotificationId = 1;
let nextOtpId = 1;

// --- Crypto & Password Helpers ---
function hashPassword(password: string, salt?: string): { hash: string; salt: string } {
  const actualSalt = salt || crypto.randomBytes(16).toString("hex");
  const derivedKey = crypto.pbkdf2Sync(password, actualSalt, 100000, 32, "sha256");
  return { hash: derivedKey.toString("hex"), salt: actualSalt };
}

function verifyPassword(password: string, salt: string, expectedHash: string): boolean {
  const { hash } = hashPassword(password, salt);
  return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(expectedHash));
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

function userToOut(u: User) {
  const bCount = Array.from(bookings.values()).filter(
    (b) => b.user_id === u.id || b.traveler_email.toLowerCase() === u.email.toLowerCase()
  ).length;
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
  };
}

// --- Seed Data Loader ---
function initData() {
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
  users.set(adminUser.id, adminUser);

  // Load Verified Catalog Data from EXPLORE_DESTINATIONS
  if (Array.isArray(EXPLORE_DESTINATIONS)) {
    EXPLORE_DESTINATIONS.forEach((dest: any, idx: number) => {
      const id = idx + 1;
      const flagshipStay = dest.stays?.[0];
      places.set(id, {
        id,
        name: dest.name,
        tagline: dest.badge || dest.idealFor || "Himalayan Sanctuary",
        region: dest.region || dest.id,
        district: dest.district || "Kullu",
        category: dest.subValley || "valley",
        price: flagshipStay?.price || "₹1,800",
        unit: flagshipStay?.unit || "/night",
        rating: 4.9,
        reviews: 142,
        altitude: dest.elevation || "1,600m",
        tags: dest.idealFor ? dest.idealFor.split(", ") : ["Nature", "Kath-Kuni", "Serenity"],
        image: dest.images?.[0] || dest.image || "/images/destinations/tirthan-valley.jpg",
        description: dest.description || "",
        host_name: flagshipStay?.hostName || "Verified Local Host",
        latitude: dest.latitude ?? 31.639,
        longitude: dest.longitude ?? 77.3845,
        nearby_locations: dest.nearbyAttractions || [],
        stay_options: dest.stays || [],
        created_at: new Date().toISOString(),
      });
      if (id >= nextPlaceId) nextPlaceId = id + 1;
    });
  }

  // Load Verified Experiences
  const verifiedExperiences = [
    {
      id: 1,
      title: "Hidden Cedar Forest Walk",
      region: "jibhi",
      location: "Jibhi, Himachal Pradesh",
      category: "nature",
      duration: "2–3 hours",
      difficulty: "Easy",
      price: "₹500",
      unit: "per person",
      guide: "Rahul (Local Companion)",
      rating: 4.8,
      reviews: 120,
      image: "/images/experiences/forest-walk.jpg",
      description: "Gentle walking trail through ancient deodar pine glades with secret waterfall nooks.",
      inclusions: ["Local walking guide", "Herbal mountain chai", "Forest flora insights"],
    },
    {
      id: 2,
      title: "Authentic Himachali Home Meal",
      region: "kullu",
      location: "Kullu, Himachal Pradesh",
      category: "food",
      duration: "2 hours",
      difficulty: "Food Experience",
      price: "₹350",
      unit: "per person",
      guide: "Sushma (Local Host)",
      rating: 4.9,
      reviews: 86,
      image: "/images/experiences/home-meal.jpg",
      description: "Traditional Siddu, ghee, mountain walnut chutney, and wood-fired dham lunch.",
      inclusions: ["Full Himachali meal", "Traditional kitchen tour", "Family recipe sharing"],
    },
    {
      id: 3,
      title: "Sunrise Viewpoint Ridge Trek",
      region: "jibhi",
      location: "Jibhi, Himachal Pradesh",
      category: "adventure",
      duration: "3–4 hours",
      difficulty: "Moderate",
      price: "₹700",
      unit: "per person",
      guide: "Aman (Local Guide)",
      rating: 4.7,
      reviews: 64,
      image: "/images/experiences/sunrise-trek.jpg",
      description: "Ascend to high alpine ridges overlooking snowcapped Great Himalayan peaks at golden dawn.",
      inclusions: ["Experienced mountain escort", "Trekking poles", "Hot flask tea"],
    },
    {
      id: 4,
      title: "Village Life & Handloom Walk",
      region: "tirthan",
      location: "Tirthan Valley, Himachal Pradesh",
      category: "culture",
      duration: "2–3 hours",
      difficulty: "Cultural",
      price: "₹450",
      unit: "per person",
      guide: "Meena (Local Host)",
      rating: 4.8,
      reviews: 92,
      image: "/images/experiences/village-walk.jpg",
      description: "Discover Kath-Kuni heritage architecture, traditional wool weaving, and organic apple orchards.",
      inclusions: ["Village entry & tour", "Handloom demonstration", "Organic orchard fruits"],
    },
    {
      id: 5,
      title: "Riverside Camping & Stargazing",
      region: "tirthan",
      location: "Tirthan Valley, Himachal Pradesh",
      category: "nature",
      duration: "1 Night",
      difficulty: "Camping",
      price: "₹1,200",
      unit: "per person",
      guide: "Karan (Local Guide)",
      rating: 4.9,
      reviews: 78,
      image: "/images/experiences/riverside-camp.jpg",
      description: "Sleep under pristine dark skies beside the bubbling glacial Tirthan stream with bonfire warmth.",
      inclusions: ["Canvas tent accommodation", "Warm bedding", "Bonfire", "Evening barbecue"],
    },
  ];

  for (const exp of verifiedExperiences) {
    experiences.set(exp.id, {
      ...exp,
      created_at: new Date().toISOString(),
    });
    if (exp.id >= nextExperienceId) nextExperienceId = exp.id + 1;
  }

  // Load Verified Local Guides & Companions
  const verifiedLocals = [
    {
      id: 1,
      category: "companions",
      region: "jibhi",
      name: "Rahul Sharma",
      location: "Shoja / Jibhi, HP",
      role: "Local Companion",
      lang: "Hindi, English, Pahadi",
      rating: 4.8,
      reviews: 82,
      price: "₹500",
      unit: "/day",
      tags: ["Village Walks", "Hidden Spots", "River Trails"],
      image: "/images/locals/rahul.jpg",
      verified: true,
      certified: false,
      gradient: "linear-gradient(135deg,#2b7050,#78caa0)",
      bio: "Born in Shoja near Jalori Pass, Rahul has guided wanderers through ancient cedar forests and waterfall alcoves for over 7 years.",
    },
    {
      id: 2,
      category: "companions",
      region: "tirthan",
      name: "Sonia Negi",
      location: "Tirthan Valley, HP",
      role: "Local Companion",
      lang: "Hindi, English, Pahadi",
      rating: 4.9,
      reviews: 48,
      price: "₹450",
      unit: "/day",
      tags: ["Village Life", "Nature Walks", "Flora & Fauna"],
      image: "/images/locals/sonia.jpg",
      verified: true,
      certified: false,
      gradient: "linear-gradient(135deg,#8b34a3,#d08be0)",
      bio: "Sonia loves introducing mindful wanderers to organic farming, trout river walks, and centuries-old Kath-Kuni wooden architecture in Gushaini.",
    },
    {
      id: 3,
      category: "companions",
      region: "kullu",
      name: "Vikram Thakur",
      location: "Kullu, Himachal Pradesh",
      role: "Local Companion",
      lang: "Hindi, English",
      rating: 4.7,
      reviews: 36,
      price: "₹600",
      unit: "/day",
      tags: ["Local Culture", "Viewpoints", "Apple Orchards"],
      image: null,
      verified: true,
      certified: false,
      gradient: "linear-gradient(135deg,#b85d19,#f0a050)",
      bio: "Native to Kullu valley, Vikram knows every ancient stone temple, apple harvest route, and ridge overlook.",
    },
  ];

  for (const loc of verifiedLocals) {
    locals.set(loc.id, {
      ...loc,
      phone: "+91 98160 000" + loc.id,
      email: loc.name.toLowerCase().replace(/\s+/g, ".") + "@pahadily.in",
      created_at: new Date().toISOString(),
    });
    if (loc.id >= nextLocalId) nextLocalId = loc.id + 1;
  }
}

initData();

// --- Express App Setup ---
const app = express();
app.use(cors());
app.use(express.json());

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
      return res.status(401).json({ detail: "Invalid or expired token" });
    }
    const user = users.get(payload.sub);
    if (!user) {
      if (optional) return next();
      return res.status(401).json({ detail: "User not found" });
    }
    req.user = user;
    next();
  };
}

// --- Health & System API Routes ---
app.get("/healthz", (_req, res) => {
  res.json({ status: "ok" });
});

app.get("/api/healthz", (_req, res) => {
  res.json({ status: "ok" });
});

app.get("/api/stats", (_req, res) => {
  const allBookings = Array.from(bookings.values());
  const allUsers = Array.from(users.values());

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
    places: places.size,
    experiences: experiences.size,
    locals: locals.size,
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

// --- Auth Endpoints ---
app.post("/api/auth/signup", (req, res) => {
  const { email, password, full_name, phone, role = "traveler" } = req.body;
  if (!email || !password || !full_name) {
    return res.status(400).json({ detail: "Email, password, and full name are required." });
  }
  const cleanEmail = String(email).trim().toLowerCase();
  const existing = Array.from(users.values()).find((u) => u.email.toLowerCase() === cleanEmail);
  if (existing) {
    return res.status(400).json({ detail: "Account with this email already exists" });
  }

  const { hash, salt } = hashPassword(password);
  const newUser: User = {
    id: nextUserId++,
    email: cleanEmail,
    password_hash: hash,
    salt,
    full_name: String(full_name).trim(),
    phone: phone ? String(phone).trim() : null,
    role: ["traveler", "host", "admin", "guide"].includes(role) ? role : "traveler",
    avatar: null,
    bio: null,
    is_active: true,
    is_verified: true,
    created_at: new Date().toISOString(),
  };
  users.set(newUser.id, newUser);

  emailNotifications.push({
    id: nextNotificationId++,
    recipient_email: newUser.email,
    recipient_name: newUser.full_name,
    subject: `Welcome to Pahadíly, ${newUser.full_name}!`,
    email_type: "welcome_user",
    status: "sent",
    preview: `Welcome email dispatched for newly registered ${newUser.role} #${newUser.id}`,
    created_at: new Date().toISOString(),
  });

  const token = createToken(newUser);
  res.status(201).json({
    token,
    user: userToOut(newUser),
    message: "Welcome to Pahadíly! Your account is created.",
  });
});

app.post("/api/auth/send-registration-otp", (req, res) => {
  const { email, password, full_name, phone, role = "traveler" } = req.body;
  if (!email || !password || !full_name) {
    return res.status(400).json({ detail: "Missing required registration fields" });
  }
  const cleanEmail = String(email).trim().toLowerCase();
  const existing = Array.from(users.values()).find((u) => u.email.toLowerCase() === cleanEmail);
  if (existing) {
    return res.status(400).json({ detail: "An account with this email already exists. Please log in." });
  }

  const otp_code = String(Math.floor(100000 + Math.random() * 900000));
  const { hash, salt } = hashPassword(password);

  for (const o of registrationOtps) {
    if (o.email === cleanEmail && !o.is_used) {
      o.is_used = true;
    }
  }

  registrationOtps.push({
    id: nextOtpId++,
    email: cleanEmail,
    otp_code,
    full_name: String(full_name).trim(),
    phone: phone ? String(phone).trim() : null,
    role: ["traveler", "host", "admin"].includes(role) ? role : "traveler",
    password_hash: hash,
    salt,
    is_used: false,
    created_at: new Date().toISOString(),
  });

  res.json({
    message: `Verification code sent to ${cleanEmail}!`,
    email: cleanEmail,
    otp_preview: otp_code,
  });
});

app.post("/api/auth/verify-registration-otp", (req, res) => {
  const { email, otp_code } = req.body;
  if (!email || !otp_code) {
    return res.status(400).json({ detail: "Email and OTP code are required" });
  }
  const cleanEmail = String(email).trim().toLowerCase();
  const otpRecord = [...registrationOtps]
    .reverse()
    .find((o) => o.email === cleanEmail && !o.is_used);

  if (!otpRecord) {
    return res.status(400).json({
      detail: "No pending verification request found for this email. Please request a new code.",
    });
  }

  if (otpRecord.otp_code.trim() !== String(otp_code).trim()) {
    return res.status(400).json({
      detail: "Invalid verification code. Please check and try again.",
    });
  }

  otpRecord.is_used = true;

  let existing = Array.from(users.values()).find((u) => u.email.toLowerCase() === cleanEmail);
  if (!existing) {
    existing = {
      id: nextUserId++,
      email: cleanEmail,
      password_hash: otpRecord.password_hash,
      salt: otpRecord.salt,
      full_name: otpRecord.full_name,
      phone: otpRecord.phone,
      role: otpRecord.role,
      avatar: null,
      bio: null,
      is_active: true,
      is_verified: true,
      created_at: new Date().toISOString(),
    };
    users.set(existing.id, existing);

    emailNotifications.push({
      id: nextNotificationId++,
      recipient_email: existing.email,
      recipient_name: existing.full_name,
      subject: `Welcome to Pahadíly, ${existing.full_name}!`,
      email_type: "welcome_user",
      status: "sent",
      preview: `Welcome email dispatched for verified account #${existing.id}`,
      created_at: new Date().toISOString(),
    });
  }

  const token = createToken(existing);
  res.json({
    token,
    user: userToOut(existing),
    message: "Email verified! Logged in successfully.",
  });
});

app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ detail: "Email and password are required" });
  }
  const cleanEmail = String(email).trim().toLowerCase();
  const user = Array.from(users.values()).find((u) => u.email.toLowerCase() === cleanEmail);
  if (!user || !verifyPassword(password, user.salt, user.password_hash)) {
    return res.status(401).json({ detail: "Invalid email or password" });
  }
  const token = createToken(user);
  res.json({
    token,
    user: userToOut(user),
    message: "Login successful",
  });
});

app.post("/api/auth/demo-login", (req, res) => {
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
      role: role as any,
      is_active: true,
      is_verified: true,
      created_at: new Date().toISOString(),
    };
    users.set(targetUser.id, targetUser);
  }
  const token = createToken(targetUser);
  res.json({
    token,
    user: userToOut(targetUser),
    message: `Logged in as demo ${role}`,
  });
});

app.get("/api/auth/me", authMiddleware(), (req: AuthenticatedRequest, res) => {
  res.json(userToOut(req.user!));
});

// --- Places / Stays Endpoints ---
app.get("/api/places", (req, res) => {
  const { region, category, q } = req.query;
  let result = Array.from(places.values());

  if (region && region !== "all") {
    const regStr = String(region).toLowerCase();
    result = result.filter((p) => p.region.toLowerCase() === regStr);
  }
  if (category && category !== "all") {
    const catStr = String(category).toLowerCase();
    result = result.filter((p) => p.category.toLowerCase() === catStr);
  }
  if (q) {
    const query = String(q).trim().toLowerCase();
    result = result.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        p.tagline.toLowerCase().includes(query) ||
        p.region.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        p.tags.some((t) => t.toLowerCase().includes(query))
    );
  }
  res.json(result);
});

app.get("/api/places/:id", (req, res) => {
  const id = Number(req.params.id);
  const place = places.get(id);
  if (!place) return res.status(404).json({ detail: "Place not found" });
  res.json(place);
});

app.post("/api/places", authMiddleware(), (req: AuthenticatedRequest, res) => {
  const body = req.body;
  const newPlace: Place = {
    id: nextPlaceId++,
    name: body.name,
    tagline: body.tagline || "",
    region: String(body.region || "himachal").toLowerCase(),
    category: String(body.category || "valley").toLowerCase(),
    price: body.price || "₹2,200",
    unit: body.unit || "/night",
    rating: Number(body.rating) || 4.8,
    reviews: Number(body.reviews) || 12,
    altitude: body.altitude || "1,800m",
    tags: Array.isArray(body.tags) ? body.tags : [],
    image: body.image || "/images/destinations/tirthan-valley.jpg",
    description: body.description || "",
    host_name: body.host_name || req.user?.full_name || null,
    latitude: body.latitude ?? null,
    longitude: body.longitude ?? null,
    nearby_locations: Array.isArray(body.nearby_locations) ? body.nearby_locations : [],
    stay_options: Array.isArray(body.stay_options) ? body.stay_options : [],
    created_at: new Date().toISOString(),
  };
  places.set(newPlace.id, newPlace);
  res.status(201).json(newPlace);
});

app.put("/api/places/:id", authMiddleware(), (req, res) => {
  const id = Number(req.params.id);
  const place = places.get(id);
  if (!place) return res.status(404).json({ detail: "Place not found" });

  const body = req.body;
  place.name = body.name ?? place.name;
  place.tagline = body.tagline ?? place.tagline;
  if (body.region) place.region = String(body.region).toLowerCase();
  if (body.category) place.category = String(body.category).toLowerCase();
  if (body.price) place.price = body.price;
  if (body.unit) place.unit = body.unit;
  if (body.rating !== undefined) place.rating = Number(body.rating);
  if (body.reviews !== undefined) place.reviews = Number(body.reviews);
  if (body.altitude) place.altitude = body.altitude;
  if (Array.isArray(body.tags)) place.tags = body.tags;
  if (body.image) place.image = body.image;
  if (body.description) place.description = body.description;
  if (body.host_name) place.host_name = body.host_name;
  if (body.latitude !== undefined) place.latitude = body.latitude;
  if (body.longitude !== undefined) place.longitude = body.longitude;
  if (Array.isArray(body.nearby_locations)) place.nearby_locations = body.nearby_locations;
  if (Array.isArray(body.stay_options)) place.stay_options = body.stay_options;

  res.json(place);
});

app.delete("/api/places/:id", authMiddleware(), (req, res) => {
  const id = Number(req.params.id);
  if (!places.has(id)) return res.status(404).json({ detail: "Place not found" });
  places.delete(id);
  res.json({ message: "Place deleted successfully" });
});

app.patch("/api/places/:id/dynamic-details", authMiddleware(), (req, res) => {
  const id = Number(req.params.id);
  const place = places.get(id);
  if (!place) return res.status(404).json({ detail: "Place not found" });

  if (Array.isArray(req.body.nearby_locations)) {
    place.nearby_locations = req.body.nearby_locations;
  }
  if (Array.isArray(req.body.stay_options)) {
    place.stay_options = req.body.stay_options;
  }
  res.json(place);
});

const handlePlaceReview = (req: Request, res: Response) => {
  const placeId = Number(req.params.id);
  const place = places.get(placeId);
  if (!place) return res.status(404).json({ detail: "Place not found" });

  const { rating, comment, user_name } = req.body;
  const numRating = Math.max(1, Math.min(5, Number(rating) || 5));
  const review: PlaceReview = {
    id: nextReviewId++,
    place_id: placeId,
    user_name: user_name || "Himalayan Traveler",
    rating: numRating,
    comment: comment || "",
    created_at: new Date().toISOString(),
  };
  placeReviews.set(review.id, review);

  const reviewsForPlace = Array.from(placeReviews.values()).filter((r) => r.place_id === placeId);
  const total = reviewsForPlace.reduce((sum, r) => sum + r.rating, 0);
  place.rating = Math.round((total / reviewsForPlace.length) * 10) / 10;
  place.reviews = reviewsForPlace.length;

  res.json(place);
};

app.post("/api/places/:id/reviews", handlePlaceReview);
app.post("/api/places/:id/rate", handlePlaceReview);

app.get("/api/places/:id/reviews", (req, res) => {
  const placeId = Number(req.params.id);
  const reviews = Array.from(placeReviews.values())
    .filter((r) => r.place_id === placeId)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  res.json(reviews);
});

// --- Experiences Endpoints ---
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
        e.description.toLowerCase().includes(query) ||
        e.inclusions.some((inc) => inc.toLowerCase().includes(query))
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

app.post("/api/experiences", authMiddleware(), (req: AuthenticatedRequest, res) => {
  const body = req.body;
  const newExp: Experience = {
    id: nextExperienceId++,
    title: body.title,
    region: String(body.region || "himachal").toLowerCase(),
    location: body.location || "Himachal Pradesh",
    category: String(body.category || "nature").toLowerCase(),
    duration: body.duration || "2–3 hours",
    difficulty: body.difficulty || "Easy",
    price: body.price || "₹500",
    unit: body.unit || "per person",
    guide: body.guide || `With ${req.user?.full_name || "Local Host"}`,
    rating: Number(body.rating) || 4.8,
    reviews: Number(body.reviews) || 10,
    image: body.image || "/images/experiences/forest-walk.jpg",
    description: body.description || "",
    inclusions: Array.isArray(body.inclusions) ? body.inclusions : [],
    created_at: new Date().toISOString(),
  };
  experiences.set(newExp.id, newExp);
  res.status(201).json(newExp);
});

app.put("/api/experiences/:id", authMiddleware(), (req, res) => {
  const id = Number(req.params.id);
  const exp = experiences.get(id);
  if (!exp) return res.status(404).json({ detail: "Experience not found" });

  const body = req.body;
  exp.title = body.title ?? exp.title;
  if (body.region) exp.region = String(body.region).toLowerCase();
  if (body.location) exp.location = body.location;
  if (body.category) exp.category = String(body.category).toLowerCase();
  if (body.duration) exp.duration = body.duration;
  if (body.difficulty) exp.difficulty = body.difficulty;
  if (body.price) exp.price = body.price;
  if (body.unit) exp.unit = body.unit;
  if (body.guide) exp.guide = body.guide;
  if (body.rating !== undefined) exp.rating = Number(body.rating);
  if (body.reviews !== undefined) exp.reviews = Number(body.reviews);
  if (body.image) exp.image = body.image;
  if (body.description) exp.description = body.description;
  if (Array.isArray(body.inclusions)) exp.inclusions = body.inclusions;

  res.json(exp);
});

app.delete("/api/experiences/:id", authMiddleware(), (req, res) => {
  const id = Number(req.params.id);
  if (!experiences.has(id)) return res.status(404).json({ detail: "Experience not found" });
  experiences.delete(id);
  res.json({ message: "Experience deleted successfully" });
});

// --- Locals Endpoints ---
app.get("/api/locals", (req, res) => {
  const { category, region, q } = req.query;
  let result = Array.from(locals.values());

  if (category && category !== "all") {
    result = result.filter((l) => l.category.toLowerCase() === String(category).toLowerCase());
  }
  if (region && region !== "all") {
    result = result.filter((l) => l.region.toLowerCase() === String(region).toLowerCase());
  }
  if (q) {
    const query = String(q).trim().toLowerCase();
    result = result.filter(
      (l) =>
        l.name.toLowerCase().includes(query) ||
        l.location.toLowerCase().includes(query) ||
        l.role.toLowerCase().includes(query) ||
        l.tags.some((t) => t.toLowerCase().includes(query))
    );
  }
  res.json(result);
});

app.get("/api/locals/:id", (req, res) => {
  const id = Number(req.params.id);
  const local = locals.get(id);
  if (!local) return res.status(404).json({ detail: "Local person not found" });
  res.json(local);
});

app.post("/api/locals", authMiddleware(), (req, res) => {
  const body = req.body;
  const newLocal: Local = {
    id: nextLocalId++,
    category: String(body.category || "companion").toLowerCase(),
    region: String(body.region || "himachal").toLowerCase(),
    name: body.name,
    location: body.location || "Himachal Pradesh",
    role: body.role || "Local Guide",
    lang: body.lang || "Hindi, English",
    rating: Number(body.rating) || 4.8,
    reviews: Number(body.reviews) || 20,
    price: body.price || "₹600",
    unit: body.unit || "/day",
    tags: Array.isArray(body.tags) ? body.tags : [],
    image: body.image || null,
    verified: body.verified ?? true,
    certified: body.certified ?? false,
    gradient: body.gradient || "linear-gradient(135deg, #174231, #78caa0)",
    bio: body.bio || null,
    phone: body.phone || null,
    email: body.email || null,
    latitude: body.latitude ?? null,
    longitude: body.longitude ?? null,
    created_at: new Date().toISOString(),
  };
  locals.set(newLocal.id, newLocal);
  res.status(201).json(newLocal);
});

app.put("/api/locals/:id", authMiddleware(), (req, res) => {
  const id = Number(req.params.id);
  const local = locals.get(id);
  if (!local) return res.status(404).json({ detail: "Local person not found" });

  const body = req.body;
  local.name = body.name ?? local.name;
  if (body.category) local.category = String(body.category).toLowerCase();
  if (body.region) local.region = String(body.region).toLowerCase();
  if (body.location) local.location = body.location;
  if (body.role) local.role = body.role;
  if (body.lang) local.lang = body.lang;
  if (body.rating !== undefined) local.rating = Number(body.rating);
  if (body.reviews !== undefined) local.reviews = Number(body.reviews);
  if (body.price) local.price = body.price;
  if (body.unit) local.unit = body.unit;
  if (Array.isArray(body.tags)) local.tags = body.tags;
  if (body.image !== undefined) local.image = body.image;
  if (body.verified !== undefined) local.verified = Boolean(body.verified);
  if (body.certified !== undefined) local.certified = Boolean(body.certified);
  if (body.gradient) local.gradient = body.gradient;
  if (body.bio !== undefined) local.bio = body.bio;
  if (body.phone !== undefined) local.phone = body.phone;
  if (body.email !== undefined) local.email = body.email;
  if (body.latitude !== undefined) local.latitude = body.latitude;
  if (body.longitude !== undefined) local.longitude = body.longitude;

  res.json(local);
});

app.delete("/api/locals/:id", authMiddleware(), (req, res) => {
  const id = Number(req.params.id);
  if (!locals.has(id)) return res.status(404).json({ detail: "Local person not found" });
  locals.delete(id);
  res.json({ message: "Local person deleted successfully" });
});

// --- Users Management Endpoints (Admin / Host) ---
app.get("/api/users", authMiddleware(), (req: AuthenticatedRequest, res) => {
  if (!req.user || !["admin", "host"].includes(req.user.role)) {
    return res.status(403).json({ detail: "Admin or Host access required" });
  }
  const { role, verified, q } = req.query;
  let result = Array.from(users.values());

  if (role && role !== "all") {
    result = result.filter((u) => u.role === role);
  }
  if (verified && verified !== "all") {
    const isVer = verified === "true";
    result = result.filter((u) => Boolean(u.is_verified) === isVer);
  }
  if (q) {
    const query = String(q).trim().toLowerCase();
    result = result.filter(
      (u) =>
        u.full_name.toLowerCase().includes(query) ||
        u.email.toLowerCase().includes(query) ||
        (u.phone && u.phone.includes(query))
    );
  }
  res.json(result.map(userToOut));
});

app.get("/api/users/:id", authMiddleware(), (req: AuthenticatedRequest, res) => {
  const id = Number(req.params.id);
  if (!req.user || (!["admin", "host"].includes(req.user.role) && req.user.id !== id)) {
    return res.status(403).json({ detail: "Unauthorized" });
  }
  const target = users.get(id);
  if (!target) return res.status(404).json({ detail: "User not found" });
  res.json(userToOut(target));
});

app.patch("/api/users/:id/role", authMiddleware(), (req: AuthenticatedRequest, res) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ detail: "Admin privileges required to change user roles" });
  }
  const target = users.get(Number(req.params.id));
  if (!target) return res.status(404).json({ detail: "User not found" });
  const { role } = req.body;
  if (!["traveler", "host", "admin", "guide"].includes(role)) {
    return res.status(400).json({ detail: "Invalid role specified" });
  }
  target.role = role;
  res.json(userToOut(target));
});

app.patch("/api/users/:id/status", authMiddleware(), (req: AuthenticatedRequest, res) => {
  if (!req.user || !["admin", "host"].includes(req.user.role)) {
    return res.status(403).json({ detail: "Unauthorized" });
  }
  const target = users.get(Number(req.params.id));
  if (!target) return res.status(404).json({ detail: "User not found" });

  const { is_active, is_verified } = req.body;
  if (is_active !== undefined) target.is_active = Boolean(is_active);
  if (is_verified !== undefined) target.is_verified = Boolean(is_verified);
  res.json(userToOut(target));
});

app.delete("/api/users/:id", authMiddleware(), (req: AuthenticatedRequest, res) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ detail: "Admin privileges required to delete accounts" });
  }
  const targetId = Number(req.params.id);
  if (req.user.id === targetId) {
    return res.status(400).json({ detail: "Cannot delete your own active admin account" });
  }
  if (!users.has(targetId)) return res.status(404).json({ detail: "User not found" });
  users.delete(targetId);
  res.json({ message: "User account deleted successfully" });
});

// --- Bookings Endpoints ---
app.post("/api/bookings", authMiddleware(true), (req: AuthenticatedRequest, res) => {
  const body = req.body;
  const payId = body.payment_id || `PHD-PAY-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
  const txnRef =
    body.transaction_ref || `UPI-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

  const newBooking: Booking = {
    id: nextBookingId++,
    booking_type: body.booking_type || "place",
    item_id: Number(body.item_id) || 1,
    item_title: body.item_title || "Himalayan Sanctuary",
    item_image: body.item_image || null,
    user_id: req.user?.id || null,
    traveler_name: body.traveler_name || req.user?.full_name || "Traveler",
    traveler_email: (body.traveler_email || req.user?.email || "").toLowerCase(),
    traveler_phone: body.traveler_phone || req.user?.phone || null,
    travel_date: body.travel_date || new Date().toISOString().slice(0, 10),
    end_date: body.end_date || null,
    guests: String(body.guests || "2"),
    nights: Number(body.nights) || 1,
    total_price: body.total_price || "₹2,000",
    payment_method: body.payment_method || "upi",
    payment_status: body.payment_status || "paid",
    payment_id: payId,
    transaction_ref: txnRef,
    message: body.message || "",
    status: body.payment_status === "paid" ? "confirmed" : "pending",
    created_at: new Date().toISOString(),
  };

  bookings.set(newBooking.id, newBooking);

  emailNotifications.push({
    id: nextNotificationId++,
    recipient_email: newBooking.traveler_email,
    recipient_name: newBooking.traveler_name,
    subject: `Booking Confirmed: ${newBooking.item_title} | Pahadíly Voucher #${newBooking.id}`,
    email_type: "booking_confirmation",
    booking_id: newBooking.id,
    status: "sent",
    preview: `Voucher #${newBooking.id} for ${newBooking.item_title} (${newBooking.total_price} via ${newBooking.payment_method})`,
    created_at: new Date().toISOString(),
  });

  res.status(201).json(newBooking);
});

app.get("/api/bookings", authMiddleware(), (req, res) => {
  const { status_filter, payment_status, q } = req.query;
  let result = Array.from(bookings.values()).sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

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
        (b.payment_id && b.payment_id.toLowerCase().includes(query)) ||
        (b.transaction_ref && b.transaction_ref.toLowerCase().includes(query))
    );
  }
  res.json(result);
});

app.get("/api/bookings/my", authMiddleware(), (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  const userEmail = user.email.toLowerCase();
  const result = Array.from(bookings.values())
    .filter((b) => b.user_id === user.id || b.traveler_email.toLowerCase() === userEmail)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  res.json(result);
});

app.patch("/api/bookings/:id/status", authMiddleware(), (req: AuthenticatedRequest, res) => {
  const id = Number(req.params.id);
  const booking = bookings.get(id);
  if (!booking) return res.status(404).json({ detail: "Booking not found" });

  const newStatus = (req.query.new_status || req.body.new_status) as string;
  if (!["pending", "confirmed", "completed", "cancelled"].includes(newStatus)) {
    return res.status(400).json({ detail: "Invalid status value" });
  }

  if (
    req.user?.role === "traveler" &&
    booking.user_id !== req.user.id &&
    booking.traveler_email.toLowerCase() !== req.user.email.toLowerCase()
  ) {
    return res.status(403).json({ detail: "Not authorized to update this booking" });
  }

  booking.status = newStatus;
  if (newStatus === "cancelled" && booking.payment_status === "paid") {
    booking.payment_status = "refunded";
  }
  res.json(booking);
});

app.patch("/api/bookings/:id/payment", authMiddleware(), (req: AuthenticatedRequest, res) => {
  if (!req.user || !["admin", "host"].includes(req.user.role)) {
    return res.status(403).json({ detail: "Unauthorized" });
  }
  const id = Number(req.params.id);
  const booking = bookings.get(id);
  if (!booking) return res.status(404).json({ detail: "Booking not found" });

  const { payment_status, payment_method, transaction_ref } = req.body;
  if (payment_status) {
    booking.payment_status = payment_status;
    if (payment_status === "paid" && booking.status === "pending") {
      booking.status = "confirmed";
    } else if (payment_status === "refunded") {
      booking.status = "cancelled";
    }
  }
  if (payment_method) booking.payment_method = payment_method;
  if (transaction_ref) booking.transaction_ref = transaction_ref;

  res.json(booking);
});

app.delete("/api/bookings/:id", authMiddleware(), (req: AuthenticatedRequest, res) => {
  if (!req.user || !["admin", "host"].includes(req.user.role)) {
    return res.status(403).json({ detail: "Unauthorized" });
  }
  const id = Number(req.params.id);
  if (!bookings.has(id)) return res.status(404).json({ detail: "Booking not found" });
  bookings.delete(id);
  res.json({ message: "Booking removed successfully" });
});

app.post("/api/bookings/:id/resend-email", authMiddleware(), (req: AuthenticatedRequest, res) => {
  const id = Number(req.params.id);
  const booking = bookings.get(id);
  if (!booking) return res.status(404).json({ detail: "Booking not found" });

  emailNotifications.push({
    id: nextNotificationId++,
    recipient_email: booking.traveler_email,
    recipient_name: booking.traveler_name,
    subject: `Re-sent: Booking Confirmed: ${booking.item_title} | Pahadíly Voucher #${booking.id}`,
    email_type: "booking_confirmation",
    booking_id: booking.id,
    status: "sent",
    preview: `Voucher #${booking.id} re-dispatched to ${booking.traveler_email}`,
    created_at: new Date().toISOString(),
  });

  res.json({ message: `Confirmation voucher sent to ${booking.traveler_email}` });
});

// --- Host Applications Endpoints ---
app.post("/api/host-applications", authMiddleware(true), (req: AuthenticatedRequest, res) => {
  const body = req.body;
  const newApp: HostApplication = {
    id: nextHostAppId++,
    name: body.name,
    email: (body.email || req.user?.email || null)?.toLowerCase(),
    phone: body.phone || req.user?.phone || null,
    region: body.region || "Himachal",
    skill: body.skill || "Host",
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
  res.status(201).json({
    id: newApp.id,
    status: newApp.status,
    message:
      "Host & Location details submitted successfully! Your listing is now pending administrator review.",
    application: newApp,
  });
});

app.get("/api/host-applications", authMiddleware(), (req: AuthenticatedRequest, res) => {
  let result = Array.from(hostApplications.values()).sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  if (req.user?.role !== "admin") {
    const userEmail = req.user?.email?.toLowerCase();
    result = result.filter(
      (a) => a.user_id === req.user?.id || (a.email && a.email.toLowerCase() === userEmail)
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

app.patch("/api/host-applications/:id/status", authMiddleware(), (req: AuthenticatedRequest, res) => {
  if (req.user?.role !== "admin") {
    return res
      .status(403)
      .json({ detail: "Administrator privileges required to review host applications." });
  }
  const id = Number(req.params.id);
  const appObj = hostApplications.get(id);
  if (!appObj) return res.status(404).json({ detail: "Application not found" });

  const statusVal = (req.query.status_val || req.body.status_val) as "pending" | "approved" | "rejected";
  if (!["pending", "approved", "rejected"].includes(statusVal)) {
    return res.status(400).json({ detail: "Invalid status value" });
  }

  appObj.status = statusVal;
  if (req.query.admin_notes || req.body.admin_notes) {
    appObj.admin_notes = String(req.query.admin_notes || req.body.admin_notes);
  }

  let publishedId = appObj.published_place_id;

  if (statusVal === "approved") {
    // 1. Upgrade user account to host
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

    // 2. Publish as live Place if property_name exists
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
        description:
          appObj.description ||
          `Welcome to ${appObj.property_name}. Experience the Himalayas with local host ${appObj.name}.`,
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

  res.json({
    id: appObj.id,
    status: appObj.status,
    published_place_id: publishedId,
    message:
      `Host application marked as ${statusVal}` +
      (publishedId && statusVal === "approved" ? ` and published as Place #${publishedId}!` : "."),
    application: appObj,
  });
});

app.delete("/api/host-applications/:id", authMiddleware(), (req: AuthenticatedRequest, res) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ detail: "Unauthorized" });
  }
  const id = Number(req.params.id);
  if (!hostApplications.has(id)) return res.status(404).json({ detail: "Application not found" });
  hostApplications.delete(id);
  res.json({ message: "Host application deleted successfully" });
});

// --- Notifications Audit Endpoints ---
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

// --- API Root Endpoint ---
app.get("/api", (_req, res) => {
  res.json({
    name: "Pahadíly API",
    version: "1.0.0",
    status: "online",
    tagline: "Rare Places. Real People. Lasting Stories.",
  });
});

// --- Frontend Mounting (Vite in Dev Mode or Static in Prod) ---
async function startServer() {
  const isProduction = process.env.NODE_ENV === "production";
  const distPath = path.resolve(__dirname, "dist");
  const hasDist = fs.existsSync(path.join(distPath, "index.html"));

  if (isProduction && hasDist) {
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
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
      },
      appType: "spa",
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, HOST, () => {
    console.log(`Pahadíly full-stack server running on http://${HOST}:${PORT}`);
  });
}

startServer();
