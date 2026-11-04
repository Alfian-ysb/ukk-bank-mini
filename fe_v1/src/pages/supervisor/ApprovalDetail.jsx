import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { get, patch } from "../../api";
import DashboardLayout from "../../components/DashboardLayout";
import GenericReportTable from "../../components/supervisor/GenericReportTable";
import Button from "../../components/Button";

const ApprovalDetail = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();

  const fetchApprovalDetail = async (shiftId) => {
    try {
      setLoading(true);
      const response = await get(`/supervisor/shifts/${shiftId}`);
      setData(response.data?.data || response.data || null);
    } catch (error) {
      console.error("Error fetching approval detail:", error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchApprovalDetail(id);
  }, [id]);

  const formatRupiah = (number) => {
    const formatted = new Intl.NumberFormat("id-ID", {
      maximumFractionDigits: 0,
    }).format(number || 0);
    return `Rp${formatted}`;
  };

  const formatDateFull = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleApprove = async () => {
    if (
      !window.confirm("Apakah Anda yakin ingin menyetujui laporan harian ini?")
    )
      return;

    try {
      setIsSubmitting(true);
      await patch(`/supervisor/shifts/${id}/approve`);
      alert("Laporan berhasil disetujui!");
      fetchApprovalDetail(id);
    } catch (error) {
      alert(
        "Gagal menyetujui laporan: " +
          (error.response?.data?.message || error.message),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Detail Laporan">
        <div className="flex h-64 items-center justify-center text-sm text-slate-500">
          Memuat data laporan...
        </div>
      </DashboardLayout>
    );
  }

  if (!data) {
    return (
      <DashboardLayout title="Detail Laporan">
        <div className="rounded border border-slate-300 bg-white p-6 text-center text-sm text-slate-600">
          Data laporan tidak ditemukan.
        </div>
      </DashboardLayout>
    );
  }

  const openingDenominations =
    data.denominations?.filter((d) => d.type === "opening") || [];
  const closingDenominations =
    data.denominations?.filter((d) => d.type === "closing") || [];
  const transactions = data.transactions || [];
  const depositCount = transactions.filter(
    (t) => t.transaction_type === "deposit" || t.type === "deposit",
  ).length;

  return (
    <DashboardLayout title="Laporan Harian Teller">
      <div className="mx-auto border border-slate-200 bg-white p-8 text-sm text-slate-800 shadow-sm print:border-none print:shadow-none">
        {/* Tombol Aksi */}
        <div className="mb-6 flex items-center justify-between border-b border-slate-200 pb-4 print:hidden">
          <Button theme="outline" text="Kembali" onClick={() => navigate(-1)} />
          <div className="flex items-center gap-2">
            <Button
              theme="outline"
              text="Cetak / Print"
              onClick={() => window.print()}
            />

            {data.status === "closed" && (
              <Button
                theme="primary"
                text="Setujui Laporan"
                onClick={handleApprove}
                disabled={isSubmitting}
              />
            )}
          </div>
        </div>

        {/* Header Dokumen */}
        <div className="mb-4">
          <p className="text-lg font-bold uppercase tracking-tight text-slate-700">
            LKM MITRA SISWA ABADI
          </p>
          <h1 className="text-base font-bold text-slate-900">
            Laporan Harian Teller (Penutupan Kas)
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            {formatDateFull(data.shift_date)} · Status:{" "}
            <span className="font-semibold capitalize">{data.status}</span>
          </p>
          <hr className="mt-2 border-t-2 border-slate-800" />
        </div>

        <div className="mb-4 text-sm text-slate-800 flex w-full justify-between gap-6 flex-wrap">
          <div className="w-full flex-1">
            <p className="font-semibold text-slate-900 mb-1">Petugas Teller:</p>
            {data.assigned_staff && data.assigned_staff.length > 0 ? (
              <ol className="list-decimal pl-5 space-y-0.5 text-slate-700">
                {data.assigned_staff.map((staff, index) => (
                  <li key={index}>{staff}</li>
                ))}
              </ol>
            ) : (
              <p className="italic text-slate-500">-</p>
            )}
          </div>
          <div className="w-full flex-2">
            <GenericReportTable
              title="Rincian lembaran: Saldo awal"
              headers={["Nominal", "Jumlah", "Total"]}
              data={openingDenominations}
              renderRow={(item, idx) => (
                <tr key={item.id || idx}>
                  <td className="px-3 py-1.5 text-slate-800">
                    {formatRupiah(item.denomination)}
                  </td>
                  <td className="px-3 py-1.5 text-center text-slate-800">
                    {item.quantity} lembar
                  </td>
                  <td className="px-3 py-1.5 text-right font-medium text-slate-900">
                    {formatRupiah(item.amount)}
                  </td>
                </tr>
              )}
            />
          </div>
        </div>

        {/* Rekapitulasi */}
        <div className="mb-6">
          <h2 className="mb-1.5 font-bold text-slate-900">Rekap Transaksi</h2>
          <table className="w-full border-collapse border border-slate-300">
            <tbody className="divide-y divide-slate-300">
              <tr>
                <td className="px-3 py-1.5 text-slate-700">Saldo awal</td>
                <td className="px-3 py-1.5 text-right font-medium text-slate-900">
                  {formatRupiah(data.opening_balance)}
                </td>
              </tr>
              <tr>
                <td className="px-3 py-1.5 text-slate-700">
                  Total setoran ({depositCount} transaksi)
                </td>
                <td className="px-3 py-1.5 text-right font-medium text-slate-900">
                  {formatRupiah(data.total_deposits)}
                </td>
              </tr>
              <tr>
                <td className="px-3 py-1.5 text-slate-700">Total penarikan</td>
                <td className="px-3 py-1.5 text-right font-medium text-slate-900">
                  {formatRupiah(data.total_withdrawals)}
                </td>
              </tr>
              <tr className="font-bold bg-slate-50/50">
                <td className="px-3 py-1.5 text-slate-900">
                  Saldo akhir sistem (saldo awal + setoran - penarikan)
                </td>
                <td className="px-3 py-1.5 text-right text-slate-900">
                  {formatRupiah(data.closing_digital_balance)}
                </td>
              </tr>
              <tr className="font-bold">
                <td className="px-3 py-1.5 text-slate-900">
                  Uang fisik di laci
                </td>
                <td className="px-3 py-1.5 text-right text-slate-900">
                  {formatRupiah(data.closing_physical_balance)}
                </td>
              </tr>
              <tr className="font-bold">
                <td className="px-3 py-1.5 text-slate-900">Selisih</td>
                <td
                  className={`px-3 py-1.5 text-right ${data.difference === 0 ? "text-emerald-700" : "text-rose-600"}`}
                >
                  {formatRupiah(data.difference)}
                </td>
              </tr>
            </tbody>
          </table>
          {data.terbilang && (
            <p className="mt-1.5 text-sm italic text-slate-500">
              Terbilang: {data.terbilang}
            </p>
          )}
        </div>

        <GenericReportTable
          title="Rincian lembaran: Uang fisik"
          headers={["Nominal", "Jumlah", "Total"]}
          data={closingDenominations}
          renderRow={(item, idx) => (
            <tr key={item.id || idx}>
              <td className="px-3 py-1.5 text-slate-800">
                {formatRupiah(item.denomination)}
              </td>
              <td className="px-3 py-1.5 text-center text-slate-800">
                {item.quantity} lembar
              </td>
              <td className="px-3 py-1.5 text-right font-medium text-slate-900">
                {formatRupiah(item.amount)}
              </td>
            </tr>
          )}
        />

        {/* Catatan Verifikasi */}
        {data.approved_at && (
          <p className="mb-12 text-sm text-slate-600">
            Diverifikasi oleh {data.approved_by || "Supervisor Bank Mini"} pada{" "}
            {formatDateFull(data.approved_at)} {formatTime(data.approved_at)}.
            Catatan: {data.notes || "Sesuai"}
          </p>
        )}

        {/* Area Tanda Tangan */}
        {/* <div className="mt-16 grid grid-cols-2 text-center text-slate-800">
          <div>
            <p className="mb-16 font-semibold">Teller</p>
            <p className="font-bold">
              {data.assigned_staff?.join(", ") || "Teller Loket 1"}
            </p>
          </div>
          <div>
            <p className="mb-16 font-semibold">Supervisor</p>
            <p className="font-bold">
              {data.approved_by || "Supervisor Bank Mini"}
            </p>
          </div>
        </div> */}

        {/* Footer Cetak */}
        {/* <div className="mt-12 text-xs text-slate-400">
          Dicetak {new Date().toLocaleDateString("id-ID")}{" "}
          {formatTime(new Date())} WIB oleh sistem E-Teller Bank Mini Sekolah.
        </div> */}
      </div>
    </DashboardLayout>
  );
};

export default ApprovalDetail;
