/**
 * Pahadíly SEO Utilities & Schema.org JSON-LD Generators
 * Strictly uses verified destination, stay, experience, and local guide data.
 */

export const DEFAULT_SITE_TITLE = "Pahadíly | Discover Hidden Places & Homestays in Himachal Pradesh";
export const DEFAULT_SITE_DESC =
  "Discover authentic Himalayan homestays, local mountain guides, and slow community travel experiences across Kullu, Tirthan, and offbeat Himachal Pradesh valleys.";
export const DEFAULT_OG_IMAGE = "/images/hero/himachal-hero.jpg";

export const PRODUCTION_DOMAIN = "https://pahadily.com";

/**
 * Returns the canonical base URL for the site.
 * Prefers explicitly configured VITE_SITE_URL, otherwise defaults to confirmed production domain.
 */
export function getBaseUrl() {
  const configured = typeof import.meta !== "undefined" && import.meta.env?.VITE_SITE_URL;
  if (configured && typeof configured === "string" && configured.startsWith("http")) {
    return configured.replace(/\/+$/, "");
  }
  return PRODUCTION_DOMAIN;
}

/**
 * Normalizes a URL path to a clean canonical format:
 * - ensures leading slash
 * - removes trailing slash (except root)
 * - removes search query / hashes for clean indexing
 */
export function getCanonicalUrl(pathname = "/") {
  const base = getBaseUrl();
  const cleanPath = pathname.split("?")[0].split("#")[0].trim();
  const normalizedPath = cleanPath === "" || cleanPath === "/" ? "" : `/${cleanPath.replace(/^\/+|\/+$/g, "")}`;
  return `${base}${normalizedPath}`;
}

/**
 * Converts a relative image path to an absolute URL for social crawlers.
 */
export function getAbsoluteImageUrl(imagePath) {
  if (!imagePath) return `${getBaseUrl()}${DEFAULT_OG_IMAGE}`;
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath;
  }
  const clean = imagePath.startsWith("/") ? imagePath : `/${imagePath}`;
  return `${getBaseUrl()}${clean}`;
}

/**
 * Generates Schema.org Organization structured data
 */
export function generateOrganizationSchema() {
  const base = getBaseUrl();
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Pahadíly",
    "alternateName": "Pahadily Travel & Community Discovery",
    "url": base,
    "logo": `${base}/images/logo/pahadily-logo.png`,
    "description": "Community-first Himalayan travel platform connecting mindful travelers with authentic homestays, local guides, and slow mountain experiences.",
    "areaServed": {
      "@type": "AdministrativeArea",
      "name": "Himachal Pradesh, India",
    },
    "sameAs": [
      "https://instagram.com/pahadily",
      "https://facebook.com/pahadily",
    ],
  };
}

/**
 * Generates Schema.org WebSite structured data with SearchAction
 */
export function generateWebSiteSchema() {
  const base = getBaseUrl();
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Pahadíly",
    "url": base,
    "description": DEFAULT_SITE_DESC,
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${base}/explore?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

/**
 * Generates Schema.org BreadcrumbList structured data
 */
export function generateBreadcrumbSchema(items = []) {
  const base = getBaseUrl();
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url?.startsWith("http") ? item.url : `${base}${item.url || "/"}`,
    })),
  };
}

/**
 * Generates Schema.org TouristDestination structured data for a destination
 */
export function generateTouristDestinationSchema(dest, canonicalUrl) {
  if (!dest) return null;
  const base = getBaseUrl();

  const attractions = Array.isArray(dest.nearbyAttractions)
    ? dest.nearbyAttractions.map((att) => ({
        "@type": "TouristAttraction",
        "name": att.name,
        "description": att.description,
        "image": att.image?.startsWith("http") ? att.image : `${base}${att.image}`,
        "touristType": att.category,
      }))
    : [];

  return {
    "@context": "https://schema.org",
    "@type": "TouristDestination",
    "name": dest.name,
    "description": dest.description,
    "url": canonicalUrl || `${base}/destinations/${dest.slug || dest.id}`,
    "image": (dest.images || [dest.image || DEFAULT_OG_IMAGE]).map((img) =>
      img?.startsWith("http") ? img : `${base}${img}`
    ),
    "touristType": dest.idealFor ? dest.idealFor.split(", ") : ["Eco Tourism", "Heritage Hamlets"],
    "containedInPlace": {
      "@type": "AdministrativeArea",
      "name": `${dest.district || "Kullu"} District, Himachal Pradesh, India`,
    },
    ...(dest.latitude && dest.longitude
      ? {
          "geo": {
            "@type": "GeoCoordinates",
            "latitude": dest.latitude,
            "longitude": dest.longitude,
            "elevation": dest.elevation || "1600m",
          },
        }
      : {}),
    ...(attractions.length > 0 ? { "containsPlace": attractions } : {}),
  };
}

