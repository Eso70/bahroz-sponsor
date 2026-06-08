import { COUNTRIES_SORTED } from "./modal-constants";

export const parseGpsCoordinates = (input: string): { lat: string; lng: string } | null => {
  if (!input || typeof input !== "string") return null;
  const decoded = decodeURIComponent(input).trim();
  if (!decoded) return null;

  const queryMatch = decoded.match(/[?&]q=([^&]+)/i);
  const geoMatch = decoded.match(/^geo:([^?]+)/i);
  const source = (queryMatch && queryMatch[1]) || (geoMatch && geoMatch[1]) || decoded;

  const coordsMatch = source.match(/(-?\d+(?:\.\d+)?)[,\s]+(-?\d+(?:\.\d+)?)/);
  if (!coordsMatch) return null;

  return {
    lat: coordsMatch[1],
    lng: coordsMatch[2],
  };
};

const normalizeUrlForParsing = (input: string): string => {
  const trimmed = input.trim();
  if (!trimmed) return "";
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return trimmed;
  return `https://${trimmed}`;
};

export const isGoogleMapsUrl = (input: string): boolean => {
  if (!input || typeof input !== "string") return false;
  const normalized = normalizeUrlForParsing(input);
  try {
    const url = new URL(normalized);
    const host = url.hostname.toLowerCase();
    return (
      host === "maps.app.goo.gl" ||
      host === "goo.gl" ||
      host.endsWith("google.com") && url.pathname.startsWith("/maps") ||
      host === "maps.google.com"
    );
  } catch {
    return false;
  }
};

export const normalizeGoogleMapsUrl = (input: string): string => {
  return normalizeUrlForParsing(input);
};

export const isGpsInputValid = (input: string): boolean => {
  return !!parseGpsCoordinates(input) || isGoogleMapsUrl(input);
};

// Simple slugify function
const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
};

// Simple random string generator
const generateRandomSlug = (length: number = 8): string => {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    const randomValues = new Uint32Array(length);
    crypto.getRandomValues(randomValues);
    for (let i = 0; i < length; i++) {
      result += chars[randomValues[i] % chars.length];
    }
  } else {
    // Fallback for environments without crypto
    for (let i = 0; i < length; i++) {
      result += chars[Math.floor(Math.random() * chars.length)];
    }
  }
  return result;
};

export const buildSlugFromName = (value: string): string => {
  const base = slugify(value);
  return base || generateRandomSlug(8);
};

