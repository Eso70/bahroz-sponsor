import { NextRequest, NextResponse } from "next/server";
import { extractAnalyticsData } from "@/lib/utils/analytics";
import { getLinktreeIdByUid } from "@/lib/supabase/queries";
import { addView, addClick } from "@/lib/utils/batch-queue";
import { buildEventId, sendTikTokEvent, toEventTime } from "@/lib/utils/tiktok-events";

// POST /api/analytics/batch - Batch process multiple analytics events
// This reduces API calls from N individual calls to 1 batch call
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { views = [], clicks = [] } = body as {
      views?: Array<{
        uid: string;
        timestamp?: number;
        eventId?: string;
        contentId?: string;
        contentName?: string;
        contentType?: string;
        description?: string;
        url?: string;
      }>;
      clicks?: Array<{
        linkId: string;
        linktreeId: string;
        timestamp?: number;
        platform?: string;
        eventName?: "ClickButton" | "Contact" | "Lead";
        eventId?: string;
        contentId?: string;
        contentName?: string;
        contentType?: string;
        description?: string;
        url?: string;
      }>;
    };

    // Extract analytics data once for both views and clicks
    const analyticsData = await extractAnalyticsData(request);
    const hasValidIp = analyticsData.ip_address && analyticsData.ip_address.trim();
    const referer = request.headers.get("referer") || undefined;
    const origin = request.headers.get("origin") || undefined;

    // Process views and clicks in parallel for better performance
    const [viewsResult, clicksResult] = await Promise.all([
      // Process views in batch
      (async () => {
        if (!Array.isArray(views) || views.length === 0 || !hasValidIp) {
          return { count: 0 };
        }
        
        const uniqueViews = new Map<string, {
          linktreeId: string;
          uid: string;
          timestamp?: number;
          eventId?: string;
          contentId?: string;
          contentName?: string;
          contentType?: string;
          description?: string;
          url?: string;
        }>(); // uid+day -> linktreeId + time
        
        // Get all unique UIDs and their linktree IDs
        for (const view of views) {
          if (view.uid && view.uid.trim()) {
            const dayKey = Number.isFinite(view.timestamp)
              ? new Date(view.timestamp as number).toISOString().slice(0, 10)
              : new Date().toISOString().slice(0, 10);
            const mapKey = `${view.uid.trim()}_${dayKey}`;
            if (uniqueViews.has(mapKey)) {
              continue;
            }
            const linktreeId = await getLinktreeIdByUid(view.uid.trim());
            if (linktreeId) {
              uniqueViews.set(mapKey, {
                linktreeId,
                uid: view.uid.trim(),
                timestamp: view.timestamp,
                eventId: view.eventId,
                contentId: view.contentId,
                contentName: view.contentName,
                contentType: view.contentType,
                description: view.description,
                url: view.url,
              });
            }
          }
        }
        
        // Add all views to batch queue - wait for all to complete
        const viewPromises = [];
        for (const entry of uniqueViews.values()) {
          const viewedAt = Number.isFinite(entry.timestamp)
            ? new Date(entry.timestamp as number).toISOString()
            : new Date().toISOString();
          viewPromises.push(addView({
            linktree_id: entry.linktreeId,
            ip_address: analyticsData.ip_address.trim(),
            session_id: analyticsData.session_id?.trim() || null,
            viewed_at: viewedAt,
          }));

          const viewUrl = origin
            ? `${origin.replace(/\/$/, "")}/${entry.uid}`
            : referer;
          const eventId = buildEventId({
            event: "ViewContent",
            contentId: entry.linktreeId,
            sessionId: analyticsData.session_id,
            ip: analyticsData.ip_address,
            eventTimeIso: viewedAt,
          });
          viewPromises.push(sendTikTokEvent({
            event: "ViewContent",
            event_time: toEventTime(viewedAt),
            event_id: entry.eventId || eventId,
            content_id: entry.contentId || `linktree:${entry.linktreeId}`,
            content_ids: [entry.contentId || `linktree:${entry.linktreeId}`],
            content_type: entry.contentType || "lead_generation_linktree",
            content_name: entry.contentName || entry.uid,
            description: entry.description || `Public link page view for ${entry.uid}`,
            url: entry.url || viewUrl,
            ip: analyticsData.ip_address,
            user_agent: analyticsData.user_agent,
            ttclid: analyticsData.ttclid,
            ttp: analyticsData.ttp,
          }));
        }
        await Promise.all(viewPromises);
        
        return { count: uniqueViews.size };
      })(),
      
      // Process clicks in batch
      (async () => {
        if (!Array.isArray(clicks) || clicks.length === 0 || !hasValidIp) {
          return { count: 0 };
        }
        
        const uniqueClicks = new Map<string, {
          linkId: string;
          linktreeId: string;
          timestamp?: number;
          platform?: string;
          eventName?: "ClickButton" | "Contact" | "Lead";
          eventId?: string;
          contentId?: string;
          contentName?: string;
          contentType?: string;
          description?: string;
          url?: string;
        }>();
        
        // Deduplicate clicks
        for (const click of clicks) {
          if (
            click.linkId && 
            click.linkId.trim() && 
            click.linktreeId && 
            click.linktreeId.trim()
          ) {
            const dayKey = Number.isFinite(click.timestamp)
              ? new Date(click.timestamp as number).toISOString().slice(0, 10)
              : new Date().toISOString().slice(0, 10);
            const key = `${click.linkId.trim()}_${click.linktreeId.trim()}_${dayKey}`;
            if (!uniqueClicks.has(key)) {
              uniqueClicks.set(key, {
                linkId: click.linkId.trim(),
                linktreeId: click.linktreeId.trim(),
                timestamp: click.timestamp,
                platform: click.platform?.trim() || undefined,
                eventName: click.eventName,
                eventId: click.eventId,
                contentId: click.contentId,
                contentName: click.contentName,
                contentType: click.contentType,
                description: click.description,
                url: click.url,
              });
            }
          }
        }
        
        // Add all clicks to batch queue - wait for all to complete
        const clickPromises = [];
        for (const click of uniqueClicks.values()) {
          const clickedAt = Number.isFinite(click.timestamp)
            ? new Date(click.timestamp as number).toISOString()
            : new Date().toISOString();
          clickPromises.push(addClick({
            link_id: click.linkId,
            linktree_id: click.linktreeId,
            ip_address: analyticsData.ip_address.trim(),
            session_id: analyticsData.session_id?.trim() || null,
            clicked_at: clickedAt,
          }));

          const eventId = buildEventId({
            event: click.eventName || "ClickButton",
            contentId: click.linkId,
            sessionId: analyticsData.session_id,
            ip: analyticsData.ip_address,
            eventTimeIso: clickedAt,
          });
          clickPromises.push(sendTikTokEvent({
            event: click.eventName || "ClickButton",
            event_time: toEventTime(clickedAt),
            event_id: click.eventId || eventId,
            content_id: click.contentId || `link:${click.linkId}`,
            content_ids: [click.contentId || `link:${click.linkId}`],
            content_type: click.contentType || `${click.platform || "link"}_cta`,
            content_name: click.contentName || click.platform || "link",
            description: click.description || `${click.platform || "Link"} CTA click`,
            url: click.url || referer || origin,
            ip: analyticsData.ip_address,
            user_agent: analyticsData.user_agent,
            ttclid: analyticsData.ttclid,
            ttp: analyticsData.ttp,
          }));
        }
        await Promise.all(clickPromises);
        
        return { count: uniqueClicks.size };
      })(),
    ]);

    return NextResponse.json({ 
      success: true,
      processed: {
        views: viewsResult.count,
        clicks: clicksResult.count,
      }
    }, { status: 200 });
  } catch (error) {
    // Always return success - analytics failures shouldn't break the page
    console.error("Batch analytics error:", error);
    return NextResponse.json({ success: true }, { status: 200 });
  }
}
