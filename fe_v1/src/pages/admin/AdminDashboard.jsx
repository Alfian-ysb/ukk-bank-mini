import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";
import { get } from "../../api";

function AdminDashboard() {
  const [staff, setStaff] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;
    Promise.all([get("/admin/staff"), get("/admin/customers")])
      .then(([staffResponse, customerResponse]) => {
        if (active) {
          setStaff(staffResponse.data || []);
          setCustomers(customerResponse.data || []);
        }
      })
      .catch((error) => {
        if (active) setMessage(error.message);
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <DashboardLayout title="Dashboard Admin">
      {message && <p className="mb-4 text-red-600">{message}</p>}
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