// Extract value and country code from URL (for edit mode)
export const extractValueFromUrl = (platform: string, url: string, metadata?: Record<string, unknown> | null): { value: string; countryCode: string } => {
  if (platform === "gps") {
    const originalInput = metadata?.original_input;
    if (typeof originalInput === "string") {
      return { value: originalInput, countryCode: "964" };
    }
    const coords = parseGpsCoordinates(url || "");
    if (coords) {
      return { value: `${coords.lat},${coords.lng}`, countryCode: "964" };
    }
    return { value: "", countryCode: "964" };
  }
  // First, try to use metadata if available (most reliable)
  if (metadata && typeof metadata === 'object') {
    const originalInput = metadata.original_input || metadata.originalInput;
    const countryCodeFromMeta = metadata.country_code || metadata.countryCode;
    
    if (originalInput && typeof originalInput === 'string') {
      // Extract country code from metadata, remove + if present, default to Iraq (964)
      let extractedCountryCode = "964";
      if (countryCodeFromMeta && typeof countryCodeFromMeta === 'string') {
        extractedCountryCode = countryCodeFromMeta.replace(/^\+/, "").trim();
        // Validate country code exists in our list
        const isValidCode = COUNTRIES_SORTED.some(c => c.code === extractedCountryCode);
        if (!isValidCode) {
          extractedCountryCode = "964"; // Fallback to Iraq if invalid
        }
      }
      return {
        value: originalInput,
        countryCode: extractedCountryCode
      };
    }
  }
  
  // Fallback: extract from URL
  let value = "";
  let countryCode = "964";
  
  if (platform === "whatsapp" || platform === "phone" || platform === "viber") {
    let phoneNumber = "";
    
    if (platform === "whatsapp") {
      const match = url.match(/wa\.me\/(\d+)/);
      if (match) {
        phoneNumber = match[1];
      }
    } else if (platform === "phone") {
      const match = url.match(/tel:\+?(\d+)/);
      if (match) {
        phoneNumber = match[1];
      }
    } else if (platform === "viber") {
      // Handle both %2B encoded + prefix (new format) and literal + prefix (legacy)
      const match = url.match(/number=(?:%2B|\+)?(\d+)/i);
      if (match) {
        phoneNumber = match[1];
      }
    }
    
    if (phoneNumber) {
      let foundCountryCode = false;
      for (const country of COUNTRIES_SORTED) {
        if (phoneNumber.startsWith(country.code)) {
          countryCode = country.code;
          value = phoneNumber.substring(country.code.length);
          if (value.startsWith("0")) {
            value = value.substring(1);
          }
          foundCountryCode = true;
          break;
        }
      }
      if (!foundCountryCode) {
        value = phoneNumber.startsWith("0") ? phoneNumber.substring(1) : phoneNumber;
      }
    }
  } else {
    try {
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split("/").filter(p => p);
      
      // For social media platforms, preserve the full URL to support all link types
      if (platform === "instagram" || platform === "facebook" || platform === "twitter" || 
          platform === "x" || platform === "youtube" || platform === "linkedin" || 
          platform === "tiktok" || platform === "snapchat") {
        // Preserve full URL to support all link types (posts, videos, stories, etc.)
        value = url;
      } else if (platform === "telegram") {
        value = pathParts[pathParts.length - 1] || "";
      } else if (platform === "discord") {
        // Preserve the full URL for all Discord link types:
        // user profiles (discord.com/users/ID), server invites (discord.gg/CODE,
        // discord.com/invite/CODE), and channel links (discord.com/channels/...)
        value = url;
      } else if (platform === "email") {
        value = url.replace(/^mailto:/, "");
      } else if (platform === "website" || platform === "custom") {
        value = url;
      } else {
        value = pathParts[pathParts.length - 1] || "";
      }
      
      // Only strip @ from usernames, not from full URLs
      if (value.startsWith("@") && !value.startsWith("http")) {
        value = value.substring(1);
      }
    } catch {
      if (platform === "email") {
        value = url.replace(/^mailto:/, "");
      } else {
        value = url.replace(/https?:\/\/(www\.)?/, "").split("/").filter(p => p)[0] || "";
      }
    }
  }
  
  return { value, countryCode };
};

