import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import DashboardLayout from "../../../components/DashboardLayout";
import { get } from "../../../api";
import Button from "../../../components/Button";

function StaffDetailPage() {
  const { id } = useParams();
  const [staff, setStaff] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    get(`/admin/staff/${id}`)
      .then((response) => setStaff(response.data?.data || response.data || null))
      .catch((requestError) => setError(requestError.message));
  }, [id]);

  return (
    <DashboardLayout title="Detail Staff">
      <div className="mx-auto max-w-3xl space-y-4">
        {/* Navigation Breadcrumb */}
        <div>
          <Link
            to="/admin/staff"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
          >
            &larr; Kembali ke daftar staff
          </Link>
        </div>

        {/* State Error */}
        {error && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs font-medium text-rose-800">
            {error}
          </div>
        )}

        {/* State Loading */}
        {!staff && !error && (
          <div className="flex h-40 items-center justify-center rounded-2xl border border-slate-200 bg-white text-xs font-medium text-slate-400">
            Memuat detail staff...
          </div>
        )}

        {/* Display Record List */}
        {staff && (
          <div className="rounded border border-slate-200 bg-white p-6 shadow-xs">
            {/* Title Section */}
            <div className="mb-5 border-b border-slate-100 pb-3">
              <span className="text-lg font-bold text-neutral-dark-gray">
                Detail Staff
              </span>
            </div>

            {/* List Detail Data */}
            <div className="divide-y divide-slate-100 text-sm">
              <div className="flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:justify-between">
                <span className="font-semibold text-neutral-dark-gray capitalize sm:w-1/3">
                  Username
                </span>
                <span className="font-semibold text-slate-900 sm:w-2/3 sm:text-right">
                  {staff.username || "-"}
                </span>
              </div>

              <div className="flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:justify-between">
                <span className="font-semibold text-neutral-dark-gray capitalize sm:w-1/3">
                  Nama Lengkap
                </span>
                <span className="font-medium text-slate-900 sm:w-2/3 sm:text-right">
                  {staff.full_name || "-"}
                </span>
              </div>

              <div className="flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:justify-between">
                <span className="font-semibold text-neutral-dark-gray capitalize sm:w-1/3">
                  Role / Jabatan
                </span>
                <span className="font-medium text-slate-900 sm:w-2/3 sm:text-right">
                  <span
                    className={`inline-block rounded-full px-2.5 py-0.5 text-sm font-semibold capitalize`}
                  >
                    {staff.role || "-"}
                  </span>
                </span>
              </div>
            </div>
            <Button 
              text="Edit"  
              onClick={() => navigate(`/admin/staff/${staff.id}/edit`)}
              customClass="mt-4 px-8"
              />
          </div>

        )}
      </div>
    </DashboardLayout>
  );
}

export default StaffDetailPage;