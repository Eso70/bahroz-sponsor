"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
import "./login-compat.css";

const validateUsername = (username: string): string | null => {
  if (!username || username.trim().length < 3) {
    return "ناوی بەکارهێنەر پێویستە لانیکەم ٣ پیت بێت";
  }
  return null;
};

const validatePassword = (password: string): string | null => {
  if (!password || password.length < 6) {
    return "تێپەڕەوشە پێویستە لانیکەم ٦ پیت بێت";
  }
  return null;
};

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setUsernameError(null);
    setPasswordError(null);

    const usernameErr = validateUsername(username);
    const passwordErr = validatePassword(password);

    if (usernameErr || passwordErr) {
      setUsernameError(usernameErr);
      setPasswordError(passwordErr);
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        cache: "no-store",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), password, rememberMe: true }),
        credentials: "include",
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || "ناوی بەکارهێنەر یان تێپەڕەوشە هەڵەیە");
        setIsLoading(false);
        return;
      }

      window.location.href = "/admin";
    } catch (err) {
      console.error("Login error:", err);
      setError("هەڵەیەکی نادیار ڕوویدا");
      setIsLoading(false);
    }
  }, [username, password]);

  const handleGoHome = useCallback(() => {
    router.push("/");
  }, [router]);

  // Cross-platform viewport height fix
  useEffect(() => {
    const setViewportHeight = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty("--vh", `${vh}px`);
    };
    setViewportHeight();
    window.addEventListener("resize", setViewportHeight);
    window.addEventListener("orientationchange", setViewportHeight);
    setTimeout(setViewportHeight, 100);
    return () => {
      window.removeEventListener("resize", setViewportHeight);
      window.removeEventListener("orientationchange", setViewportHeight);
    };
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLFormElement>) => {
    if (e.key === "Enter" && (usernameError || passwordError)) e.preventDefault();
  }, [usernameError, passwordError]);

  return (
    <div className="min-h-screen flex flex-col lg:flex-row relative bg-white dark:bg-[#090a0f] transition-colors duration-300">

      {/* ── Full-page diagonal grid pattern overlay ────────────────── */}
      <div
        className="fixed inset-0 pointer-events-none z-0 opacity-[0.10] dark:opacity-[0.10]"
        style={{
          backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 28px, rgba(150,150,150,0.7) 28px, rgba(150,150,150,0.7) 29px), repeating-linear-gradient(-45deg, transparent, transparent 28px, rgba(150,150,150,0.7) 28px, rgba(150,150,150,0.7) 29px)",
        }}
      />
      {/* ── Purple-blue radial glow (bottom-right) ────────── */}
      <div
        className="fixed bottom-0 right-0 w-[600px] h-[600px] pointer-events-none z-0 opacity-[0.20] dark:opacity-[0.14]"
        style={{ background: "radial-gradient(circle at bottom right, rgba(120,80,220,0.85), rgba(60,100,255,0.45) 40%, transparent 70%)" }}
      />

      {/* ── Back button ─────────────────────────────────── */}
      <button
        onClick={handleGoHome}
        className="fixed top-4 left-4 lg:top-6 lg:left-6 z-50 group flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-300
          text-slate-500 dark:text-gray-400
          hover:text-slate-700 dark:hover:text-gray-200
          hover:bg-slate-50/80 dark:hover:bg-white/8"
        aria-label="Go to home page"
        title="گەڕانەوە بۆ پەڕەی سەرەکی"
      >
        <ArrowLeft className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
        <span className="text-sm font-medium">گەڕانەوە</span>
      </button>

      {/* ── Left panel — Login form ─────────────────────── */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 xl:px-12 py-8 lg:py-12 relative overflow-hidden">

        {/* Radial glow */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[560px] h-[560px] rounded-full opacity-[0.12] dark:opacity-[0.07] pointer-events-none transition-opacity duration-300"
          style={{ background: "radial-gradient(circle, rgba(126,0,1,0.7), transparent 65%)" }}
        />
        {/* Corner accents */}
        <div className="absolute -top-20 -left-20 w-80 h-80 rounded-full opacity-[0.06] dark:opacity-[0.04] pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(126,0,1,0.6), transparent 60%)" }} />
        <div className="absolute -bottom-16 -right-16 w-64 h-64 rounded-full opacity-[0.05] dark:opacity-[0.03] pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(126,0,1,0.5), transparent 60%)" }} />

        <div className="w-full max-w-md relative z-10">

          {/* ── Mobile logo ──────────────────────────────── */}
          <div className="flex lg:hidden flex-col items-center gap-4 mb-8">
            <div className="relative h-20 w-20">
              <div className="relative h-full w-full overflow-hidden rounded-full shadow-sm border border-slate-100 dark:border-white/10 bg-white dark:bg-[#14161f]">
                <Image
                  src="/images/Logo.jpg"
                  alt="Bahroz Logo"
                  width={80}
                  height={80}
                  className="h-full w-full object-cover"
                  priority
                  sizes="80px"
                  quality={85}
                />
              </div>
            </div>
            <div className="text-center">
              <h1 className="text-2xl font-bold text-slate-800 dark:text-gray-100 mb-2">
                چوونەژوورەوە
              </h1>
              <div className="mx-auto w-10 h-0.5 rounded-full mb-2" style={{ backgroundColor: "#7E0001" }} />
              <p className="text-sm text-slate-400 dark:text-gray-500">
                بەخێربێیت بۆ Bahroz
              </p>
            </div>
          </div>

          {/* ── Desktop title ─────────────────────────────── */}
          <div className="hidden lg:block mb-10 text-center">
            <div className="inline-flex flex-col items-center gap-3">
              <h1 className="text-3xl font-bold text-slate-800 dark:text-gray-100 tracking-tight">
                چوونەژوورەوە
              </h1>
              <div className="w-12 h-0.75 rounded-full" style={{ backgroundColor: "#7E0001" }} />
              <p className="text-sm text-slate-400 dark:text-gray-500 tracking-wide">
                بەخێربێیت بۆ Bahroz
              </p>
            </div>
          </div>

          {/* ── Form ─────────────────────────────────── */}
          <form
            onSubmit={handleSubmit}
            onKeyDown={handleKeyDown}
            className="w-full flex flex-col gap-5"
            noValidate
            autoComplete="on"
          >
              {/* Error message */}
              {(error || usernameError || passwordError) && (
                <div className="w-full rounded-xl px-4 py-3 text-sm text-center
                  border border-[#7E0001]/30 dark:border-[#7E0001]/25
                  bg-[#7E0001]/10 dark:bg-[#7E0001]/10
                  text-[#7E0001] dark:text-[#7E0001]">
                  {error || usernameError || passwordError}
                </div>
              )}

              {/* Username field */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-slate-600 dark:text-gray-300 text-right">
                  ناوی بەکارهێنەر
                </label>
                <input
                  type="text"
                  autoComplete="username"
                  autoFocus
                  placeholder="ناوی بەکارهێنەرەکەت بنووسە"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    if (usernameError) setUsernameError(null);
                  }}
                  disabled={isLoading}
                  className="
                    w-full rounded-xl px-4 py-3 text-base text-right
                    border transition-all duration-200
                    focus:outline-none focus:ring-2 focus:ring-[#7E0001]/25
                    disabled:opacity-50 disabled:cursor-not-allowed
                    bg-slate-50 dark:bg-[#0d0e13]
                    border-slate-200 dark:border-white/10
                    text-slate-700 dark:text-gray-200
                    placeholder:text-slate-400 dark:placeholder:text-gray-600
                    hover:border-slate-300 dark:hover:border-white/20
                    focus:border-[#7E0001] dark:focus:border-[#7E0001]
                  "
                  style={{ minHeight: "48px", fontSize: "16px" }}
                />
              </div>

              {/* Password field */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-slate-600 dark:text-gray-300 text-right">
                  تێپەڕەوشە
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="تێپەڕەوشە بنووسە"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (passwordError) setPasswordError(null);
                    }}
                    disabled={isLoading}
                    className="
                      w-full rounded-xl pr-4 pl-12 py-3 text-base text-right
                      border transition-all duration-200
                      focus:outline-none focus:ring-2 focus:ring-[#7E0001]/25
                      disabled:opacity-50 disabled:cursor-not-allowed
                      bg-slate-50 dark:bg-[#0d0e13]
                      border-slate-200 dark:border-white/10
                      text-slate-700 dark:text-gray-200
                      placeholder:text-slate-400 dark:placeholder:text-gray-600
                      hover:border-slate-300 dark:hover:border-white/20
                      focus:border-[#7E0001] dark:focus:border-[#7E0001]
                    "
                    style={{ minHeight: "48px", fontSize: "16px" }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                    className="absolute left-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-colors
                      text-slate-400 dark:text-gray-500
                      hover:text-slate-600 dark:hover:text-gray-300
                      hover:bg-slate-100 dark:hover:bg-white/8
                      disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-xl px-4 py-3 text-base font-medium text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md hover:scale-[1.01] active:scale-100"
                style={{ minHeight: "48px", backgroundColor: "#7E0001" }}
              >
                {isLoading ? "چاوەڕوان بە..." : "چوونەژوورەوە"}
              </button>
          </form>
        </div>
      </div>

      {/* ── Vertical divider ────────────────────────────── */}
      <div
        className="hidden lg:block absolute left-1/2 top-[12%] h-[76%] w-px -translate-x-px pointer-events-none z-10"
        style={{
          background: "linear-gradient(to bottom, transparent, rgba(126,0,1,0.4), rgba(126,0,1,0.55), rgba(126,0,1,0.4), transparent)",
        }}
      />

      {/* ── Right panel (desktop only) ────────────────────── */}
      <div
        className="hidden lg:flex lg:w-1/2 items-center justify-center px-8 xl:px-16 py-12 relative overflow-hidden"
        style={{
          background: "linear-gradient(to bottom right, rgba(126,0,1,0.95), rgba(126,0,1,0.85), rgba(126,0,1,0.95))",
        }}
      >
        {/* Decorative blobs */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-md text-center space-y-1 z-10">
          <div className="space-y-4">
            <div className="flex justify-center">
              <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 shadow-lg">
                <Image
                  src="/images/Logo.jpg"
                  alt="Bahroz Logo"
                  width={112}
                  height={112}
                  className="rounded-full"
                  priority
                  quality={85}
                />
              </div>
            </div>
            <h2 className="text-4xl xl:text-5xl font-bold text-white tracking-tight leading-tight drop-shadow-sm">
              بەخێربێیت
            </h2>
            <p className="text-lg xl:text-xl text-white/90 leading-tight">
              پەیجەکانت بەڕێوە ببەو داتاکان ببینە.
            </p>
          </div>
          <div className="pt-4 border-t border-white/20">
            <p className="text-base text-white/80 leading-tight">
              بەکارهێنانی ئاسان و خێرا بۆ بەڕێوەبردنی پەیجەکانت
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
