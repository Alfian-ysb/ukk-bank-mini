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
    <DashboardLayout title="Personal details">
      <div className="mx-auto max-w-4xl space-y-5 font-inter">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          Personal details
        </h1>
        <Link
          to="/admin/staff"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 transition-colors hover:text-slate-900"
        >
          &larr; Kembali ke daftar staff
        </Link>

        {error && (
          <div
            role="alert"
            className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm font-medium text-rose-800"
          >
            {error}
          </div>
        )}

        {!staff && !error && (
          <div className="flex h-40 items-center justify-center rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-400">
            Memuat detail staff...
          </div>
        )}

        {staff && (
          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-[4px_4px_12px_rgba(0,0,0,0.05)] sm:p-7">
            <header className="mb-6">
              <h2 className="text-base font-semibold text-slate-900">
                Informasi Akun
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Informasi Akun dan akses staff.
              </p>
            </header>

            <dl className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
              {[
                { label: "Username", value: staff.username },
                { label: "Nama lengkap", value: staff.full_name },
                { label: "Role", value: staff.role },
              ].map(({ label, value }) => (
                <div key={label} className="min-w-0">
                  <dt className="mb-1.5 text-xs font-medium text-slate-700">
                    {label}
                  </dt>
                  <dd className="flex min-h-10 items-center rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-800 shadow-xs">
                    {value || "-"}
                  </dd>
                </div>
              ))}
            </dl>

            <div className="mt-7 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-5">
              <Button
                text="Edit"
                onClick={() => navigate(`/admin/staff/${staff.id}/edit`)}
                customClass="min-w-24"
              />
              <Button
                theme="outline"
                text="Kembali"
                onClick={() => navigate("/admin/staff")}
                customClass="min-w-24"
              />
            </div>
          </section>
        )}
      </div>
    </DashboardLayout>
  );
}

export default StaffDetailPage;