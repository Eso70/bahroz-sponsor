import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "چوونەژوورەوە - Bahroz",
  description: "چوونەژوورەوە بۆ بەڕێوەبردنی Bahroz",
  robots: "noindex, nofollow",
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
