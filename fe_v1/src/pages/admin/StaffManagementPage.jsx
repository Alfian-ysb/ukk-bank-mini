import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";
import AdminTable from "../../components/admin/AdminTable";
import { get, remove as removeRequest } from "../../api";
import Button from "../../components/Button";

function StaffManagementPage() {
  const [staff, setStaff] = useState([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function loadStaff() {
    const response = await get("/admin/staff");
    setStaff(response.data || []);
  }

  useEffect(() => {
    get("/admin/staff")
      .then((response) => setStaff(response.data || []))
      .catch((requestError) => setError(requestError.message));
  }, []);

  async function deleteStaff(id) {
    if (!window.confirm("Hapus staff ini?")) return;
    try {
      await removeRequest(`/admin/staff/${id}`);
      await loadStaff();
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  const rows = staff.map((item) => [
    item.username,
    item.full_name,
    item.role,
    <div className="flex gap-2" key={item.id}>
      <Button theme={'outline'} text="Lihat" onClick={() => navigate(`/admin/staff/${item.id}`)} />
      <Button text="Edit" onClick={() => navigate(`/admin/staff/${item.id}/edit`)} />
      <Button theme={'danger'} text="Hapus" onClick={() => deleteStaff(item.id)} />
    </div>,
  ]);

  return (
    <DashboardLayout title="Lihat Staff">
      <p className="mb-4"><Link className="underline" to="/admin/dashboard">Kembali ke dashboard</Link></p>
      {error && <p className="mb-4 text-red-600">{error}</p>}
      <Button text="Tambah Staff" onClick={() => navigate("/admin/staff/create")} customClass={'my-4'}/>
      
      <AdminTable
        title="Daftar staff"
        headers={["Username", "Nama", "Role", "Aksi"]}
        rows={rows}
        emptyMessage="Belum ada staff."
      />
    </DashboardLayout>
  );
}

export default StaffManagementPage;
