import { useState } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";
import CustomerSearch from "../../components/teller/CustomerSearch";
import CustomerSummary from "../../components/teller/CustomerSummary";
import QrScannerModal from "../../components/teller/QrScannerModal";
import TransactionForm from "../../components/teller/TransactionForm";
import { post } from "../../api";

const money = (value) => `Rp ${Number(value || 0).toLocaleString("id-ID")}`;

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
      setMessage(error.message);
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

    if (!isConfirmed) return;

    try {
      const response = await post(
        `/teller/customer/${customer.id}/transaction`,
        {
          ...transaction,
          amount: Number(transaction.amount),
        },
      );
      setMessage(response.message);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setTransaction({ transaction_type: "deposit", amount: "" });
      setAccountNumber("");
      setCustomer(null);
    }
  }

  return (
    <DashboardLayout title="Transaksi Teller">
      <p className="mb-4">
        <Link className="underline" to="/teller/dashboard">
          Kembali ke dashboard
        </Link>
      </p>
      <section className="w-full rounded bg-white p-4">
        <h2 className="mb-3 text-lg font-semibold">Transaksi</h2>
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
          <div className="mt-4 flex gap-4">
            <TransactionForm
              transaction={transaction}
              onChange={setTransaction}
              onSubmit={saveTransaction}
            />
            <CustomerSummary customer={customer} />
          </div>
        )}
      </section>
      {message && <p className="mt-4">{message}</p>}
    </DashboardLayout>
  );
}

export default TransactionPage;
