const URL_ENV = "SLACK_DATA_PIPELINE_WEBHOOK";

export async function sendSlackAlert(text: string): Promise<void> {
  const url = process.env[URL_ENV];
  if (!url) return;
  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
  } catch {
    // Silent — never let Slack outage cascade into worker failure
  }
}
