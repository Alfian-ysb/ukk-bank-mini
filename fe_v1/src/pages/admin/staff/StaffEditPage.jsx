import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import DashboardLayout from "../../../components/DashboardLayout";
import { get, patch } from "../../../api";
import Button from "../../../components/Button";
import { useDialog } from "../../../context/dialogContext";

const emptyForm = { username: "", full_name: "", password: "", role: "" };

function StaffEditPage() {
  const { confirmDialog } = useDialog();
  const { id } = useParams();
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    get(`/admin/staff/${id}`)
      .then((response) =>
        setForm({ ...emptyForm, ...response.data, password: "" }),
      )
      .catch((requestError) => setError(requestError.message));
  }, [id]);

  function change(event) {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  }

  async function submit(event) {
    event.preventDefault();

    const isConfirmed = await confirmDialog(
      "Apakah Anda yakin ingin memperbarui staff ini?",
    );
    if (!isConfirmed) {
      return;
    }

    setError("");
    setMessage("");
    try {
      const response = await patch(`/admin/staff/${id}`, form);
      setMessage(response.message || "Staff berhasil diperbarui.");
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  return (
    <DashboardLayout title="Edit Staff">
      <div className="mx-auto max-w-4xl space-y-5 font-inter">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          Personal details
        </h1>
        <Link
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 transition-colors hover:text-slate-900"
          to="/admin/staff"
        >
          &larr; Kembali ke daftar staff
        </Link>

        <form
          className="rounded-lg border border-slate-200 bg-white p-5 shadow-[4px_4px_12px_rgba(0,0,0,0.05)] sm:p-7"
          onSubmit={submit}
        >
          <header className="mb-6">
            <h2 className="text-base font-semibold text-slate-900">
              Informasi Akun
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Perbarui Informasi Akun dan akses staff.
            </p>
          </header>

          {error && (
            <div
              role="alert"
              className="mb-5 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800"
            >
              {error}
            </div>
          )}
          {message && (
            <p
              role="status"
              className="mb-5 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800"
            >
              {message}
            </p>
          )}

          <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
            <label className="block text-xs font-medium text-slate-700">
              Username
              <input
                className="mt-1.5 min-h-10 w-full rounded-md border border-slate-200 px-3 text-sm text-slate-800 shadow-xs outline-none transition focus:border-primary focus:ring-2 focus:ring-blue-100"
                name="username"
                value={form.username}
                onChange={change}
                required
              />
            </label>
            <label className="block text-xs font-medium text-slate-700">
              Nama lengkap
              <input
                className="mt-1.5 min-h-10 w-full rounded-md border border-slate-200 px-3 text-sm text-slate-800 shadow-xs outline-none transition focus:border-primary focus:ring-2 focus:ring-blue-100"
                name="full_name"
                value={form.full_name}
                onChange={change}
                required
              />
            </label>
            <label className="block text-xs font-medium text-slate-700">
              Password baru
              <input
                className="mt-1.5 min-h-10 w-full rounded-md border border-slate-200 px-3 text-sm text-slate-800 shadow-xs outline-none transition focus:border-primary focus:ring-2 focus:ring-blue-100"
                type="password"
                name="password"
                value={form.password}
                onChange={change}
                minLength={6}
                autoComplete="new-password"
                placeholder="Kosongkan jika tidak diubah"
              />
            </label>
            <label className="block text-xs font-medium text-slate-700">
              Role
              <select
                className="mt-1.5 min-h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-800 shadow-xs outline-none transition focus:border-primary focus:ring-2 focus:ring-blue-100"
                name="role"
                value={form.role}
                onChange={change}
                required
              >
                <option value="">Pilih role</option>
                <option value="admin">Admin</option>
                <option value="supervisor">Supervisor</option>
                <option value="teller">Teller</option>
              </select>
            </label>
          </div>

          <div className="mt-7 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-5">
            <Button type="submit" text="Simpan" theme="primary" />
            <Button type="button" text="Batal" theme="outline" onClick={() => navigate("/admin/staff")} />
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}

export default StaffEditPage;
