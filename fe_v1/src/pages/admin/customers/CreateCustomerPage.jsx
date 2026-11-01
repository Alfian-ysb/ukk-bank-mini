import { useState } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../../../components/DashboardLayout";
import { post } from "../../../api";

const initialForm = {
  nis: "1501",
  student_name: "nama siswa 1",
  major: "DKV",
  cohort_year: "2027",
  password: "123456",
  pin: "123456",
};

function CreateCustomerPage() {
  const [form, setForm] = useState(initialForm);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function change(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  async function submit(event) {
    event.preventDefault();
    setMessage("");
    setError("");

    try {
      const response = await post("/admin/customers", form);
      setMessage(response.message || "Nasabah berhasil ditambahkan.");
      setForm(initialForm);
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  return (
    <DashboardLayout title="Tambah Nasabah">
      <p className="mb-4">
        <Link className="underline" to="/admin/dashboard">
          Kembali ke dashboard
        </Link>
      </p>

      <form className="max-w-md space-y-3 rounded bg-white p-4" onSubmit={submit}>
        <label className="block">
          NIS
          <input className="mt-1 w-full rounded border p-2" name="nis" value={form.nis} onChange={change} required />
        </label>
        <label className="block">
          Nama siswa
          <input className="mt-1 w-full rounded border p-2" name="student_name" value={form.student_name} onChange={change} required />
        </label>
        <label className="block">
          Jurusan
          <input className="mt-1 w-full rounded border p-2" name="major" value={form.major} onChange={change} required />
        </label>
        <label className="block">
          Tahun angkatan
          <input className="mt-1 w-full rounded border p-2" name="cohort_year" value={form.cohort_year} onChange={change} required />
        </label>
        <label className="block">
          Password
          <input className="mt-1 w-full rounded border p-2" type="password" name="password" value={form.password} onChange={change} required />
        </label>
        <label className="block">
          PIN
          <input className="mt-1 w-full rounded border p-2" type="password" name="pin" value={form.pin} onChange={change} maxLength="6" required />
        </label>
        {error && <p className="text-red-600">{error}</p>}
        {message && <p className="text-green-600">{message}</p>}
        <button className="rounded bg-primary px-3 py-2 text-white">
          Simpan nasabah
        </button>
      </form>
    </DashboardLayout>
  );
}

export default CreateCustomerPage;
