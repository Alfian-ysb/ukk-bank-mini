import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";
import { get } from "../../api";
import Button from "../../components/Button";

function CustomerDetailPage() {
  const { id } = useParams();
  const [customer, setCustomer] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    get(`/admin/customers/${id}`)
      .then((response) => setCustomer(response.data))
      .catch((requestError) => setError(requestError.message));
  }, [id]);

  return (
    <DashboardLayout title="Detail Nasabah">
      <div className="mx-auto max-w-3xl space-y-4">
        {/* Navigation Breadcrumb */}
        <div>
          <Link
            to="/admin/customers"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
          >
            &larr; Kembali ke daftar nasabah
          </Link>
        </div>

        {/* State Error */}
        {error && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs font-medium text-rose-800">
            {error}
          </div>
        )}

        {/* State Loading */}
        {!customer && !error && (
          <div className="flex h-40 items-center justify-center rounded-2xl border border-slate-200 bg-white text-xs font-medium text-slate-400">
            Memuat detail nasabah...
          </div>
        )}

        {/* Display Record List */}
        {customer && (
          <div className="rounded border border-slate-200 bg-white p-6 shadow-xs">
            {/* Title Section */}
            <div className="mb-5 border-b border-slate-100 pb-3">
              <span className="text-lg font-bold text-neutral-dark-gray">
                Detail Nasabah
              </span>
            </div>

            {/* List Detail Data */}
            <div className="divide-y divide-slate-100 text-sm">
              <div className="flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:justify-between">
                <span className="font-semibold text-neutral-dark-gray capitalize sm:w-1/3">
                  No. Rekening
                </span>
                <span className="font-semibold text-slate-900 sm:w-2/3 sm:text-right font-mono">
                  {customer.account_number || "-"}
                </span>
              </div>

              <div className="flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:justify-between">
                <span className="font-semibold text-neutral-dark-gray capitalize sm:w-1/3">
                  NIS
                </span>
                <span className="font-medium text-slate-900 sm:w-2/3 sm:text-right">
                  {customer.nis || "-"}
                </span>
              </div>

              <div className="flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:justify-between">
                <span className="font-semibold text-neutral-dark-gray capitalize sm:w-1/3">
                  Nama Siswa
                </span>
                <span className="font-medium text-slate-900 sm:w-2/3 sm:text-right">
                  {customer.student_name || "-"}
                </span>
              </div>

              <div className="flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:justify-between">
                <span className="font-semibold text-neutral-dark-gray capitalize sm:w-1/3">
                  Jurusan
                </span>
                <span className="font-medium text-slate-900 sm:w-2/3 sm:text-right">
                  {customer.major || "-"}
                </span>
              </div>

              <div className="flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:justify-between">
                <span className="font-semibold text-neutral-dark-gray capitalize sm:w-1/3">
                  Tahun Angkatan
                </span>
                <span className="font-medium text-slate-900 sm:w-2/3 sm:text-right">
                  {customer.cohort_year || "-"}
                </span>
              </div>

              <div className="flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:justify-between">
                <span className="font-semibold text-neutral-dark-gray capitalize sm:w-1/3">
                  Status
                </span>
                <span className="font-medium text-slate-900 sm:w-2/3 sm:text-right">
                  <span
                    className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${
                      customer.status === "active"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {customer.status || "-"}
                  </span>
                </span>
              </div>

              <div className="flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:justify-between">
                <span className="font-semibold text-neutral-dark-gray capitalize sm:w-1/3">
                  Saldo
                </span>
                <span className="font-bold text-slate-900 sm:w-2/3 sm:text-right">
                  Rp {Number(customer.balance || 0).toLocaleString("id-ID")}
                </span>
              </div>
            </div>

            <Button
              text="Edit"
              onClick={() => navigate(`/admin/customers/${customer.id}/edit`)}
              customClass="mt-4 px-8"
            />
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default CustomerDetailPage;
