import { useState } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../../../components/DashboardLayout";
import AdminForm from "../../../components/admin/AdminForm";
import { post } from "../../../api";

const emptyForm = { nis: "", student_name: "", major: "", cohort_year: "", pin: "", password: "" };
const fields = [
  { name: "nis", label: "NIS", required: true },
  { name: "student_name", label: "Nama siswa", required: true },
  { name: "major", label: "Jurusan", required: true },
  { name: "cohort_year", label: "Tahun angkatan", required: true },
  { name: "pin", label: "PIN", type: "password", required: true, minLength: 6, maxLength: 6 },
  { name: "password", label: "Password", type: "password", required: true, minLength: 6 },
];

function CustomerCreatePage() {
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  function change(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function submit(event) {
    event.preventDefault();
    setError("");
    setMessage("");
    try {
      const response = await post("/admin/customers", form);
      setMessage(response.message || "Nasabah berhasil ditambahkan.");
      setForm(emptyForm);
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  return (
    <DashboardLayout title="Tambah Nasabah">
      <p className="mb-4"><Link className="underline" to="/admin/customers">Kembali ke daftar</Link></p>
      <div className="max-w-xl mx-auto">
        <AdminForm title="Tambah nasabah" fields={fields} values={form} onChange={change} onSubmit={submit}
          error={error} message={message} submitLabel="Tambah nasabah" />
      </div>
    </DashboardLayout>
  );
}

export default CustomerCreatePage;
