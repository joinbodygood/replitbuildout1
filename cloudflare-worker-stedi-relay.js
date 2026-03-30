/**
 * Cloudflare Worker — Stedi API relay
 *
 * Relays requests from Replit (GCP IPs, blocked by Stedi's AWS WAF)
 * through Cloudflare's Anycast network, which is not blocked.
 *
 * ─── DEPLOY IN 3 STEPS ───────────────────────────────────────────────────────
 * 1. Go to https://workers.cloudflare.com → Sign up/login (free account)
 * 2. Create a new Worker → paste this entire file → Deploy
 * 3. Copy your worker URL (e.g. https://stedi-relay.YOUR-NAME.workers.dev)
 *    → Add to Replit Secrets as:  STEDI_RELAY_URL = https://stedi-relay.....workers.dev
 *
 * ─── SECURITY ────────────────────────────────────────────────────────────────
 * The worker forwards Authorization headers from your app, so your Stedi API
 * key travels encrypted via HTTPS the whole way. The worker itself holds no
 * secrets. Only your Replit app knows the STEDI_API_KEY.
 *
 * ─── COST ────────────────────────────────────────────────────────────────────
 * Cloudflare Workers free tier: 100,000 requests/day — more than enough.
 * ─────────────────────────────────────────────────────────────────────────────
 */

const STEDI_BASE = 'https://healthcare.us.stedi.com';

// Optional: lock down the worker to only accept requests from your Replit app
// Set ALLOWED_ORIGIN in Worker environment variables if you want this.
const ALLOWED_ORIGINS = [
  'https://97fabf48-e042-4961-b9ca-a0dfc3dfe2b6-00-33wvqrode1kdu.worf.replit.dev',
  'https://bodygoodstudio.replit.app',
  'https://bodygoodstudio.com',
];

export default {
  async fetch(request, env, ctx) {
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: corsHeaders(request),
      });
    }

    const origin = request.headers.get('Origin') || '';
    const isAllowed = ALLOWED_ORIGINS.length === 0
      || ALLOWED_ORIGINS.some(o => origin.startsWith(o))
      || origin === '';

    if (!isAllowed) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const url = new URL(request.url);
    const stediPath = url.pathname.replace(/^\/?relay/, '');
    const stediUrl = `${STEDI_BASE}${stediPath}${url.search}`;

    const forwardHeaders = new Headers();
    for (const [k, v] of request.headers) {
      const lower = k.toLowerCase();
      if (!['host', 'cf-connecting-ip', 'x-forwarded-for', 'x-real-ip'].includes(lower)) {
        forwardHeaders.set(k, v);
      }
    }
    forwardHeaders.set('Host', 'healthcare.us.stedi.com');

    const body = request.method !== 'GET' && request.method !== 'HEAD'
      ? await request.arrayBuffer()
      : undefined;

    const stediResponse = await fetch(stediUrl, {
      method: request.method,
      headers: forwardHeaders,
      body,
    });

    const responseBody = await stediResponse.arrayBuffer();
    const responseHeaders = new Headers(stediResponse.headers);
    Object.entries(corsHeaders(request)).forEach(([k, v]) => responseHeaders.set(k, v));

    return new Response(responseBody, {
      status: stediResponse.status,
      statusText: stediResponse.statusText,
      headers: responseHeaders,
    });
  },
};

function corsHeaders(request) {
  const origin = request.headers.get('Origin') || '*';
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, stedi-test',
    'Access-Control-Max-Age': '86400',
  };
}
