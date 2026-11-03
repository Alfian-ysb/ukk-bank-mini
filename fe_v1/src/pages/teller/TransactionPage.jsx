import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";
import CustomerSearch from "../../components/teller/CustomerSearch";
import CustomerSummary from "../../components/teller/CustomerSummary";
import QrScannerModal from "../../components/teller/QrScannerModal";
import TransactionForm from "../../components/teller/TransactionForm";
import TransactionStatus from "../../components/teller/TransactionStatus";
import { get, post } from "../../api";

const money = (value) => `Rp ${Number(value || 0).toLocaleString("id-ID")}`;
const TRANSACTION_STATUSES = [
  "pending",
  "approved",
  "rejected",
  "expired",
  "completed",
];
const ACTIVE_STATUSES = ["pending", "approved"];
const POLL_INTERVAL = 3000;
const REQUEST_TIMEOUT = 120000;

function getTransactionStatus(payload) {
  const dataStatus = payload?.data?.status || payload?.data?.transaction_status;
  const rootStatus = payload?.transaction_status;
  
  const status = dataStatus || rootStatus;
  
  if (status && TRANSACTION_STATUSES.includes(String(status).toLowerCase())) {
    return String(status).toLowerCase();
  }
  return null;
}

function getStatusEndpoint(payload) {
  // 1. Ambil URL langsung jika Backend sudah menyediakan
  const dynamicUrl =
    payload?.data?.status_url ||
    payload?.data?.status_endpoint ||
    payload?.status_url ||
    payload?.status_endpoint;

  if (dynamicUrl) {
    return dynamicUrl;
  }

  // 2. Ambil ID request dari payload
  const requestId = payload?.data?.request_id;

  // 3. Jika ID ada, susun URL endpoint sesuai route di api.php
  if (requestId) {
    return `/api/teller/transaction-requests/${requestId}`;
  }

  return "";
}

function getErrorMessage(error) {
  switch (error.status) {
    case 401:
      return "Sesi staff tidak valid atau sudah berakhir. Silakan login kembali.";
    case 403:
      return "Anda tidak memiliki izin untuk melakukan transaksi ini.";
    case 404:
      return "Nasabah atau transaksi tidak ditemukan.";
    case 409:
      return error.message || "Transaksi tidak dapat diproses karena konflik data." ;
    case 422:
      return error.message || "Data transaksi tidak valid.";
    default:
      return error.message || "Transaksi gagal diproses.";
  }
}

