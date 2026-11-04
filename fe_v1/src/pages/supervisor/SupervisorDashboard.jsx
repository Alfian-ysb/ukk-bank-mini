import { Link } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";
import { get } from "../../api";
import { useEffect, useState } from "react";

const money = (value) => `Rp ${Number(value || 0).toLocaleString("id-ID")}`;


function SupervisorDashboard() {
  const [vault, setVault] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    get("/supervisor/vault/balance")
      .then((response) => {
        setVault(response.data || null);
      })
      .catch((error) => {
        setMessage(error.message);
      });
  }, []);
  return (
    <DashboardLayout title="Dashboard Supervisor">
      <div>
        {message && (
          <p className="mb-4 text-sm font-medium text-red-600">{message}</p>
        )}

        {vault ? (
          <section className="rounded-lg bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-gray-700">
              {vault.location}
            </h2>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-md border bg-gray-50 p-4">
                <p className="text-sm text-gray-500">Saldo Saat Ini</p>
                <p className="text-xl font-bold text-gray-800">
                  {money(vault.balance)}
                </p>
              </div>
              <div className="rounded-md border bg-green-50 p-4">
                <p className="text-sm text-green-600">Total Masuk</p>
                <p className="text-xl font-bold text-green-700">
                  {money(vault.total_in)}
                </p>
              </div>
              <div className="rounded-md border bg-red-50 p-4">
                <p className="text-sm text-red-600">Total Keluar</p>
                <p className="text-xl font-bold text-red-700">
                  {money(vault.total_out)}
                </p>
              </div>
            </div>
          </section>
        ) : (
          <section className="rounded-lg bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Memuat data vault...</p>
          </section>
        )}
      </div>
      <div className="grid gap-4 md:grid-cols-2 mt-4">
        <Shortcut
          to="/supervisor/shifts"
          title="Laporan Harian"
          text="Lihat daftar shift dan approve shift yang sudah ditutup."
        />
        <Shortcut
          to="/supervisor/journals"
          title="Jurnal akuntansi"
          text="Lihat jurnal akuntansi dan transaksi operasional."
        />
        <Shortcut
          to="/supervisor/transactions"
          title="Transaksi"
          text="Lihat jurnal akuntansi dan transaksi operasional."
        />
        <Shortcut
          to="/supervisor/customers"
          title="Daftar Nasabah"
          text="Lihat data nasabah."
        />
      </div>
    </DashboardLayout>
  );
}

function Shortcut({ to, title, text }) {
  return (
    <Link className="rounded bg-white p-4 shadow" to={to}>
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="mt-2 text-sm text-gray-600">{text}</p>
    </Link>
  );
}

export default SupervisorDashboard;
