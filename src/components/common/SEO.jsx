import { useEffect } from "react";
import {
  DEFAULT_SITE_TITLE,
  DEFAULT_SITE_DESC,
  DEFAULT_OG_IMAGE,
  getCanonicalUrl,
  getAbsoluteImageUrl,
} from "../../utils/seo";

/**
 * Reusable SEO & Social Metadata Component
 * Updates page title, meta description, canonical link, OpenGraph & Twitter tags,
 * and Schema.org JSON-LD structured data in the document head dynamically.
 */
function SEO({
  title = DEFAULT_SITE_TITLE,
  description = DEFAULT_SITE_DESC,
  canonicalPath = "/",
  ogImage = DEFAULT_OG_IMAGE,
  ogType = "website",
  noindex = false,
  nofollow = false,
  schema = null,
}) {
  useEffect(() => {
    // 1. Update Document Title
    const finalTitle = title.includes("Pahadíly") || title.includes("Pahadily")
      ? title
      : `${title} | Pahadíly`;
    document.title = finalTitle;

    // Helper to set or create a meta tag
    const setMetaTag = (selector, attributeName, attributeValue, content) => {
      let meta = document.querySelector(selector);
      if (!meta) {
        meta = document.createElement("meta");
        meta.setAttribute(attributeName, attributeValue);
        document.head.appendChild(meta);
      }
      meta.setAttribute("content", content);
    };

    // 2. Standard Meta Description
    setMetaTag('meta[name="description"]', "name", "description", description);

    // 3. Robots Meta Tag (e.g. noindex for admin/host/404)
    const robotsDirectives = [];
    if (noindex) robotsDirectives.push("noindex");
    else robotsDirectives.push("index");

    if (nofollow) robotsDirectives.push("nofollow");
    else robotsDirectives.push("follow");

    setMetaTag('meta[name="robots"]', "name", "robots", robotsDirectives.join(", "));

    // 4. Canonical Link Tag
    const canonicalHref = getCanonicalUrl(canonicalPath);
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement("link");
      canonicalLink.setAttribute("rel", "canonical");
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute("href", canonicalHref);

    // 5. OpenGraph Tags
    const absImageUrl = getAbsoluteImageUrl(ogImage);
    setMetaTag('meta[property="og:title"]', "property", "og:title", finalTitle);
    setMetaTag('meta[property="og:description"]', "property", "og:description", description);
    setMetaTag('meta[property="og:url"]', "property", "og:url", canonicalHref);
    setMetaTag('meta[property="og:image"]', "property", "og:image", absImageUrl);
    setMetaTag('meta[property="og:type"]', "property", "og:type", ogType);
    setMetaTag('meta[property="og:site_name"]', "property", "og:site_name", "Pahadíly");
    setMetaTag('meta[property="og:locale"]', "property", "og:locale", "en_IN");

    // 6. Twitter / X Card Tags
    setMetaTag('meta[name="twitter:card"]', "name", "twitter:card", "summary_large_image");
    setMetaTag('meta[name="twitter:title"]', "name", "twitter:title", finalTitle);
    setMetaTag('meta[name="twitter:description"]', "name", "twitter:description", description);
    setMetaTag('meta[name="twitter:image"]', "name", "twitter:image", absImageUrl);

    // 7. Schema.org JSON-LD Structured Data
    const SCRIPT_ID = "pahadily-json-ld";
    let scriptTag = document.getElementById(SCRIPT_ID);

    if (schema) {
      if (!scriptTag) {
        scriptTag = document.createElement("script");
        scriptTag.id = SCRIPT_ID;
        scriptTag.type = "application/ld+json";
        document.head.appendChild(scriptTag);
      }
      const schemaData = Array.isArray(schema) ? schema : [schema];
      scriptTag.textContent = JSON.stringify(schemaData.length === 1 ? schemaData[0] : schemaData);
    } else if (scriptTag) {
      scriptTag.remove();
    }

    return () => {
      // Optional cleanup on unmount
    };
  }, [title, description, canonicalPath, ogImage, ogType, noindex, nofollow, schema]);

  return null;
}

export default SEO;
