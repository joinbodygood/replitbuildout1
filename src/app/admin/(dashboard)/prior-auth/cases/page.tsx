/**
 * PA Case List — All Cases (Filterable)
 *
 * API: GET /api/pa/cases?stage=X&assignedTo=Y&search=Z&page=1&limit=20
 * Response: { data: InsuranceCaseSummary[], total, page, limit }
 *
 * Features to build:
 *   - Search bar (email, name, carrier, member ID)
 *   - Stage filter dropdown
 *   - Assigned-to filter dropdown
 *   - Sortable table columns
 *   - Pagination
 *   - Click row → navigate to /admin/prior-auth/cases/[id]
 *
 * See docs/pa-module-mockup.html for visual reference
 */
export default function PACaseList() {
  return (
    <div className="p-8">
      <h1
        className="text-2xl font-bold text-[#0C0D0F] mb-2"
        style={{ fontFamily: "Poppins, sans-serif" }}
      >
        All PA Cases
      </h1>
      <p className="text-sm text-[#55575A] mb-6">
        Filterable list of all insurance prior authorization cases
      </p>
      <div className="bg-white rounded-xl border border-[#E5E5E5] p-12 text-center">
        <p className="text-[#55575A] text-sm">
          Backend API ready at <code className="bg-gray-100 px-2 py-1 rounded">/api/pa/cases</code>
        </p>
        <p className="text-[#55575A] text-xs mt-2">
          See docs/pa-module-mockup.html for UI design reference
        </p>
      </div>
    </div>
  );
}
