import { query } from "@/lib/database/client";
import { cookies } from "next/headers";
import { getCache, setCache, trackAdminSession } from "@/lib/database/redis";

interface SessionUser {
  id: string;
  username: string;
  name: string;
}

export async function getSession() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("admin_session")?.value;

  if (!sessionToken) {
    return null;
  }

  // 1. Try to fetch session from Redis cache
  const cachedUser = await getCache<SessionUser>(`session:${sessionToken}`);
  if (cachedUser) {
    return {
      user: cachedUser,
    };
  }

  // 2. Cache miss: Query consolidated data from PostgreSQL in one request
  const adminResult = await query<{
    admin_id: string;
    username: string;
    name: string;
    session_expires_at: string;
  }>(
    `SELECT a.id as admin_id, a.username, a.name, s.session_expires_at
     FROM admin_sessions s
     INNER JOIN admins a ON s.admin_id = a.id
     WHERE s.session_token = $1 AND s.session_expires_at > NOW()`,
    [sessionToken]
  );

  if (!adminResult.rows || adminResult.rows.length === 0) {
    return null;
  }

  const admin = adminResult.rows[0];

  // Ensure admin data exists
  if (!admin || !admin.admin_id) {
    return null;
  }

  const user: SessionUser = {
    id: admin.admin_id,
    username: admin.username,
    name: admin.name,
  };

  // 3. Cache the session in Redis with matching TTL
  try {
    const expiresAt = new Date(admin.session_expires_at).getTime();
    const ttlSeconds = Math.max(0, Math.floor((expiresAt - Date.now()) / 1000));
    
    if (ttlSeconds > 0) {
      await setCache(`session:${sessionToken}`, user, ttlSeconds);
      await trackAdminSession(user.id, sessionToken, ttlSeconds);
    }
  } catch (error) {
    console.warn("⚠️ Failed to cache admin session in Redis:", error);
  }

  return {
    user,
  };
}

