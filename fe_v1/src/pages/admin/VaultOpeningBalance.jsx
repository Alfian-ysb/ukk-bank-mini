import { Link } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";
import VaultOpeningBalanceForm from "../../components/admin/VaultOpeningBalanceForm";

function VaultOpeningBalance() {
  return (
    <DashboardLayout title="Setup Saldo Awal Brankas">

      <div className="max-w-md">
        <VaultOpeningBalanceForm />
      </div>
    </DashboardLayout>
  );
}

export default VaultOpeningBalance;
