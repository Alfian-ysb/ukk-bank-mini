import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import DashboardLayout from "../../../components/DashboardLayout";
import AdminForm from "../../../components/admin/AdminForm";
import { post } from "../../../api";

const emptyForm = {
  nis: "",
  student_name: "",
  major: "",
  cohort_year: "",
  pin: "",
  password: "",
};
const fields = [
  { name: "nis", label: "NIS", required: true },
  { name: "student_name", label: "Nama siswa", required: true },
  {
    name: "major",
    label: "Jurusan",
    type: "select",
    required: true,
    options: [
      { value: "RPL", label: "RPL" },
      { value: "TKJ", label: "TKJ" },
      { value: "DKV", label: "DKV" },
      { value: "AKL", label: "AKL" },
      { value: "MP", label: "MP" },
      { value: "LPS", label: "LPS" },
      { value: "BD", label: "BD" },
      { value: "BR", label: "BR" },
    ],
  },
  { name: "cohort_year", label: "Tahun angkatan", required: true },
  {
    name: "pin",
    label: "PIN",
    type: "password",
    required: true,
    minLength: 6,
    maxLength: 6,
  },
  {
    name: "password",
    label: "Password",
    type: "password",
    required: true,
    minLength: 6,
  },
];

function CustomerCreatePage() {
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  function change(event) {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  }

  async function submit(event) {
    event.preventDefault();

    const isConfirmed = window.confirm(
      "Apakah Anda yakin ingin menambahkan nasabah ini?",
    );
    if (!isConfirmed) {
      return;
    }

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
      {/* <p className="mb-4"><Link className="underline" to="/admin/customers">Kembali ke daftar</Link></p> */}
      <div className="w-full h-full flex items-center justify-center">
        <div className="max-w-xl  w-full mx-auto">
          <AdminForm
            title="Tambah nasabah"
            fields={fields}
            values={form}
            onChange={change}
            onSubmit={submit}
            onCancel={() => navigate("/admin/customers")}
            onReset={() => setForm(emptyForm)}
            error={error}
            message={message}
            submitLabel="Tambah nasabah"
          />
        </div>
      </div>
    </DashboardLayout>
  );
}

export default CustomerCreatePage;
