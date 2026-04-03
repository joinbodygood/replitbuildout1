import type { PAEvent } from "./types";

export async function fireEvent(event: PAEvent): Promise<void> {
  const url = process.env.PA_STATUS_WEBHOOK_URL;
  if (!url) return;

  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(event),
      signal: AbortSignal.timeout(5000),
    });
  } catch {
    console.warn(`[pa-webhook] Failed to fire ${event.type} for case ${event.caseId}`);
  }
}

export function buildEvent(
  type: string,
  caseId: string,
  patientEmail: string,
  patientName: string,
  data: Record<string, unknown>
): PAEvent {
  return {
    type,
    caseId,
    patientEmail,
    patientName,
    data,
    timestamp: new Date().toISOString(),
  };
}
