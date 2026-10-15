import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Production canonical base URL
const BASE_URL = (process.env.VITE_SITE_URL || "https://pahadily.com").replace(/\/+$/, "");
const LASTMOD = new Date().toISOString().slice(0, 10);

// Set to guarantee no duplicate URLs are added
const urlMap = new Map();

function addUrl(pathname, priority, changefreq) {
  // Normalize path
  const cleanPath = pathname.split("?")[0].trim();
  const normalized = cleanPath === "" || cleanPath === "/" ? "/" : `/${cleanPath.replace(/^\/+|\/+$/g, "")}`;
  if (!urlMap.has(normalized)) {
    urlMap.set(normalized, {
      url: normalized,
      priority,
      changefreq,
    });
  }
}

// 1. Core Public Static Pages
addUrl("/", "1.0", "weekly");
addUrl("/explore", "0.95", "daily");
addUrl("/companions", "0.90", "weekly");
addUrl("/stays", "0.90", "weekly");
addUrl("/experiences", "0.85", "weekly");
addUrl("/become-a-local", "0.80", "monthly");

// 2. Real Published Locations from Database (if any exist)
try {
  const dbPath = path.resolve(__dirname, "../data/pahadily_db_state.json");
  if (fs.existsSync(dbPath)) {
    const dbState = JSON.parse(fs.readFileSync(dbPath, "utf-8"));
    if (Array.isArray(dbState.locations)) {
      dbState.locations.forEach((entry) => {
        const loc = entry[1] || entry;
        if (loc && loc.status === "published" && loc.slug) {
          addUrl(`/explore?valley=${encodeURIComponent(loc.valley || loc.slug)}`, "0.75", "weekly");
        }
      });
    }
  }
} catch {
  // Graceful fallback
}

// Build standard XML
const xmlLines = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"',
  '        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"',
  '        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">',
];

for (const item of urlMap.values()) {
  xmlLines.push("  <url>");
  xmlLines.push(`    <loc>${BASE_URL}${item.url}</loc>`);
  xmlLines.push(`    <lastmod>${LASTMOD}</lastmod>`);
  xmlLines.push(`    <changefreq>${item.changefreq}</changefreq>`);
  xmlLines.push(`    <priority>${item.priority}</priority>`);
  xmlLines.push("  </url>");
}

xmlLines.push("</urlset>");
xmlLines.push("");

const sitemapXml = xmlLines.join("\n");
const outputPath = path.resolve(__dirname, "../public/sitemap.xml");
fs.writeFileSync(outputPath, sitemapXml, "utf-8");

console.log(`Generated public/sitemap.xml with ${urlMap.size} verified, non-duplicate public URLs.`);
