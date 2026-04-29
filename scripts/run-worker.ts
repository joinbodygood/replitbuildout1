import { db } from "../src/lib/db";

async function main() {
  const name = process.argv[2];
  if (!name) { console.error("Usage: tsx scripts/run-worker.ts <worker_name>"); process.exit(1); }

  const modules: Record<string, string> = {
    "aca-qhp-bulk": "../src/lib/workers/aca-qhp-bulk",
    "medicare-part-d": "../src/lib/workers/medicare-part-d",
    "medicaid-state": "../src/lib/workers/medicaid-state",
    "pbm-baseline": "../src/lib/workers/pbm-baseline",
    "federal-military-sync": "../src/lib/workers/federal-military-sync",
    "carrier-floridablue": "../src/lib/workers/carrier-scrapers/floridablue",
    "carrier-aetna": "../src/lib/workers/carrier-scrapers/aetna",
    "carrier-uhc": "../src/lib/workers/carrier-scrapers/uhc",
    "carrier-cigna": "../src/lib/workers/carrier-scrapers/cigna",
    "carrier-humana": "../src/lib/workers/carrier-scrapers/humana",
  };

  const path = modules[name];
  if (!path) { console.error(`Unknown worker: ${name}`); process.exit(1); }

  const mod = (await import(path)) as { run: () => Promise<unknown> };
  await mod.run();
}

main().finally(() => db.$disconnect());
