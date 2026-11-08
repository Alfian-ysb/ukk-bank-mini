import { Link } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";
import { get } from "../../api";
import { useEffect, useState } from "react";

const money = (value) => `Rp ${Number(value || 0).toLocaleString("id-ID")}`;

function SupervisorDashboard() {
  const [vault, setVault] = useState(null);
  const [message, setMessage] = useState("");
  const [userCountData, setUserCountData] = useState([]);

  const userCount = async () => {
    try {
      const res = await get("/supervisor/settings/total-users");
      setUserCountData(res.data);
    } catch (error) {
      setMessage(error.message);
    }
  };

  useEffect(() => {
    userCount();
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

        <h2 className="mb-4 text-2xl font-inter font-semibold text-neutral-dark-gray">
          Dashboard
        </h2>
        {vault ? (
          <section className="rounded-lg bg-white shadow-[4px_4px_12px_rgba(0,0,0,0.05)] font-inter">
            <div className="grid sm:grid-cols-4 rounded-lg outline outline-neutral-clay/20">
              <div className="border-neutral-clay p-5">
                <p className="text-sm font-medium text-gray-500">
                  Saldo Saat Ini
                </p>
                <p className="text-2xl font-bold text-gray-800">
                  {money(vault.balance)}
                </p>
              </div>
              <div className="border-x-2 border-neutral-clay/30 p-5">
                <p className="text-sm font-medium text-green-600">
                  Total Masuk
                </p>
                <p className="text-2xl font-bold text-green-700">
                  {money(vault.total_in)}
                </p>
              </div>
              <div className="border-neutral-clay p-5 border-r-2 border-r-neutral-clay/30">
                <p className="text-sm font-medium text-red-600">Total Keluar</p>
                <p className="text-2xl font-bold text-red-700">
                  {money(vault.total_out)}
                </p>
              </div>
              <div className="border-neutral-clay p-5">
                <p className="text-sm font-medium ">Total Nasabah</p>
                <p className="text-2xl font-bold ">
                  {userCountData?.total_customer || 0}
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
    <Link
      className="rounded-lg bg-white p-4 outline outline-neutral-clay/20 shadow-[4px_4px_12px_rgba(0,0,0,0.05)] hover:scale-101 transition-all duration-150"
      to={to}
    >
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="mt-2 text-sm text-gray-600">{text}</p>
    </Link>
  );
}

export default SupervisorDashboard;
