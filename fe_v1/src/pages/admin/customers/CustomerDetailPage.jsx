import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import DashboardLayout from "../../../components/DashboardLayout";
import { get } from "../../../api";
import Button from "../../../components/Button";

function CustomerDetailPage() {
  const { id } = useParams();
  const [customer, setCustomer] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    get(`/admin/customers/${id}`)
      .then((response) => setCustomer(response.data))
      .catch((requestError) => setError(requestError.message));
  }, [id]);

  const details = customer
    ? [
        { label: "Nama siswa", value: customer.student_name },
        { label: "NIS", value: customer.nis },
        { label: "No. rekening", value: customer.account_number },
        { label: "Email", value: customer.email },
        { label: "Jurusan", value: customer.major },
        { label: "Tahun angkatan", value: customer.cohort_year },
        { label: "Status", value: customer.status },
        {
          label: "Saldo",
          value: `Rp ${Number(customer.balance || 0).toLocaleString("id-ID")}`,
        },
      ]
    : [];

  return (
    <DashboardLayout title="Detail Nasabah">
      <div className="mx-auto max-w-4xl space-y-5 font-inter">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          Detail Nasabah
        </h1>

        <Link
          to="/admin/customers"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 transition-colors hover:text-slate-900"
        >
          &larr; Kembali ke daftar nasabah
        </Link>

        {error && (
          <div
            role="alert"
            className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm font-medium text-rose-800"
          >
            {error}
          </div>
        )}

        {!customer && !error && (
          <div className="flex h-40 items-center justify-center rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-400">
            Memuat detail nasabah...
          </div>
        )}

        {customer && (
          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-[4px_4px_12px_rgba(0,0,0,0.05)] sm:p-7">
            <header className="mb-6">
              <h2 className="text-base font-semibold text-slate-900">
                Informasi Akun
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Informasi ini berisi data pribadi dan rekening nasabah.
              </p>
            </header>

            <dl className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
              {details.map(({ label, value }) => (
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
                onClick={() => navigate(`/admin/customers/${customer.id}/edit`)}
                customClass="min-w-24"
              />
              <Button
                theme="outline"
                text="Kembali"
                onClick={() => navigate("/admin/customers")}
                customClass="min-w-24"
              />
            </div>
          </section>
        )}
      </div>
    </DashboardLayout>
  );
}

export default CustomerDetailPage;
