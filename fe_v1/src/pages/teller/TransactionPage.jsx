import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";
import CustomerSummary from "../../components/teller/CustomerSummary";
import TransactionForm from "../../components/teller/TransactionForm";
import TransactionStatus from "../../components/teller/TransactionStatus";
import { ACTIVE_STATUSES } from "./transactionUtils";
import useCustomerLookup from "../../hooks/useCustomerLookup";
import useTransactionStatus from "../../hooks/useTransactionStatus";
import useTransactionSubmission from "../../hooks/useTransactionSubmission";

function TransactionPage() {
  const { custId } = useParams();
  const [transaction, setTransaction] = useState({
    transaction_type: "deposit",
    amount: "",
  });
  const [receiptTransaction, setReceiptTransaction] = useState(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [transactionError, setTransactionError] = useState("");
  const { customer, message, setCustomer, setMessage, findCustomerById } =
    useCustomerLookup();

  useEffect(() => {
    findCustomerById(custId);
  }, [custId, findCustomerById]);

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
  const saveTransaction = useTransactionSubmission({
    customer,
    transaction,
    onTransactionStarted: (response, submittedTransaction) => {
      setTransactionError("");
      setIsReceiptOpen(false);
      setReceiptTransaction({
        transaction: submittedTransaction,
        openingBalance: Number(customer?.balance || 0),
      });
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
    onReset: () => setTransaction({ transaction_type: "deposit", amount: "" }),
  });

  const handleCetakStruk = () => {
    window.print();
  };

  const formatCurrency = (value) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Number(value || 0));

  const formattedDate = new Date().toLocaleString("id-ID", {
    dateStyle: "short",
    timeStyle: "short",
  });

  const displayedTransaction = receiptTransaction?.transaction || transaction;
  const isTransactionSuccessful = ["approved", "completed"].includes(
    transactionStatus,
  );
  const nominalTransaksi = Number(displayedTransaction?.amount || 0);
  const saldoAwal =
    receiptTransaction?.openingBalance ?? Number(customer?.balance || 0);
  const saldoAkhir =
    saldoAwal +
    (displayedTransaction?.transaction_type === "deposit"
      ? nominalTransaksi
      : -nominalTransaksi);

  return (
    <DashboardLayout title="Transaksi Teller">
      <style>{`
            @page {
              size: 80mm auto;
              margin: 0 auto;
            }

            @media print {
              body {
                background: #fff;
                margin: 0;
                padding: 0;
              }

              body * {
                visibility: hidden;
              }

              #area-struk-cetak, #area-struk-cetak * {
                visibility: visible;
              }

              #area-struk-cetak {
                position: absolute;
                top: 0;
                left: 0;
                width: 80mm;
                margin: 0;
                padding: 20px;
                border: none;
                box-shadow: none;
                background: #fff;
              }

              #tombol-cetak {
                display: none !important;
              }
            }
      `}</style>

      <p className="mb-4 print:hidden">
        <Link
          className="text-neutral-dark-gray underline hover:text-neutral-dark"
          to="/teller/dashboard"
        >
          Kembali ke dashboard
        </Link>
      </p>

      <section className="w-full rounded-lg bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-lg font-semibold print:hidden">Transaksi</h2>

        {message && (
          <div className="mb-4 flex items-center justify-between rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 print:hidden">
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
        {customer && (
          <div className="flex flex-col gap-4 align-top md:flex-row">
            <div className="flex-4 h-fit flex flex-col justify-center gap-4 print:hidden">
              <CustomerSummary customer={customer} />
              <TransactionForm
                transaction={transaction}
                onChange={setTransaction}
                onSubmit={saveTransaction}
                disabled={ACTIVE_STATUSES.includes(transactionStatus)}
                error={transactionError}
                onClearError={() => setTransactionError("")}
              />
            </div>

          </div>
        )}
      </section>

      <TransactionStatus
        status={transactionStatus}
        message={transactionStatusMessage}
      >
        {receiptTransaction && isTransactionSuccessful && (
          <button
            type="button"
            onClick={() => setIsReceiptOpen(true)}
            className="cursor-pointer rounded-lg bg-slate-900 px-4 py-2 font-semibold text-white transition hover:bg-slate-700"
          >
            Lihat Struk
          </button>
        )}
      </TransactionStatus>

      {isReceiptOpen && receiptTransaction && isTransactionSuccessful && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 print:block print:bg-transparent print:p-0"
          role="dialog"
          aria-modal="true"
          aria-labelledby="judul-popup-struk"
        >
          <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-4 shadow-xl print:max-h-none print:w-auto print:max-w-none print:overflow-visible print:rounded-none print:p-0 print:shadow-none">
            <div className="mb-3 flex items-center justify-between print:hidden">
              <h2
                id="judul-popup-struk"
                className="text-lg font-semibold text-slate-900"
              >
                Struk Transaksi
              </h2>
              <button
                type="button"
                onClick={() => setIsReceiptOpen(false)}
                className="cursor-pointer rounded px-2 py-1 font-bold text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                aria-label="Tutup struk"
              >
                ✕
              </button>
            </div>
            <div
              id="area-struk-cetak"
              className="box-border rounded-2xl border border-slate-200 bg-white p-4 font-plus-jakarta-sans text-slate-800 shadow-sm print:rounded-none print:border-none print:p-0 print:shadow-none"
            >
              <div className="mb-4 border-b border-dashed border-slate-300 pb-3 text-center print:hidden">
                <h1 className="text-lg font-bold text-neutral-dark-gray">
                  Struk Transaksi
                </h1>
              </div>

              <header className="text-center">
                <h2 className="text-lg font-bold uppercase tracking-wide text-slate-900">
                  Bank Mini
                </h2>
                <p className="text-xs font-medium uppercase tracking-[0.12em] text-slate-500">
                  SMK Negeri 1 Bantul
                </p>
                <p className="mt-2 text-sm font-semibold text-slate-700">
                  {displayedTransaction?.transaction_type === "deposit"
                    ? "Bukti Setoran Tunai"
                    : "Bukti Penarikan Tunai"}
                </p>
              </header>

              <div className="mt-4 space-y-3">
                <div className="grid gap-2 text-[13px]">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-slate-500">Tanggal</span>
                    <span className="font-medium text-slate-800">
                      {formattedDate} WIB
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-slate-500">No Rekening</span>
                    <span className="font-medium text-slate-800">
                      {customer?.account_number || "N/A"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-slate-500">Nama</span>
                    <span className="font-medium text-slate-800">
                      {customer?.student_name || "N/A"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-slate-500">Jurusan</span>
                    <span className="font-medium text-slate-800">
                      {customer?.major || "N/A"}
                    </span>
                  </div>
                </div>

                <div className="border-y border-dashed border-slate-300 py-3">
                  <div className="space-y-2 text-[13px]">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-slate-500">Saldo awal</span>
                      <span className="font-medium text-slate-800">
                        {formatCurrency(saldoAwal)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-slate-500">
                        {displayedTransaction?.transaction_type === "deposit"
                          ? "Setoran"
                          : "Penarikan"}
                      </span>
                      <span
                        className={`font-semibold ${
                          displayedTransaction?.transaction_type === "deposit"
                            ? "text-emerald-600"
                            : "text-amber-600"
                        }`}
                      >
                        {displayedTransaction?.transaction_type === "deposit"
                          ? "+"
                          : "-"}
                        {formatCurrency(nominalTransaksi)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl bg-slate-100 p-3">
                  <div className="flex items-center justify-between gap-3 text-sm font-bold text-slate-900">
                    <span>Saldo akhir</span>
                    <span>{formatCurrency(saldoAkhir)}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 border-t border-dashed border-slate-300 pt-3 text-center">
                <p className="text-[11px] leading-relaxed text-slate-500">
                  Simpan struk ini sebagai bukti transaksi sah Bank Mini SMK
                  Negeri 1 Bantul.
                  <br />
                  Terima kasih atas kepercayaan Anda.
                </p>
              </div>

              <button
                id="tombol-cetak"
                onClick={handleCetakStruk}
                className="mt-4 w-full cursor-pointer rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-500"
              >
                Cetak Struk
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

export default TransactionPage;
