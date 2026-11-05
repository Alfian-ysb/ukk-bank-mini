import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import DashboardLayout from "../../../components/DashboardLayout";
import { get, patch } from "../../../api";
import Button from "../../../components/Button";

const emptyForm = {
  nis: "",
  student_name: "",
  major: "",
  cohort_year: "",
  pin: "",
  password: "",
};

function CustomerEditPage() {
  const { id } = useParams();
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    get(`/admin/customers/${id}`)
      .then((response) =>
        setForm({ ...emptyForm, ...response.data, pin: "", password: "" }),
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

    // Konfirmasi sebelum menyimpan data
    const isConfirmed = window.confirm(
      "Apakah Anda yakin ingin menyimpan perubahan data nasabah ini?",
    );
    if (!isConfirmed) return;

    setError("");
    setMessage("");

    // Salin objek form untuk memanipulasi payload
    const payload = { ...form };

    // Hapus pin & password dari payload jika nilainya kosong
    if (!payload.pin || payload.pin.trim() === "") {
      delete payload.pin;
    }
    if (!payload.password || payload.password.trim() === "") {
      delete payload.password;
    }

    try {
      const response = await patch(`/admin/customers/${id}`, payload);
      setMessage(response.message || "Nasabah berhasil diperbarui.");
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  return (
    <DashboardLayout title="Edit Nasabah">
      <div className="mx-auto max-w-4xl space-y-5 font-inter">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          Personal details
        </h1>
        <Link
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 transition-colors hover:text-slate-900"
          to="/admin/customers"
        >
          &larr; Kembali ke daftar nasabah
        </Link>

        <form
          className="rounded-lg border border-slate-200 bg-white p-5 shadow-[4px_4px_12px_rgba(0,0,0,0.05)] sm:p-7"
          onSubmit={submit}
        >
          <header className="mb-6">
            <h2 className="text-base font-semibold text-slate-900">
              Account Information
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Perbarui informasi pribadi dan rekening nasabah.
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
              NIS
              <input
                className="mt-1.5 min-h-10 w-full rounded-md border border-slate-200 px-3 text-sm text-slate-800 shadow-xs outline-none transition focus:border-primary focus:ring-2 focus:ring-blue-100"
                name="nis"
                value={form.nis}
                onChange={change}
                required
              />
            </label>
            <label className="block text-xs font-medium text-slate-700">
              Nama siswa
              <input
                className="mt-1.5 min-h-10 w-full rounded-md border border-slate-200 px-3 text-sm text-slate-800 shadow-xs outline-none transition focus:border-primary focus:ring-2 focus:ring-blue-100"
                name="student_name"
                value={form.student_name}
                onChange={change}
                required
              />
            </label>
            <label className="block text-xs font-medium text-slate-700">
              Jurusan
              <input
                className="mt-1.5 min-h-10 w-full rounded-md border border-slate-200 px-3 text-sm text-slate-800 shadow-xs outline-none transition focus:border-primary focus:ring-2 focus:ring-blue-100"
                name="major"
                value={form.major}
                onChange={change}
                required
              />
            </label>
            <label className="block text-xs font-medium text-slate-700">
              Tahun angkatan
              <input
                className="mt-1.5 min-h-10 w-full rounded-md border border-slate-200 px-3 text-sm text-slate-800 shadow-xs outline-none transition focus:border-primary focus:ring-2 focus:ring-blue-100"
                name="cohort_year"
                type="number"
                min="2000"
                max={new Date().getFullYear() + 3}
                step="1"
                placeholder="Contoh: 2023"
                value={form.cohort_year}
                onChange={change}
                required
              />
            </label>
            <label className="block text-xs font-medium text-slate-700 sm:col-span-2">
              Status
              <select
                className="mt-1.5 min-h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-800 shadow-xs outline-none transition focus:border-primary focus:ring-2 focus:ring-blue-100"
                name="status"
                value={form.status || ""}
                onChange={change}
                required
              >
                <option value="">Pilih status</option>
                <option value="active">Aktif</option>
                <option value="inactive">Nonaktif</option>
                <option value="blocked">Diblokir</option>
              </select>
            </label>
          </div>

          <div className="mt-7 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-5">
            <Button type="submit" text="Simpan" theme="primary" />
            <Button text="Batal" theme="outline" onClick={() => navigate(`/admin/customers/${id}`)} />
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}

export default CustomerEditPage;
