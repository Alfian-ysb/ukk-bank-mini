import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import DashboardLayout from "../../../components/DashboardLayout";
import AdminTable from "../../../components/admin/AdminTable";
import { get, remove as removeRequest } from "../../../api";
import Button from "../../../components/Button";

function StaffManagementPage() {
  const [staff, setStaff] = useState([]);
  const [error, setError] = useState("");
  
  const [searchQuery, setSearchQuery] = useState("");

  const navigate = useNavigate();

  async function loadStaff() {
    try {
      setError("");
      const response = await get("/admin/staff");
      setStaff(response.data || []);
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  useEffect(() => {
    loadStaff();
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

  const filteredStaff = staff.filter((item) => {
    const query = searchQuery.toLowerCase();
    return (
      item.username?.toLowerCase().includes(query) ||
      item.full_name?.toLowerCase().includes(query) ||
      item.role?.toLowerCase().includes(query)
    );
  });

  const rows = filteredStaff.map((item) => [
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
      <h1 className="text-2xl font-bold">Daftar Staff</h1>
      {error && <p className="mb-4 text-red-600">{error}</p>}
      
      <div className="flex justify-between items-center my-4 gap-4">
        <input
          type="text"
          placeholder="Cari staff..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-6 border border-gray-300 rounded-lg px-4 py-2 w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <Button customClass="flex-1" text="Tambah Staff" onClick={() => navigate("/admin/staff/create")} />
      </div>
      
      <AdminTable
        title="Daftar staff"
        headers={["Username", "Nama", "Role", "Aksi"]}
        rows={rows}
        emptyMessage={searchQuery ? "Staff tidak ditemukan." : "Belum ada staff."}
      />
    </DashboardLayout>
  );
}

export default StaffManagementPage;