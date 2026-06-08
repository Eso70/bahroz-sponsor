"use client";

import { memo, useCallback, useMemo, useEffect, useRef, useState } from "react";
import { Link } from "@/lib/supabase/queries";
import { Linktree } from "@/lib/supabase/queries";
import { appendMessageToUrl } from "@/lib/utils/message-url";
import { DynamicTemplate } from "@/components/templates/DynamicTemplate";
import type { TemplateTheme } from "@/components/templates";
import {
  deriveAccentColor,
  deriveBorderColor,
  deriveTextColor,
  deriveTextSecondaryColor,
  deriveHighlightColor,
} from "@/lib/utils/theme-colors";
import { hasTrackedView, markViewTracked, hasTrackedClick, markClickTracked } from "@/lib/utils/tracking";
import { queueView, queueClick, flushNow } from "@/lib/utils/client-queue";
import { getBackgroundGradient, DEFAULT_BACKGROUND_COLOR } from "@/lib/config/background-gradients";
import { WhatsAppQuestionModal, type WhatsAppQuestion } from "@/components/public/WhatsAppQuestionModal";
import {
  buildClickEventId,
  buildClickProperties,
  buildViewContentProperties,
  buildViewEventId,
  classifyTikTokClickEvent,
  isRapidDuplicateClick,
  trackTikTokPixelEvent,
} from "@/lib/utils/tiktok-tracking";

interface LinktreePageProps {
  linktree: Linktree;
  links: Link[];
}

