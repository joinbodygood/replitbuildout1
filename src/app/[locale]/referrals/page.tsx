"use client";

import { useState } from "react";
import { useLocale } from "next-intl";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export default function ReferralsPage() {
  const locale = useLocale();
  const isEs = locale === "es";
  const [email, setEmail] = useState("");
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [stats, setStats] = useState<{ totalReferred: number; totalEarned: number } | null>(null);
  const [copied, setCopied] = useState(false);

  async function handleGetCode(e: React.FormEvent) {
    e.preventDefault();
    if (!email.includes("@")) return;

    const res = await fetch("/api/referrals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    setReferralCode(data.code);

    // Get stats
    const statsRes = await fetch(`/api/referrals?email=${encodeURIComponent(email)}`);
    const statsData = await statsRes.json();
    setStats(statsData);
  }

  const referralLink = referralCode ? `https://joinbodygood.com/${locale}/ref/${referralCode}` : "";

  function copyLink() {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <>
      <section className="py-16 bg-brand-pink-soft">
        <Container narrow>
          <div className="text-center">
            <Badge variant="red">{isEs ? "GANA $25" : "EARN $25"}</Badge>
            <h1 className="font-heading text-heading text-3xl md:text-4xl font-bold mt-4 mb-4">
              {isEs
                ? "Refiere a un Amigo, Gana $25"
                : "Refer a Friend, Earn $25"}
            </h1>
            <p className="text-body-muted text-lg max-w-xl mx-auto">
              {isEs
                ? "Comparte tu enlace. Cuando tu amigo haga su primera compra, ambos reciben $25 de cr\u00e9dito."
                : "Share your link. When your friend makes their first purchase, you both get $25 credit."}
            </p>
          </div>
        </Container>
      </section>

      <section className="py-16">
        <Container narrow>
          {/* How it works */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {[
              {
                step: "1",
                title: isEs ? "Comparte Tu Enlace" : "Share Your Link",
                desc: isEs ? "Copia tu enlace \u00fanico y comp\u00e1rtelo con amigos." : "Copy your unique link and share it with friends.",
              },
              {
                step: "2",
                title: isEs ? "Tu Amigo Compra" : "Friend Purchases",
                desc: isEs ? "Tu amigo obtiene $25 de descuento en su primer pedido." : "Your friend gets $25 off their first order.",
              },
              {
                step: "3",
                title: isEs ? "T\u00fa Ganas $25" : "You Earn $25",
                desc: isEs ? "Recibes $25 de cr\u00e9dito en tu pr\u00f3ximo ciclo de facturaci\u00f3n." : "You get $25 credit on your next billing cycle.",
              },
            ].map((item) => (
              <Card key={item.step} className="text-center">
                <div className="w-10 h-10 bg-brand-red text-white rounded-full flex items-center justify-center mx-auto mb-3 font-heading font-bold">
                  {item.step}
                </div>
                <h3 className="font-heading text-heading font-semibold mb-2">{item.title}</h3>
                <p className="text-body-muted text-sm">{item.desc}</p>
              </Card>
            ))}
          </div>

          {/* Get your code */}
          {!referralCode ? (
            <div className="max-w-md mx-auto">
              <h2 className="font-heading text-heading text-xl font-bold mb-4 text-center">
                {isEs ? "Obt\u00e9n Tu Enlace de Referido" : "Get Your Referral Link"}
              </h2>
              <form onSubmit={handleGetCode} className="space-y-4">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={isEs ? "Tu email de Body Good" : "Your Body Good email"}
                  className="w-full px-4 py-3 rounded-card border border-border focus:border-brand-red focus:outline-none transition-colors"
                  required
                />
                <button
                  type="submit"
                  className="w-full bg-brand-red text-white font-heading font-semibold px-8 py-3.5 rounded-pill shadow-btn hover:bg-brand-red-hover transition-all duration-base"
                >
                  {isEs ? "Obtener Mi Enlace" : "Get My Link"}
                </button>
              </form>
            </div>
          ) : (
            <div className="max-w-md mx-auto text-center">
              <h2 className="font-heading text-heading text-xl font-bold mb-4">
                {isEs ? "Tu Enlace de Referido" : "Your Referral Link"}
              </h2>

              <div className="flex gap-2 mb-6">
                <input
                  type="text"
                  value={referralLink}
                  readOnly
                  className="flex-grow px-4 py-3 rounded-card border border-border bg-surface-dim text-sm font-mono"
                />
                <button
                  onClick={copyLink}
                  className={`px-6 py-3 rounded-card font-semibold transition-all ${
                    copied
                      ? "bg-success text-white"
                      : "bg-brand-red text-white hover:bg-brand-red-hover"
                  }`}
                >
                  {copied ? "\u2713" : isEs ? "Copiar" : "Copy"}
                </button>
              </div>

              {/* Share buttons */}
              <div className="flex justify-center gap-3 mb-8">
                <a
                  href={`mailto:?subject=${encodeURIComponent(isEs ? "Prueba Body Good" : "Try Body Good")}&body=${encodeURIComponent(referralLink)}`}
                  className="px-4 py-2 rounded-card border border-border text-sm text-body hover:border-brand-red hover:text-brand-red transition-colors"
                >
                  Email
                </a>
                <a
                  href={`sms:?body=${encodeURIComponent(referralLink)}`}
                  className="px-4 py-2 rounded-card border border-border text-sm text-body hover:border-brand-red hover:text-brand-red transition-colors"
                >
                  SMS
                </a>
                <button
                  onClick={copyLink}
                  className="px-4 py-2 rounded-card border border-border text-sm text-body hover:border-brand-red hover:text-brand-red transition-colors"
                >
                  {isEs ? "Copiar enlace" : "Copy link"}
                </button>
              </div>

              {/* Stats */}
              {stats && (
                <div className="grid grid-cols-2 gap-4">
                  <Card className="text-center">
                    <p className="font-heading text-heading text-2xl font-bold">{stats.totalReferred}</p>
                    <p className="text-body-muted text-sm">{isEs ? "Referidos" : "Referrals"}</p>
                  </Card>
                  <Card className="text-center">
                    <p className="font-heading text-heading text-2xl font-bold">
                      ${(stats.totalEarned / 100).toFixed(0)}
                    </p>
                    <p className="text-body-muted text-sm">{isEs ? "Ganado" : "Earned"}</p>
                  </Card>
                </div>
              )}
            </div>
          )}
        </Container>
      </section>
    </>
  );
}
