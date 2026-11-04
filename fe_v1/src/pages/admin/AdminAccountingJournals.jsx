import React, { useEffect, useState } from 'react';
import Table from '../../components/Table';
import { get } from '../../api';
import DashboardLayout from '../../components/DashboardLayout';

const AdminAccountingJournals = () => {
  const [journals, setJournals] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    get("/admin/journals") // atau endpoint jurnal Anda
      .then((response) => {
        setJournals(response.data || []);
      })
      .catch((error) => {
        setMessage(error.message);
      });
  }, []);

  // Helper format Rupiah
  const formatRupiah = (number) => {
    return `Rp${Number(number || 0).toLocaleString("id-ID")}`;
  };

  // Helper format tanggal
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleString("id-ID", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  return (
    <DashboardLayout title="Jurnal Akuntansi">
      {message && <p className="mb-4 text-sm font-medium text-red-600">{message}</p>}

      <section className="rounded-lg bg-white p-5 shadow-sm">
        <h2 className="mb-3 text-2xl font-plus-jakarta-sans font-semibold text-gray-700">
          Jurnal Umum / Transaksi
        </h2>
        {journals.length > 0 ? (
          <Table
            headers={[
              "Waktu / Tanggal",
              "Kode Akun",
              "Posisi",
              "No. Rekening",
              "Nama Nasabah",
              "Jenis Transaksi",
              "Nominal",
              "Teller",
            ]}
            data={journals.map((item) => [
              formatDate(item.created_at || item.transaction?.date),
              <span className="font-mono font-medium text-slate-700">
                {item.account_code}
              </span>,
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase ${
                  item.position === "debit"
                    ? "bg-blue-100 text-blue-800"
                    : "bg-purple-100 text-purple-800"
                }`}
              >
                {item.position}
              </span>,
              item.transaction?.customer?.account_number || "-",
              item.transaction?.customer?.student_name || "-",
              <span className="capitalize text-slate-600">
                {item.transaction?.transaction_type === "deposit"
                  ? "Setor Tunai"
                  : item.transaction?.transaction_type === "withdrawal"
                  ? "Tarik Tunai"
                  : item.transaction?.transaction_type || "-"}
              </span>,
              <span className="font-semibold text-slate-800">
                {formatRupiah(item.amount)}
              </span>,
              <ul>
                {item.transaction?.shift?.assigned_staff?.map((staff) => (
                  <li key={staff} className="font-semibold text-sm">
                    {staff}
                  </li>
                )) || "-"}
              </ul>,
            ])}
          />
        ) : (
          <p className="text-sm text-gray-500">Tidak ada data jurnal akuntansi.</p>
        )}
      </section>
    </DashboardLayout>
  );
};

export default AdminAccountingJournals;