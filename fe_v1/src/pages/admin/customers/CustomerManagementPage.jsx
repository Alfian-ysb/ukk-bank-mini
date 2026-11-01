import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import DashboardLayout from "../../../components/DashboardLayout";
import AdminTable from "../../../components/admin/AdminTable";
import { get, remove as removeRequest } from "../../../api";
import Button from "../../../components/Button";

function CustomerManagementPage() {
  const [customers, setCustomers] = useState([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function loadCustomers() {
    const response = await get("/admin/customers");
    setCustomers(response.data || []);
  }

  useEffect(() => {
    get("/admin/customers")
      .then((response) => setCustomers(response.data || []))
      .catch((requestError) => setError(requestError.message));
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

  const rows = customers.map((item) => [
    item.account_number,
    item.nis,
    item.student_name,
    item.major,
    item.cohort_year,
    `Rp ${Number(item.balance || 0).toLocaleString("id-ID")}`,
    <div className="flex gap-2" key={item.id}>
      <Button theme={'outline'} text="Lihat" onClick={() => navigate(`/admin/customers/${item.id}`)} />
      <Button text="Edit" onClick={() => navigate(`/admin/customers/${item.id}/edit`)} />
      <Button theme={'danger'} text="Hapus" onClick={() => deleteCustomer(item.id)} />
    </div>,
  ]);

  return (
    <DashboardLayout title="Lihat Nasabah">
      <p className="mb-4"><Link className="underline" to="/admin/dashboard">Kembali ke dashboard</Link></p>
      <Button text="Tambah nasabah" onClick={() => navigate("/admin/customers/create")} customClass={'my-4'}/>
      {error && <p className="mb-4 text-red-600">{error}</p>}
      <AdminTable
        title="Daftar nasabah"
        headers={["No. Rekening", "NIS", "Nama", "Jurusan", "Angkatan", "Saldo", "Aksi"]}
        rows={rows}
        emptyMessage="Belum ada nasabah."
      />
    </DashboardLayout>
  );
}

export default CustomerManagementPage;
