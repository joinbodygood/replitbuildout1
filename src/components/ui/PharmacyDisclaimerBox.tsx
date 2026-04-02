import { Info } from "lucide-react";

export function PharmacyDisclaimerBox({ className = "" }: { className?: string }) {
  return (
    <div
      className={`rounded-xl border border-blue-200 bg-blue-50 p-4 flex gap-3 ${className}`}
      role="note"
      aria-label="Pharmacy pickup disclaimer"
    >
      <Info size={18} className="text-blue-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
      <p className="text-sm text-blue-900 leading-relaxed">
        This option includes your medical doctor consultation and electronic prescription sent to
        your local pharmacy. It{" "}
        <strong className="font-bold">does NOT include the cost of the medication</strong>. All
        medications are to be paid for at the pharmacy. You may use your health insurance to pay
        for the medication at the pharmacy.
      </p>
    </div>
  );
}
