import React, { useEffect, useState } from 'react'
import Table from '../../components/Table';
import { get } from '../../api';
import DashboardLayout from '../../components/DashboardLayout';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    get("/supervisor/transactions")
      .then((response) => {
        setTransactions(response.data || []);
      })
      .catch((error) => {
        setMessage(error.message);
      });
  }, []);

  const formatRupiah = (number) => {
    return `Rp${Number(number || 0).toLocaleString("id-ID")}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleString("id-ID", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  return (
    <DashboardLayout title="Jurnal Akuntansi / Transaksi">
      {message && <p className="mb-4 text-sm font-medium text-red-600">{message}</p>}

      <section className="rounded-lg bg-white p-5 shadow-sm">
        <h2 className="mb-3 text-2xl font-plus-jakarta-sans font-semibold text-gray-700">
          Riwayat Transaksi
        </h2>
        {transactions.length > 0 ? (
          <Table
            headers={[
              "Waktu / Tanggal",
              "No. Rekening",
              "Nama Siswa",
              "Jurusan",
              "Jenis Transaksi",
              "Nominal",
              "Teller",
            ]}
            data={transactions.map((item) => [
              formatDate(item.date || item.created_at),
              item.customer?.account_number || "-",
              item.customer?.student_name || "-",
              item.customer?.major || "-",
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase`}
              >
                {item.transaction_type === "deposit" ? "Setor Tunai" : "Tarik Tunai"}
              </span>,
              <span className="font-semibold text-slate-800">
                {formatRupiah(item.amount)}
              </span>,
              <ul>
                {item.shift?.assigned_staff?.map((staff) => (
                  <li key={staff} className="font-semibold text-sm">
                    {staff}
                  </li>
                )) || "-"}
              </ul>,
            ])}
          />
        ) : (
          <p className="text-sm text-gray-500">Tidak ada data transaksi.</p>
        )}
      </section>
    </DashboardLayout>
  );
};

export default Transactions