import { NextRequest, NextResponse } from "next/server";
import { extractAnalyticsData } from "@/lib/utils/analytics";
import { getLinktreeIdByUid } from "@/lib/supabase/queries";
import { addView } from "@/lib/utils/batch-queue";
import { buildEventId, sendTikTokEvent, toEventTime } from "@/lib/utils/tiktok-events";
import { isRateLimited } from "@/lib/database/redis";

// POST /api/public/linktrees/[uid]/view - Track unique page view
// Batched inserts reduce database load significantly
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ uid: string }> }
) {
  try {
    const { uid } = await params;
    
    // Validate UID - skip if null/empty to reduce API calls
    if (!uid || !uid.trim()) {
      return NextResponse.json({ success: true }, { status: 200 });
    }
    
    // Get linktree ID
    const linktreeId = await getLinktreeIdByUid(uid);
    if (!linktreeId || !linktreeId.trim()) {
      return NextResponse.json({ success: true }, { status: 200 }); // Don't error, just return success
    }

    // Extract minimal analytics data (server extracts referrer from headers)
    const analyticsData = await extractAnalyticsData(request);
    
    // Validate analytics data - skip if IP is null/empty
    if (!analyticsData.ip_address || !analyticsData.ip_address.trim()) {
      return NextResponse.json({ success: true }, { status: 200 });
    }

    // Rate Limit: Max 60 page views per minute per IP
    const ip = analyticsData.ip_address.trim();
    const isLimited = await isRateLimited(`rate:limit:view:${ip}`, 60, 60);
    if (isLimited) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }
    
    // Add to batch queue (will be inserted in batch) - fire and forget
    const viewedAt = new Date().toISOString();
    addView({
      linktree_id: linktreeId.trim(),
      ip_address: analyticsData.ip_address.trim(),
      session_id: analyticsData.session_id?.trim() || null,
      viewed_at: viewedAt,
    }).catch(() => {
      // Silently fail - analytics shouldn't break the page
    });

    const origin = request.headers.get("origin");
    const viewUrl = origin ? `${origin.replace(/\/$/, "")}/${uid}` : undefined;
    const eventId = buildEventId({
      event: "ViewContent",
      contentId: linktreeId.trim(),
      sessionId: analyticsData.session_id,
      ip: analyticsData.ip_address,
      eventTimeIso: viewedAt,
    });
    sendTikTokEvent({
      event: "ViewContent",
      event_time: toEventTime(viewedAt),
      event_id: eventId,
      content_id: `linktree:${linktreeId.trim()}`,
      content_ids: [`linktree:${linktreeId.trim()}`],
      content_type: "lead_generation_linktree",
      content_name: uid,
      description: `Public link page view for ${uid}`,
      url: viewUrl,
      ip: analyticsData.ip_address,
      user_agent: analyticsData.user_agent,
      ttclid: analyticsData.ttclid,
      ttp: analyticsData.ttp,
    }).catch(() => {
      // Silently fail
    });

    // Return immediately - batch insert happens in background
    return NextResponse.json({ success: true }, { status: 200 });
  } catch {
    // Always return success - analytics failures shouldn't break the page
    return NextResponse.json({ success: true }, { status: 200 });
  }
}
