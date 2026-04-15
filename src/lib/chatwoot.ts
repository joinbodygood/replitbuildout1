/**
 * Server-to-server Chatwoot API client for storefront CRM sync.
 * Powers PayPal + quiz-lead event hooks. Does NOT power the admin helpdesk UI
 * (that lives in bg-helpdesk-v2 at support.joinbodygood.com).
 */

const BASE_URL = process.env.CHATWOOT_API_URL ?? "https://chatwoot.bgs.dev";
const API_TOKEN = process.env.CHATWOOT_API_TOKEN ?? "";
const ACCOUNT_ID = process.env.CHATWOOT_ACCOUNT_ID ?? "1";
const API = `${BASE_URL}/api/v1/accounts/${ACCOUNT_ID}`;

export interface UpsertContactParams {
  email: string;
  name?: string;
  phone?: string;
  attributes?: Record<string, string>;
}

export async function upsertContact(params: UpsertContactParams): Promise<number | null> {
  if (!API_TOKEN) return null;

  try {
    // Search for existing contact by email
    const searchRes = await fetch(`${API}/contacts/search?q=${encodeURIComponent(params.email)}`, {
      headers: { api_access_token: API_TOKEN },
      cache: "no-store",
    });

    if (searchRes.ok) {
      const data = await searchRes.json();
      const existing = data.payload?.find((c: { email?: string }) => c.email === params.email);
      if (existing) return existing.id as number;
    }

    // Create new contact
    const createRes = await fetch(`${API}/contacts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        api_access_token: API_TOKEN,
      },
      body: JSON.stringify({
        email: params.email,
        name: params.name,
        phone_number: params.phone,
        custom_attributes: params.attributes,
      }),
    });

    if (!createRes.ok) return null;
    const created = await createRes.json();
    return (created.id ?? created.payload?.contact?.id) as number | null;
  } catch (e) {
    console.warn("upsertContact failed:", e);
    return null;
  }
}

export interface OpenConversationParams {
  contactId: number;
  message: string;
  label?: string;
}

export async function openConversation(params: OpenConversationParams): Promise<void> {
  if (!API_TOKEN) return;

  try {
    // Get available inboxes
    const inboxRes = await fetch(`${API}/inboxes`, {
      headers: { api_access_token: API_TOKEN },
      cache: "no-store",
    });

    if (!inboxRes.ok) return;
    const { payload: inboxes } = await inboxRes.json();
    const inbox = inboxes?.find((i: { channel_type: string }) =>
      i.channel_type === "Channel::WebWidget" || i.channel_type === "Channel::Api"
    );
    if (!inbox) return;

    const convRes = await fetch(`${API}/conversations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        api_access_token: API_TOKEN,
      },
      body: JSON.stringify({
        contact_id: params.contactId,
        inbox_id: inbox.id,
        message: { content: params.message },
        labels: params.label ? [params.label] : [],
      }),
    });

    if (!convRes.ok) {
      console.warn("openConversation failed:", await convRes.text());
    }
  } catch (e) {
    console.warn("openConversation failed:", e);
  }
}

export async function getOpenConversationCount(): Promise<number> {
  if (!API_TOKEN) return 0;

  try {
    const res = await fetch(`${API}/conversations?status=open`, {
      headers: { api_access_token: API_TOKEN },
      cache: "no-store",
    });
    if (!res.ok) return 0;
    const data = await res.json();
    return data.data?.meta?.all_count ?? 0;
  } catch {
    return 0;
  }
}
