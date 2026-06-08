"use client";

import { memo, useState, useEffect, useMemo, useCallback } from "react";
import {
  X,
  Loader2,
  MousePointerClick,
  Users,
  TrendingUp,
  BarChart3,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { StatCard } from "./analytics/StatCard";
import { flushNow } from "@/lib/utils/client-queue";


// Custom scrollbar — adapts to light/dark
const scrollbarStyles = `
  .custom-scrollbar::-webkit-scrollbar {
    width: 5px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: rgba(156, 163, 175, 0.35);
    border-radius: 4px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: rgba(156, 163, 175, 0.6);
  }
  .dark .custom-scrollbar::-webkit-scrollbar-thumb {
    background: rgba(255,255,255,0.10);
  }
  .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: rgba(255,255,255,0.18);
  }
`;

interface AnalyticsData {
  unique_views: number;
  unique_clicks: number;
  views_by_device: Record<string, number>;
  clicks_by_platform: Record<string, number>;
  views_by_referer: Record<string, number>;
  clicks_by_referer: Record<string, number>;
  views_by_os: Record<string, number>;
  clicks_by_os: Record<string, number>;
  top_clicked_links: Array<{
    link_id: string;
    platform: string;
    display_name?: string;
    click_count: number;
    recent_clicks?: Array<{
      ip_address: string;
      clicked_at: string;
    }>;
  }>;
  recent_views: Array<{
    ip_address: string;
    viewed_at: string;
  }>;
  recent_clicks: Array<{
    ip_address: string;
    platform?: string;
    clicked_at: string;
  }>;
}

interface AnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  linktreeId: string;
  linktreeName: string;
}


