import { setRequestLocale } from "next-intl/server";
import { db } from "@/lib/db";
import { Container } from "@/components/ui/Container";
import Link from "next/link";
import { AdminProductsTable } from "@/components/admin/AdminProductsTable";

type Props = { params: Promise<{ locale: string }> };

const CATEGORY_LABELS: Record<string, string> = {
  compounded: "Compounded GLP-1",
  oral: "Oral / GlowRx",
  branded_rx: "Branded Rx",
  branded_mgmt: "Branded Mgmt",
  insurance: "Insurance",
  wellness: "Wellness Injections",
  hair: "Hair Loss",
  skincare: "Skincare",
  feminine_health: "Feminine Health",
  mental_wellness: "Mental Wellness",
  services: "Services",
};

const FULFILLMENT_LABELS: Record<string, { label: string; color: string }> = {
  direct_ship: { label: "Direct Ship", color: "bg-green-100 text-green-800" },
  pharmacy_rx: { label: "Pharmacy Rx", color: "bg-blue-100 text-blue-800" },
  dual_path: { label: "Dual Path", color: "bg-purple-100 text-purple-800" },
};

export default async function AdminProductsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const products = await db.product.findMany({
    include: {
      translations: { where: { locale: "en" } },
      variants: { orderBy: { sortOrder: "asc" } },
      _count: { select: { variants: true } },
    },
    orderBy: [{ category: "asc" }, { sortOrder: "asc" }],
  });

  const categoryCounts = products.reduce<Record<string, number>>((acc, p) => {
    acc[p.category] = (acc[p.category] ?? 0) + 1;
    return acc;
  }, {});

  const totalActive = products.filter((p) => p.isActive).length;
  const totalInactive = products.filter((p) => !p.isActive).length;

  const serializable = products.map((p) => ({
    id: p.id,
    slug: p.slug,
    sku: p.sku,
    category: p.category,
    fulfillment: p.fulfillment,
    dosageForm: p.dosageForm,
    forGender: p.forGender,
    requiresPrescription: p.requiresPrescription,
    isActive: p.isActive,
    isFeatured: p.isFeatured,
    sortOrder: p.sortOrder,
    pathBConsultPrice: p.pathBConsultPrice,
    pathBOngoingPrice: p.pathBOngoingPrice,
    fccMedicationName: p.fccMedicationName,
    fccConcentration: p.fccConcentration,
    programTag: p.programTag,
    variantCount: p._count.variants,
    lowestPrice: p.variants.length > 0 ? Math.min(...p.variants.map((v) => v.price)) : 0,
    nameEn: p.translations[0]?.name ?? p.slug,
    createdAt: p.createdAt.toISOString(),
  }));

  return (
    <section className="py-8 pb-16">
      <Container>
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-sm text-body-muted mb-1">
              <Link href={`/${locale}/admin`} className="hover:text-brand-red">Dashboard</Link>
              <span>/</span>
              <span>Products</span>
            </div>
            <h1 className="font-heading text-heading text-3xl font-bold">Product Catalog</h1>
            <p className="text-body-muted mt-1">
              {products.length} total · {totalActive} active · {totalInactive} inactive
            </p>
          </div>
        </div>

        {/* Category Summary Cards */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 mb-8">
          {Object.entries(CATEGORY_LABELS).map(([key, label]) => {
            const count = categoryCounts[key] ?? 0;
            return (
              <div key={key} className="bg-white border border-gray-200 rounded-lg p-3 text-center">
                <p className="font-bold text-heading text-xl">{count}</p>
                <p className="text-body-muted text-xs leading-tight mt-0.5">{label}</p>
              </div>
            );
          })}
        </div>
      </Container>

      {/* Wide table — full width with padding */}
      <div className="px-4 sm:px-6 lg:px-8">
        <AdminProductsTable
          products={serializable}
          categoryLabels={CATEGORY_LABELS}
          fulfillmentLabels={FULFILLMENT_LABELS}
          locale={locale}
        />
      </div>
    </section>
  );
}
