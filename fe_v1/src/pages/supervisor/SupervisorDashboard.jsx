import { Link } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";

function SupervisorDashboard() {
  return (
    <DashboardLayout title="Dashboard Supervisor">
      <div className="grid gap-4 md:grid-cols-2">
        <Shortcut
          to="/supervisor/shifts"
          title="Laporan Harian"
          text="Lihat daftar shift dan approve shift yang sudah ditutup."
        />
        <Shortcut
          to="/supervisor/vault"
          title="Saldo Brankas"
          text="Lihat saldo, uang masuk, dan uang keluar dari brankas."
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