function TransactionPage() {
  const [accountNumber, setAccountNumber] = useState("");
  const [customer, setCustomer] = useState(null);
  const [transaction, setTransaction] = useState({
    transaction_type: "deposit",
    amount: "",
  });
  const [message, setMessage] = useState("");
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isFindingCustomer, setIsFindingCustomer] = useState(false);
  const [transactionStatus, setTransactionStatus] = useState("");
  const [transactionStatusMessage, setTransactionStatusMessage] = useState("");
  const [statusEndpoint, setStatusEndpoint] = useState("");
  const transactionStartedAt = useRef(0);

  useEffect(() => {
    if (!ACTIVE_STATUSES.includes(transactionStatus)) {
      return undefined;
    }

    let cancelled = false;
    let timeoutId;
    let expiryTimeoutId;

    function expireRequest() {
      if (cancelled) return;
      setTransactionStatus("expired");
      setTransactionStatusMessage(
        "Waktu menunggu persetujuan habis. Periksa status transaksi di backend sebelum mencoba lagi.",
      );
      setStatusEndpoint("");
    }

    async function pollStatus() {
      if (Date.now() - transactionStartedAt.current >= REQUEST_TIMEOUT) {
        expireRequest();
        return;
      }

      try {
        const response = await get(statusEndpoint);
        if (cancelled) return;

        const nextStatus = getTransactionStatus(response);
        if (nextStatus) {
          setTransactionStatus(nextStatus);
          setTransactionStatusMessage(
            response.message ||
              (nextStatus === "pending"
                ? "Transaksi menunggu persetujuan nasabah."
                : ""),
          );
        }

        if (
          ["approved", "completed"].includes(nextStatus) &&
          response.data?.customer_balance !== undefined
        ) {
          setCustomer((currentCustomer) => ({
            ...currentCustomer,
            balance: response.data.customer_balance,
          }));
        }

        if (["approved", "completed", "rejected", "expired"].includes(nextStatus)) {
          setStatusEndpoint("");
          return;
        }
      } catch (error) {
        if (!cancelled) {
          setTransactionStatusMessage(getErrorMessage(error));
        }
      }

      if (!cancelled) {
        timeoutId = window.setTimeout(pollStatus, POLL_INTERVAL);
      }
    }

    expiryTimeoutId = window.setTimeout(expireRequest, REQUEST_TIMEOUT);
    if (statusEndpoint) {
      timeoutId = window.setTimeout(pollStatus, POLL_INTERVAL);
    }
    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
      window.clearTimeout(expiryTimeoutId);
    };
  }, [statusEndpoint, transactionStatus]);

  async function findCustomer(accountNumberToFind = accountNumber) {
    const normalizedAccountNumber = accountNumberToFind.trim();
    if (!normalizedAccountNumber) {
      setMessage("Nomor rekening wajib diisi.");
      return;
    }

    setIsFindingCustomer(true);
    try {
      const response = await post("/teller/customer", {
        account_number: normalizedAccountNumber,
      });
      setCustomer(response.data);
      setMessage("");
    } catch (error) {
      setCustomer(null);
      setMessage(getErrorMessage(error));
    } finally {
      setIsFindingCustomer(false);
    }
  }

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

  async function saveTransaction(event) {
    event.preventDefault();

    const isDeposit = transaction.transaction_type === "deposit";
    const typeLabel = isDeposit ? "SETOR TUNAI (Deposit)" : "PENARIKAN TUNAI";
    const isConfirmed = window.confirm(
      `Apakah Anda yakin ingin memproses transaksi berikut?\n\n` +
        `Nasabah: ${customer.student_name}\n` +
        `Jenis: ${typeLabel}\n` +
        `Nominal: ${money(transaction.amount)}`,
    );
    console.log("User confirmed transaction:", transaction.amount);

    if (!isConfirmed) return;

    try {
      const response = await post(
        `/teller/customer/${customer.id}/transaction`,
        {
          ...transaction,
          amount: Number(transaction.amount),
        },
      );
      const nextStatus = getTransactionStatus(response) || "completed";
      transactionStartedAt.current = Date.now();
      setTransactionStatus(nextStatus);
      setStatusEndpoint(getStatusEndpoint(response));
      setTransactionStatusMessage(
        nextStatus === "pending"
          ? "Transaksi menunggu persetujuan nasabah."
          : response.message ||
            (nextStatus === "completed"
              ? "Transaksi berhasil diselesaikan."
              : ""),
      );

      if (
        ["approved", "completed"].includes(nextStatus) &&
        response.data?.customer_balance !== undefined
      ) {
        setCustomer((currentCustomer) => ({
          ...currentCustomer,
          balance: response.data.customer_balance,
        }));
      }
      setTransaction({ transaction_type: "deposit", amount: "" });
    } catch (error) {
      setTransactionStatus("");
      setStatusEndpoint("");
      setTransactionStatusMessage(getErrorMessage(error));
    }
  }

  return (
    <DashboardLayout title="Transaksi Teller">
      <p className="mb-4">
        <Link className="underline text-neutral-dark-gray hover:text-neutral-dark" to="/teller/dashboard">
          Kembali ke dashboard
        </Link>
      </p>

      <section className="w-full rounded bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-lg font-semibold">Transaksi</h2>
        
        {/* TAMPILAN ERROR MESSAGE */}
        {message && (
          <div className="mb-4 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700 flex justify-between items-center">
            <span>{message}</span>
            <button 
              onClick={() => setMessage("")}
              className="text-red-500 hover:text-red-800 font-bold ml-2"
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
          <div className="mt-4 flex flex-col md:flex-row gap-4">
            <TransactionForm
              transaction={transaction}
              onChange={setTransaction}
              onSubmit={saveTransaction}
              disabled={ACTIVE_STATUSES.includes(transactionStatus)}
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