// Generate URL from platform and input
export const generateUrl = (platform: string, input: string, countryCode?: string): string => {
  if (!input || !input.trim()) return "";
  
  const trimmed = input.trim();
  // Only use country code for phone-based platforms
  const isPhonePlatform = platform === "whatsapp" || platform === "phone" || platform === "viber";
  const code = isPhonePlatform ? (countryCode || "964") : undefined;
  
  // Helper function to format phone number with country code
  const formatPhoneNumber = (phoneNumber: string, countryCode: string): string => {
    // Remove all non-digits and + signs
    const digitsOnly = phoneNumber.replace(/[^\d]/g, "");
    if (!digitsOnly) return "";
    
    // Remove leading zeros
    let cleanedNumber = digitsOnly.replace(/^0+/, "");
    if (!cleanedNumber) return "";
    
    // Check if the number already starts with the country code
    // We need to check this properly - the number must be longer than the code
    // and must start with the exact code
    const codeLength = countryCode.length;
    if (cleanedNumber.length > codeLength && cleanedNumber.substring(0, codeLength) === countryCode) {
      // Number already has this country code, return as is
      return cleanedNumber;
    }
    
    // Check if number starts with any other country code (sorted by length descending for proper matching)
    // This ensures longer codes (like 212) are checked before shorter ones (like 2)
    for (const country of COUNTRIES_SORTED) {
      const otherCodeLength = country.code.length;
      if (country.code !== countryCode && 
          cleanedNumber.length > otherCodeLength &&
          cleanedNumber.substring(0, otherCodeLength) === country.code) {
        // Number has a different country code, remove it
        cleanedNumber = cleanedNumber.substring(otherCodeLength);
        // Remove any leading zeros that might remain
        cleanedNumber = cleanedNumber.replace(/^0+/, "");
        break;
      }
    }
    
    // Add the country code
    return countryCode + cleanedNumber;
  };
  
  switch (platform) {
    case "whatsapp": {
      if (!code) return ""; // Country code required for WhatsApp
      const fullWhatsapp = formatPhoneNumber(trimmed, code);
      if (!fullWhatsapp) return "";
      return `https://wa.me/${fullWhatsapp}?text=${encodeURIComponent("")}`;
    }
    
    case "phone": {
      if (!code) return ""; // Country code required for phone
      const fullPhone = formatPhoneNumber(trimmed, code);
      if (!fullPhone) return "";
      return `tel:+${fullPhone}`;
    }
    
    case "viber": {
      if (!code) return ""; // Country code required for Viber
      const fullViber = formatPhoneNumber(trimmed, code);
      if (!fullViber) return "";
      // Include + prefix for cross-platform reliability on iOS and Android
      return `viber://chat?number=+${fullViber}`;
    }
    
    case "telegram": {
      const telegramUsername = trimmed.replace(/^@/, "").replace(/[^a-zA-Z0-9_]/g, "");
      return telegramUsername ? `https://t.me/${telegramUsername}` : "";
    }
    
    case "instagram": {
      // Accept any valid Instagram URL - preserve all link types (posts, reels, stories, etc.)
      if (trimmed.startsWith("http")) return trimmed;
      if (trimmed.startsWith("www.")) return `https://${trimmed}`;
      if (trimmed.startsWith("instagram.com")) return `https://${trimmed}`;
      // If it's just a username, format as profile link
      const instagramUsername = trimmed.replace(/^@/, "").trim();
      // Only sanitize if it's clearly just a username (no slashes, no special chars that indicate a URL)
      if (!trimmed.includes("/") && !trimmed.includes("?") && !trimmed.includes("#")) {
        const cleanUsername = instagramUsername.replace(/[^a-zA-Z0-9_.]/g, "");
        return cleanUsername ? `https://www.instagram.com/${cleanUsername}` : "";
      }
      // If it looks like a partial URL, try to construct it
      return `https://www.instagram.com/${instagramUsername}`;
    }
    
    case "facebook": {
      // Accept any valid Facebook URL - preserve all link types (profiles, pages, events, groups, watch, etc.)
      if (trimmed.startsWith("http")) return trimmed;
      if (trimmed.startsWith("www.")) return `https://${trimmed}`;
      if (trimmed.startsWith("facebook.com") || trimmed.startsWith("fb.com")) return `https://${trimmed}`;
      if (trimmed.startsWith("m.facebook.com")) return `https://${trimmed}`;
      // If it's just a username/ID, format as profile link
      const facebookId = trimmed.trim();
      // Only sanitize if it's clearly just a username (no slashes, no special chars that indicate a URL)
      if (!trimmed.includes("/") && !trimmed.includes("?") && !trimmed.includes("#")) {
        const cleanId = facebookId.replace(/[^a-zA-Z0-9.]/g, "");
        return cleanId ? `https://www.facebook.com/${cleanId}` : "";
      }
      // If it looks like a partial URL, try to construct it
      return `https://www.facebook.com/${facebookId}`;
    }
    
    case "twitter":
    case "x": {
      // Accept any valid Twitter/X URL - preserve all link types (profiles, tweets, hashtags, etc.)
      if (trimmed.startsWith("http")) return trimmed;
      if (trimmed.startsWith("www.")) return `https://${trimmed}`;
      if (trimmed.startsWith("twitter.com") || trimmed.startsWith("x.com")) return `https://${trimmed}`;
      // If it's just a username, format as profile link
      const twitterUsername = trimmed.replace(/^@/, "").trim();
      // Only sanitize if it's clearly just a username (no slashes, no special chars that indicate a URL)
      if (!trimmed.includes("/") && !trimmed.includes("?") && !trimmed.includes("#")) {
        const cleanUsername = twitterUsername.replace(/[^a-zA-Z0-9_]/g, "");
        return cleanUsername ? `https://x.com/${cleanUsername}` : "";
      }
      // If it looks like a partial URL, try to construct it
      return `https://x.com/${twitterUsername}`;
    }
    
    case "youtube": {
      // Accept any valid YouTube URL - preserve all link types (channels, videos, playlists, shorts, etc.)
      if (trimmed.startsWith("http")) return trimmed;
      if (trimmed.startsWith("www.")) return `https://${trimmed}`;
      if (trimmed.startsWith("youtube.com") || trimmed.startsWith("youtu.be")) return `https://${trimmed}`;
      if (trimmed.startsWith("m.youtube.com")) return `https://${trimmed}`;
      if (trimmed.startsWith("@")) return `https://www.youtube.com/${trimmed}`;
      // If it's just a username/handle, format as channel link
      const youtubeHandle = trimmed.replace(/^@/, "").trim();
      // Only sanitize if it's clearly just a username (no slashes, no special chars that indicate a URL)
      if (!trimmed.includes("/") && !trimmed.includes("?") && !trimmed.includes("#")) {
        return youtubeHandle ? `https://www.youtube.com/@${youtubeHandle}` : "";
      }
      // If it looks like a partial URL, try to construct it
      return `https://www.youtube.com/${youtubeHandle}`;
    }
    
    case "linkedin": {
      // Accept any valid LinkedIn URL - preserve all link types (profiles, companies, posts, schools, groups, etc.)
      if (trimmed.startsWith("http")) return trimmed;
      if (trimmed.startsWith("www.")) return `https://${trimmed}`;
      if (trimmed.startsWith("linkedin.com")) return `https://${trimmed}`;
      // If it's just a username/ID, format as profile link
      const linkedinId = trimmed.trim();
      // Only sanitize if it's clearly just a username (no slashes, no special chars that indicate a URL)
      if (!trimmed.includes("/") && !trimmed.includes("?") && !trimmed.includes("#")) {
        const cleanId = linkedinId.replace(/[^a-zA-Z0-9-]/g, "");
        return cleanId ? `https://www.linkedin.com/in/${cleanId}` : "";
      }
      // If it looks like a partial URL, try to construct it
      return `https://www.linkedin.com/${linkedinId}`;
    }
    
    case "tiktok": {
      // Accept any valid TikTok URL - preserve all link types (videos, profiles, shortened links, etc.)
      if (trimmed.startsWith("http")) return trimmed;
      if (trimmed.startsWith("www.")) return `https://${trimmed}`;
      if (trimmed.startsWith("tiktok.com") || trimmed.startsWith("vm.tiktok.com") || trimmed.startsWith("vt.tiktok.com")) return `https://${trimmed}`;
      if (trimmed.startsWith("m.tiktok.com")) return `https://${trimmed}`;
      // If it's just a username, format as profile link
      const tiktokUsername = trimmed.replace(/^@/, "").trim();
      // Only sanitize if it's clearly just a username (no slashes, no special chars that indicate a URL)
      if (!trimmed.includes("/") && !trimmed.includes("?") && !trimmed.includes("#")) {
        const cleanUsername = tiktokUsername.replace(/[^a-zA-Z0-9_.]/g, "");
        return cleanUsername ? `https://www.tiktok.com/@${cleanUsername}` : "";
      }
      // If it looks like a partial URL, try to construct it
      return `https://www.tiktok.com/${tiktokUsername.startsWith("@") ? "" : "@"}${tiktokUsername}`;
    }
    
    case "snapchat": {
      // Accept any valid Snapchat URL - preserve all link types (add, t/, p/, stories, spotlight, etc.)
      if (trimmed.startsWith("http")) return trimmed;
      if (trimmed.startsWith("www.")) return `https://${trimmed}`;
      if (trimmed.startsWith("snapchat.com")) return `https://${trimmed}`;
      // If it's just a username, format as add link
      const snapchatUsername = trimmed.replace(/^@/, "").trim();
      // Only sanitize if it's clearly just a username (no slashes, no special chars that indicate a URL)
      if (!trimmed.includes("/") && !trimmed.includes("?") && !trimmed.includes("#")) {
        const cleanUsername = snapchatUsername.replace(/[^a-zA-Z0-9_.]/g, "");
        return cleanUsername ? `https://www.snapchat.com/add/${cleanUsername}` : "";
      }
      // If it looks like a partial URL, try to construct it
      return `https://www.snapchat.com/${snapchatUsername}`;
    }
    
    case "discord": {
      // Accept all valid Discord link types:
      // - Server invites: https://discord.gg/CODE or https://discord.com/invite/CODE
      // - User profiles:  https://discord.com/users/ID  (numeric ID)
      // - Channel links:  https://discord.com/channels/...
      if (trimmed.startsWith("http")) {
        const isValidDiscord =
          trimmed.includes("discord.gg/") ||
          trimmed.includes("discord.com/invite/") ||
          trimmed.includes("discord.com/users/") ||
          trimmed.includes("discord.com/channels/");
        return isValidDiscord ? trimmed : "";
      }
      // Bare invite code (e.g. "abc123" or "my-server")
      if (/^[a-zA-Z0-9-]+$/.test(trimmed) && !/^\d+$/.test(trimmed)) {
        return `https://discord.gg/${trimmed}`;
      }
      // Numeric user ID
      if (/^\d+$/.test(trimmed)) {
        return `https://discord.com/users/${trimmed}`;
      }
      // Partial URLs without scheme
      if (trimmed.startsWith("discord.gg/")) return `https://${trimmed}`;
      if (trimmed.startsWith("discord.com/invite/")) return `https://${trimmed}`;
      if (trimmed.startsWith("discord.com/users/")) return `https://${trimmed}`;
      if (trimmed.startsWith("discord.com/channels/")) return `https://${trimmed}`;
      return "";
    }
    
    case "email": {
      return trimmed.includes("@") ? `mailto:${trimmed}` : "";
    }
    
    case "website": {
      if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return trimmed;
      return trimmed ? `https://${trimmed.replace(/^www\./, "")}` : "";
    }

    case "custom": {
      // Accept any URL the user types — pass through as-is.
      // Auto-add https:// if there is no scheme so the link is always absolute.
      if (!trimmed) return "";
      if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return trimmed;
      // Preserve other explicit schemes (mailto:, tel:, viber://, etc.)
      if (trimmed.includes("://") || trimmed.startsWith("mailto:") || trimmed.startsWith("tel:")) return trimmed;
      return `https://${trimmed}`;
    }

    case "gps": {
      const coords = parseGpsCoordinates(trimmed);
      if (coords) {
        return `https://www.google.com/maps?q=${coords.lat},${coords.lng}`;
      }
      if (isGoogleMapsUrl(trimmed)) {
        return normalizeGoogleMapsUrl(trimmed);
      }
      return "";
    }

    default:
      return trimmed;
  }
};
