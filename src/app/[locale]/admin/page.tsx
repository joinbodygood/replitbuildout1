import { setRequestLocale } from "next-intl/server";
import { db } from "@/lib/db";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import Link from "next/link";

type Props = { params: Promise<{ locale: string }> };

export default async function AdminPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [orderCount, productCount, reviewCount, leadCount, blogCount, referralCount] =
    await Promise.all([
      db.order.count(),
      db.product.count({ where: { isActive: true } }),
      db.review.count(),
      db.quizLead.count(),
      db.blogPost.count({ where: { isPublished: true } }),
      db.referral.count(),
    ]);

  const recentOrders = await db.order.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
    include: { items: true },
  });

  const pendingReviews = await db.review.count({ where: { isApproved: false } });

  const stats = [
    { label: "Orders", value: orderCount, href: `/${locale}/admin/orders` },
    { label: "Products", value: productCount, href: `/${locale}/admin` },
    { label: "Quiz Leads", value: leadCount, href: `/${locale}/admin` },
    { label: "Reviews", value: reviewCount, sub: pendingReviews > 0 ? `${pendingReviews} pending` : null, href: `/${locale}/admin` },
    { label: "Blog Posts", value: blogCount, href: `/${locale}/admin` },
    { label: "Referrals", value: referralCount, href: `/${locale}/admin` },
  ];

  const formatPrice = (cents: number) => `$${(cents / 100).toFixed(2)}`;

  return (
    <section className="py-8">
      <Container>
        <h1 className="font-heading text-heading text-3xl font-bold mb-8">Admin Dashboard</h1>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-12">
          {stats.map((stat) => (
            <Card key={stat.label} className="text-center">
              <p className="font-heading text-heading text-2xl font-bold">{stat.value}</p>
              <p className="text-body-muted text-sm">{stat.label}</p>
              {stat.sub && <p className="text-warning text-xs mt-1">{stat.sub}</p>}
            </Card>
          ))}
        </div>

        {/* Recent Orders */}
        <h2 className="font-heading text-heading text-xl font-bold mb-4">Recent Orders</h2>
        {recentOrders.length === 0 ? (
          <p className="text-body-muted">No orders yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b-2 border-border text-left">
                  <th className="py-3 px-4 font-heading text-heading text-sm">Order ID</th>
                  <th className="py-3 px-4 font-heading text-heading text-sm">Email</th>
                  <th className="py-3 px-4 font-heading text-heading text-sm">Items</th>
                  <th className="py-3 px-4 font-heading text-heading text-sm">Total</th>
                  <th className="py-3 px-4 font-heading text-heading text-sm">Status</th>
                  <th className="py-3 px-4 font-heading text-heading text-sm">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id} className="border-b border-border-light hover:bg-surface-dim">
                    <td className="py-3 px-4 font-mono text-sm">{order.id.slice(0, 8)}...</td>
                    <td className="py-3 px-4 text-sm">{order.email}</td>
                    <td className="py-3 px-4 text-sm">{order.items.length} items</td>
                    <td className="py-3 px-4 text-sm font-heading font-bold">{formatPrice(order.total)}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                        order.status === "pending_intake" ? "bg-yellow-100 text-yellow-800" :
                        order.status === "processing" ? "bg-blue-100 text-blue-800" :
                        order.status === "shipped" ? "bg-green-100 text-green-800" :
                        "bg-gray-100 text-gray-800"
                      }`}>
                        {order.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-body-muted">
                      {new Date(order.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Container>
    </section>
  );
}
