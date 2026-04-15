/**
 * Chatwoot stubs — helpdesk has been migrated to bg-helpdesk-v2.
 * These no-op stubs keep existing call-sites compiling until those routes
 * are updated to use the new helpdesk service API.
 */

export async function upsertContact(_params: {
  email: string;
  name?: string;
  phone?: string;
  attributes?: Record<string, string>;
}): Promise<number | null> {
  return null;
}

export async function openConversation(_params: {
  contactId: number;
  message: string;
  label?: string;
}): Promise<void> {}

export async function getOpenConversationCount(): Promise<number> {
  return 0;
}
