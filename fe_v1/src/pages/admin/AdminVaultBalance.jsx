import { useEffect, useState } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import { get } from "../../api";

const money = (value) => `Rp ${Number(value || 0).toLocaleString("id-ID")}`;
const AdminVaultBalance = () => {
  const [vault, setVault] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    get("/admin/vault/balance")
      .then((response) => {
        setVault(response.data || null);
      })
      .catch((error) => {
        setMessage(error.message);
      });
  }, []);

  return (
    <DashboardLayout title="Informasi Vault">
      {message && <p className="mb-4 text-sm font-medium text-red-600">{message}</p>}

      {vault ? (
        <section className="rounded-lg bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-700">{vault.location}</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-md border bg-gray-50 p-4">
              <p className="text-sm text-gray-500">Saldo Saat Ini</p>
              <p className="text-xl font-bold text-gray-800">{money(vault.balance)}</p>
            </div>
            <div className="rounded-md border bg-green-50 p-4">
              <p className="text-sm text-green-600">Total Masuk</p>
              <p className="text-xl font-bold text-green-700">{money(vault.total_in)}</p>
            </div>
            <div className="rounded-md border bg-red-50 p-4">
              <p className="text-sm text-red-600">Total Keluar</p>
              <p className="text-xl font-bold text-red-700">{money(vault.total_out)}</p>
            </div>
          </div>
        </section>
      ) : (
        <section className="rounded-lg bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Memuat data vault...</p>
        </section>
      )}
    </DashboardLayout>
  );
}

export default AdminVaultBalance

