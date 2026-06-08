"use client";

import { memo, useMemo } from "react";
import { LinktreeHeader } from "@/components/public/LinktreeHeader";
import { LinktreeButtons } from "@/components/public/LinktreeButtons";
import { GpsLocationDisplay, splitGpsLinks } from "@/components/public/GpsLocationDisplay";
import { Footer } from "@/components/public/Footer";
import type { TemplateComponentProps } from "./types";
import { deriveTextColor, deriveTextSecondaryColor } from "@/lib/utils/theme-colors";
import { areTemplatePropsEqual } from "@/lib/utils/linktree-utils";

export const ModernGlassTemplate = memo(function ModernGlassTemplate({
  linktree,
  links,
  theme,
  onLinkClick,
}: TemplateComponentProps) {
  const { gpsLink, regularLinks } = useMemo(() => splitGpsLinks(links), [links]);
  const backgroundStyle = useMemo(
    () => ({
      background: theme.isSolid 
        ? theme.from 
        : `linear-gradient(to bottom right, ${theme.from}, ${theme.via}, ${theme.to})`,
    }),
    [theme.from, theme.via, theme.to, theme.isSolid],
  );

  const textColor = useMemo(() => deriveTextColor(theme.from, theme.via, theme.to), [theme.from, theme.via, theme.to]);
  const textSecondaryColor = useMemo(() => deriveTextSecondaryColor(theme.from, theme.via, theme.to), [theme.from, theme.via, theme.to]);

  return (
    <div 
      className="relative flex min-h-screen w-full flex-col items-center overflow-y-auto px-4 pt-10 pb-4"
      style={backgroundStyle}
    >
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.06]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 26px, #7E0001 26px, #7E0001 27px), repeating-linear-gradient(90deg, transparent, transparent 26px, #7E0001 26px, #7E0001 27px)",
        }}
      />
      <div className="w-full max-w-md mx-auto scale-[0.95] sm:scale-100">
        <LinktreeHeader linktree={linktree} textColor={textColor} textSecondaryColor={textSecondaryColor} />
      </div>

      <div className="mt-7 w-full max-w-md mx-auto mb-16">
        <LinktreeButtons links={regularLinks} onLinkClick={onLinkClick} />
      </div>

      <div className="w-full max-w-md mx-auto">
        <GpsLocationDisplay
          gpsLink={gpsLink}
          textColor={textColor}
          textSecondaryColor={textSecondaryColor}
        />
      </div>

      <Footer 
        footerText={linktree.footer_text}
        footerPhone={linktree.footer_phone}
        footerHidden={linktree.footer_hidden ?? false}
        transparent={true}
        textColor={textColor}
        textSecondaryColor={textSecondaryColor}
      />
    </div>
  );
}, areTemplatePropsEqual);
