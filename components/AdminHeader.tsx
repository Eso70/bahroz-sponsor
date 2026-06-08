"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { LayoutDashboard, Plus, RefreshCw, Trash2, Sun, Moon, Laptop } from "lucide-react";
import { ProfileAvatar } from "@/components/ProfileAvatar";
import { ProfileDropdown } from "@/components/ProfileDropdown";

interface AdminHeaderProps {
  onCreateNew?: () => void;
  onRefresh?: () => void;
  onProfileClick?: () => void;
  theme?: "light" | "dark" | "system";
  onChangeTheme?: (theme: "light" | "dark" | "system") => void;
}

export function AdminHeader({ onCreateNew, onRefresh, onProfileClick, theme = "system", onChangeTheme }: AdminHeaderProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [hasAnalyticsData, setHasAnalyticsData] = useState<boolean | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);
  const themeMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (themeMenuRef.current && !themeMenuRef.current.contains(event.target as Node)) {
        setIsThemeMenuOpen(false);
      }
    };

    if (isDropdownOpen || isThemeMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen, isThemeMenuOpen]);

  // Check if analytics data exists
  useEffect(() => {
    const checkAnalyticsData = async () => {
      try {
        const response = await fetch("/api/analytics/totals", {
          credentials: "include",
          cache: 'no-store',
        });

        if (response.ok) {
          const result = await response.json();
          const data = result.data || {};
          const hasData = (data.total_views || 0) > 0 || (data.total_clicks || 0) > 0;
          setHasAnalyticsData(hasData);
        } else {
          setHasAnalyticsData(false);
        }
      } catch (error) {
        console.error("Error checking analytics data:", error);
        setHasAnalyticsData(false);
      }
    };

    checkAnalyticsData();
  }, []);

  const handleRefresh = useCallback(async () => {
    if (!onRefresh) return;
    setIsRefreshing(true);
    try {
      await onRefresh();
      // Re-check analytics data after refresh
      const response = await fetch("/api/analytics/totals", {
        credentials: "include",
        cache: 'no-store',
      });
      if (response.ok) {
        const result = await response.json();
        const data = result.data || {};
        const hasData = (data.total_views || 0) > 0 || (data.total_clicks || 0) > 0;
        setHasAnalyticsData(hasData);
      }
    } catch (error) {
      console.error("Error refreshing data:", error);
    } finally {
      setIsRefreshing(false);
    }
  }, [onRefresh]);

  const handleClearAllAnalytics = useCallback(async () => {
    setIsClearing(true);
    try {
      const response = await fetch("/api/analytics/clear-all", {
        method: "DELETE",
        credentials: "include",
        cache: 'no-store',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to clear analytics");
      }

      // Refresh data after clearing
      if (onRefresh) {
        await onRefresh();
      }

      // Update analytics data state
      setHasAnalyticsData(false);
      setShowConfirmDialog(false);
    } catch (error) {
      console.error("Error clearing analytics:", error);
      alert(error instanceof Error ? error.message : "هەڵەیەک ڕوویدا");
    } finally {
      setIsClearing(false);
    }
  }, [onRefresh]);

  const handleLogout = useCallback(async () => {
    setIsDropdownOpen(false);
    setIsLoading(true);

    try {
      // Call logout API to invalidate session in database
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch {
      // Ignore errors, still redirect
    }

    // Clear any local state and redirect to login
    // Using window.location.href ensures full page reload and cookie deletion
    window.location.href = "/login";
  }, []);

  return (
    <header
      className="sticky top-0 z-50 w-full bg-white dark:bg-[#090a0f] border-b border-gray-200 dark:border-white/8 transition-all duration-400 relative"
      dir="ltr"
      suppressHydrationWarning
    >
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.06] dark:opacity-[0.02]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 26px, #7E0001 26px, #7E0001 27px), repeating-linear-gradient(90deg, transparent, transparent 26px, #7E0001 26px, #7E0001 27px)",
        }}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-10 relative">
        <div className="flex items-center justify-between h-14 sm:h-16 md:h-18">
          {/* Left Section - Logo & Title */}
          <div className="flex items-center gap-2 sm:gap-3 md:gap-4 min-w-0">
            <div
              className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-lg sm:rounded-xl bg-[#7E0001]/10 border border-[#7E0001]/30 shadow-sm flex-shrink-0"
            >
              <LayoutDashboard className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-[#7E0001]" />
            </div>
            <div className="flex flex-col min-w-0">
              <h1 className="text-sm sm:text-base md:text-lg font-bold text-slate-700 dark:text-gray-100 leading-tight tracking-tight truncate">
                داشبۆرد
              </h1>
              <p className="text-xs text-slate-400 dark:text-gray-400 hidden sm:block">
                بەڕێوەبردنی سیستەم
              </p>
            </div>
          </div>

          {/* Right Section - Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3 flex-shrink-0">
            <button
              onClick={() => setShowConfirmDialog(true)}
              disabled={isRefreshing || isClearing || hasAnalyticsData === false}
              className="group relative flex items-center justify-center p-2 sm:p-2.5 md:p-3 rounded-xl bg-gradient-to-br from-rose-50 to-pink-50 hover:from-rose-100 hover:to-pink-100 border border-rose-100 dark:from-rose-500/10 dark:to-pink-500/10 dark:border-rose-500/20 dark:hover:from-rose-500/20 dark:hover:to-pink-500/20 dark:text-rose-400 transition-all duration-300 text-rose-500 hover:text-rose-600 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 shadow-sm hover:shadow"
              aria-label="Clear All Analytics"
              title={hasAnalyticsData === false ? "هیچ داتایەک نییە" : "پاککردنەوەی هەموو داتاکان"}
            >
              <Trash2 className="h-4 w-4 sm:h-4 sm:w-4 md:h-5 md:w-5 transition-transform group-hover:scale-110" />
            </button>
            {onRefresh && (
              <button
                onClick={handleRefresh}
                disabled={isRefreshing || isClearing}
                className="group relative flex items-center justify-center p-2 sm:p-2.5 md:p-3 rounded-xl bg-gradient-to-br from-slate-50 to-gray-50 hover:from-slate-100 hover:to-gray-100 border border-slate-100 dark:from-white/5 dark:to-white/5 dark:border-white/10 dark:text-gray-300 dark:hover:from-white/10 dark:hover:to-white/10 transition-all duration-300 text-slate-500 hover:text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 shadow-sm hover:shadow"
                aria-label="Refresh"
                title="نوێکردنەوە"
              >
                <RefreshCw className={`h-4 w-4 sm:h-4 sm:w-4 md:h-5 md:w-5 transition-transform ${isRefreshing ? 'animate-spin' : 'group-hover:rotate-180'}`} />
              </button>
            )}

            {/* Theme Selector Toggle */}
            <div className="relative" ref={themeMenuRef}>
              <button
                onClick={() => setIsThemeMenuOpen(!isThemeMenuOpen)}
                className="group relative flex items-center justify-center p-2 sm:p-2.5 md:p-3 rounded-xl bg-gradient-to-br from-slate-50 to-gray-50 hover:from-slate-100 hover:to-gray-100 border border-slate-100 dark:from-white/5 dark:to-white/5 dark:border-white/10 dark:text-gray-300 dark:hover:from-white/10 dark:hover:to-white/10 transition-all duration-300 text-slate-500 hover:text-slate-700 shadow-sm hover:shadow"
                aria-label="Toggle theme"
                title="گۆڕینی ڕووکار"
              >
                {theme === "light" && <Sun className="h-4 w-4 sm:h-4 sm:w-4 md:h-5 md:w-5" />}
                {theme === "dark" && <Moon className="h-4 w-4 sm:h-4 sm:w-4 md:h-5 md:w-5" />}
                {theme === "system" && <Laptop className="h-4 w-4 sm:h-4 sm:w-4 md:h-5 md:w-5" />}
              </button>

              {isThemeMenuOpen && (
                <div className="absolute right-0 mt-2 w-32 rounded-xl bg-white dark:bg-[#14161f] border border-gray-100 dark:border-white/10 shadow-xl overflow-hidden z-[60] animate-in fade-in slide-in-from-top-1 duration-200">
                  <div className="p-1 flex flex-col gap-0.5" dir="rtl">
                    <button
                      onClick={() => {
                        onChangeTheme?.("light");
                        setIsThemeMenuOpen(false);
                      }}
                      className={`flex items-center gap-2 w-full px-3 py-2 text-xs font-semibold rounded-lg transition-colors ${theme === "light"
                          ? "bg-[#7E0001]/10 text-[#7E0001] dark:bg-[#7E0001]/15"
                          : "text-slate-600 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-white/5"
                        }`}
                    >
                      <Sun className="h-3.5 w-3.5" />
                      <span className="font-kurdish">ڕووناک</span>
                    </button>
                    <button
                      onClick={() => {
                        onChangeTheme?.("dark");
                        setIsThemeMenuOpen(false);
                      }}
                      className={`flex items-center gap-2 w-full px-3 py-2 text-xs font-semibold rounded-lg transition-colors ${theme === "dark"
                          ? "bg-[#7E0001]/10 text-[#7E0001] dark:bg-[#7E0001]/15"
                          : "text-slate-600 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-white/5"
                        }`}
                    >
                      <Moon className="h-3.5 w-3.5" />
                      <span className="font-kurdish">تاریک</span>
                    </button>
                    <button
                      onClick={() => {
                        onChangeTheme?.("system");
                        setIsThemeMenuOpen(false);
                      }}
                      className={`flex items-center gap-2 w-full px-3 py-2 text-xs font-semibold rounded-lg transition-colors ${theme === "system"
                          ? "bg-[#7E0001]/10 text-[#7E0001] dark:bg-[#7E0001]/15"
                          : "text-slate-600 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-white/5"
                        }`}
                    >
                      <Laptop className="h-3.5 w-3.5" />
                      <span className="font-kurdish">سیستەم</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {onCreateNew && (
              <button
                onClick={onCreateNew}
                className="group relative flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 md:px-5 py-2 sm:py-2.5 md:py-3 rounded-xl text-xs sm:text-sm md:text-base font-semibold text-white shadow-lg transition-all hover:shadow-xl whitespace-nowrap flex-shrink-0 bg-gradient-to-r from-[#7E0001] via-[#7E0001] to-[#7E0001] hover:from-[#7E0001] hover:via-[#7E0001] hover:to-[#7E0001]"
              >
                <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5 flex-shrink-0" />
                <span className="font-kurdish hidden xs:inline">بەستەری نوێ</span>
              </button>
            )}
            <div className="flex items-center gap-2 sm:gap-3 relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="group flex items-center transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#7E0001]/50 focus:ring-offset-2 focus:ring-offset-white rounded-full p-0.5"
                aria-label="Profile menu"
              >
                <div className="ring-2 ring-slate-200 dark:ring-white/10 group-hover:ring-[#7E0001]/40 rounded-full transition-all duration-300 shadow-sm">
                  <ProfileAvatar size="md" />
                </div>
              </button>

              <ProfileDropdown
                isOpen={isDropdownOpen}
                isLoading={isLoading}
                onLogout={handleLogout}
                onProfileClick={() => {
                  setIsDropdownOpen(false);
                  onProfileClick?.();
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 dark:bg-black/60 backdrop-blur-md">
          <div className="relative w-full max-w-md rounded-2xl bg-white dark:bg-[#14161f] border border-gray-100/50 dark:border-white/8 shadow-xl overflow-hidden" dir="rtl">
            <div className="p-6 sm:p-8">
              {/* Icon */}
              <div className="flex justify-center mb-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-rose-50/70 to-pink-50/70 dark:from-rose-500/10 dark:to-pink-500/10 border border-rose-100/50 dark:border-rose-500/20 flex items-center justify-center">
                  <Trash2 className="h-7 w-7 text-rose-400" />
                </div>
              </div>

              {/* Message */}
              <div className="text-center mb-6">
                <p className="text-base text-slate-600 dark:text-gray-300 font-kurdish leading-relaxed">
                  دڵنیایت لە پاککردنەوەی هەموو داتاکانی بینین و کلیک؟
                </p>
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirmDialog(false)}
                  disabled={isClearing}
                  className="flex-1 px-4 py-2.5 rounded-xl text-slate-600 dark:text-gray-300 font-medium transition-all duration-300 text-sm shadow-sm hover:shadow disabled:opacity-50 disabled:cursor-not-allowed bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/10 hover:border-slate-300 dark:hover:border-white/20"
                >
                  هەڵوەشاندنەوە
                </button>
                <button
                  onClick={handleClearAllAnalytics}
                  disabled={isClearing}
                  className="flex-1 px-4 py-2.5 rounded-xl text-white font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 shadow-md hover:shadow-lg"
                >
                  {isClearing ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
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
    </header>
  );
}


