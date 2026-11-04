import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import DashboardLayout from "../../../components/DashboardLayout";
import AdminForm from "../../../components/admin/AdminForm";
import { get, patch } from "../../../api";

const emptyForm = { nis: "", student_name: "", major: "", cohort_year: "", pin: "", password: "" };

const status = [
  { value: "active", label: "Aktif" },
  { value: "inactive", label: "Nonaktif" },
  { value: "blocked", label: "Diblokir" },
];
const fields = [
  { name: "nis", label: "NIS", required: true },
  { name: "student_name", label: "Nama siswa", required: true },
  { name: "major", label: "Jurusan", required: true },
  { name: "cohort_year", label: "Tahun angkatan", required: true },
  { name: "status", type: "select", label: "Status", required: true, options: status },
  { name: "pin", label: "PIN", type: "password", required: false, minLength: 6, maxLength: 6 },
  { name: "password", label: "Password", type: "password", required: false, minLength: 6 },
];

function CustomerEditPage() {
  const { id } = useParams();
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    get(`/admin/customers/${id}`)
      .then((response) => setForm({ ...emptyForm, ...response.data, pin: "", password: "" }))
      .catch((requestError) => setError(requestError.message));
  }, [id]);

  function change(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function submit(event) {
    event.preventDefault();

    // Konfirmasi sebelum menyimpan data
    const isConfirmed = window.confirm("Apakah Anda yakin ingin menyimpan perubahan data nasabah ini?");
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
      <p className="mb-4">
        <Link className="underline" to="/admin/customers">
          Kembali ke daftar
        </Link>
      </p>
      <div className="max-w-xl">
        <AdminForm
          title="Edit nasabah"
          fields={fields}
          values={form}
          onChange={change}
          onCancel={() => window.history.back()}
          onSubmit={submit}
          error={error}
          message={message}
          submitLabel="Simpan perubahan"
        />
      </div>
    </DashboardLayout>
  );
}

export default CustomerEditPage;