import { Link } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";
import VaultOpeningBalanceForm from "../../components/admin/VaultOpeningBalanceForm";

function VaultOpeningBalance() {
  return (
    <DashboardLayout title="Setup Saldo Awal Brankas">
      <p className="mb-4">
        <Link className="underline" to="/admin/dashboard">
          Kembali ke dashboard
        </Link>
      </p>

      <div className="max-w-md">
        <VaultOpeningBalanceForm />
      </div>
    </DashboardLayout>
  );
}

export default VaultOpeningBalance;
