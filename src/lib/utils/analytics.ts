/**
 * Analytics utility functions
 */

export interface AnalyticsData {
  ip_address: string;
  session_id?: string;
  user_agent?: string;
  ttclid?: string;
  ttp?: string;
}

/**
 * Extract IP address from request
 */
export function getClientIP(request: Request): string {
  // Check various headers for IP address
  const forwarded = request.headers.get("x-forwarded-for");
  const realIP = request.headers.get("x-real-ip");
  const cfConnectingIP = request.headers.get("cf-connecting-ip");
  
  if (cfConnectingIP) {
    return cfConnectingIP.split(",")[0].trim();
  }
  
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  
  if (realIP) {
    return realIP.split(",")[0].trim();
  }
  
  return "0.0.0.0"; // Fallback
}


/**
 * Generate or get session ID from request
 */
export function getSessionId(request: Request): string {
  // Try to get session ID from cookie
  const cookies = request.headers.get("cookie");
  if (cookies) {
    const sessionMatch = cookies.match(/session[_-]?id=([^;]+)/i);
    if (sessionMatch) {
      return sessionMatch[1];
    }
  }

  // Generate a session ID based on IP + User-Agent hash
  const ip = getClientIP(request);
  const userAgent = request.headers.get("user-agent") || "";
  const hash = `${ip}-${userAgent}`.slice(0, 32);
  
  return hash;
}

function getCookieValue(cookies: string | null, name: string): string | undefined {
  if (!cookies) return undefined;
  const match = cookies.match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`));
  return match?.[1];
}

function getQueryParam(url: string | null | undefined, name: string): string | undefined {
  if (!url) return undefined;
  try {
    return new URL(url).searchParams.get(name) || undefined;
  } catch {
    return undefined;
  }
}

/**
 * Extract all analytics data from request (simplified - only IP and session ID)
 */
export async function extractAnalyticsData(request: Request): Promise<AnalyticsData> {
  const ip = getClientIP(request);
  const sessionId = getSessionId(request);
  const cookies = request.headers.get("cookie");
  const userAgent = request.headers.get("user-agent") || undefined;
  const referer = request.headers.get("referer");
  const ttclid = getQueryParam(request.url, "ttclid") || getQueryParam(referer, "ttclid");
  const ttp = getCookieValue(cookies, "_ttp");

  return {
    ip_address: ip,
    session_id: sessionId,
    user_agent: userAgent,
    ttclid,
    ttp,
  };
}
