"use client";

import type { Link, Linktree } from "@/lib/supabase/queries";

export type TikTokEventName = "ViewContent" | "Contact" | "Lead" | "ClickButton";
export type TikTokClickEventName = Exclude<TikTokEventName, "ViewContent">;

export interface TikTokEventProperties {
  content_id: string;
  content_ids: string[];
  content_type: string;
  content_name: string;
  description: string;
  url?: string;
}

type TikTokTrack = (
  event: TikTokEventName,
  properties?: Record<string, unknown>,
  options?: { event_id?: string }
) => void;

declare global {
  interface Window {
    ttq?: {
      track?: TikTokTrack;
      page?: () => void;
    };
  }
}

const CHAT_PLATFORMS = new Set(["whatsapp", "telegram", "viber"]);
const HARD_LEAD_PLATFORMS = new Set(["phone", "email"]);
const RAPID_CLICK_WINDOW_MS = 1500;
const recentClickKeys = new Map<string, number>();

function getDayKey(date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

function getPageUrl(): string | undefined {
  if (typeof window === "undefined") return undefined;
  return window.location.href;
}

function getDisplayName(link: Link): string {
  return link.display_name || link.platform || "link";
}

function getRandomId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function classifyTikTokClickEvent(link: Link): TikTokClickEventName {
  const platform = link.platform.toLowerCase();

  if (CHAT_PLATFORMS.has(platform)) {
    return "Contact";
  }

  if (HARD_LEAD_PLATFORMS.has(platform) || link.display_order === 0) {
    return "Lead";
  }

  return "ClickButton";
}

export function buildViewContentProperties(linktree: Linktree): TikTokEventProperties {
  const contentId = `linktree:${linktree.id || linktree.uid}`;
  const description = linktree.subtitle || `Public link page for ${linktree.name}`;

  return {
    content_id: contentId,
    content_ids: [contentId],
    content_type: "lead_generation_linktree",
    content_name: linktree.name,
    description,
    url: getPageUrl(),
  };
}

export function buildClickProperties(linktree: Linktree, link: Link): TikTokEventProperties {
  const contentId = `link:${link.id}`;
  const displayName = getDisplayName(link);

  return {
    content_id: contentId,
    content_ids: [contentId],
    content_type: `${link.platform.toLowerCase()}_cta`,
    content_name: displayName,
    description: `${displayName} CTA click from ${linktree.name}`,
    url: getPageUrl(),
  };
}

export function buildViewEventId(linktree: Linktree): string {
  return `vc:${linktree.id || linktree.uid}:${getDayKey()}`;
}

export function buildClickEventId(eventName: TikTokEventName, link: Link): string {
  return `${eventName.toLowerCase()}:${link.id}:${Date.now()}:${getRandomId()}`;
}

export function isRapidDuplicateClick(eventName: TikTokEventName, linkId: string): boolean {
  const now = Date.now();
  const key = `${eventName}:${linkId}`;
  const previous = recentClickKeys.get(key) || 0;

  recentClickKeys.set(key, now);

  for (const [storedKey, timestamp] of recentClickKeys) {
    if (now - timestamp > RAPID_CLICK_WINDOW_MS) {
      recentClickKeys.delete(storedKey);
    }
  }

  return now - previous < RAPID_CLICK_WINDOW_MS;
}

export function trackTikTokPixelEvent(
  event: TikTokEventName,
  properties: TikTokEventProperties,
  eventId: string
): void {
  if (typeof window === "undefined") return;
  window.ttq?.track?.(event, { ...properties }, { event_id: eventId });
}
