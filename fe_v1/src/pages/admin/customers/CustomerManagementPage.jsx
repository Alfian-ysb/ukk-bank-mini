import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../../components/DashboardLayout";
import AdminTable from "../../../components/admin/AdminTable";
import { get, patch, remove as removeRequest } from "../../../api";
import Button from "../../../components/Button";
import Pagination from "../../../components/Pagination";
import CustomerCsvImport from "./CustomerCsvImport";

function CustomerManagementPage() {
  const [customers, setCustomers] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");

  const navigate = useNavigate();

  const loadCustomers = useCallback(async (pageNumber) => {
    try {
      setError("");
      setLoading(true);
      const response = await get(`/admin/customers?page=${pageNumber}&per_page=15`);
      setCustomers(response.data || []);
      setPagination(response.pagination || null);
      if (response.pagination?.last_page && pageNumber > response.pagination.last_page) {
        setPage(response.pagination.last_page);
      }
    } catch (requestError) {
      setError(requestError.message);
      setCustomers([]);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCustomers(page);
  }, [loadCustomers, page]);

  async function deleteCustomer(id) {
    if (!window.confirm("Hapus nasabah ini?")) return;
    try {
      await removeRequest(`/admin/customers/${id}`);
      await loadCustomers(page);
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  async function changeStatus(id, newStatus) {
    try {
      await patch(`/admin/customers/${id}`, { status: newStatus });
      await loadCustomers(page);
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  // Filter data nasabah di frontend secara langsung
  const filteredCustomers = customers.filter((item) => {
    const query = searchQuery.toLowerCase();
    return (
      item.account_number?.toString().toLowerCase().includes(query) ||
      item.nis?.toString().toLowerCase().includes(query) ||
      item.student_name?.toLowerCase().includes(query) ||
      item.major?.toLowerCase().includes(query) ||
      item.cohort_year?.toString().toLowerCase().includes(query)
    );
  });

  // Gunakan data hasil filter (`filteredCustomers`) untuk baris tabel
  const rows = filteredCustomers.map((item) => [
    item.account_number,
    item.nis,
    item.student_name,
    item.major,
    item.cohort_year,
    item.status,
    <div className="flex gap-2" key={item.id}>
      <Button
        theme={"outline"}
        text="Lihat"
        onClick={() => navigate(`/admin/customers/${item.id}`)}
      />
      <Button
        text="Edit"
        onClick={() => navigate(`/admin/customers/${item.id}/edit`)}
      />
      <Button
        theme={"danger"}
        text="Hapus"
        onClick={() => deleteCustomer(item.id)}
      />
    </div>,
  ]);

  return (
    <DashboardLayout title="Lihat Nasabah">
      <CustomerCsvImport onImported={() => loadCustomers(page)} />

      <div className="flex justify-between items-center my-4 gap-4">
        <input
          type="text"
          placeholder="Cari nasabah..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setPage(1);
          }}
          className="flex-6 border border-gray-300 rounded-lg px-4 py-2 w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <Button
          customClass="flex-1"
          text="Tambah Nasabah"
          onClick={() => navigate("/admin/customers/create")}
        />
      </div>

      {error && <p className="mb-4 text-red-600">{error}</p>}

      <AdminTable
        title="Daftar nasabah"
        headers={["No. Rekening", "NIS", "Nama", "Jurusan", "Angkatan", "Status", "Aksi"]}
        rows={rows}
        emptyMessage={
          searchQuery ? "Nasabah tidak ditemukan." : "Belum ada nasabah."
        }
      />
      <Pagination
        pagination={pagination}
        onPageChange={setPage}
        disabled={loading}
      />
    </DashboardLayout>
  );
}

export default CustomerManagementPage;
