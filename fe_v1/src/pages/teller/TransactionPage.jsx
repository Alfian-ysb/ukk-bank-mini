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
    onReset: () => setTransaction({ transaction_type: "deposit", amount: "" }),
  });

  const handleCetakStruk = () => {
    window.print();
  };

  return (
    <DashboardLayout title="Transaksi Teller">
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #area-struk-cetak, #area-struk-cetak * {
            visibility: visible;
          }
          #area-struk-cetak {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
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

      <section className="w-full rounded bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-lg font-semibold print:hidden">Transaksi</h2>

        {message && (
          <div className="mb-4 flex items-center justify-between rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700 print:hidden">
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
          <div className="flex flex-col md:flex-row gap-4 align-top">
            <div className="flex flex-col justify-center gap-4 h-fit flex-4 print:hidden">
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
            
            <div id="area-struk-cetak" className="flex-2 rounded border border-neutral-clay p-4 font-plus-jakarta-sans box-border">
              <h1 className="text-lg font-semibold text-neutral-dark-gray mb-6 print:hidden">
                Struk Transaksi
              </h1>
              <div>
                <section className="flex flex-col gap-1 items-center mt-4">
                  <h2 className="text-lg font-semibold text-neutral-dark-gray text-center">
                    BANK MINI SMK NEGERI 1 BANTUL
                  </h2>
                  <p className="text-sm font-medium text-neutral-light-gray">
                    Bukti {transaction?.transaction_type === "deposit" ? "Setoran Tunai" : "Penarikan Tunai"}
                  </p>
                </section>
                <section className="flex flex-col justify-between mt-4 gap-4">
                  <div>  
                    <ul>
                      {/* <li>Id Transaksi: {transaction?.id || "N/A"}</li> */}
                      <li>Tanggal, Waktu: {new Date().toLocaleString('id-ID', {dateStyle: 'short', timeStyle: 'short'})} WIB</li>
                      <li>No Rekening: {customer?.account_number || "N/A"}</li>
                      <li>Nama: {customer?.student_name || "N/A"}</li>
                      <li>Jurusan: {customer?.major || "N/A"}</li>
                    </ul>
                  </div>
                  <div className="border-t border-neutral-clay py-2">
                    <ul>
                      <li>Saldo awal: Rp {Number(customer?.balance || 0).toLocaleString("id-ID")}</li>
                      <li className="font-semibold">{transaction?.transaction_type === "deposit" ? "Setoran Tunai" : "Penarikan Tunai"} {transaction?.transaction_type === "deposit" ? "+" : "-"} Rp {Number(transaction?.amount || 0).toLocaleString("id-ID")}</li>
                      <li className="font-semibold">Saldo akhir: Rp {Number((customer?.balance || 0) + (transaction?.transaction_type === "deposit" ? Number(transaction?.amount || 0) : -Number(transaction?.amount || 0))).toLocaleString("id-ID")}</li>
                    </ul>
                  </div>
                  <p className="text-sm text-neutral-light-gray text-center">Simpan struk ini sebagai bukti transaksi sah bank mini SMK Negeri 1 Bantul. Terima kasih</p>
                </section>
              </div>
              
              <button 
                id="tombol-cetak"
                onClick={handleCetakStruk}
                disabled={!ACTIVE_STATUSES.includes(transactionStatus)}
                className="disabled:cursor-not-allowed disabled:bg-neutral-700 mt-4 w-full rounded bg-neutral-dark px-4 py-2 text-white hover:bg-neutral-dark-gray cursor-pointer"
              >
                Cetak Struk
              </button>
            </div>
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
