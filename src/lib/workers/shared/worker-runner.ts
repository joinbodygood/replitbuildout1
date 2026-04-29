import { db } from "@/lib/db";
import { sendSlackAlert } from "./slack-alert";

export async function runWorker(name: string, fn: () => Promise<{ rowsWritten: number }>) {
  const run = await db.workerRun.create({ data: { workerName: name, status: "running" } });
  try {
    const { rowsWritten } = await fn();
    await db.workerRun.update({
      where: { id: run.id },
      data: { status: "success", finishedAt: new Date(), rowsWritten },
    });
    return { ok: true as const, rowsWritten };
  } catch (e) {
    const msg = (e as Error).message;
    await db.workerRun.update({
      where: { id: run.id },
      data: { status: "error", finishedAt: new Date(), errorMessage: msg },
    });
    await sendSlackAlert(`🚨 Worker *${name}* failed: ${msg}`);
    throw e;
  }
}
