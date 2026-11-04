import { Link } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";
import useCustomerLookup from "../../hooks/useCustomerLookup";
import { useState } from "react";
import QrScannerModal from "../../components/teller/QrScannerModal";
import CustomerSearch from "../../components/teller/CustomerSearch";

function TellerDashboard() {
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const {
    accountNumber,
    message,
    isFindingCustomer,
    setAccountNumber,
    setMessage,
    findCustomer,
  } = useCustomerLookup();

  function handleFindCustomer(event) {
    event.preventDefault();
    findCustomer();
  }

  function handleAccountDetected(scannedAccountNumber) {
    setAccountNumber(scannedAccountNumber);
    findCustomer(scannedAccountNumber);
  }

  function handleScannerError(error) {
    setMessage(
      error?.message ||
        "Kamera tidak dapat digunakan. Izinkan akses kamera lalu coba lagi.",
    );
  }

  function handleFindCustomer(event) {
    event.preventDefault();
    findCustomer();
  }
  return (
    <DashboardLayout title="Dashboard Teller">
      <div className="grid gap-4 md:grid-cols-3">
        <Menu
          to="/teller/shift"
          title="Shift"
          text="Buka atau tutup shift teller."
        />
        <Menu
          to="/teller/transaction"
          title="Transaksi"
          text="Setor dan tarik uang nasabah."
        />
        <Menu
          to="/teller/report"
          title="Laporan"
          text="Lihat transaksi berdasarkan tanggal."
        />
      </div>
      <div className="mt-4">
        <section className="w-full rounded bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-lg font-semibold">Cari Nasabah</h2>

        {message && (
          <div className="mb-4 flex items-center justify-between rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            <span>{message}</span>
            <button
              type="button"
              onClick={() => setMessage("")}
              className="ml-2 font-bold text-red-500 hover:text-red-800"
              title="Tutup"
            >
              ✕
            </button>
          </div>
        )}

        <CustomerSearch
          accountNumber={accountNumber}
          isFindingCustomer={isFindingCustomer}
          onAccountNumberChange={setAccountNumber}
          onFind={handleFindCustomer}
          onOpenScanner={() => {
            setMessage("");
            setIsScannerOpen(true);
          }}
        />

        {isScannerOpen && (
          <QrScannerModal
            onClose={() => setIsScannerOpen(false)}
            onError={handleScannerError}
            onAccountDetected={handleAccountDetected}
          />
        )}
      </section>
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
