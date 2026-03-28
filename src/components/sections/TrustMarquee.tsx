export function TrustMarquee() {
  const items = [
    "★ Trusted by 5,000+ Patients",
    "★ Doctor-Led Care",
    "★ Science-Backed",
    "★ Free Discreet Shipping",
    "★ HIPAA Compliant",
    "★ Board-Certified Physicians",
    "★ FDA-Registered Pharmacy",
    "★ 4.9/5 Patient Rating",
  ];

  return (
    <div className="bg-brand-red py-3 overflow-hidden">
      <div className="flex animate-marquee whitespace-nowrap">
        {[...items, ...items].map((item, i) => (
          <span key={i} className="text-white text-sm font-semibold mx-8 shrink-0">
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
