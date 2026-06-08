import { isGpsInputValid } from "../modal-utils";

/**
 * Validates a single link value based on the platform and optional country code.
 * Returns a Kurdish error message string if invalid, or undefined if valid.
 */
export function validateSingleLink(
  platform: string,
  value: string,
  countryCode?: string
): string | undefined {
  const trimmed = value.trim();
  
  if (!trimmed) {
    return "تکایە بەهای لینکەکە بنووسە";
  }

  // Helper to check if a string is a URL
  const isUrl = (val: string) => val.startsWith("http://") || val.startsWith("https://") || val.includes("/");

  switch (platform) {
    case "whatsapp":
    case "phone":
    case "viber": {
      const digitsOnly = trimmed.replace(/\D/g, "");
      const isIraq = countryCode === "964";

      // Strip selected country code if user typed it at the start
      let checkNumber = digitsOnly;
      if (countryCode && checkNumber.startsWith(countryCode)) {
        checkNumber = checkNumber.substring(countryCode.length);
      }

      if (isIraq) {
        // Iraqi mobile carrier rules:
        // Korek (075/75), Asiacell (077/77), Zain (078/78, 079/79)
        if (checkNumber.startsWith("0")) {
          if (!/^07[5789]\d{8}$/.test(checkNumber)) {
            return "تکایە ژمارەیەکی دروستی عێراق بنووسە (دەبێت بە 075, 077, 078, 079 دەستپێبکات و ١١ ژمارە بێت)";
          }
        } else {
          if (!/^7[5789]\d{8}$/.test(checkNumber)) {
            return "تکایە ژمارەیەکی دروستی عێراق بنووسە (دەبێت بە 75, 77, 78, 79 دەستپێبکات و ١٠ ژمارە بێت)";
          }
        }
      } else {
        // Strip leading zero if present
        if (checkNumber.startsWith("0")) {
          checkNumber = checkNumber.substring(1);
        }
        // General international phone validation: national number between 6 and 12 digits
        if (checkNumber.length < 6 || checkNumber.length > 12) {
          return "تکایە ژمارەیەکی مۆبایلی دروست بنووسە";
        }
      }
      return undefined;
    }

    case "telegram": {
      if (isUrl(trimmed)) {
        const pattern = /^(https?:\/\/)?(www\.)?(t\.me|telegram\.me)\/[a-zA-Z0-9_]{5,32}\/?(\?.*)?$/i;
        if (!pattern.test(trimmed)) {
          return "لینکی تێلیگرام نادروستە (پێویستە t.me/username بێت)";
        }
      } else {
        const username = trimmed.replace(/^@/, "");
        if (!/^[a-zA-Z0-9_]{5,32}$/.test(username)) {
          return "ناوی بەکارهێنەری تێلیگرام نادروستە (دەبێت لانیکەم ٥ پیت بێت و تەنها پیت، ژمارە و _ تێدابێت)";
        }
      }
      return undefined;
    }

    case "instagram": {
      if (isUrl(trimmed)) {
        if (!/^(https?:\/\/)?(www\.)?instagram\.com\/.+$/i.test(trimmed)) {
          return "تکایە لینکێکی دروستی ئینستاگرام بنووسە (پێویستە instagram.com بێت)";
        }
      } else {
        const username = trimmed.replace(/^@/, "");
        if (!/^[a-zA-Z0-9_.]+$/.test(username) || username.length > 30) {
          return "ناوی بەکارهێنەری ئینستاگرام نادروستە";
        }
      }
      return undefined;
    }

    case "facebook": {
      if (isUrl(trimmed)) {
        if (!/^(https?:\/\/)?(www\.|m\.)?(facebook\.com|fb\.com)\/.+$/i.test(trimmed)) {
          return "تکایە لینکێکی دروستی فەیسبووک بنووسە (پێویستە facebook.com بێت)";
        }
      } else {
        if (!/^[a-zA-Z0-9.]+$/.test(trimmed) || trimmed.length < 5) {
          return "ناوی بەکارهێنەری فەیسبووک نادروستە (لانیکەم ٥ پیت یان ژمارە)";
        }
      }
      return undefined;
    }

    case "tiktok": {
      if (isUrl(trimmed)) {
        if (!/^(https?:\/\/)?(www\.|m\.)?(tiktok\.com|vm\.tiktok\.com|vt\.tiktok\.com)\/.+$/i.test(trimmed)) {
          return "تکایە لینکێکی دروستی تیکتۆک بنووسە (پێویستە tiktok.com بێت)";
        }
      } else {
        const username = trimmed.replace(/^@/, "");
        if (!/^[a-zA-Z0-9_.]+$/.test(username) || username.length > 24) {
          return "ناوی بەکارهێنەری تیکتۆک نادروستە";
        }
      }
      return undefined;
    }

    case "snapchat": {
      if (isUrl(trimmed)) {
        if (!/^(https?:\/\/)?(www\.)?snapchat\.com\/.+$/i.test(trimmed)) {
          return "تکایە لینکێکی دروستی سناپچات بنووسە (پێویستە snapchat.com/add/username بێت)";
        }
      } else {
        const username = trimmed.replace(/^@/, "");
        if (!/^[a-zA-Z][a-zA-Z0-9._-]{2,14}$/.test(username)) {
          return "ناوی بەکارهێنەری سناپچات نادروستە";
        }
      }
      return undefined;
    }

    case "youtube": {
      if (isUrl(trimmed)) {
        if (!/^(https?:\/\/)?(www\.|m\.)?(youtube\.com|youtu\.be)\/.+$/i.test(trimmed)) {
          return "تکایە لینکێکی دروستی یوتیوب بنووسە";
        }
      } else {
        const username = trimmed.replace(/^@/, "");
        if (!/^[a-zA-Z0-9._-]+$/.test(username)) {
          return "ناوی کەناڵی یوتیوب نادروستە";
        }
      }
      return undefined;
    }

    case "twitter":
    case "x": {
      if (isUrl(trimmed)) {
        if (!/^(https?:\/\/)?(www\.)?(twitter\.com|x\.com)\/.+$/i.test(trimmed)) {
          return "تکایە لینکێکی دروستی ئێکس/تویتەر بنووسە";
        }
      } else {
        const username = trimmed.replace(/^@/, "");
        if (!/^[a-zA-Z0-9_]{1,15}$/.test(username)) {
          return "ناوی بەکارهێنەری ئێکس/تویتەر نادروستە";
        }
      }
      return undefined;
    }

    case "linkedin": {
      if (isUrl(trimmed)) {
        if (!/^(https?:\/\/)?(www\.)?linkedin\.com\/.+/i.test(trimmed)) {
          return "تکایە لینکێکی دروستی لینکدئین بنووسە";
        }
      } else {
        if (!/^[a-zA-Z0-9_-]+$/.test(trimmed)) {
          return "ناوی ناسنامەی لینکدئین نادروستە";
        }
      }
      return undefined;
    }

    case "discord": {
      if (isUrl(trimmed)) {
        const isValid =
          trimmed.includes("discord.gg/") ||
          trimmed.includes("discord.com/invite/") ||
          trimmed.includes("discord.com/users/") ||
          trimmed.includes("discord.com/channels/");
        if (!isValid) {
          return "تکایە لینکێکی دروستی دیسکۆرد بنووسە";
        }
      } else {
        // Invite code or numeric user ID
        const isNumeric = /^\d+$/.test(trimmed);
        if (isNumeric) {
          if (!/^\d{17,20}$/.test(trimmed)) {
            return "ئایدی دیسکۆرد نادروستە (دەبێت نێوان ١٧ بۆ ٢٠ ژمارە بێت)";
          }
        } else {
          if (!/^[a-zA-Z0-9-]+$/.test(trimmed)) {
            return "کۆدی بانگهێشتی دیسکۆرد نادروستە";
          }
        }
      }
      return undefined;
    }

    case "email": {
      const emailOnly = trimmed.replace(/^mailto:/i, "").trim();
      const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!pattern.test(emailOnly)) {
        return "تکایە ناونیشانی ئیمەیڵێکی دروست بنووسە (نموونە: user@example.com)";
      }
      return undefined;
    }

    case "website": {
      const checkUrl = trimmed.startsWith("http://") || trimmed.startsWith("https://") ? trimmed : `https://${trimmed}`;
      try {
        const urlObj = new URL(checkUrl);
        if (!urlObj.hostname || !urlObj.hostname.includes(".")) {
          return "تکایە ناونیشانی ماڵپەڕێکی دروست بنووسە (نموونە: website.com)";
        }
      } catch {
        return "تکایە ناونیشانی ماڵپەڕێکی دروست بنووسە (نموونە: website.com)";
      }
      return undefined;
    }

    case "gps": {
      if (!isGpsInputValid(trimmed)) {
        return "تکایە ناونیشانی GPS دروست بنووسە (نموونە: 36.191, 44.009) یان لینکێکی نەخشەی گووگڵ";
      }
      return undefined;
    }

    case "custom": {
      if (trimmed.includes("://") || trimmed.startsWith("mailto:") || trimmed.startsWith("tel:") || trimmed.startsWith("viber://")) {
        const parts = trimmed.split(":");
        if (!parts[1] || parts[1].trim().length < 2) {
          return "تکایە لینکێکی دروست بنووسە";
        }
      } else {
        if (!/^[a-zA-Z0-9\-]+(\.[a-zA-Z0-9\-]+)+.*$/.test(trimmed)) {
          return "تکایە لینکێکی دروست بنووسە (نموونە: example.com)";
        }
      }
      return undefined;
    }

    default:
      return undefined;
  }
}
