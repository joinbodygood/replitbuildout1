import { setRequestLocale } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import { Accordion } from "@/components/ui/Accordion";
import {
  Check,
  Lock,
  ChevronRight,
  Star,
  ShieldCheck,
  FileText,
  PhoneCall,
  Package,
  ArrowRight,
} from "lucide-react";
import { InsuranceStickyMobileCTA } from "@/components/sections/InsuranceStickyMobileCTA";

type Props = { params: Promise<{ locale: string }> };

export default async function InsurancePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const base = `/${locale}`;

  return (
    <>
      {/* ── HERO ── */}
      <section className="relative bg-gray-950 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(37,99,235,0.15),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(237,27,27,0.08),transparent_60%)]" />
        <Container narrow className="relative py-20 md:py-28">
          <div className="max-w-2xl">
            <div className="mb-5">
              <Badge variant="red">INSURANCE NAVIGATION PROGRAM</Badge>
            </div>
            <h1 className="font-heading text-4xl md:text-5xl font-extrabold text-white leading-tight mb-5">
              Will Your Insurance Cover{" "}
              <span className="text-blue-400">Weight Loss Medication?</span>
            </h1>
            <p className="text-white/70 text-lg md:text-xl mb-4 leading-relaxed">
              Find out in 60 seconds. Free. No insurance card needed.
            </p>
            <p className="text-white/60 text-base mb-8 max-w-xl leading-relaxed">
              Millions of Americans have insurance that covers Wegovy, Zepbound, Mounjaro, and
              Ozempic — and don&apos;t even know it. Your plan might cover your medication for as
              little as $25/month at the pharmacy. Take our free probability quiz to see your
              chances before you spend a dime.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <a href={`${base}/insurance-check`} className="inline-flex items-center justify-center font-heading font-semibold rounded-pill transition-all bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 text-lg">
                Check My Coverage Odds — Free →
              </a>
              <a href={`${base}/quiz/result/compounded`} className="inline-flex items-center justify-center font-heading font-semibold rounded-pill transition-all border-2 border-white/30 text-white hover:bg-white/10 px-10 py-4 text-lg">
                Explore Self-Pay Options
              </a>
            </div>
            <p className="text-white/30 text-xs mt-4">
              Takes 60 seconds · No insurance card needed · Instant results
            </p>
          </div>
        </Container>
      </section>

      {/* ── TRUST BAR — MEDICATIONS ── */}
      <section className="bg-white border-b border-border">
        <Container className="py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-body-muted flex-shrink-0">
              Medications covered:
            </p>
            <div className="flex flex-wrap items-center gap-4 text-sm font-heading font-semibold text-heading">
              {[
                "Wegovy (pill & injection)",
                "Zepbound (vial & KwikPen)",
                "Mounjaro (for diabetes)",
                "Ozempic (for diabetes)",
              ].map((med, i) => (
                <div key={med} className="flex items-center gap-2">
                  {i > 0 && <span className="text-border hidden sm:block">·</span>}
                  <Check size={14} className="text-blue-600 flex-shrink-0" />
                  <span>{med}</span>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* ── STAT BADGES ── */}
      <section className="bg-surface-dim py-10">
        <Container>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { stat: "4 in 10", label: "adults have coverage they don't know about" },
              { stat: "Growing", label: "employer plans adding GLP-1 coverage every quarter" },
              { stat: "~$25/mo", label: "average pharmacy copay with proper coverage" },
              { stat: "100%", label: "of our paperwork handled by us — you just pick up the meds" },
            ].map((item) => (
              <div key={item.stat} className="bg-white rounded-2xl border border-border p-5 text-center">
                <div className="font-heading text-2xl font-extrabold text-blue-600 mb-1">{item.stat}</div>
                <div className="text-body-muted text-xs leading-snug">{item.label}</div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-16 bg-white">
        <Container narrow>
          <div className="text-center mb-10">
            <p className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-2">How It Works</p>
            <h2 className="font-heading text-heading text-3xl md:text-4xl font-bold mb-3">
              4 Steps. We Handle the Hard Part.
            </h2>
            <p className="text-body-muted text-base max-w-lg mx-auto">
              You don&apos;t need to understand prior authorizations, formularies, or appeal letters.
              That&apos;s our job.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-10">
            {[
              {
                step: "1",
                icon: <ShieldCheck size={22} />,
                title: "Take the Free Quiz",
                desc: "Answer a few questions about your insurance and health conditions. Get your approval probability instantly — no insurance card needed.",
              },
              {
                step: "2",
                icon: <FileText size={22} />,
                title: "Get Your Eligibility Report",
                desc: "For $25, we run a real coverage check using your insurance card. You'll know exactly what your plan covers and what you'll pay.",
              },
              {
                step: "3",
                icon: <PhoneCall size={22} />,
                title: "We Submit Your PA",
                desc: "For $50, our team writes and submits your prior authorization, includes one appeal if needed, and handles all back-and-forth.",
              },
              {
                step: "4",
                icon: <Package size={22} />,
                title: "Pick Up Your Medication",
                desc: "Once approved, your prescription is sent to your pharmacy. Most patients pay around $25/month for their medication.",
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-12 h-12 rounded-full bg-blue-600 text-white font-heading font-extrabold text-lg flex items-center justify-center mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="font-heading text-heading font-bold mb-2 text-sm">{item.title}</h3>
                <p className="text-body-muted text-xs leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

          <blockquote className="border-l-4 border-brand-red bg-brand-pink-soft rounded-r-xl px-6 py-5 italic text-body text-sm leading-relaxed">
            &ldquo;You don&apos;t need to understand prior authorizations, formularies, or appeal letters. That&apos;s
            our job. Your only job is to show up at the pharmacy.&rdquo;{" "}
            <span className="not-italic font-semibold text-heading">— Dr. Linda Moleon, DO</span>
          </blockquote>
        </Container>
      </section>

      {/* ── SEQUENTIAL JOURNEY (PRICING) ── */}
      <section className="py-16 bg-surface-dim">
        <Container narrow>
          <div className="text-center mb-10">
            <p className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-2">Your Path to Coverage</p>
            <h2 className="font-heading text-heading text-3xl font-bold mb-3">
              One Step at a Time. No Pressure.
            </h2>
            <p className="text-body-muted text-sm max-w-lg mx-auto">
              Each step only appears after the previous one is completed. You never spend a dollar you don&apos;t need to.
            </p>
          </div>

          <div className="space-y-0">
            {/* STEP 1 — FREE */}
            <JourneyStep
              step="1"
              label="Start here — Free"
              labelColor="text-green-700"
              price="Free"
              priceNote=""
              title="Probability Quiz"
              active
              desc="Answer a few quick questions about your carrier, plan type, and health conditions. Get an instant estimate of your approval odds — no insurance card needed, no cost, no commitment."
              bullets={[]}
              infoBox={{
                color: "green",
                label: "What happens next:",
                text: "If your probability is moderate to high, we'll recommend moving to Step 2 for a definitive answer. If it's low, we'll be honest about it and show you affordable self-pay options instead — so you don't waste $25 on a long shot.",
              }}
              cta={{ label: "Check My Coverage Odds — Free →", href: "/insurance-check", style: "blue" }}
              locale={locale}
            />

            <Connector />

            {/* STEP 2 — $25 */}
            <JourneyStep
              step="2"
              label="Step 2"
              labelColor="text-blue-600"
              price="$25"
              priceNote="one-time"
              title="Eligibility Check"
              active
              desc="Upload your insurance card and member ID, and our team runs a real coverage verification. Within 48 hours, you'll know exactly what your plan covers, what you'll pay at the pharmacy, and whether a prior authorization is required."
              bullets={[
                "Real coverage verification using your actual insurance card",
                "Carrier-specific formulary and drug tier check",
                "Your estimated copay and coinsurance breakdown",
                "Prior authorization requirement confirmation",
                "Clear recommendation: proceed to Step 3 or explore self-pay",
              ]}
              infoBox={{
                color: "amber",
                label: "Decision gate:",
                text: "If your eligibility check shows strong coverage, we'll recommend moving to Step 3. If your plan doesn't cover GLP-1 medications or the copay is higher than self-pay pricing, we'll tell you that honestly and route you to self-pay programs starting at $149/mo.",
              }}
              cta={{ label: "Get My Eligibility Check — $25 →", href: "/insurance-check", style: "blue" }}
              locale={locale}
            />

            <Connector />

            {/* STEP 3 — $50 (LOCKED) */}
            <JourneyStep
              step="3"
              label="Unlocks after Step 2"
              labelColor="text-body-muted"
              price="$50"
              priceNote="one-time"
              title="Consultation + Prior Authorization Submission"
              active={false}
              desc="Your eligibility check confirmed coverage — now let's get you approved. Our clinical team conducts your medical consultation, writes your prescription, and submits the prior authorization to your insurance. If initially denied, we file one appeal at no extra cost."
              bullets={[
                "Medical consultation with Dr. Linda or Nurse Ketty",
                "Prescription written for your recommended medication",
                "Prior authorization drafted with full clinical documentation",
                "Submitted directly to your insurance carrier",
                "One appeal included at no additional cost if initially denied",
              ]}
              infoBox={{
                color: "green",
                label: "When you're approved:",
                text: "Your prescription goes to your pharmacy. Most patients pay around $25/month for their medication with insurance coverage and the manufacturer savings card. A one-time $85 approval processing fee applies at this point to finalize everything.",
              }}
              locale={locale}
            />

            <Connector />

            {/* STEP 4 — $75/mo (LOCKED) */}
            <JourneyStep
              step="4"
              label="Unlocks after approval"
              labelColor="text-body-muted"
              price="$75"
              priceNote="/month — only after approval"
              title="Ongoing Prescription Management"
              active={false}
              desc="You're approved. You're picking up your meds. Now stay supported. Our monthly program keeps everything running: prescription renewals, PA renewals, dosage adjustments, and unlimited access to our clinical team. Pay-as-you-go — no contract, cancel anytime."
              bullets={[
                "Monthly prescription renewal — no gaps in medication",
                "Unlimited messaging with our clinical team",
                "Prior authorization renewal and annual maintenance",
                "Dosage adjustments as your treatment progresses",
                "Pay-as-you-go — cancel anytime, no contract",
              ]}
              locale={locale}
            />
          </div>

          {/* BOTTOM LINE */}
          <div className="mt-10 border-l-4 border-brand-red bg-brand-pink-soft rounded-r-xl px-6 py-5 text-sm leading-relaxed text-body">
            <p className="mb-3">
              <strong className="text-heading">The bottom line:</strong> If you get approved, most patients pay around{" "}
              $25/month at the pharmacy for their medication. Add our $75/month program fee and your total monthly cost
              is around $100/month for brand-name, FDA-approved medication — compared to $1,000+ without insurance.
            </p>
            <p>
              <strong className="text-heading">And if insurance doesn&apos;t work out?</strong> You&apos;ll know at
              Step 1 or Step 2 — before you&apos;ve spent more than $25. We&apos;ll make sure you have a clear path to
              affordable self-pay options instead.
            </p>
          </div>
        </Container>
      </section>

      {/* ── MEDICATION COMPARISON ── */}
      <section className="py-16 bg-white">
        <Container>
          <div className="text-center mb-8">
            <p className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-2">Medications</p>
            <h2 className="font-heading text-heading text-2xl md:text-3xl font-bold mb-3">
              Two Proven Medications. We&apos;ll Help You Get the Right One Covered.
            </h2>
            <p className="text-body-muted text-sm max-w-lg mx-auto">
              Dr. Linda and Nurse Ketty will recommend the medication that gives you the best chance of approval AND the best results.
            </p>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-border shadow-card">
            <table className="w-full text-sm border-collapse min-w-[600px]">
              <thead>
                <tr>
                  <th className="bg-gray-950 text-white font-heading text-xs font-bold uppercase tracking-wider p-4 text-left w-1/4"></th>
                  <th className="bg-gray-950 text-white font-heading text-xs font-bold uppercase tracking-wider p-4 text-left w-[37.5%]">Semaglutide</th>
                  <th className="bg-gray-950 text-white font-heading text-xs font-bold uppercase tracking-wider p-4 text-left w-[37.5%]">Tirzepatide</th>
                </tr>
              </thead>
              <tbody>
                {[
                  {
                    label: "Brand names",
                    sem: "Wegovy (weight loss)\nOzempic (diabetes)",
                    trzSep: "Zepbound (weight loss)\nMounjaro (diabetes)",
                  },
                  {
                    label: "How it works",
                    sem: "Targets 1 hormone (GLP-1) to reduce hunger and control blood sugar",
                    trzSep: "Targets 2 hormones (GLP-1 + GIP) for stronger hunger reduction",
                  },
                  {
                    label: "Average weight loss",
                    sem: "~15% of body weight in clinical trials",
                    trzSep: "~20% of body weight in clinical trials",
                  },
                  {
                    label: "Available forms",
                    sem: "Weekly injection or daily pill (Wegovy)",
                    trzSep: "Weekly injection (vial or KwikPen)",
                  },
                  {
                    label: "FDA approved for",
                    sem: "Weight loss, type 2 diabetes, cardiovascular risk reduction",
                    trzSep: "Weight loss, type 2 diabetes, obstructive sleep apnea",
                  },
                  {
                    label: "Insurance coverage",
                    sem: "Widely covered for diabetes (Ozempic). Growing coverage for weight loss (Wegovy).",
                    trzSep: "Widely covered for diabetes (Mounjaro). Expanding for weight loss (Zepbound).",
                  },
                  {
                    label: "Copay with insurance",
                    sem: "$25/month with manufacturer savings card",
                    trzSep: "$25/month with manufacturer savings card",
                  },
                  {
                    label: "Without insurance",
                    sem: "Wegovy: $149–$349/mo self-pay\nOzempic: $349–$499/mo self-pay",
                    trzSep: "Zepbound: $299–$449/mo self-pay\nMounjaro: ~$1,080/mo list price",
                  },
                ].map((row, i) => (
                  <tr key={row.label} className={i % 2 === 0 ? "bg-white" : "bg-surface-dim"}>
                    <td className="p-4 font-heading font-semibold text-heading text-xs">{row.label}</td>
                    <td className="p-4 text-body leading-relaxed">
                      {row.sem.split("\n").map((line, j) => (
                        <span key={j}>{line}{j < row.sem.split("\n").length - 1 && <br />}</span>
                      ))}
                    </td>
                    <td className="p-4 text-body leading-relaxed">
                      {row.trzSep.split("\n").map((line, j) => (
                        <span key={j}>{line}{j < row.trzSep.split("\n").length - 1 && <br />}</span>
                      ))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-body-muted text-xs text-center mt-4 max-w-lg mx-auto">
            Not sure which medication is right for you? Our providers will review your health history, insurance coverage, and goals to recommend the best option.
          </p>
        </Container>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="py-16 bg-surface-dim">
        <Container>
          <div className="text-center mb-10">
            <p className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-2">Reviews</p>
            <h2 className="font-heading text-heading text-2xl md:text-3xl font-bold">
              Real Patients. Real Approvals. Real Results.
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                quote: "I had no idea my employer plan covered Zepbound until Body Good checked for me.",
                body: "I was paying $400/month for compounded medication. Dr. Linda's team got my insurance to cover Zepbound and now I pay $25 at CVS. I wish I'd done this months ago.",
                author: "Sarah M.",
                location: "Florida",
              },
              {
                quote: "They handled everything. I just showed up at Walgreens.",
                body: "The prior authorization process scared me. I didn't even know what it was. Body Good submitted everything, handled the appeal when it was initially denied, and two weeks later I picked up Wegovy. Total cost: $25.",
                author: "Denise R.",
                location: "Texas",
              },
              {
                quote: "I have sleep apnea and didn't know that qualified me for coverage.",
                body: "The probability quiz said I had a 75% chance. I paid $25 to verify. Turns out my plan covers Zepbound for sleep apnea. I've lost 40 pounds and my sleep apnea symptoms have improved significantly.",
                author: "Keisha T.",
                location: "Georgia",
              },
            ].map((t) => (
              <div key={t.author} className="bg-white rounded-2xl border border-border p-6 flex flex-col">
                <div className="flex gap-0.5 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} className="fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="font-heading font-semibold text-heading text-sm mb-2">&ldquo;{t.quote}&rdquo;</p>
                <p className="text-body-muted text-sm leading-relaxed flex-grow">{t.body}</p>
                <p className="text-xs font-semibold text-body-muted mt-4">
                  — {t.author}, {t.location}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ── DR. LINDA MESSAGE ── */}
      <section className="py-16 bg-white">
        <Container narrow>
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="flex-shrink-0 w-20 h-20 md:w-24 md:h-24 rounded-full bg-gray-200 overflow-hidden ring-4 ring-brand-pink-soft flex items-center justify-center text-3xl">
              👩🏽‍⚕️
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-brand-red mb-2">A Note from Your Doctor</p>
              <h2 className="font-heading text-heading text-2xl font-bold mb-5">
                You shouldn&apos;t need a medical degree to figure out your insurance.
              </h2>
              <div className="border-l-4 border-brand-red bg-brand-pink-soft rounded-r-xl px-6 py-5 text-sm leading-relaxed text-body space-y-4">
                <p>
                  I started Body Good because I was tired of watching patients — women just like me — get stuck in a
                  system that wasn&apos;t built for them.
                </p>
                <p>
                  You shouldn&apos;t need a medical degree to figure out if your insurance covers your medication. You
                  shouldn&apos;t have to spend hours on hold with your carrier. And you definitely shouldn&apos;t give
                  up on treatment you need because the paperwork is confusing.
                </p>
                <p>
                  That&apos;s why we built this program. My team and I handle the coverage checks, the prior
                  authorizations, the appeals, and the pharmacy coordination. <strong className="text-heading">You focus on feeling better.</strong>
                </p>
                <p>
                  If your insurance can cover this, we&apos;ll find a way. If it can&apos;t, we&apos;ll make sure you
                  still have affordable options. Either way, you&apos;re not doing this alone.
                </p>
              </div>
              <div className="mt-4">
                <p className="font-heading font-bold text-heading">— Dr. Linda Moleon, DO</p>
                <p className="text-body-muted text-xs">Double Board-Certified in Obesity Medicine &amp; Anesthesiology</p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ── FAQ ── */}
      <section className="py-16 bg-surface-dim">
        <Container narrow>
          <div className="text-center mb-10">
            <p className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-2">FAQ</p>
            <h2 className="font-heading text-heading text-2xl md:text-3xl font-bold">
              Questions We Get Every Day
            </h2>
          </div>
          <div className="bg-white rounded-2xl border border-border px-6 md:px-8">
            <Accordion
              items={[
                {
                  question: "What is the free probability quiz?",
                  answer: "It's a quick 60-second quiz that estimates how likely your insurance is to cover GLP-1 weight loss medication. It uses your carrier, plan type, and health conditions to give you an honest probability score. No insurance card needed. No cost. No commitment.",
                },
                {
                  question: "What does the $25 eligibility check include?",
                  answer: "We use your actual insurance card and member ID to run a real coverage verification. You'll get a detailed report showing: whether your plan covers GLP-1 medications, which specific medications are covered, your estimated copay, and whether a prior authorization is required. Results within 48 hours.",
                },
                {
                  question: "What is a prior authorization and why do I need one?",
                  answer: "A prior authorization (PA) is your insurance company's way of confirming that a medication is medically necessary before they agree to pay for it. Many insurance plans require a PA for GLP-1 medications. Our clinical team writes and submits your PA, including all the clinical documentation your insurance needs to say 'yes.'",
                },
                {
                  question: "What happens if my prior authorization is denied?",
                  answer: "If your PA is initially denied, our team files one appeal on your behalf at no additional cost — it's included in the $50 PA submission fee. Many denials are overturned on appeal. If the appeal is also denied, we'll help you explore self-pay options starting at $149/month so you're never left without a path forward.",
                },
                {
                  question: "How much will I pay at the pharmacy?",
                  answer: "If your insurance covers your medication and you qualify for the manufacturer savings card, most patients pay around $25/month at the pharmacy. Your exact cost depends on your plan's copay structure, which we'll confirm during the eligibility check.",
                },
                {
                  question: "Which medications can you help me get covered?",
                  answer: "We work with all four major GLP-1 medications: Wegovy (semaglutide, for weight loss — now available as a pill or injection), Zepbound (tirzepatide, for weight loss and sleep apnea), Mounjaro (tirzepatide, for type 2 diabetes), and Ozempic (semaglutide, for type 2 diabetes). We'll recommend the one that gives you the best chance of approval based on your insurance and health history.",
                },
                {
                  question: "Do I have to commit to the $75/month program?",
                  answer: "No. The $75/month ongoing program is pay-as-you-go with no contract. You can cancel anytime. It includes monthly prescription renewals, unlimited clinical team support, PA renewal handling, and dosage adjustments. Think of it as having a concierge medical team for your weight loss — without the concierge price tag.",
                },
                {
                  question: "I have Medicare or Medicaid. Can I still use this program?",
                  answer: "It depends. Medicare currently does not cover medications prescribed specifically for weight loss. However, if you have type 2 diabetes, Medicare may cover Ozempic or Mounjaro for blood sugar management. Medicaid coverage varies by state. Our $25 eligibility check will give you a definitive answer for your specific situation. If insurance doesn't work out, our self-pay programs are available to everyone.",
                },
                {
                  question: "Is Body Good a real medical practice?",
                  answer: "Yes. Body Good Studio is a physician-led telehealth practice founded by Dr. Linda Moleon, who is double board-certified in Obesity Medicine and Anesthesiology. Every prescription is reviewed by our licensed medical team. We are not a pharmacy, a supplement company, or a wellness brand. We are a legitimate medical practice that specializes in weight management.",
                },
                {
                  question: "What if my insurance doesn't cover it?",
                  answer: "You still have excellent options. Our self-pay compounded programs start at $149/month for semaglutide and $315/month for tirzepatide, with free shipping and full physician oversight. We also offer oral (needle-free) options and branded prescription management starting at $45. The $25 eligibility check is never wasted — it gives you clarity either way.",
                },
              ]}
            />
          </div>
        </Container>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="py-16 bg-gray-950 text-white">
        <Container narrow>
          <div className="text-center">
            <h2 className="font-heading text-3xl md:text-4xl font-extrabold text-white mb-4">
              Your Insurance Might Be Paying for This.
              <br className="hidden md:block" /> Let&apos;s Find Out.
            </h2>
            <p className="text-white/60 text-base max-w-xl mx-auto mb-8 leading-relaxed">
              Take the free probability quiz. It takes 60 seconds. If your chances look good, we&apos;ll handle
              everything from the coverage check to the pharmacy pickup. If not, we&apos;ll make sure you have
              affordable options. Either way, you&apos;ll know exactly where you stand.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <a href={`${base}/insurance-check`} className="inline-flex items-center justify-center font-heading font-semibold rounded-pill transition-all bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 text-lg w-full sm:w-auto">
                Check My Coverage Odds — Free →
              </a>
              <a href={`${base}/quiz/result/compounded`} className="inline-flex items-center justify-center font-heading font-semibold rounded-pill transition-all border-2 border-white/30 text-white hover:bg-white/10 px-10 py-4 text-lg w-full sm:w-auto">
                Start Self-Pay at $149/mo
              </a>
            </div>
            <p className="text-white/25 text-xs mt-5">
              No login required · No insurance card needed for the free quiz · Results are instant
            </p>
          </div>
        </Container>
      </section>

      {/* ── CROSS-SELL BAR ── */}
      <section className="py-10 bg-surface-dim border-t border-border">
        <Container>
          <p className="text-xs font-semibold uppercase tracking-wider text-body-muted text-center mb-5">
            Not sure insurance is the right path? Explore your other options.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              { label: "Self-Pay Compounded — from $139/mo", href: `${base}/quiz/result/compounded` },
              { label: "Oral / Needle-Free — from $109/mo", href: `${base}/quiz/result/oral` },
              { label: "Brand-Name Rx — from $45", href: `${base}/quiz/result/branded` },
              { label: "Not sure? Take the Quiz", href: `${base}/quiz` },
            ].map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="flex items-center gap-2 bg-white border border-border rounded-pill px-5 py-2.5 text-sm font-semibold text-heading hover:border-brand-red hover:text-brand-red transition-all"
              >
                {link.label}
                <ArrowRight size={14} />
              </a>
            ))}
          </div>
        </Container>
      </section>

      {/* ── LEGAL DISCLAIMER ── */}
      <section className="py-8 bg-white border-t border-border">
        <Container>
          <p className="text-xs text-body-muted/60 leading-relaxed max-w-3xl mx-auto text-center">
            Body Good Studio is a physician-led telehealth practice. All prescriptions are reviewed and authorized by
            licensed medical providers. Insurance coverage, copay amounts, and prior authorization outcomes vary by
            carrier, plan, and individual circumstances. The free probability quiz provides an estimate based on general
            coverage data and does not guarantee approval or specific costs. Wegovy is a registered trademark of Novo
            Nordisk. Zepbound, Mounjaro, and KwikPen are registered trademarks of Eli Lilly and Company. Body Good
            Studio is not affiliated with, endorsed by, or sponsored by Novo Nordisk or Eli Lilly. Individual weight
            loss results vary.
          </p>
        </Container>
      </section>

      {/* ── STICKY MOBILE CTA ── */}
      <InsuranceStickyMobileCTA href={`${base}/insurance-check`} />
    </>
  );
}

/* ── Journey Step Component ── */
function JourneyStep({
  step,
  label,
  labelColor,
  price,
  priceNote,
  title,
  active,
  desc,
  bullets,
  infoBox,
  cta,
  locale,
}: {
  step: string;
  label: string;
  labelColor: string;
  price: string;
  priceNote: string;
  title: string;
  active: boolean;
  desc: string;
  bullets: string[];
  infoBox?: { color: string; label: string; text: string };
  cta?: { label: string; href: string; style: string };
  locale: string;
}) {
  const infoColors: Record<string, string> = {
    green: "bg-green-50 border-green-200 text-green-800",
    amber: "bg-amber-50 border-amber-200 text-amber-800",
    blue: "bg-blue-50 border-blue-200 text-blue-800",
  };

  return (
    <div className={`rounded-2xl border-2 p-6 md:p-7 ${active ? "bg-white border-blue-500 shadow-card-hover" : "bg-white/60 border-border opacity-75"}`}>
      <div className="flex items-start gap-4">
        <div className={`flex-shrink-0 w-11 h-11 rounded-full flex items-center justify-center font-heading font-extrabold text-lg ${active ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-400"}`}>
          {active ? step : <Lock size={16} />}
        </div>
        <div className="flex-grow min-w-0">
          <div className="flex flex-wrap items-baseline justify-between gap-2 mb-0.5">
            <p className={`text-xs font-bold uppercase tracking-wider ${labelColor}`}>{label}</p>
            {price && (
              <span className={`font-heading font-extrabold text-2xl ${active ? "text-heading" : "text-body-muted"}`}>
                {price}{" "}
                {priceNote && <span className="text-sm font-normal text-body-muted">{priceNote}</span>}
              </span>
            )}
          </div>
          <h3 className="font-heading text-heading font-bold text-xl mb-2">{title}</h3>
          <p className="text-body text-sm leading-relaxed mb-4">{desc}</p>

          {bullets.length > 0 && (
            <div className="space-y-1.5 mb-4">
              {bullets.map((b, i) => (
                <div key={i} className="flex items-start gap-2 text-sm">
                  <div className="w-2.5 h-2.5 rounded-full border-2 border-green-500 flex-shrink-0 mt-1" />
                  <span className="text-body">{b}</span>
                </div>
              ))}
            </div>
          )}

          {infoBox && (
            <div className={`rounded-lg border px-4 py-3 text-xs leading-relaxed mb-4 ${infoColors[infoBox.color] ?? infoColors.blue}`}>
              <strong>{infoBox.label}</strong> {infoBox.text}
            </div>
          )}

          {cta && active && (
            <a
              href={`/${locale}${cta.href}`}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-heading font-bold text-sm px-6 py-3 rounded-pill transition-colors"
            >
              {cta.label}
              <ChevronRight size={16} />
            </a>
          )}

          {!active && (
            <div className="inline-flex items-center gap-2 text-xs text-body-muted bg-surface-dim border border-border rounded-pill px-4 py-2">
              <Lock size={12} />
              <span>Unlocks after completing the previous step</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Connector() {
  return (
    <div className="flex justify-start pl-9">
      <div className="w-0.5 h-6 bg-border border-dashed border-l-2 border-border ml-4" />
    </div>
  );
}
