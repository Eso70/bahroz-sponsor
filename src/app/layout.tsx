import type { Metadata, Viewport } from "next";
import { Background } from "@/components/ui/background";
import { TikTokPixel } from "@/components/analytics/TikTokPixel";
import { AnimatedGradientOverlay } from "@/components/ui/animated-gradient-overlay";
import { getAppBaseUrl } from "@/lib/utils/app-url";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(getAppBaseUrl()),
  title: "Bahroz",
  description:
    "Bahroz connects communities with networking opportunities tailored for growth and support.",
  icons: {
    icon: "/favicon.ico",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: "#4b5563",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover", // For devices with notches
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ku" dir="rtl" suppressHydrationWarning>
      <head>
        <link rel="dns-prefetch" href="https://analytics.tiktok.com" />
        <link rel="preconnect" href="https://analytics.tiktok.com" crossOrigin="anonymous" />
        <meta name="theme-color" content="#4b5563" />
        {/* Prevent browser caching of HTML pages */}
        <meta httpEquiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
        <meta httpEquiv="Pragma" content="no-cache" />
        <meta httpEquiv="Expires" content="0" />
        <TikTokPixel />
        {/* Theme init — runs synchronously before paint to avoid flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var s=localStorage.getItem('admin-theme');if(s==='dark'){document.documentElement.classList.add('dark');}else if(s==='light'){document.documentElement.classList.remove('dark');}else if(window.matchMedia('(prefers-color-scheme: dark)').matches){document.documentElement.classList.add('dark');}}catch(e){}})();`,
          }}
        />
      </head>
      <body className="antialiased" suppressHydrationWarning>
        <div 
          data-theme-background
          className="relative min-h-screen w-full overflow-hidden text-white"
          style={{
            background: `linear-gradient(to bottom right, var(--theme-bg-from, #0b1224), var(--theme-bg-via, #1c2d52), var(--theme-bg-to, #b7791f))`,
            backgroundAttachment: 'scroll', // Safari/iOS: Use scroll instead of fixed for better performance
            backgroundSize: '200% 200%',
            contain: 'layout style paint', // Performance optimization
            isolation: 'isolate', // Create new stacking context
          }}
          suppressHydrationWarning
        >
          {/* Animated gradient overlay */}
          <AnimatedGradientOverlay />
          <Background />
          <div className="relative z-10" suppressHydrationWarning>
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
