import { useEffect, useState } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import { get } from "../../api";

const JournalReport = () => {
  const [journals, setJournals] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    Promise.allSettled([
      get("/supervisor/journals"),
      get("/supervisor/transactions"),
    ]).then((results) => {
      const [journalResult, transactionResult] = results;

      setJournals(journalResult.status === "fulfilled" ? journalResult.value.data || [] : []);
      setTransactions(transactionResult.status === "fulfilled" ? transactionResult.value.data || [] : []);

      const errors = results
        .filter((result) => result.status === "rejected")
        .map((result) => result.reason.message)
        .filter((error) => !["No accounting journals found", "No transactions found"].includes(error));

      if (errors.length) {
        setMessage(errors.join(" "));
      }
    });
  }, []);

  return (
    <DashboardLayout title="Laporan Jurnal & Transaksi">
      {message && <p className="mb-4 text-sm font-medium text-red-600">{message}</p>}

      <div className="grid gap-6 md:grid-cols-2">
        <section className="rounded-lg bg-white p-5 shadow-sm">
          <h2 className="mb-3 font-semibold text-gray-700">Jurnal Akuntansi</h2>
          {journals.length ? (
            <pre className="overflow-auto rounded bg-gray-50 p-3 text-xs">
              {JSON.stringify(journals, null, 2)}
            </pre>
          ) : (
            <p className="text-sm text-gray-500">Tidak ada data jurnal.</p>
          )}
        </section>

        <section className="rounded-lg bg-white p-5 shadow-sm">
          <h2 className="mb-3 font-semibold text-gray-700">Transaksi Ops</h2>
          {transactions.length ? (
            <pre className="overflow-auto rounded bg-gray-50 p-3 text-xs">
              {JSON.stringify(transactions, null, 2)}
            </pre>
          ) : (
            <p className="text-sm text-gray-500">Tidak ada data transaksi.</p>
          )}
        </section>
      </div>
    </DashboardLayout>
  );
}

export default JournalReport;