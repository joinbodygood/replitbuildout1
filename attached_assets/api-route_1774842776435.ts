// app/api/pharmacy-search/route.ts
import { NextRequest, NextResponse } from "next/server";

export interface PharmacyResult {
  npi: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  fax: string;
}

function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  if (digits.length === 11 && digits.startsWith("1")) {
    return `(${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
  }
  return raw;
}

function parsePharmacy(result: Record<string, any>): PharmacyResult | null {
  const name = result.basic?.organization_name;
  if (!name) return null;

  const locationAddress = (result.addresses ?? []).find(
    (a: Record<string, any>) => a.address_purpose === "LOCATION"
  );

  if (!locationAddress) return null;

  return {
    npi: String(result.number ?? ""),
    name: name.trim(),
    address: (locationAddress.address_1 ?? "").trim(),
    city: (locationAddress.city ?? "").trim(),
    state: (locationAddress.state ?? "").trim(),
    zip: (locationAddress.postal_code ?? "").slice(0, 5),
    phone: formatPhone(locationAddress.telephone_number ?? ""),
    fax: formatPhone(locationAddress.fax_number ?? ""),
  };
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const zip = searchParams.get("zip");
  const name = searchParams.get("name")?.trim() || "";

  if (!zip || !/^\d{5}$/.test(zip)) {
    return NextResponse.json(
      { error: "A valid 5-digit zip code is required." },
      { status: 400 }
    );
  }

  try {
    const url = new URL("https://npiregistry.cms.hhs.gov/api/");
    url.searchParams.set("version", "2.1");
    url.searchParams.set("taxonomy_description", "pharmacy");
    url.searchParams.set("postal_code", zip);
    url.searchParams.set("limit", "20");

    // Wildcard suffix so partial names match (e.g. "walgreens" finds "WALGREEN CO")
    if (name) {
      url.searchParams.set("organization_name", `${name}*`);
    }

    const response = await fetch(url.toString(), {
      headers: { Accept: "application/json" },
      next: { revalidate: 3600 }, // cache for 1 hour
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Pharmacy registry is temporarily unavailable. Please try again." },
        { status: 502 }
      );
    }

    const data = await response.json();
    const rawResults: Record<string, any>[] = data.results ?? [];

    const pharmacies: PharmacyResult[] = rawResults
      .map(parsePharmacy)
      .filter((p): p is PharmacyResult => p !== null);

    return NextResponse.json({ pharmacies });
  } catch {
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}
