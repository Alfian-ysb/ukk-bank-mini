import { useCallback, useState } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";
import CustomerSearch from "../../components/teller/CustomerSearch";
import CustomerSummary from "../../components/teller/CustomerSummary";
import QrScannerModal from "../../components/teller/QrScannerModal";
import TransactionForm from "../../components/teller/TransactionForm";
import TransactionStatus from "../../components/teller/TransactionStatus";
import { ACTIVE_STATUSES } from "./transactionUtils";
import useCustomerLookup from "../../hooks/useCustomerLookup";
import useTransactionStatus from "../../hooks/useTransactionStatus";
import useTransactionSubmission from "../../hooks/useTransactionSubmission";

function TransactionPage() {
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [transaction, setTransaction] = useState({
    transaction_type: "deposit",
    amount: "",
  });
  const [transactionError, setTransactionError] = useState("");
  const {
    accountNumber,
    customer,
    message,
    isFindingCustomer,
    setAccountNumber,
    setCustomer,
    setMessage,
    findCustomer,
  } = useCustomerLookup();
  const {
    status: transactionStatus,
    message: transactionStatusMessage,
    start: startTransactionStatus,
    reset: resetTransactionStatus,
    setMessage: setTransactionStatusMessage,
  } = useTransactionStatus({
    onCustomerBalanceChange: useCallback(
      (balance) => {
        setCustomer((currentCustomer) => ({
          ...currentCustomer,
          balance,
        }));
      },
      [setCustomer],
    ),
  });

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

  const saveTransaction = useTransactionSubmission({
    customer,
    transaction,
    onTransactionStarted: (response) => {
      setTransactionError("");
      return startTransactionStatus(response);
    },
    onTransactionError: (errorMessage) => {
      resetTransactionStatus();
      setTransactionStatusMessage(errorMessage);
      setTransactionError(errorMessage);
    },
    onCustomerBalanceChange: (balance) => {
      setCustomer((currentCustomer) => ({
        ...currentCustomer,
        balance,
      }));
    },
    onReset: () =>
      setTransaction({ transaction_type: "deposit", amount: "" }),
  });

  return (
    <DashboardLayout title="Transaksi Teller">
      <p className="mb-4">
        <Link
          className="text-neutral-dark-gray underline hover:text-neutral-dark"
          to="/teller/dashboard"
        >
          Kembali ke dashboard
        </Link>
      </p>

      <section className="w-full rounded bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-lg font-semibold">Transaksi</h2>

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

        {customer && (
          <div className="mt-4 flex flex-col gap-4 md:flex-row">
            <TransactionForm
              transaction={transaction}
              onChange={setTransaction}
              onSubmit={saveTransaction}
              disabled={ACTIVE_STATUSES.includes(transactionStatus)}
              error={transactionError}
              onClearError={() => setTransactionError("")}
            />
            <CustomerSummary customer={customer} />
          </div>
        )}
      </section>

      <TransactionStatus
        status={transactionStatus}
        message={transactionStatusMessage}
      />
    </DashboardLayout>
  );
}

export default TransactionPage;
