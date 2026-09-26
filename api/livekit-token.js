import { AccessToken } from "livekit-server-sdk";
import { createClient } from "@supabase/supabase-js";

function send(res, status, body) {
  return res.status(status).json(body);
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    return send(res, 405, { error: "Method not allowed" });
  }

  try {
    const authHeader = req.headers.authorization || "";
    const accessToken = authHeader.startsWith("Bearer ")
      ? authHeader.slice(7).trim()
      : "";

    if (!accessToken) {
      return send(res, 401, {
        error: "Missing StudentX login token"
      });
    }

    const {
      LIVEKIT_API_KEY,
      LIVEKIT_API_SECRET,
      LIVEKIT_URL,
      SUPABASE_URL,
      SUPABASE_PUBLISHABLE_KEY
    } = process.env;

    if (
      !LIVEKIT_API_KEY ||
      !LIVEKIT_API_SECRET ||
      !LIVEKIT_URL ||
      !SUPABASE_URL ||
      !SUPABASE_PUBLISHABLE_KEY
    ) {
      return send(res, 500, {
        error: "LiveKit server environment is not configured"
      });
    }

    const supabase = createClient(
      SUPABASE_URL,
      SUPABASE_PUBLISHABLE_KEY,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false
        }
      }
    );

    const { data: userData, error: userError } =
      await supabase.auth.getUser(accessToken);

    if (userError || !userData?.user) {
      return send(res, 401, {
        error: "StudentX login session is invalid or expired"
      });
    }

    const body = req.body || {};
    const liveSessionId = String(body.liveSessionId || "").trim();
    const role =
      body.role === "broadcaster"
        ? "broadcaster"
        : "viewer";

    if (!liveSessionId) {
      return send(res, 400, {
        error: "liveSessionId is required"
      });
    }

    const { data: liveSession, error: liveError } =
      await supabase
        .from("live_sessions")
        .select("id,status,broadcaster_id,user_id")
        .eq("id", liveSessionId)
        .maybeSingle();

    if (liveError) {
      return send(res, 500, {
        error: liveError.message
      });
    }

    if (!liveSession) {
      return send(res, 404, {
        error: "Live session not found"
      });
    }

    if (liveSession.status !== "live") {
      return send(res, 410, {
        error: "This live session has ended"
      });
    }

    const userId = userData.user.id;

    const broadcasterId =
      liveSession.broadcaster_id ||
      liveSession.user_id;

    if (
      role === "broadcaster" &&
      broadcasterId !== userId
    ) {
      return send(res, 403, {
        error:
          "You are not the broadcaster of this live session"
      });
    }

    const roomName =
      `studentx-live-${liveSessionId}`;

    const token = new AccessToken(
      LIVEKIT_API_KEY,
      LIVEKIT_API_SECRET,
      {
        identity: userId,
        ttl: "1h"
      }
    );

    token.addGrant({
      roomJoin: true,
      room: roomName,
      canPublish: role === "broadcaster",
      canSubscribe: true,
      canPublishData: true
    });

    const participantToken =
      await token.toJwt();

    return send(res, 200, {
      serverUrl: LIVEKIT_URL,
      participantToken,
      roomName,
      role,
      liveSessionId
    });

  } catch (error) {
    console.error(
      "StudentX LiveKit token error:",
      error
    );

    return send(res, 500, {
      error:
        error?.message ||
        "Unable to create LiveKit token"
    });
  }
}
