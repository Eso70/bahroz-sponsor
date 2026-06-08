"use client";

import { memo, useMemo } from "react";
import { SOCIAL_PLATFORMS } from "../modal-constants";

interface SocialLink {
  id: string;
  platform: string;
  url: string;
  value?: string;
  countryCode?: string;
  enabled: boolean;
  order?: number;
}

interface PlatformSelectionStepProps {
  selectedPlatforms: string[];
  socialLinks: SocialLink[];
  error?: string;
  touched?: boolean;
  onTogglePlatform: (platformId: string) => void;
}

// Memoized platform button component
const PlatformButton = memo(function PlatformButton({
  platform,
  isSelected,
  onToggle,
}: {
  platform: typeof SOCIAL_PLATFORMS[0];
  isSelected: boolean;
  onToggle: () => void;
}) {
  const Icon = platform.icon;
  
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 ${
        isSelected
          ? "border-[#7E0001] bg-[#7E0001]/10 scale-105"
          : "border-gray-300 bg-white hover:border-gray-400 hover:bg-gray-50"
      }`}
    >
      <div className={`p-3 rounded-lg bg-linear-to-br ${platform.color}`}>
        <Icon className="h-6 w-6 text-white" />
      </div>
      <span className="text-xs font-medium text-gray-900">{platform.name}</span>
    </button>
  );
}, (prevProps, nextProps) => {
  return prevProps.isSelected === nextProps.isSelected && prevProps.platform.id === nextProps.platform.id;
});

PlatformButton.displayName = "PlatformButton";

export const PlatformSelectionStep = memo(function PlatformSelectionStep({
  selectedPlatforms,
  socialLinks,
  error,
  touched,
  onTogglePlatform,
}: PlatformSelectionStepProps) {
  // Pre-compute selected platforms map from existing socialLinks to avoid
  // transient desync between `selectedPlatforms` and `socialLinks` state updates.
  // This ensures the UI reflects actual created link instances.
  const selectedPlatformsMap = useMemo(() => {
    return new Set(socialLinks.map(l => l.platform));
  }, [socialLinks]);

  return (
    <div className="space-y-3 sm:space-y-4">
      <p className="text-xs sm:text-sm text-gray-600 text-center">پلاتفۆڕمەکان هەڵبژێرە</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {SOCIAL_PLATFORMS.map((platform) => (
          <PlatformButton
            key={platform.id}
            platform={platform}
            isSelected={selectedPlatformsMap.has(platform.id)}
            onToggle={() => onTogglePlatform(platform.id)}
          />
        ))}
      </div>
      {error && touched && (
        <p className="text-xs text-[#7E0001] mt-2 text-center font-kurdish">{error}</p>
      )}
      {selectedPlatforms.length === 0 && !error && (
        <p className="text-center text-sm text-gray-600 py-4">
          لانی کەم یەک لە پلاتفۆڕمەکان هەڵبژێرە
        </p>
      )}
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison to prevent unnecessary re-renders
  return (
    prevProps.selectedPlatforms.length === nextProps.selectedPlatforms.length &&
    prevProps.selectedPlatforms.every((id, idx) => id === nextProps.selectedPlatforms[idx]) &&
    prevProps.socialLinks.length === nextProps.socialLinks.length &&
    prevProps.error === nextProps.error &&
    prevProps.touched === nextProps.touched
  );
});
