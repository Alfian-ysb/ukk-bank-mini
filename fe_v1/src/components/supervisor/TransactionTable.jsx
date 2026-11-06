import React from "react";
import Table from "../Table";
import Button from "../Button";

const TransactionTable = ({ transactions, loading }) => {
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

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      {/* Styling Khusus untuk Mode Print */}
      <style>{`
        @media print {
          .no-print {
            display: none !important;
          }

          body {
            background-color: #ffffff !important;
            color: #000000 !important;
            font-size: 12px;
          }

          .print-container {
            box-shadow: none !important;
            padding: 0 !important;
            margin: 0 !important;
            width: 100% !important;
          }

          .print-header {
            display: block !important;
            margin-bottom: 20px;
            border-bottom: 2px solid #000;
            padding-bottom: 10px;
          }

          table {
            width: 100% !important;
            border-collapse: collapse !important;
          }

          th, td {
            border: 1px solid #d1d5db !important;
            padding: 6px 8px !important;
            font-size: 11px !important;
          }

          tr {
            page-break-inside: avoid;
          }
        }

        .print-header {
          display: none;
        }
      `}</style>

      <section className="print-container rounded-lg bg-white p-5 shadow-sm">
        {/* Kop / Header Laporan (Hanya muncul saat dicetak) */}
        <div className="print-header text-center">
          <h1 className="text-xl font-bold uppercase tracking-wide">
            Laporan Riwayat Transaksi
          </h1>
          <p className="text-xs text-gray-600">
            Dicetak pada: {new Date().toLocaleString("id-ID", { dateStyle: "full", timeStyle: "short" })}
          </p>
        </div>

        {/* Action Header di Layar */}
        <div className="mb-4 flex items-center justify-between no-print">
          <h2 className="text-2xl font-plus-jakarta-sans font-semibold text-gray-700">
            Riwayat Transaksi
          </h2>
          <Button onClick={handlePrint} theme="primary" text="Unduh Laporan" />
        </div>

        {loading ? (
          <p className="py-4 text-center text-sm text-gray-500">Memuat data...</p>
        ) : transactions.length > 0 ? (
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
                key={item.id}
                className={`rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase ${
                  item.transaction_type === "deposit"
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {item.transaction_type === "deposit"
                  ? "Setor Tunai"
                  : "Tarik Tunai"}
              </span>,
              <span
                key={`amt-${item.id}`}
                className="font-semibold text-slate-800"
              >
                {formatRupiah(item.amount)}
              </span>,
              <ul key={`staff-${item.id}`}>
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
    </>
  );
};

export default TransactionTable;