export const AnalyticsModal = memo(function AnalyticsModal({
  isOpen,
  onClose,
  linktreeId,
  linktreeName,
}: AnalyticsModalProps) {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isClearing, setIsClearing] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchAnalytics = useCallback(async (bypassCache = false) => {
    setIsLoading(true);
    setError(null);
    try {
      const { fetchWithCache } = await import('@/lib/utils/cache');
      const url = bypassCache
        ? `/api/linktrees/${linktreeId}/analytics?_t=${Date.now()}`
        : `/api/linktrees/${linktreeId}/analytics`;
      const result = await fetchWithCache<{ data: AnalyticsData }>(
        url,
        { credentials: 'include' },
        `/api/linktrees/${linktreeId}/analytics`,
        bypassCache
      );
      setAnalytics(result.data);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : "داتاکان بار نەکران");
      console.error("Error fetching analytics:", err);
    } finally {
      setIsLoading(false);
    }
  }, [linktreeId]);

  useEffect(() => {
    if (isOpen && linktreeId) fetchAnalytics();
  }, [isOpen, linktreeId, fetchAnalytics]);

  const handleRefresh = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await flushNow();
      const flushResponse = await fetch(`/api/linktrees/${linktreeId}/analytics/flush`, {
        method: 'POST',
        credentials: 'include',
        cache: 'no-store',
      });
      if (!flushResponse.ok) {
        const errorData = await flushResponse.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to flush server queues");
      }
      const flushResult = await flushResponse.json();
      if (!flushResult.success) throw new Error("Queue flush did not complete successfully");
      await fetchAnalytics(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "هەڵەیەک لە نوێکردنەوەدا ڕوویدا");
      console.error("Error refreshing analytics:", err);
      setIsLoading(false);
    }
  };

  const handleClearAnalytics = async () => {
    setIsClearing(true);
    setError(null);
    try {
      const response = await fetch(`/api/linktrees/${linktreeId}/analytics/clear`, {
        method: 'DELETE',
        cache: 'no-store',
        credentials: 'include',
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to clear analytics");
      }
      const { clearCachedData } = await import('@/lib/utils/cache');
      clearCachedData(`/api/linktrees/${linktreeId}/analytics`);
      await fetchAnalytics();
      setShowConfirmDialog(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "هەڵەیەک ڕوویدا");
      console.error("Error clearing analytics:", err);
    } finally {
      setIsClearing(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  const conversionRate = useMemo(() => {
    if (!analytics || analytics.unique_views === 0) return "0.0";
    return ((analytics.unique_clicks / analytics.unique_views) * 100).toFixed(1);
  }, [analytics]);

  // Rank badge colour map
  const rankBadge = (index: number) => {
    if (index === 0) return "bg-amber-100 dark:bg-amber-400/15 text-amber-600 dark:text-amber-300 border border-amber-200 dark:border-amber-400/25";
    if (index === 1) return "bg-slate-100 dark:bg-slate-600/20 text-slate-500 dark:text-slate-300 border border-slate-200 dark:border-slate-500/25";
    if (index === 2) return "bg-[#7E0001]/10 dark:bg-[#7E0001]/15 text-[#7E0001] border border-[#7E0001]/30 dark:border-[#7E0001]/25";
    return "bg-slate-50 dark:bg-white/5 text-slate-400 dark:text-gray-500 border border-slate-100 dark:border-white/8";
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: scrollbarStyles }} />
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/40 dark:bg-black/60 backdrop-blur-md overflow-y-auto"
        onClick={handleBackdropClick}
        dir="rtl"
      >
        {/* ── Modal card ─────────────────────────────────────────── */}
        <div className="
          relative w-full max-w-4xl my-4 sm:my-8 rounded-2xl overflow-hidden shadow-2xl
          bg-white dark:bg-[#14161f]
          border border-gray-100/80 dark:border-white/8
        ">

          {/* ── Header ──────────────────────────────────────────── */}
          <div className="
            relative p-5 sm:p-6 border-b
            border-gray-100/80 dark:border-white/8
            bg-gradient-to-r from-white to-slate-50/30
            dark:from-[#14161f] dark:to-[#7E0001]/5
          ">
            <div className="flex items-start justify-between gap-4">
              {/* Title block */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2.5 rounded-xl bg-[#7E0001]/10 dark:bg-[#7E0001]/15 border border-[#7E0001]/20 dark:border-[#7E0001]/25 shadow-sm">
                    <BarChart3 className="h-5 w-5 text-[#7E0001]" />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-700 dark:text-gray-100 font-kurdish">
                      داتاکانی بینین
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-400 dark:text-gray-500 mt-0.5 font-kurdish truncate">
                      {linktreeName}
                    </p>
                  </div>
                </div>
                {lastUpdated && (
                  <div className="flex items-center gap-2 mt-2 text-xs text-slate-400 dark:text-gray-500">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#7E0001] animate-pulse shadow-sm" />
                    <span className="font-kurdish">
                      دواین نوێکردنەوە: {new Intl.DateTimeFormat("ku", {
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      }).format(lastUpdated)}
                    </span>
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2 shrink-0">
                {/* Clear */}
                <button
                  onClick={() => setShowConfirmDialog(true)}
                  disabled={isLoading || isClearing || !analytics || (analytics.unique_views === 0 && analytics.unique_clicks === 0)}
                  className="group relative p-2.5 rounded-xl transition-all duration-200 border shadow-sm
                    bg-rose-50 dark:bg-rose-500/10
                    border-rose-100 dark:border-rose-500/20
                    text-rose-500 dark:text-rose-400
                    hover:bg-rose-100 dark:hover:bg-rose-500/20
                    hover:border-rose-200 dark:hover:border-rose-500/35
                    hover:shadow disabled:opacity-40 disabled:cursor-not-allowed"
                  aria-label="Clear Analytics"
                  title={!analytics || (analytics.unique_views === 0 && analytics.unique_clicks === 0) ? "هیچ داتایەک نییە" : "پاککردنەوەی داتاکان"}
                >
                  <Trash2 className="h-5 w-5 transition-transform group-hover:scale-110" />
                </button>

                {/* Refresh */}
                <button
                  onClick={(e) => { e.preventDefault(); handleRefresh(); }}
                  disabled={isLoading || isClearing}
                  className="group relative p-2.5 rounded-xl transition-all duration-200 border shadow-sm
                    bg-slate-50 dark:bg-white/5
                    border-slate-100 dark:border-white/10
                    text-slate-500 dark:text-gray-400
                    hover:bg-slate-100 dark:hover:bg-white/10
                    hover:border-slate-200 dark:hover:border-white/20
                    hover:text-slate-700 dark:hover:text-gray-200
                    disabled:opacity-50 disabled:cursor-not-allowed hover:shadow"
                  aria-label="Refresh"
                  title="نوێکردنەوە"
                >
                  <RefreshCw className={`h-5 w-5 transition-transform ${isLoading ? 'animate-spin' : 'group-hover:rotate-180'}`} />
                </button>

                {/* Close */}
                <button
                  onClick={onClose}
                  className="group relative p-2.5 rounded-xl transition-all duration-200 border shadow-sm
                    bg-slate-50 dark:bg-white/5
                    border-slate-100 dark:border-white/10
                    text-slate-500 dark:text-gray-400
                    hover:bg-slate-100 dark:hover:bg-white/10
                    hover:border-slate-200 dark:hover:border-white/20
                    hover:text-slate-700 dark:hover:text-gray-200 hover:shadow"
                  aria-label="داخستن"
                >
                  <X className="h-5 w-5 transition-transform group-hover:rotate-90" />
                </button>
              </div>
            </div>
          </div>

          {/* ── Content ─────────────────────────────────────────── */}
          <div className="
            p-4 sm:p-5 md:p-6 overflow-y-auto
            max-h-[calc(100vh-180px)] sm:max-h-[calc(100vh-200px)] md:max-h-[calc(100vh-220px)]
            custom-scrollbar
            bg-white dark:bg-[#14161f]
          ">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-16 gap-4">
                <Loader2 className="h-10 w-10 animate-spin text-[#7E0001]" />
                <p className="text-sm text-slate-400 dark:text-gray-500 font-kurdish">داتاکان بار دەکرێن...</p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-16 gap-4">
                <p className="text-sm text-[#7E0001] font-kurdish">{error}</p>
                <button
                  onClick={(e) => { e.preventDefault(); fetchAnalytics(true); }}
                  className="px-4 py-2.5 rounded-xl text-white font-kurdish shadow-lg hover:shadow-xl transition-all bg-gradient-to-r from-[#7E0001] to-[#3aada6] hover:from-[#3aada6] hover:to-[#2f9b94]"
                >
                  هەوڵ بدەوە
                </button>
              </div>
            ) : analytics ? (
              <div className="space-y-4 sm:space-y-5">

                {/* ── Stat Cards ── */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                  <StatCard
                    icon={Users}
                    label="بینەری جیاواز"
                    value={analytics.unique_views}
                    color="green"
                  />
                  <StatCard
                    icon={TrendingUp}
                    label="کلیکەری جیاواز"
                    value={analytics.unique_clicks}
                    color="orange"
                  />
                  <StatCard
                    icon={BarChart3}
                    label="ڕێژەی گۆڕان"
                    value={`${conversionRate}%`}
                    color="slate"
                    subtitle={`${analytics.unique_clicks} / ${analytics.unique_views}`}
                  />
                </div>

                {/* ── Top Clicked Links ── */}
                {analytics.top_clicked_links.length > 0 && (
                  <div className="
                    rounded-2xl p-4 sm:p-5 border shadow-sm
                    bg-slate-50/60 dark:bg-[#0d0e13]
                    border-slate-100/80 dark:border-white/8
                  ">
                    {/* Section header */}
                    <div className="flex items-center gap-2 mb-4">
                      <div className="p-1.5 rounded-lg bg-[#7E0001]/10 dark:bg-[#7E0001]/15 border border-[#7E0001]/20 dark:border-[#7E0001]/25">
                        <MousePointerClick className="h-3.5 w-3.5 text-[#7E0001]" />
                      </div>
                      <h3 className="text-sm font-semibold text-slate-700 dark:text-gray-200 font-kurdish">
                        زۆرترین کلیک
                      </h3>
                    </div>

                    {/* Link rows */}
                    <div className="space-y-2">
                      {analytics.top_clicked_links.map((link, index) => (
                        <div
                          key={link.link_id}
                          className="
                            p-3 rounded-xl border transition-all duration-200 group
                            bg-white dark:bg-[#14161f]
                            border-slate-100/80 dark:border-white/8
                            hover:border-slate-200 dark:hover:border-white/15
                            hover:shadow-md dark:hover:shadow-black/30
                          "
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              {/* Rank badge */}
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 shadow-sm ${rankBadge(index)}`}>
                                {index + 1}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium text-slate-700 dark:text-gray-200 font-kurdish truncate">
                                  {link.display_name || link.platform}
                                </div>
                                <div className="text-xs text-slate-400 dark:text-gray-500 font-kurdish">
                                  {link.platform}
                                </div>
                              </div>
                            </div>
                            {/* Click count */}
                            <div className="
                              text-sm font-bold shrink-0 ml-3 px-2.5 py-1 rounded-lg
                              text-[#7E0001] bg-[#7E0001]/8 dark:bg-[#7E0001]/12
                              border border-[#7E0001]/20 dark:border-[#7E0001]/20
                              font-kurdish
                            ">
                              {link.click_count.toLocaleString()} کلیک
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* ── Confirm clear dialog ─────────────────────────────── */}
      {showConfirmDialog && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-2 sm:p-3 md:p-4 bg-black/50 dark:bg-black/70 backdrop-blur-md overflow-y-auto">
          <div
            className="
              relative w-full max-w-md my-2 sm:my-4 rounded-2xl overflow-hidden shadow-xl
              bg-white dark:bg-[#14161f]
              border border-gray-100/80 dark:border-white/8
            "
            dir="rtl"
          >
            <div className="p-6 sm:p-8">
              {/* Icon */}
              <div className="flex justify-center mb-5">
                <div className="w-14 h-14 rounded-full flex items-center justify-center
                  bg-rose-50 dark:bg-rose-500/10
                  border border-rose-100 dark:border-rose-500/20">
                  <Trash2 className="h-7 w-7 text-rose-400 dark:text-rose-400" />
                </div>
              </div>

              {/* Message */}
              <div className="text-center mb-6">
                <p className="text-base text-slate-600 dark:text-gray-300 font-kurdish leading-relaxed">
                  دڵنیایت لە پاککردنەوەی داتاکان؟
                </p>
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirmDialog(false)}
                  disabled={isClearing}
                  className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium font-kurdish transition-all duration-200 border
                    bg-slate-50 dark:bg-white/5
                    border-slate-200 dark:border-white/10
                    text-slate-600 dark:text-gray-300
                    hover:bg-slate-100 dark:hover:bg-white/10
                    hover:border-slate-300 dark:hover:border-white/20
                    shadow-sm hover:shadow
                    disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  هەڵوەشاندنەوە
                </button>
                <button
                  onClick={handleClearAnalytics}
                  disabled={isClearing}
                  className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium font-kurdish transition-all duration-200
                    text-white bg-gradient-to-r from-rose-500 to-pink-500
                    hover:from-rose-600 hover:to-pink-600
                    shadow-md hover:shadow-lg
                    disabled:opacity-50 disabled:cursor-not-allowed
                    flex items-center justify-center gap-2"
                >
                  {isClearing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>پاککردنەوە...</span>
                    </>
                  ) : (
                    <span>بەڵێ</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
});
