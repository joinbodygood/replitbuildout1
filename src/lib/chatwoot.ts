/**
 * Chatwoot API client — server-side only (uses CHATWOOT_API_TOKEN)
 */

const BASE_URL    = process.env.NEXT_PUBLIC_CHATWOOT_URL ?? "https://app.chatwoot.com";
const API_TOKEN   = process.env.CHATWOOT_API_TOKEN ?? "";
const ACCOUNT_ID  = process.env.CHATWOOT_ACCOUNT_ID ?? "1";
const INBOX_ID    = parseInt(process.env.CHATWOOT_INBOX_ID ?? "1", 10);

const apiHeaders = {
  "api_access_token": API_TOKEN,
  "Content-Type": "application/json",
};

function isConfigured() {
  return Boolean(API_TOKEN && BASE_URL);
}

// ─── Find or create a contact ─────────────────────────────────────────────────
export async function upsertContact(params: {
  email: string;
  name?: string | null;
  phone?: string | null;
  attributes?: Record<string, string>;
}): Promise<number | null> {
  if (!isConfigured()) return null;
  try {
    // Search by email first
    const searchRes = await fetch(
      `${BASE_URL}/api/v1/accounts/${ACCOUNT_ID}/contacts/search?q=${encodeURIComponent(params.email)}&include_contacts=true`,
      { headers: apiHeaders }
    );
    const searchData = await searchRes.json();
    const existing = searchData.payload?.find(
      (c: { email: string; id: number }) => c.email === params.email
    );

    if (existing) {
      // Patch with any new info
      await fetch(`${BASE_URL}/api/v1/accounts/${ACCOUNT_ID}/contacts/${existing.id}`, {
        method: "PATCH",
        headers: apiHeaders,
        body: JSON.stringify({
          name: params.name || existing.name,
          phone_number: params.phone || existing.phone_number,
          additional_attributes: params.attributes ?? {},
        }),
      });
      return existing.id as number;
    }

    // Create new contact
    const res = await fetch(`${BASE_URL}/api/v1/accounts/${ACCOUNT_ID}/contacts`, {
      method: "POST",
      headers: apiHeaders,
      body: JSON.stringify({
        email: params.email,
        name: params.name || params.email,
        phone_number: params.phone ?? undefined,
        additional_attributes: params.attributes ?? {},
      }),
    });
    const data = await res.json();
    return (data.id as number) ?? null;
  } catch (err) {
    console.error("[Chatwoot] upsertContact error:", err);
    return null;
  }
}

// ─── Open a conversation and post a first outgoing message ───────────────────
export async function openConversation(params: {
  contactId: number;
  message: string;
  label?: string;
}): Promise<number | null> {
  if (!isConfigured()) return null;
  try {
    const convRes = await fetch(
      `${BASE_URL}/api/v1/accounts/${ACCOUNT_ID}/conversations`,
      {
        method: "POST",
        headers: apiHeaders,
        body: JSON.stringify({
          inbox_id: INBOX_ID,
          contact_id: params.contactId,
          additional_attributes: {},
          ...(params.label ? { labels: [params.label] } : {}),
        }),
      }
    );
    const conv = await convRes.json();
    const convId = conv.id as number | undefined;
    if (!convId) return null;

    // Send the outgoing welcome message
    await fetch(
      `${BASE_URL}/api/v1/accounts/${ACCOUNT_ID}/conversations/${convId}/messages`,
      {
        method: "POST",
        headers: apiHeaders,
        body: JSON.stringify({
          content: params.message,
          message_type: "outgoing",
          private: false,
        }),
      }
    );

    return convId;
  } catch (err) {
    console.error("[Chatwoot] openConversation error:", err);
    return null;
  }
}

// ─── Get open conversation count (for sidebar badge) ─────────────────────────
export async function getOpenConversationCount(): Promise<number> {
  if (!isConfigured()) return 0;
  try {
    const res = await fetch(
      `${BASE_URL}/api/v1/accounts/${ACCOUNT_ID}/conversations?status=open&page=1`,
      { headers: apiHeaders, next: { revalidate: 60 } }
    );
    if (!res.ok) return 0;
    const data = await res.json();
    return (data.data?.meta?.all_count as number) ?? 0;
  } catch (err) {
    console.error("[Chatwoot] getOpenConversationCount error:", err);
    return 0;
  }
}
