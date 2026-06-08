"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { CUSTOM_ICONS_MAP, ICON_CATEGORIES } from "@/lib/config/icons";
import { Search, X } from "lucide-react";

interface IconPickerProps {
  value: string;
  onChange: (iconName: string) => void;
  customTrigger?: React.ReactNode;
}

type CategoryKey = keyof typeof ICON_CATEGORIES;

const CATEGORY_LABELS: Record<CategoryKey, string> = {
  all: "All",
  lucide: "Lucide",
  fontAwesome: "Font Awesome",
  bootstrap: "Bootstrap",
  tabler: "Tabler",
  material: "Material",
  antDesign: "Ant Design",
  simpleIcons: "Simple Icons",
};

// Memoized Icon Button — transform-gpu + content-visibility for max scroll performance
const IconButton = React.memo(({
  iconName,
  isSelected,
  onClick,
}: {
  iconName: string;
  isSelected: boolean;
  onClick: (name: string) => void;
}) => {
  const Icon = CUSTOM_ICONS_MAP[iconName];
  if (!Icon) return null;

  return (
    <button
      type="button"
      onClick={() => onClick(iconName)}
      className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-200 transform-gpu ${
        isSelected
          ? "bg-[#7E0001]/15 dark:bg-[#7E0001]/20 text-[#7E0001] ring-2 ring-[#7E0001] shadow-md scale-95"
          : "bg-white dark:bg-[#1a1c27] text-slate-600 dark:text-gray-400 border border-slate-100 dark:border-white/8 hover:bg-slate-50 dark:hover:bg-[#242638] hover:text-slate-800 dark:hover:text-gray-200 hover:border-slate-300 dark:hover:border-white/15 shadow-sm hover:shadow"
      }`}
      style={{
        contentVisibility: "auto",
        containIntrinsicSize: "70px",
      }}
      title={iconName}
    >
      <Icon className="w-5 h-5 sm:w-6 sm:h-6 mb-1 pointer-events-none" />
      <span className="text-[9px] sm:text-[10px] w-full truncate text-center opacity-70 pointer-events-none">
        {iconName.replace(/^(Fa|Si|Bs|Tb|Md|AiOutline|Ai)/, "")}
      </span>
    </button>
  );
});

IconButton.displayName = "IconButton";

export function IconPicker({ value, onChange, customTrigger }: IconPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<CategoryKey>("all");
  const [visibleCount, setVisibleCount] = useState(120);

  const popoverRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const gridContainerRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // ── Filtered icons ──────────────────────────────────────────────────────────
  const filteredIcons = useMemo(() => {
    const iconNames = ICON_CATEGORIES[activeCategory] || [];
    if (!searchQuery) return iconNames;
    const lowerQuery = searchQuery.toLowerCase();
    return iconNames.filter((name) => name.toLowerCase().includes(lowerQuery));
  }, [activeCategory, searchQuery]);

  const renderedIcons = useMemo(() => filteredIcons.slice(0, visibleCount), [filteredIcons, visibleCount]);

  // Per-tab count badges (updates with search)
  const categoryCounts = useMemo(() => {
    const counts = {} as Record<CategoryKey, number>;
    const lowerQuery = searchQuery.toLowerCase();
    (Object.keys(ICON_CATEGORIES) as CategoryKey[]).forEach((cat) => {
      const list = ICON_CATEGORIES[cat] || [];
      counts[cat] = !searchQuery
        ? list.length
        : list.filter((name) => name.toLowerCase().includes(lowerQuery)).length;
    });
    return counts;
  }, [searchQuery]);

  // Reset scroll & page when category or search changes
  // Wrapped in startTransition to satisfy react-hooks/set-state-in-effect
  useEffect(() => {
    React.startTransition(() => {
      setVisibleCount(120);
    });
    if (gridContainerRef.current) gridContainerRef.current.scrollTop = 0;
  }, [activeCategory, searchQuery]);

  // ── IntersectionObserver infinite scroll ────────────────────────────────────
  useEffect(() => {
    const container = gridContainerRef.current;
    const sentinel = sentinelRef.current;
    if (!container || !sentinel || !isOpen || filteredIcons.length <= visibleCount) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting)
          setVisibleCount((prev) => Math.min(prev + 120, filteredIcons.length));
      },
      { root: container, rootMargin: "250px" }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [isOpen, filteredIcons.length, visibleCount]);

  // ── Mount / keyboard / focus effects ────────────────────────────────────────
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setIsOpen(false); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && searchInputRef.current && mounted)
      setTimeout(() => searchInputRef.current?.focus(), 100);
  }, [isOpen, mounted]);

  // ── Derived values ───────────────────────────────────────────────────────────
  const SelectedIcon =
    value && CUSTOM_ICONS_MAP[value] ? CUSTOM_ICONS_MAP[value] : CUSTOM_ICONS_MAP["Link"];

  const handleIconClick = React.useCallback(
    (iconName: string) => { onChange(iconName); setIsOpen(false); },
    [onChange]
  );

  // ── Trigger button ───────────────────────────────────────────────────────────
  const triggerContent = customTrigger ? (
    <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
      {customTrigger}
    </div>
  ) : (
    <button
      type="button"
      onClick={() => setIsOpen(!isOpen)}
      className="relative flex items-center justify-center shrink-0 w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 lg:h-12 overflow-hidden rounded-lg sm:rounded-xl md:rounded-2xl border border-gray-300 dark:border-white/10 hover:border-gray-400 dark:hover:border-white/20 focus-within:ring-2 focus-within:ring-[#7E0001]/30 transition-all cursor-pointer shadow-sm group bg-white dark:bg-[#0d0e13]"
      title="ئاڕاستەی ئایکۆن (Choose Icon)"
    >
      {value && CUSTOM_ICONS_MAP[value] ? (
        <SelectedIcon className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700 dark:text-gray-300 animate-in fade-in duration-300" />
      ) : (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-gray-50 dark:bg-[#0d0e13] text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 font-bold group-hover:bg-gray-100 dark:group-hover:bg-[#1a1c27] transition-colors">
          ئایکۆن
        </div>
      )}
    </button>
  );

  if (!mounted) return <div ref={popoverRef} className="relative">{triggerContent}</div>;

  // ── Modal ────────────────────────────────────────────────────────────────────
  const modalContent = isOpen ? (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[100] bg-black/40 dark:bg-black/60 backdrop-blur-md animate-in fade-in duration-300"
        onClick={() => setIsOpen(false)}
        aria-hidden
      />

      {/* Dialog */}
      <div
        className="
          fixed z-[101] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
          w-[95vw] sm:w-[500px] md:w-[600px] lg:w-[650px] max-w-[650px]
          h-[80vh] max-h-[700px] overflow-hidden rounded-2xl shadow-2xl
          border border-gray-200/60 dark:border-white/8
          bg-white dark:bg-[#14161f]
          animate-in fade-in zoom-in-95 duration-300 flex flex-col
        "
        dir="ltr"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ─────────────────────────────────── */}
        <div className="
          shrink-0 border-b border-gray-100/80 dark:border-white/8
          bg-gradient-to-r from-white via-white to-[#7E0001]/6
          dark:from-[#14161f] dark:via-[#14161f] dark:to-[#7E0001]/5
        ">
          <div className="flex items-center justify-between px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-[#7E0001]/10 dark:bg-[#7E0001]/15 border border-[#7E0001]/25 dark:border-[#7E0001]/30 shadow-sm">
                <Search className="h-4 w-4 text-[#7E0001]" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-800 dark:text-gray-100 leading-tight">
                  ئایکۆن هەڵبژێرە
                </h2>
                <p className="text-xs text-slate-400 dark:text-gray-500 mt-0.5">Choose Icon</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="shrink-0 p-2 rounded-xl transition-all duration-200 border shadow-sm
                bg-slate-50 dark:bg-[#0d0e13]
                border-slate-200 dark:border-white/8
                text-slate-400 dark:text-gray-500
                hover:bg-slate-100 dark:hover:bg-[#1a1c27]
                hover:text-slate-700 dark:hover:text-gray-200
                hover:border-slate-300 dark:hover:border-white/15"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* ── Search ─────────────────────────────────── */}
        <div className="
          shrink-0 px-4 py-3 border-b border-gray-100/80 dark:border-white/8
          bg-slate-50/60 dark:bg-[#0d0e13]/70
        ">
          <div className="relative">
            {/* Icon is a sibling of <input>, not inside — prevents backdrop-blur clash */}
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 z-10 pointer-events-none text-slate-400 dark:text-gray-500" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search icons..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="
                w-full pl-9 pr-9 py-2.5 rounded-xl text-sm transition-all duration-200
                bg-white dark:bg-[#14161f]
                border border-slate-200 dark:border-white/10
                text-slate-700 dark:text-gray-200
                placeholder-slate-400 dark:placeholder-gray-600
                shadow-sm
                focus:outline-none focus:border-[#7E0001] focus:ring-2 focus:ring-[#7E0001]/20
                hover:border-slate-300 dark:hover:border-white/20
              "
            />
            {searchQuery && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSearchQuery("");
                  searchInputRef.current?.focus();
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-lg z-10 transition-colors duration-200
                  text-slate-400 dark:text-gray-500
                  hover:text-slate-700 dark:hover:text-gray-200
                  hover:bg-slate-100 dark:hover:bg-white/8"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* ── Category Filter Tabs — flex-wrap so all tabs visible on desktop ── */}
        <div
          className="
            shrink-0 flex flex-wrap gap-1.5 px-3 py-2.5
            border-b border-gray-100/80 dark:border-white/8
            bg-slate-100/70 dark:bg-[#0a0b10]
          "
        >
          {(Object.keys(CATEGORY_LABELS) as CategoryKey[]).map((cat) => {
            const active = activeCategory === cat;
            const count = categoryCounts[cat] || 0;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`
                  flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold
                  whitespace-nowrap border transition-all duration-200
                  ${active
                    ? "bg-[#7E0001]/15 dark:bg-[#7E0001]/20 text-[#7E0001] border-[#7E0001]/35 dark:border-[#7E0001]/40 shadow-sm"
                    : "bg-white dark:bg-[#14161f] text-slate-500 dark:text-gray-400 border-slate-200/80 dark:border-white/8 hover:bg-slate-50 dark:hover:bg-[#1a1c27] hover:text-slate-700 dark:hover:text-gray-200 hover:border-slate-300 dark:hover:border-white/15"
                  }
                `}
                title={`${CATEGORY_LABELS[cat]} (${count})`}
              >
                <span>{CATEGORY_LABELS[cat]}</span>
                {active && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-md font-bold bg-[#7E0001]/25 dark:bg-[#7E0001]/30 text-[#7E0001]">
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ── Icon Grid ──────────────────────────────── */}
        <div
          ref={gridContainerRef}
          className="flex-1 overflow-y-auto p-4 transform-gpu bg-white dark:bg-[#14161f]"
          style={{
            scrollbarWidth: "thin",
            scrollbarColor: "rgba(156,163,175,0.35) transparent",
          }}
        >
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2 sm:gap-3">
            {renderedIcons.map((iconName) => (
              <IconButton
                key={iconName}
                iconName={iconName}
                isSelected={value === iconName}
                onClick={handleIconClick}
              />
            ))}
          </div>

          {filteredIcons.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-400 dark:text-gray-500">
              <Search className="h-9 w-9 opacity-25" />
              <span className="text-sm">No icons found for &ldquo;{searchQuery}&rdquo;</span>
            </div>
          )}

          {/* Sentinel — triggers IntersectionObserver lazy load */}
          {filteredIcons.length > visibleCount && (
            <div
              ref={sentinelRef}
              className="flex justify-center items-center gap-2 mt-4 py-4 border-t border-slate-100/50 dark:border-white/5 text-xs text-slate-400 dark:text-gray-600"
            >
              <div className="w-4 h-4 border-2 border-slate-200 dark:border-white/12 border-t-[#7E0001] rounded-full animate-spin" />
              <span>Loading more icons…</span>
            </div>
          )}
        </div>

        {/* ── Footer ─────────────────────────────────── */}
        <div className="
          shrink-0 flex justify-between items-center p-3
          border-t border-gray-100/80 dark:border-white/8
          bg-slate-50/60 dark:bg-[#0d0e13]
        ">
          <button
            type="button"
            onClick={() => { onChange(""); setIsOpen(false); }}
            className="
              text-xs sm:text-sm font-medium px-3 py-1.5 rounded-lg transition-all duration-200 border
              text-red-500 dark:text-red-400
              bg-red-50 dark:bg-red-500/10
              border-red-200/60 dark:border-red-500/20
              hover:bg-red-100 dark:hover:bg-red-500/18
              hover:border-red-300 dark:hover:border-red-500/35
            "
          >
            Clear Icon
          </button>
          <span className="
            text-xs font-medium px-2.5 py-1 rounded-lg border
            text-slate-400 dark:text-gray-500
            bg-slate-100 dark:bg-white/5
            border-slate-200/60 dark:border-white/8
          ">
            {Math.min(visibleCount, filteredIcons.length)} / {filteredIcons.length} icons
          </span>
        </div>
      </div>
    </>
  ) : null;

  return (
    <div className="relative" ref={popoverRef} dir="ltr">
      {triggerContent}
      {mounted && modalContent && createPortal(modalContent, document.body)}
    </div>
  );
}
