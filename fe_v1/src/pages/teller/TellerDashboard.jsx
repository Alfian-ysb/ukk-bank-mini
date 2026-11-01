import { Link } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";

function TellerDashboard() {
  return (
    <DashboardLayout title="Dashboard Teller">
      <div className="grid gap-4 md:grid-cols-3">
        <Menu to="/teller/shift" title="Shift" text="Buka atau tutup shift teller." />
        <Menu to="/teller/transaction" title="Transaksi" text="Setor dan tarik uang nasabah." />
        <Menu to="/teller/report" title="Laporan" text="Lihat transaksi berdasarkan tanggal." />
      </div>
    </DashboardLayout>
  );
}

function Menu({ to, title, text }) {
  return (
    <Link className="rounded bg-white p-4 shadow" to={to}>
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="mt-2 text-sm text-gray-600">{text}</p>
    </Link>
  );
}

export default TellerDashboard;
