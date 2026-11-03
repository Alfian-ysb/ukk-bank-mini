import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";
import { get } from "../../api";

const money = (value) => `Rp ${Number(value || 0).toLocaleString("id-ID")}`;

function AdminDashboard() {
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
    <DashboardLayout title="Dashboard Admin">
      {message && <p className="mb-4 text-red-600">{message}</p>}
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
      <div className="grid gap-4 md:grid-cols-2">
        <Shortcut
          to="/admin/vault"
          title="Saldo Brankas"
          text="Lihat saldo, uang masuk, dan uang keluar dari brankas."
        />

        <Shortcut
          to="/admin/customers"
          title="Kelola Nasabah"
          text="Lihat saldo, uang masuk, dan uang keluar dari brankas."
        />
        <Shortcut
          to="/admin/staff"
          title="Kelola Staff"
          text="Lihat data, uang masuk, dan uang keluar dari staff."
        />
        <Shortcut
          to="/admin/settings"
          title="Pengaturan"
          text="Lihat dan ubah pengaturan sistem."
        />
      </div>

    </DashboardLayout>
  );
}

function List({ title, items, empty, render }) {
  return (
    <section className="rounded bg-white p-4">
      <h2 className="mb-2 text-lg font-semibold">{title}</h2>
      {items.length ? (
        <ul className="space-y-2">
          {items.map((item) => (
            <li className="border-b pb-2" key={item.id || item.account_number}>
              {render(item)}
            </li>
          ))}
        </ul>
      ) : (
        <p>{empty}</p>
      )}
    </section>
  );
}

export default AdminDashboard;

function Shortcut({ to, title, text }) {
  return (
    <Link className="rounded bg-white p-4 shadow" to={to}>
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="mt-2 text-sm text-gray-600">{text}</p>
    </Link>
  );
}