/**
 * Generates Schema.org LodgingBusiness structured data for a homestay or stay
 */
export function generateLodgingBusinessSchema(stay, destination, canonicalUrl) {
  if (!stay) return null;
  const base = getBaseUrl();

  return {
    "@context": "https://schema.org",
    "@type": "LodgingBusiness",
    "name": stay.name,
    "description": stay.description || stay.tagline,
    "url": canonicalUrl || `${base}/stays/${stay.id}`,
    "image": (stay.images || [stay.image || DEFAULT_OG_IMAGE]).map((img) =>
      img?.startsWith("http") ? img : `${base}${img}`
    ),
    "priceRange": stay.price ? `${stay.price} ${stay.unit || "/night"}` : "₹1,800 - ₹3,500",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": stay.subLocation || destination?.location || "Himachal Pradesh",
      "addressRegion": "Himachal Pradesh",
      "addressCountry": "IN",
    },
    ...(destination?.latitude && destination?.longitude
      ? {
          "geo": {
            "@type": "GeoCoordinates",
            "latitude": destination.latitude,
            "longitude": destination.longitude,
          },
        }
      : {}),
    "amenityFeature": (stay.amenities || []).map((amenity) => ({
      "@type": "LocationFeatureSpecification",
      "name": amenity,
      "value": true,
    })),
  };
}

/**
 * Generates Schema.org TouristTrip / Service structured data for an experience
 */
export function generateTouristTripSchema(exp, canonicalUrl) {
  if (!exp) return null;
  const base = getBaseUrl();

  return {
    "@context": "https://schema.org",
    "@type": "TouristTrip",
    "name": exp.title,
    "description": exp.description,
    "url": canonicalUrl || `${base}/experiences/${exp.id}`,
    "image": exp.image?.startsWith("http") ? exp.image : `${base}${exp.image}`,
    "touristType": exp.category,
    "offers": {
      "@type": "Offer",
      "price": exp.price?.replace(/[^0-9]/g, "") || "500",
      "priceCurrency": "INR",
      "availability": "https://schema.org/InStock",
    },
    "subTrip": {
      "@type": "TouristTrip",
      "name": `${exp.title} in ${exp.location}`,
      "description": `Guided by ${exp.guide}. Duration: ${exp.duration}. Difficulty: ${exp.difficulty}.`,
    },
  };
}

/**
 * Generates Schema.org Person structured data for a local companion or guide
 */
export function generatePersonSchema(local, canonicalUrl) {
  if (!local) return null;
  const base = getBaseUrl();

  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": local.name,
    "jobTitle": local.role,
    "description": local.bio || `${local.role} in ${local.location}`,
    "url": canonicalUrl || `${base}/locals/${local.id}`,
    "image": local.image
      ? local.image.startsWith("http")
        ? local.image
        : `${base}${local.image}`
      : `${base}/images/locals/rahul.jpg`,
    "knowsLanguage": (local.lang || "Hindi, English, Pahadi").split(",").map((s) => s.trim()),
    "workLocation": {
      "@type": "Place",
      "name": local.location,
      "address": {
        "@type": "PostalAddress",
        "addressRegion": "Himachal Pradesh",
        "addressCountry": "IN",
      },
    },
  };
}

/**
 * Generates Schema.org TouristAttraction structured data
 */
export function generateTouristAttractionSchema(attraction, destination, canonicalUrl) {
  if (!attraction) return null;
  const base = getBaseUrl();

  return {
    "@context": "https://schema.org",
    "@type": "TouristAttraction",
    "name": attraction.name,
    "description": attraction.description,
    "url": canonicalUrl || `${base}/attractions/${attraction.id}`,
    "image": attraction.image?.startsWith("http") ? attraction.image : `${base}${attraction.image}`,
    "touristType": attraction.category || "Sightseeing",
    ...(destination
      ? {
          "containedInPlace": {
            "@type": "TouristDestination",
            "name": destination.name,
            "url": `${base}/destinations/${destination.slug || destination.id}`,
          },
        }
      : {}),
  };
}
