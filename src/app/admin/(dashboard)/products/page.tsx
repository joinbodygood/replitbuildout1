"use client";

import { useEffect, useState } from "react";
import { AdminTopBar } from "@/components/admin/AdminTopBar";
import Link from "next/link";
import { Plus, ExternalLink, Package } from "lucide-react";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/auth/me").then((r) => r.json()),
      fetch("/api/products").then((r) => r.json()),
    ]).then(([me, prod]) => {
      setUser(me.user);
      setProducts(prod.products ?? prod ?? []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col h-full">
      <AdminTopBar
        title="Products"
        breadcrumbs={[{ label: "Admin" }, { label: "Products" }]}
        user={user ?? { name: "Admin", role: "" }}
      />

      <div className="flex-1 p-6">
        <div className="flex items-center justify-between mb-5">
          <p className="text-sm text-[#55575A]">{products.length} products in catalog</p>
          <Link
            href="/en/programs"
            target="_blank"
            className="inline-flex items-center gap-1.5 text-sm text-[#ED1B1B] font-medium border border-[#ED1B1B] px-4 py-1.5 rounded-full hover:bg-[#FDE7E7] transition-colors"
          >
            <ExternalLink size={14} /> View Storefront
          </Link>
        </div>

        <div className="bg-white rounded-[12px] border border-[#E5E5E5]">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E5E5E5] bg-gray-50">
                  {["Product", "Category", "Variants", "Price Range", "Status", ""].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-[#55575A] whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} className="text-center py-12 text-[#55575A] text-sm">Loading…</td></tr>
                ) : products.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-12 text-[#55575A] text-sm">No products found</td></tr>
                ) : (
                  products.map((p: any) => {
                    const name = p.translations?.[0]?.name ?? p.slug;
                    const prices = p.variants?.map((v: any) => v.price / 100) ?? [];
                    const minP = prices.length ? Math.min(...prices) : 0;
                    const maxP = prices.length ? Math.max(...prices) : 0;
                    return (
                      <tr key={p.id} className="border-b border-[#E5E5E5] hover:bg-gray-50 transition-colors last:border-0">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-[#FDE7E7] rounded-lg flex items-center justify-center shrink-0">
                              <Package size={14} className="text-[#ED1B1B]" />
                            </div>
                            <div>
                              <p className="text-xs font-medium text-[#0C0D0F]">{name}</p>
                              <p className="text-xs text-[#55575A]">/{p.slug}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs text-[#55575A]">{p.category}</td>
                        <td className="px-4 py-3 text-xs text-[#55575A]">{p.variants?.length ?? 0}</td>
                        <td className="px-4 py-3 text-xs font-medium text-[#0C0D0F]">
                          {prices.length === 0 ? "—" : minP === maxP ? `$${minP.toFixed(0)}` : `$${minP.toFixed(0)}–$${maxP.toFixed(0)}`}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${p.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                            {p.isActive ? "Active" : "Draft"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <Link
                            href={`/en/products/${p.slug}`}
                            target="_blank"
                            className="inline-flex items-center gap-1 text-xs text-[#ED1B1B] font-medium hover:underline"
                          >
                            View <ExternalLink size={11} />
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