export const LinktreePage = memo(function LinktreePage({ linktree, links }: LinktreePageProps) {
  // Ref to prevent duplicate view tracking calls
  const viewTrackedRef = useRef(false);
  
  // WhatsApp modal state
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
  const [pendingWhatsAppUrl, setPendingWhatsAppUrl] = useState<string>("");
  
  // Fix viewport height on iOS - must be client-side
  // This ensures proper height calculation on iPhone Safari
  // Performance: Debounced resize handler
  useEffect(() => {
    if (typeof window === "undefined") return;
    
    let timeoutId: NodeJS.Timeout;
    const setVH = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty("--vh", `${vh}px`);
    };
    
    // Set on load
    setVH();
    
    // Debounced resize handler for better performance
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(setVH, 150); // Debounce 150ms
    };
    
    // Update on resize and orientation change
    window.addEventListener("resize", handleResize, { passive: true });
    window.addEventListener("orientationchange", setVH, { passive: true });
    
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", setVH);
    };
  }, []);

  // Track unique page view on mount (only once per browser session)
  useEffect(() => {
    // Prevent duplicate calls with ref check (synchronous, immediate)
    if (viewTrackedRef.current) {
      return; // Already processing or tracked in this component instance
    }
    
    // Check if already tracked in storage - skip API call if already tracked
    if (hasTrackedView(linktree.uid)) {
      viewTrackedRef.current = true; // Mark as tracked
      return; // Already tracked, skip API call
    }
    
    const viewProperties = buildViewContentProperties(linktree);
    const viewEventId = buildViewEventId(linktree);

    trackTikTokPixelEvent("ViewContent", viewProperties, viewEventId);

    // Mark as tracked immediately (both ref and storage) to prevent duplicate calls
    viewTrackedRef.current = true;
    markViewTracked(linktree.uid);
    
    // Queue matching Events API hit with the same event_id for deduplication.
    queueView(linktree.uid, {
      eventId: viewEventId,
      contentId: viewProperties.content_id,
      contentName: viewProperties.content_name,
      contentType: viewProperties.content_type,
      description: viewProperties.description,
      url: viewProperties.url,
    });
  }, [linktree]);
  // Get background gradient or solid color based on background_color
  const baseTheme = useMemo(() => {
    const bgColor = linktree.background_color || DEFAULT_BACKGROUND_COLOR;
    return getBackgroundGradient(bgColor);
  }, [linktree.background_color]);

  // Extend theme with derived accent colors
  const theme: TemplateTheme = useMemo(() => {
    return {
      ...baseTheme,
      accent: deriveAccentColor(baseTheme.from, baseTheme.via, baseTheme.to),
      border: deriveBorderColor(baseTheme.from, baseTheme.via, baseTheme.to, 0.3),
      text: deriveTextColor(baseTheme.from, baseTheme.via, baseTheme.to),
      textSecondary: deriveTextSecondaryColor(baseTheme.from, baseTheme.via, baseTheme.to),
      highlight: deriveHighlightColor(baseTheme.from, baseTheme.via, baseTheme.to),
    };
  }, [baseTheme]);

  const backgroundStyle = useMemo(() => {
    if (theme.isSolid) {
      return theme.from;
    }
    return `linear-gradient(to bottom right, ${theme.from}, ${theme.via}, ${theme.to})`;
  }, [theme.from, theme.via, theme.to, theme.isSolid]);

  // Apply background color to body/page (client-side only to prevent hydration mismatch)
  // Optimized: Combined DOM updates and reduced re-renders
  useEffect(() => {
    // Only run on client to prevent hydration mismatch
    if (typeof window === 'undefined') return;
    
    // Batch DOM updates using requestAnimationFrame for better performance
    const rafId = requestAnimationFrame(() => {
      // Find the main background container using data attribute
      const bodyContainer = document.querySelector('body > div[data-theme-background]') as HTMLElement;
      
      if (bodyContainer) {
        // Apply the background (gradient or solid)
        bodyContainer.style.background = backgroundStyle;
        // Safari/iOS: Use 'scroll' instead of 'fixed' for better performance
        bodyContainer.style.backgroundAttachment = 'scroll';
      }
      
      // Update CSS variables in one batch
      const root = document.documentElement;
      root.style.setProperty('--theme-bg-from', theme.from);
      root.style.setProperty('--theme-bg-via', theme.isSolid ? theme.from : theme.via);
      root.style.setProperty('--theme-bg-to', theme.isSolid ? theme.from : theme.to);

      // Dispatch theme change event (debounced to prevent excessive events)
      window.dispatchEvent(
        new CustomEvent('theme-background-change', {
          detail: {
            from: theme.from,
            via: theme.isSolid ? theme.from : theme.via,
            to: theme.isSolid ? theme.from : theme.to,
          },
        })
      );
    });
    
    // Cleanup: restore default on unmount
    return () => {
      cancelAnimationFrame(rafId);
      if (typeof window === 'undefined') return;
      const container = document.querySelector('body > div[data-theme-background]') as HTMLElement;
      if (container) {
        container.style.background = '';
        container.style.backgroundAttachment = 'scroll';
      }
    };
  }, [backgroundStyle, theme.from, theme.via, theme.to, theme.isSolid]);

  // Extract WhatsApp modal config from template_config - completely dynamic
  const whatsappModalConfig = useMemo(() => {
    if (!linktree.template_config || typeof linktree.template_config !== 'object') {
      return null;
    }
    
    const config = linktree.template_config as Record<string, unknown>;
    const modalConfig = config.whatsapp_modal;
    
    if (!modalConfig || typeof modalConfig !== 'object' || Array.isArray(modalConfig)) {
      return null;
    }
    
    const modal = modalConfig as Record<string, unknown>;
    
    // Check if modal is enabled - default to false when not set
    const enabled = typeof modal.enabled === 'boolean' ? modal.enabled : false;
    if (!enabled) {
      return null;
    }
    
    // Extract questions array - completely dynamic, any IDs allowed
    let questions: WhatsAppQuestion[] | undefined;
    if (Array.isArray(modal.questions)) {
      questions = modal.questions
        .filter((q): q is WhatsAppQuestion => {
          if (!q || typeof q !== 'object') return false;
          const obj = q as unknown as Record<string, unknown>;
          return (
            typeof obj.id === 'string' &&
            typeof obj.text === 'string' &&
            typeof obj.message === 'string'
          );
        })
        .map((q) => {
          const obj = q as unknown as Record<string, unknown>;
          return {
            id: obj.id as string,
            text: obj.text as string,
            message: obj.message as string,
          };
        });
    }
    
    return {
      title: typeof modal.title === 'string' ? modal.title : undefined,
      subtitle: typeof modal.subtitle === 'string' ? modal.subtitle : undefined,
      questions: questions && questions.length > 0 ? questions : undefined,
    };
  }, [linktree.template_config]);

  /**
   * Cross-platform URL opener.
   * - Native URI schemes (tel:, viber://, mailto:) MUST use window.location.href on iOS Safari.
   *   window.open() is blocked for these schemes on iOS and will silently fail.
   * - Regular https:// links open in a new tab via window.open().
   */
  const openUrl = useCallback((targetUrl: string) => {
    // Native app URI schemes — must use location.href, NOT window.open()
    const isNativeScheme =
      targetUrl.startsWith("tel:") ||
      targetUrl.startsWith("viber://") ||
      targetUrl.startsWith("mailto:");

    if (isNativeScheme) {
      window.location.href = targetUrl;
      return;
    }

    // Regular web URLs — open in new tab
    try {
      window.open(targetUrl, "_blank", "noopener,noreferrer");
    } catch {
      // Fallback for popup blockers
      window.location.href = targetUrl;
    }
  }, []);

  const handleLinkClick = useCallback((linkId: string, url: string, platform: string, defaultMessage?: string | null) => {
    const link = links.find((item) => item.id === linkId);
    if (link) {
      const eventName = classifyTikTokClickEvent(link);

      if (!isRapidDuplicateClick(eventName, linkId)) {
        const clickProperties = buildClickProperties(linktree, link);
        const clickEventId = buildClickEventId(eventName, link);

        trackTikTokPixelEvent(eventName, clickProperties, clickEventId);
        queueClick(linkId, linktree.id, platform, {
          eventName,
          eventId: clickEventId,
          contentId: clickProperties.content_id,
          contentName: clickProperties.content_name,
          contentType: clickProperties.content_type,
          description: clickProperties.description,
          url: clickProperties.url,
        });
        flushNow().catch(() => {
          // Conversion delivery should not block the outbound click.
        });
      }
    }

    // Internal analytics remains unique per link/day to keep dashboard counts stable.
    if (!hasTrackedClick(linkId)) {
      // Mark as tracked immediately to prevent duplicate calls
      markClickTracked(linkId);
    }

    // For WhatsApp, show question modal if enabled, otherwise open directly
    if (platform === "whatsapp") {
      // If modal is disabled or has no questions, open WhatsApp URL directly
      if (!whatsappModalConfig || !whatsappModalConfig.questions || whatsappModalConfig.questions.length === 0) {
        openUrl(url);
        return;
      }
      // Otherwise, show the modal
      setPendingWhatsAppUrl(url);
      setIsWhatsAppModalOpen(true);
      return;
    }

    // Append default message to URL if platform supports it
    const finalUrl = appendMessageToUrl(url, platform, defaultMessage);

    openUrl(finalUrl);
  }, [linktree, links, whatsappModalConfig, openUrl]);

  // Handle WhatsApp question selection
  const handleWhatsAppQuestionSelect = useCallback((message: string) => {
    if (!pendingWhatsAppUrl) return;

    // Append the selected message to WhatsApp URL
    const finalUrl = appendMessageToUrl(pendingWhatsAppUrl, "whatsapp", message);

    // Open WhatsApp with the message
    openUrl(finalUrl);

    // Reset state
    setPendingWhatsAppUrl("");
  }, [pendingWhatsAppUrl, openUrl]);

  return (
    <div className="relative">
      <div
        className="fixed inset-0 pointer-events-none z-20 opacity-[0.10] dark:opacity-[0.10]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(45deg, transparent, transparent 28px, rgba(150,150,150,0.7) 28px, rgba(150,150,150,0.7) 29px), repeating-linear-gradient(-45deg, transparent, transparent 28px, rgba(150,150,150,0.7) 28px, rgba(150,150,150,0.7) 29px)",
        }}
      />
      {/* Purple-blue radial glow (bottom-right) */}
      <div
        className="fixed bottom-0 right-0 w-[600px] h-[600px] pointer-events-none z-20 opacity-[0.20] dark:opacity-[0.14]"
        style={{ background: "radial-gradient(circle at bottom right, rgba(120,80,220,0.85), rgba(60,100,255,0.45) 40%, transparent 70%)" }}
      />
      <div className="relative z-10">
        {/* Dynamic template renders based on template_config from database */}
        <DynamicTemplate
          linktree={linktree}
          links={links}
          theme={theme}
          onLinkClick={handleLinkClick}
        />
        
        {/* WhatsApp Question Modal */}
        <WhatsAppQuestionModal
          isOpen={isWhatsAppModalOpen}
          onClose={() => {
            setIsWhatsAppModalOpen(false);
            setPendingWhatsAppUrl("");
          }}
          onSelectQuestion={handleWhatsAppQuestionSelect}
          whatsappUrl={pendingWhatsAppUrl}
          title={whatsappModalConfig?.title}
          subtitle={whatsappModalConfig?.subtitle}
          questions={whatsappModalConfig?.questions}
        />
      </div>
    </div>
  );
});
