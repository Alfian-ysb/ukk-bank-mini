import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import "./App.css";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import AdminDashboard from "./pages/admin/AdminDashboard";
import VaultOpeningBalance from "./pages/admin/VaultOpeningBalance";
import StaffManagementPage from "./pages/admin/StaffManagementPage";
import CustomerManagementPage from "./pages/admin/CustomerManagementPage";
import StaffCreatePage from "./pages/admin/StaffCreatePage";
import StaffEditPage from "./pages/admin/StaffEditPage";
import StaffDetailPage from "./pages/admin/StaffDetailPage";
import CustomerCreatePage from "./pages/admin/CustomerCreatePage";
import CustomerEditPage from "./pages/admin/CustomerEditPage";
import CustomerDetailPage from "./pages/admin/CustomerDetailPage";
import SupervisorDashboard from "./pages/supervisor/SupervisorDashboard";
import VaultBalance from "./pages/supervisor/VaultBalance";
import ShiftApproval from "./pages/supervisor/ShiftApproval";
import CustomerLists from "./pages/supervisor/CustomerLists";
import ApprovalDetail from "./pages/supervisor/ApprovalDetail";
import TellerDashboard from "./pages/teller/TellerDashboard";
import ShiftPage from "./pages/teller/ShiftPage";
import TransactionPage from "./pages/teller/TransactionPage";
import ReportPage from "./pages/teller/ReportPage";
import ProtectedRoute from "./context/protectedRoute";
import { getRouteByRole, getStoredRole, isLoggedIn } from "./context/authSession";
import AccountingJournals from "./pages/supervisor/AccountingJournals";
import Transactions from "./pages/supervisor/Transactions";
import AdminVaultBalance from "./pages/admin/AdminVaultBalance";

function App() {
  const home = isLoggedIn() ? getRouteByRole(getStoredRole()) : "/login";

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to={home} replace />} />
        <Route path="/login" element={<Login />} />
        <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/staff" element={<StaffManagementPage />} />
          <Route path="/admin/staff/view" element={<StaffManagementPage />} />
          <Route path="/admin/staff/create" element={<StaffCreatePage />} />
          <Route path="/admin/staff/:id" element={<StaffDetailPage />} />
          <Route path="/admin/staff/:id/edit" element={<StaffEditPage />} />
          <Route path="/admin/customers" element={<CustomerManagementPage />} />
          <Route path="/admin/customers/view" element={<CustomerManagementPage />} />
          <Route path="/admin/customers/create" element={<CustomerCreatePage />} />
          <Route path="/admin/customers/:id" element={<CustomerDetailPage />} />
          <Route path="/admin/customers/:id/edit" element={<CustomerEditPage />} />
          <Route path="/admin/vault/opening-balance" element={<VaultOpeningBalance />} />
          <Route path="/admin/vault" element={<AdminVaultBalance />} />
        </Route>
        <Route element={<ProtectedRoute allowedRoles={["teller"]} />}>
          <Route path="/teller/dashboard" element={<TellerDashboard />} />
          <Route path="/teller/shift" element={<ShiftPage />} />
          <Route path="/teller/transaction" element={<TransactionPage />} />
          <Route path="/teller/report" element={<ReportPage />} />
        </Route>
        <Route element={<ProtectedRoute allowedRoles={["supervisor"]} />}>
          <Route path="/supervisor/dashboard" element={<SupervisorDashboard />} />
          <Route path="/supervisor/vault" element={<VaultBalance />} />
          <Route path="/supervisor/shifts" element={<ShiftApproval />} />
          <Route path="/supervisor/shifts/:id" element={<ApprovalDetail />} />
          <Route path="/supervisor/journals" element={<AccountingJournals />} />
          <Route path="/supervisor/transactions" element={<Transactions />} />
          <Route path="/supervisor/customers" element={<CustomerLists />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
