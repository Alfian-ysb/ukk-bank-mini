import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import DashboardLayout from "../../../components/DashboardLayout";
import AdminTable from "../../../components/admin/AdminTable";
import { get, remove as removeRequest, upload } from "../../../api";
import Button from "../../../components/Button";

function CustomerManagementPage() {
  const [customers, setCustomers] = useState([]);
  const [error, setError] = useState("");
  const [csvFile, setCsvFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  // State untuk pencarian frontend
  const [searchQuery, setSearchQuery] = useState("");

  const navigate = useNavigate();

  async function loadCustomers() {
    try {
      setError("");
      const response = await get("/admin/customers");
      setCustomers(response.data || []);
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  useEffect(() => {
    loadCustomers();
  }, []);

  async function deleteCustomer(id) {
    if (!window.confirm("Hapus nasabah ini?")) return;
    try {
      await removeRequest(`/admin/customers/${id}`);
      await loadCustomers();
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  async function importCustomers() {
    if (!csvFile) return;

    try {
      setError("");
      setIsUploading(true);
      await upload("/admin/customers/import", csvFile);
      setCsvFile(null);
      await loadCustomers();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsUploading(false);
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
      <div className="mb-4 flex flex-wrap items-center gap-3 rounded-lg border border-gray-200 p-3">
        <input
          type="file"
          accept=".csv,.txt,text/csv"
          onChange={(event) => setCsvFile(event.target.files?.[0] || null)}
          disabled={isUploading}
        />
        <Button
          text={isUploading ? "Mengunggah..." : "Upload CSV"}
          onClick={importCustomers}
          disabled={!csvFile || isUploading}
        />
        <Button
          text="Unduh Template CSV"
          theme="outline"
          onClick={() => {
            const link = document.createElement("a");
            link.href = `${import.meta.env.BASE_URL}customersTemplate.csv`;
            link.download = "template-nasabah.csv";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          }}
        />
      </div>

      <div className="flex justify-between items-center my-4 gap-4">
        <input
          type="text"
          placeholder="Cari nasabah..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
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
        headers={["No. Rekening", "NIS", "Nama", "Jurusan", "Angkatan", "Aksi"]}
        rows={rows}
        emptyMessage={
          searchQuery ? "Nasabah tidak ditemukan." : "Belum ada nasabah."
        }
      />
    </DashboardLayout>
  );
}

export default CustomerManagementPage;
