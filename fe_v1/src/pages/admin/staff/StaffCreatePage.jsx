import { useState } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../../../components/DashboardLayout";
import AdminForm from "../../../components/admin/AdminForm";
import { post } from "../../../api";

const emptyForm = { username: "", full_name: "", password: "", role: "" };
const fields = [
  { name: "username", label: "Username", required: true },
  { name: "full_name", label: "Nama lengkap", required: true },
  { name: "password", label: "Password", type: "password", required: true, minLength: 6 },
  {
    name: "role",
    label: "Role",
    type: "select",
    required: true,
    options: [
      { value: "admin", label: "Admin" },
      { value: "supervisor", label: "Supervisor" },
      { value: "teller", label: "Teller" },
    ],
  },
];

function StaffCreatePage() {
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
      const response = await post("/admin/staff", form);
      setMessage(response.message || "Staff berhasil ditambahkan.");
      setForm(emptyForm);
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  return (
    <DashboardLayout title="Tambah Staff">
      <p className="mb-4"><Link className="underline" to="/admin/staff">Kembali ke daftar</Link></p>
      <div className="max-w-xl mx-auto">
        <AdminForm title="Tambah staff" fields={fields} values={form} onChange={change} onSubmit={submit}
          error={error} message={message} submitLabel="Tambah staff" />
      </div>
    </DashboardLayout>
  );
}

export default StaffCreatePage;
