import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { clearSession, getStoredRole } from "../context/authSession";
import { post } from "../api";

const DashboardLayout = ({ children, title }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const role = getStoredRole();
  const routeByRole = {
    admin: "/admin/dashboard",
    teller: "/teller/dashboard",
    supervisor: "/supervisor/dashboard",
  };

  if (!role || !routeByRole[role]) {
    navigate("/login");
  }

  const getAppDetails = async () => {
    try {
      
    } catch (error) {
      
    }
  }

  const logout = async () => {
    try {
      await post("/staff/logout");
    } catch {
      // Sesi lokal tetap dihapus jika server sudah tidak dapat diakses.
    } finally {
      clearSession();
      navigate("/login");
    }
  };

  // Daftar menu navigasi berdasarkan peran/role
  const getMenuItems = () => {
    if (role === "admin") {
      return [
        { name: "Dashboard", path: "/admin/dashboard" },
        { name: "Staff", path: "/admin/staff/view" },
        { name: "Nasabah", path: "/admin/customers" },
        { name: "Settings", path: "/admin/settings" },
        { name: "Transaksi", path: "/admin/transactions" },
        { name: "Jurnal", path: "/admin/journals" },
      ];
    } else if (role === "supervisor") {
      return [
        { name: "Dashboard", path: "/supervisor/dashboard" },
        { name: "Nasabah", path: "/supervisor/customers" },
        { name: "Laporan Harian", path: "/supervisor/shifts" },
        { name: "Jurnal Akuntansi", path: "/supervisor/journals" },
        { name: "Log Transaksi", path: "/supervisor/transactions" },
      ];
    } else if (role === "teller") {
      return [
        { name: "Dashboard", path: "/teller/dashboard" },
        { name: "Transaksi", path: "/teller/transaction" },
        { name: "Shift", path: "/teller/shift" },
        { name: "laporan", path: "/teller/report" },
      ];
    }
    return [{ name: "Dashboard", path: routeByRole[role] || "/dashboard" }];
  };

  const menuItems = getMenuItems();

  const roleSubtitle = role
    ? `${role.charAt(0).toUpperCase() + role.slice(1)} Dashboard`
    : "Supervisor Dashboard";

  const sidebarContent = (
    <div className="flex h-full flex-col justify-between p-6">
      <div>
        {/* Brand & Subtitle */}
        <div className="mb-8 pb-4 border-b border-slate-300">
          <h1 className="font-sans text-2xl font-bold tracking-tight text-[#172554]">
            Bank Mini
          </h1>
          <p className="mt-1 text-xs font-medium text-slate-500">
            {roleSubtitle}
          </p>
        </div>

        {/* Menu Navigasi */}
        <nav className="flex flex-col gap-6">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setIsSidebarOpen(false)}
                className={`flex items-center text-sm font-semibold transition-colors ${
                  isActive
                    ? "border-l-4 border-[#172554] pl-3 text-[#172554]"
                    : "pl-4 text-slate-600 hover:text-slate-900"
                }`}
              >
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="pt-6">
        <button
          type="button"
          onClick={logout}
          className="cursor-pointer flex items-center gap-2 text-sm font-bold text-rose-600 hover:text-rose-700 transition-colors"
        >
          <svg width="34" height="34" viewBox="0 0 34 34" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M7.08333 29.75C6.30417 29.75 5.63715 29.4726 5.08229 28.9177C4.52743 28.3628 4.25 27.6958 4.25 26.9167V7.08333C4.25 6.30417 4.52743 5.63715 5.08229 5.08229C5.63715 4.52743 6.30417 4.25 7.08333 4.25H17V7.08333H7.08333V26.9167H17V29.75H7.08333ZM22.6667 24.0833L20.7188 22.0292L24.3312 18.4167H12.75V15.5833H24.3312L20.7188 11.9708L22.6667 9.91667L29.75 17L22.6667 24.0833Z" fill="#BA1A1A"/>
          </svg>

          Logout
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen w-full bg-[#f4f5f7] lg:grid lg:grid-cols-5">
      {/* Header Mobile */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 lg:hidden">
        <button
          type="button"
          onClick={() => setIsSidebarOpen(true)}
          className="rounded-lg bg-[#172554] px-3 py-1.5 text-xs font-semibold text-white"
        >
          Menu
        </button>
        <h1 className="text-base font-bold text-slate-800">
          {title || "Dashboard"}
        </h1>
      </header>

      {/* Sidebar Desktop */}
      <aside className="hidden border-r border-slate-200 bg-[#f8f9fa] lg:col-span-1 lg:block lg:min-h-screen">
        {sidebarContent}
      </aside>

      {/* Sidebar Mobile Overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            aria-label="Close sidebar"
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs"
            onClick={() => setIsSidebarOpen(false)}
          />
          <aside className="relative h-full w-72 max-w-[80%] bg-[#f8f9fa] shadow-xl">
            {sidebarContent}
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <main className="overflow-auto p-4 sm:p-6 lg:col-span-4">{children}</main>
    </div>
  );
};

export default DashboardLayout;