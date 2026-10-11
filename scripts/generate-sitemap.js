import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { EXPLORE_DESTINATIONS } from "../src/data/exploreDestinationsData.js";
import { VERIFIED_EXPERIENCES } from "../src/data/experiencesData.js";
import { VERIFIED_LOCALS } from "../src/data/localsData.js";

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

// 1. Core Public Static Pages (strictly canonical URLs only, excluding aliases like /book-stay)
addUrl("/", "1.0", "weekly");
addUrl("/explore", "0.9", "weekly");
addUrl("/stays", "0.9", "weekly");
addUrl("/experiences", "0.85", "weekly");
addUrl("/locals", "0.85", "weekly");

// 2. All 8 Verified Himalayan Destinations & their Stays + Attractions
EXPLORE_DESTINATIONS.forEach((dest) => {
  const destSlug = dest.slug || dest.id;
  addUrl(`/destinations/${destSlug}`, "0.85", "weekly");

  // Add all verified stays under this destination
  if (Array.isArray(dest.stays)) {
    dest.stays.forEach((stay) => {
      addUrl(`/stays/${stay.id}`, "0.75", "monthly");
    });
  }

  // Add all verified attractions under this destination
  if (Array.isArray(dest.nearbyAttractions)) {
    dest.nearbyAttractions.forEach((att) => {
      addUrl(`/attractions/${att.id}`, "0.70", "monthly");
    });
  }
});

// 3. Verified Slow Travel Experiences from data/experiencesData.js
VERIFIED_EXPERIENCES.forEach((exp) => {
  addUrl(`/experiences/${exp.id}`, "0.75", "monthly");
});

// 4. Verified Native Companions, Guides & Hosts from data/localsData.js
VERIFIED_LOCALS.forEach((local) => {
  addUrl(`/locals/${local.id}`, "0.70", "monthly");
});

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
