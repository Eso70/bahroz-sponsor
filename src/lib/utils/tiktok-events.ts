import crypto from "crypto";

type TikTokEventName = "ClickButton" | "Contact" | "Lead" | "ViewContent";

type TikTokEventPayload = {
  event: TikTokEventName;
  event_time: number;
  event_id: string;
  url?: string;
  content_id?: string;
  content_ids?: string[];
  content_type?: string;
  content_name?: string;
  description?: string;
  value?: number;
  currency?: string;
  email?: string;
  phone?: string;
  external_id?: string;
  ip?: string;
  user_agent?: string;
  ttclid?: string;
  ttp?: string;
};

const EVENTS_API_URL = "https://business-api.tiktok.com/open_api/v1.3/event/track/";

function isEnabled(): boolean {
  return true;
}

function getPixelId(): string | undefined {
  return process.env.TIKTOK_PIXEL_ID;
}

function getAccessToken(): string | undefined {
  return process.env.TIKTOK_EVENTS_API_TOKEN;
}

function toUnixSeconds(date: Date): number {
  return Math.floor(date.getTime() / 1000);
}

function getDayKeyFromIso(iso: string): string {
  return iso.slice(0, 10);
}

function hashEventId(value: string): string {
  return crypto.createHash("sha256").update(value).digest("hex");
}

export function buildEventId(params: {
  event: TikTokEventName;
  contentId: string;
  sessionId?: string | null;
  ip?: string | null;
  eventTimeIso: string;
}): string {
  const dayKey = getDayKeyFromIso(params.eventTimeIso);
  const sessionKey = (params.sessionId || "").trim() || (params.ip || "").trim();
  const base = [params.event, params.contentId, sessionKey, dayKey].join(":");
  return hashEventId(base);
}

export function toEventTime(dateIso: string): number {
  const timestamp = Date.parse(dateIso);
  if (Number.isFinite(timestamp)) {
    return toUnixSeconds(new Date(timestamp));
  }
  return toUnixSeconds(new Date());
}

export async function sendTikTokEvent(payload: TikTokEventPayload): Promise<void> {
  if (!isEnabled()) return;

  const pixelId = getPixelId();
  const accessToken = getAccessToken();

  if (!pixelId || !accessToken) return;

  const requestBody = {
    pixel_code: pixelId,
    data: [
      {
        event: payload.event,
        event_time: payload.event_time,
        event_id: payload.event_id,
        properties: {
          value: payload.value,
          currency: payload.currency,
          content_id: payload.content_id,
          content_ids: payload.content_ids || (payload.content_id ? [payload.content_id] : undefined),
          content_type: payload.content_type,
          content_name: payload.content_name,
          description: payload.description,
          url: payload.url,
        },
        context: {
          email: payload.email,
          phone: payload.phone,
          external_id: payload.external_id,
          ip: payload.ip,
          user_agent: payload.user_agent,
          ttclid: payload.ttclid,
          ttp: payload.ttp,
        },
      },
    ],
  };

  try {
    await fetch(EVENTS_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Access-Token": accessToken,
      },
      body: JSON.stringify(requestBody),
    });
  } catch {
    // Ignore Events API failures to avoid breaking analytics flow.
  }
}
