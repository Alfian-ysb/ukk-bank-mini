import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import DashboardLayout from "../../../components/DashboardLayout";
import AdminForm from "../../../components/admin/AdminForm";
import { get, patch } from "../../../api";

const emptyForm = { username: "", full_name: "", password: "", role: "" };
const fields = [
  { name: "username", label: "Username", required: true },
  { name: "full_name", label: "Nama lengkap", required: true },
  {
    name: "password",
    label: "Password",
    type: "password",
    required: false,
    minLength: 6,
  },
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

function StaffEditPage() {
  const { id } = useParams();
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

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

    const isConfirmed = window.confirm(
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
      <p className="mb-4">
        <Link className="underline" to="/admin/staff">
          Kembali ke daftar
        </Link>
      </p>
      <div className="max-w-xl">
        <AdminForm
          title="Edit staff"
          fields={fields}
          values={form}
          onChange={change}
          onSubmit={submit}
          error={error}
          message={message}
          submitLabel="Simpan perubahan"
        />
      </div>
    </DashboardLayout>
  );
}

export default StaffEditPage;
