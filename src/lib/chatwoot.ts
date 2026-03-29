/**
 * Chatwoot API client — server-side only (uses CHATWOOT_API_TOKEN)
 * Base URL comes from NEXT_PUBLIC_CHATWOOT_BASE_URL (self-hosted instance)
 */

const BASE_URL    = process.env.NEXT_PUBLIC_CHATWOOT_BASE_URL ?? "https://support.joinbodygood.com";
const API_TOKEN   = process.env.CHATWOOT_API_TOKEN ?? "";
const ACCOUNT_ID  = process.env.CHATWOOT_ACCOUNT_ID ?? "1";

const API = `${BASE_URL}/api/v1/accounts/${ACCOUNT_ID}`;

function headers() {
  return {
    "Content-Type": "application/json",
    "api_access_token": API_TOKEN,
  };
}

// ── Types ────────────────────────────────────────────────────────────────────

interface UpsertContactParams {
  email: string;
  name?: string;
  phone?: string;
  attributes?: Record<string, string>;
}

interface OpenConversationParams {
  contactId: number;
  message: string;
  label?: string;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Create or update a contact by email. Returns the contact ID, or null on failure.
 */
export async function upsertContact(params: UpsertContactParams): Promise<number | null> {
  if (!API_TOKEN) return null;
  try {
    // Search for existing contact
    const searchRes = await fetch(
      `${API}/contacts/search?q=${encodeURIComponent(params.email)}&include_contacts=true`,
      { headers: headers() }
    );
    if (searchRes.ok) {
      const data = await searchRes.json() as { payload: { id: number; email: string }[] };
      const existing = data.payload?.find((c) => c.email === params.email);
      if (existing) {
        // Update the existing contact
        await fetch(`${API}/contacts/${existing.id}`, {
          method: "PATCH",
          headers: headers(),
          body: JSON.stringify({
            name: params.name,
            phone_number: params.phone,
            additional_attributes: params.attributes,
          }),
        });
        return existing.id;
      }
    }

    // Create new contact
    const createRes = await fetch(`${API}/contacts`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify({
        email: params.email,
        name: params.name,
        phone_number: params.phone,
        additional_attributes: params.attributes,
      }),
    });
    if (!createRes.ok) return null;
    const created = await createRes.json() as { id: number };
    return created.id ?? null;
  } catch (err) {
    console.error("[Chatwoot] upsertContact error:", err);
    return null;
  }
}

/**
 * Open a new outbound conversation with a contact and send an initial message.
 */
export async function openConversation(params: OpenConversationParams): Promise<void> {
  if (!API_TOKEN) return;
  try {
    // Get inboxes and pick the first website or API inbox
    const inboxRes = await fetch(`${API}/inboxes`, { headers: headers() });
    if (!inboxRes.ok) return;
    const inboxData = await inboxRes.json() as { payload: { id: number; channel_type: string }[] };
    const inbox = inboxData.payload?.find(
      (i) => i.channel_type === "Channel::WebWidget" || i.channel_type === "Channel::Api"
    );
    if (!inbox) return;

    // Create conversation
    const convRes = await fetch(`${API}/conversations`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify({
        contact_id: params.contactId,
        inbox_id: inbox.id,
        labels: params.label ? [params.label] : [],
      }),
    });
    if (!convRes.ok) return;
    const conv = await convRes.json() as { id: number };
    if (!conv.id) return;

    // Send initial message
    await fetch(`${API}/conversations/${conv.id}/messages`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify({
        content: params.message,
        message_type: "outgoing",
        private: false,
      }),
    });
  } catch (err) {
    console.error("[Chatwoot] openConversation error:", err);
  }
}

/**
 * Get count of open conversations for the admin badge.
 */
export async function getOpenConversationCount(): Promise<number> {
  if (!API_TOKEN) return 0;
  try {
    const res = await fetch(`${API}/conversations?status=open&page=1`, {
      headers: headers(),
    });
    if (!res.ok) return 0;
    const data = await res.json() as { data?: { meta?: { all_count?: number } } };
    return data.data?.meta?.all_count ?? 0;
  } catch (err) {
    console.error("[Chatwoot] getOpenConversationCount error:", err);
    return 0;
  }
}
