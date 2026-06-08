/**
 * TikTok Pixel Component (Server Component)
 *
 * Loads the TikTok Pixel base code using the Next.js <Script> component.
 * Using next/script instead of a raw <script> tag is the standard approach —
 * it injects the script outside the React render tree so React never sees it,
 * which eliminates the "script tag inside React component" console warning.
 *
 * Strategy "afterInteractive": script runs after the page hydrates, matching
 * the original inline-script behaviour.
 *
 * TikTok Pixel ID is hardcoded in this file.
 */

import Script from "next/script";

// Standard TikTok Pixel using Next.js Script (afterInteractive)
// Pixel ID is hardcoded per project requirement.
export function TikTokPixel(): React.ReactElement | null {
  return (
    <Script
      id="tiktok-pixel"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: `
          // TikTok Pixel Code Start
          !function (w, d, t) {
            w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie","holdConsent","revokeConsent","grantConsent"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var r="https://analytics.tiktok.com/i18n/pixel/events.js",o=n&&n.partner;ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=r,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};n=document.createElement("script");n.type="text/javascript",n.async=!0,n.src=r+"?sdkid="+e+"&lib="+t;e=document.getElementsByTagName("script")[0];e.parentNode.insertBefore(n,e)};
            ttq.load('D8AAH7JC77UANKFS27D0');
            ttq.page();
          }(window, document, 'ttq');
          // TikTok Pixel Code End
        `,
      }}
    />
  );
}
