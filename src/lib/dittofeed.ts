/**
 * Dittofeed API client.
 *
 * Wraps the public Dittofeed REST API for identify/track events plus
 * read-only admin queries used by the /admin/marketing dashboard.
 *
 * Server-side only — never import from a client component. The Dittofeed
 * write key is a secret and the API host is internal.
 *
 * Env vars (set in .env / Replit secrets):
 *   DITTOFEED_API_BASE       e.g. https://dittofeed.bgs.dev
 *   DITTOFEED_WRITE_KEY      workspace write key (Settings → API in Dittofeed UI)
 *   DITTOFEED_WORKSPACE_ID   workspace UUID (single-tenant: from bootstrap log)
 *
 * If DITTOFEED_API_BASE is not set, all calls become no-ops so the rest
 * of the app keeps working in environments where comms infra isn't wired.
 */

const API_BASE = process.env.DITTOFEED_API_BASE;
const WRITE_KEY = process.env.DITTOFEED_WRITE_KEY;
const WORKSPACE_ID = process.env.DITTOFEED_WORKSPACE_ID;

const enabled = Boolean(API_BASE && WRITE_KEY && WORKSPACE_ID);

type Json = Record<string, unknown>;

export type IdentifyPayload = {
  /** Stable user/lead identifier. For leads without an account, use email. */
  userId: string;
  traits: {
    email?: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    leadSource?: "manychat" | "opensend" | "quiz" | "checkout" | "organic";
    programInterest?: string;
    [key: string]: unknown;
  };
  /** ISO timestamp; defaults to now. */
  timestamp?: string;
};

export type TrackPayload = {
  userId: string;
  event: string;
  properties?: Json;
  timestamp?: string;
};

async function post(path: string, body: Json) {
  if (!enabled) return { ok: false, skipped: true } as const;
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${WRITE_KEY}`,
      },
      body: JSON.stringify({ workspaceId: WORKSPACE_ID, ...body }),
      cache: "no-store",
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.error(`[dittofeed] ${path} ${res.status}: ${text.slice(0, 200)}`);
      return { ok: false, status: res.status } as const;
    }
    return { ok: true } as const;
  } catch (err) {
    console.error(`[dittofeed] ${path} threw:`, err);
    return { ok: false, error: err } as const;
  }
}

async function get(path: string): Promise<unknown> {
  if (!enabled) return null;
  try {
    const sep = path.includes("?") ? "&" : "?";
    const url = `${API_BASE}${path}${sep}workspaceId=${encodeURIComponent(WORKSPACE_ID!)}`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${WRITE_KEY}` },
      cache: "no-store",
    });
    if (!res.ok) {
      console.error(`[dittofeed] GET ${path} ${res.status}`);
      return null;
    }
    return res.json();
  } catch (err) {
    console.error(`[dittofeed] GET ${path} threw:`, err);
    return null;
  }
}

/**
 * Send an identify event. Use the first time you see a user, and any time
 * their traits change. Safe to call repeatedly — Dittofeed merges traits.
 */
export function identify(payload: IdentifyPayload) {
  return post("/api/public/apps/identify", {
    userId: payload.userId,
    traits: payload.traits,
    timestamp: payload.timestamp ?? new Date().toISOString(),
    messageId: crypto.randomUUID(),
  });
}

/**
 * Send a track event. The single workhorse for everything in
 * Section 4 of COMMS-INFRASTRUCTURE-BUILD-SPEC.md (event registry).
 */
export function track(payload: TrackPayload) {
  return post("/api/public/apps/track", {
    userId: payload.userId,
    event: payload.event,
    properties: payload.properties ?? {},
    timestamp: payload.timestamp ?? new Date().toISOString(),
    messageId: crypto.randomUUID(),
  });
}

// ─────────────────────────────────────────────────────────────────────────
// Read-only admin helpers (used by /admin/marketing dashboard pages)
// ─────────────────────────────────────────────────────────────────────────

export type Journey = {
  id: string;
  name: string;
  status: "NotStarted" | "Running" | "Paused";
  definition?: unknown;
};

export type Template = {
  id: string;
  name: string;
  type: "Email" | "Sms";
  definition?: unknown;
};

export type Segment = {
  id: string;
  name: string;
  definition?: unknown;
};

export async function listJourneys(): Promise<Journey[]> {
  const data = (await get("/api/journeys")) as { journeys?: Journey[] } | null;
  return data?.journeys ?? [];
}

export async function listTemplates(): Promise<Template[]> {
  const data = (await get("/api/content/templates")) as
    | { templates?: Template[] }
    | null;
  return data?.templates ?? [];
}

export async function listSegments(): Promise<Segment[]> {
  const data = (await get("/api/segments")) as { segments?: Segment[] } | null;
  return data?.segments ?? [];
}

/**
 * Recent messages for a single user. Used by suppression checks and
 * the lead pipeline detail view.
 */
export async function getUserMessages(
  userId: string,
  sinceIso?: string
): Promise<Array<{ event: string; channel: string; timestamp: string }>> {
  const since = sinceIso ?? new Date(Date.now() - 24 * 3600 * 1000).toISOString();
  const data = (await get(
    `/api/users/messages?userId=${encodeURIComponent(userId)}&start=${encodeURIComponent(since)}`
  )) as { messages?: Array<{ event: string; channel: string; timestamp: string }> } | null;
  return data?.messages ?? [];
}

export const dittofeed = {
  enabled,
  identify,
  track,
  listJourneys,
  listTemplates,
  listSegments,
  getUserMessages,
};
