export default function PriorAuthWorkQueue() {
  return (
    <div className="p-8">
      <h1
        className="text-2xl font-bold text-[#0C0D0F] mb-2"
        style={{ fontFamily: "Poppins, sans-serif" }}
      >
        PA Work Queue
      </h1>
      <p className="text-sm text-[#55575A] mb-6">
        Insurance prior authorization processing
      </p>
      <div className="bg-white rounded-xl border border-[#E5E5E5] p-12 text-center">
        <p className="text-[#55575A] text-sm">
          Backend API ready at <code className="bg-gray-100 px-2 py-1 rounded">/api/pa/cases</code>
        </p>
        <p className="text-[#55575A] text-xs mt-2">
          See docs/superpowers/specs/2026-04-03-pa-module-design.md for UI design reference
        </p>
      </div>
    </div>
  );
}
