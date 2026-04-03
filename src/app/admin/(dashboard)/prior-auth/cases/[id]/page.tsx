export default async function PACaseDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <div className="p-8">
      <h1
        className="text-2xl font-bold text-[#0C0D0F] mb-2"
        style={{ fontFamily: "Poppins, sans-serif" }}
      >
        Case Detail
      </h1>
      <p className="text-sm text-[#55575A] mb-6">Case ID: {id}</p>
      <div className="bg-white rounded-xl border border-[#E5E5E5] p-12 text-center">
        <p className="text-[#55575A] text-sm">
          Backend API ready at <code className="bg-gray-100 px-2 py-1 rounded">/api/pa/cases/{id}</code>
        </p>
      </div>
    </div>
  );
}
