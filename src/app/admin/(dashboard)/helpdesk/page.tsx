import { Headphones } from "lucide-react";

export default function HelpdeskPage() {
  return (
    <div className="p-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-9 h-9 bg-[#FDE7E7] rounded-lg flex items-center justify-center">
          <Headphones size={18} className="text-[#ED1B1B]" />
        </div>
        <div>
          <h1 className="font-bold text-[#0C0D0F] text-xl" style={{ fontFamily: "Poppins, sans-serif" }}>
            Helpdesk
          </h1>
          <p className="text-sm text-[#55575A]">Live chat &amp; support inbox</p>
        </div>
      </div>

      <div className="max-w-md bg-white rounded-2xl border border-[#E5E5E5] shadow-sm p-8 text-center">
        <div className="w-14 h-14 bg-[#FDE7E7] rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Headphones size={24} className="text-[#ED1B1B]" />
        </div>
        <h2 className="font-bold text-[#0C0D0F] text-lg mb-2" style={{ fontFamily: "Poppins, sans-serif" }}>
          Chat widget coming soon
        </h2>
        <p className="text-sm text-[#55575A] leading-relaxed">
          A new live chat integration will be connected here. Check back shortly.
        </p>
      </div>
    </div>
  );
}
