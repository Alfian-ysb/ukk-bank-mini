import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../../components/DashboardLayout";
import AdminTable from "../../../components/admin/AdminTable";
import { get, patch } from "../../../api";
import Button from "../../../components/Button";
import Pagination from "../../../components/Pagination";
import { useDialog } from "../../../context/dialogContext";
import { getStoredUser } from "../../../context/authSession";

function StaffManagementPage() {
  const { confirmDialog } = useDialog();
  const currentUser = getStoredUser();
  const [staff, setStaff] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [updatingStaffId, setUpdatingStaffId] = useState(null);

  const navigate = useNavigate();

  const loadStaff = useCallback(async (pageNumber) => {
    try {
      setError("");
      setLoading(true);
      const response = await get(`/admin/staff?page=${pageNumber}&per_page=15`);
      setStaff(response.data || []);
      setPagination(response.pagination || null);
      if (response.pagination?.last_page && pageNumber > response.pagination.last_page) {
        setPage(response.pagination.last_page);
      }
    } catch (requestError) {
      setError(requestError.message);
      setStaff([]);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStaff(page);
  }, [loadStaff, page]);

  async function changeStaffStatus(item, newStatus) {
    const isActive = newStatus === "active";
    const confirmation = await confirmDialog(
      `${isActive ? "Aktifkan kembali" : "Nonaktifkan"} staff ${item.full_name}?${
        isActive ? "" : " Staff tidak dapat login lagi."
      }`,
      {
        title: "Konfirmasi perubahan status",
        confirmLabel: isActive ? "Aktifkan" : "Nonaktifkan",
        tone: isActive ? "primary" : "danger",
      },
    );

    if (!confirmation) return;

    setUpdatingStaffId(item.id);
    try {
      await patch(
        `/admin/staff/${item.id}/${isActive ? "activate" : "deactivate"}`,
      );
      await loadStaff(page);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setUpdatingStaffId(null);
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
    item.is_active ? "Aktif" : "Nonaktif",
    <div className="flex flex-wrap gap-2" key={item.id}>
      <Button
        theme="outline"
        text="Lihat"
        onClick={() => navigate(`/admin/staff/${item.id}`)}
      />
      {item.is_active && (
        <Button
          text="Edit"
          onClick={() => navigate(`/admin/staff/${item.id}/edit`)}
        />
      )}
      <select
        aria-label={`Ubah status ${item.full_name}`}
        value={item.is_active ? "active" : "inactive"}
        disabled={
          loading ||
          updatingStaffId === item.id ||
          Number(item.id) === Number(currentUser?.id)
        }
        onChange={(event) => changeStaffStatus(item, event.target.value)}
        className="min-h-10 cursor-pointer rounded-lg border border-primary bg-white px-3 py-2 text-sm font-medium text-neutral-dark-gray focus:outline-none focus:ring-2 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-60"
      >
        <option value="active">Aktif</option>
        <option value="inactive">Nonaktif</option>
      </select>
    </div>,
  ]);

  return (
    <DashboardLayout title="Lihat Staff">
      <h1 className="text-2xl font-bold">Daftar Staff</h1>
      {error && <p className="mb-4 text-red-600">{error}</p>}
      
      <div className="flex justify-between items-center my-4 gap-4 flex-col sm:flex-row">  
        <input
          type="text"
          placeholder="Cari staff..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setPage(1);
          }}
          className="flex-6 border border-gray-300 rounded-lg px-4 py-2 w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <Button customClass="flex-1 text-nowrap w-full" text="Tambah Staff" onClick={() => navigate("/admin/staff/create")} />
      </div>
      
      <AdminTable
        title="Daftar staff"
        headers={["Username", "Nama", "Role", "Status", "Aksi"]}
        rows={rows}
        emptyMessage={searchQuery ? "Staff tidak ditemukan." : "Belum ada staff."}
      />
      <Pagination
        pagination={pagination}
        onPageChange={setPage}
        disabled={loading}
      />
    </DashboardLayout>
  );
}

export default StaffManagementPage;