import { query } from "@/lib/database/client";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { delCache, untrackAdminSession, getCache } from "@/lib/database/redis";

export async function POST() {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("admin_session")?.value;

    // Invalidate session in database and Redis
    if (sessionToken) {
      try {
        const cached = await getCache<{ id: string }>(`session:${sessionToken}`);
        await query("SELECT logout_admin($1)", [sessionToken]);
        await delCache(`session:${sessionToken}`);
        if (cached?.id) {
          await untrackAdminSession(cached.id, sessionToken);
        }
      } catch (redisError) {
        console.warn("⚠️ Failed to invalidate logout session in Redis:", redisError);
        // Fallback: make sure DB logout still runs
        await query("SELECT logout_admin($1)", [sessionToken]);
      }
    }

    // Create response
    const response = NextResponse.json(
      { message: "Logged out successfully" },
      { 
        status: 200,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      }
    );

    // Delete cookie with explicit expiration and all possible paths
    const cookieOptions = {
      expires: new Date(0),
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" as const,
      path: "/",
    };

    // Delete cookie with multiple attempts to ensure it's cleared
    response.cookies.set("admin_session", "", cookieOptions);
    response.cookies.delete("admin_session");

    return response;
  } catch {
    // Even on error, try to delete the cookie
    const response = NextResponse.json(
      { error: "هەڵەیەکی نادیار ڕوویدا" },
      { status: 500 }
    );

    const cookieOptions = {
      expires: new Date(0),
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" as const,
      path: "/",
    };

    response.cookies.set("admin_session", "", cookieOptions);
    response.cookies.delete("admin_session");

    return response;
  }
}

