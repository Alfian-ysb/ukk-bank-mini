import { useState } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import QrScannerModal from "../../components/teller/QrScannerModal";
import CustomerSearch from "../../components/teller/CustomerSearch";
import useCustomerLookup from "../../hooks/useCustomerLookup";

const SearchCustomerPage = () => {
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
    <DashboardLayout>
      <section className="w-full rounded-lg bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-lg font-semibold">Transaksi</h2>

        {message && (
          <div className="mb-4 flex items-center justify-between rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
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
    </DashboardLayout>
  );
};

export default SearchCustomerPage;
