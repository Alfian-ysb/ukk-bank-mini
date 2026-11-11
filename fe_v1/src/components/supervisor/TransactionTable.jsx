import { useState } from "react";
import Table from "../Table";
import Button from "../Button";
import { downloadFile } from "../../api";

const TransactionTable = ({
  transactions,
  loading,
  exportUrl,
  filters = {},
}) => {
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState("");

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

  const handleDownload = async () => {
    setDownloading(true);
    setDownloadError("");

    try {
      const query = new URLSearchParams(filters).toString();
      const path = query ? `${exportUrl}?${query}` : exportUrl;
      await downloadFile(path, "laporan-transaksi.xlsx");
    } catch (error) {
      setDownloadError(error.message || "Gagal mengunduh laporan transaksi.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <section className="rounded-lg bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl md:text-2xl font-plus-jakarta-sans font-semibold text-gray-700">
          Riwayat Transaksi
        </h2>
        <Button
          onClick={handleDownload}
          theme="primary"
          text={downloading ? "Mengunduh..." : "Unduh Excel"}
          disabled={loading || downloading}
        />
      </div>

      {downloadError && (
        <p className="mb-4 text-sm font-medium text-red-600" role="alert">
          {downloadError}
        </p>
      )}

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
              className={`rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase text-nowrap ${
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
                <li key={staff} className="font-semibold text-sm text-nowrap">
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
  );
};

export default TransactionTable;
