import { useState } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";
import { post } from "../../api";
import Button from "../../components/Button";

const money = (value) => `Rp ${Number(value || 0).toLocaleString("id-ID")}`;

function ReportPage() {
  const [date, setDate] = useState("");
  const [report, setReport] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function loadReport() {
    try {
      setLoading(true);
      const response = await post("/teller/daily-report", date ? { date } : {});
      setReport(response.data || null);
      setMessage("");
    } catch (error) {
      setMessage(error.message);
      setReport(null);
    } finally {
      setLoading(false);
    }
  }

  const openingDenominations = (report?.denominations || []).filter(
    (d) => d.type === "opening" || !d.type
  );
  const closingDenominations = (report?.denominations || []).filter(
    (d) => d.type === "closing"
  );

  return (
    <DashboardLayout title="Laporan Teller">
      <div className="mx-auto space-y-4">
        {/* Navigation Breadcrumb */}
        <div>
          <Link
            to="/teller/dashboard"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
          >
            &larr; Kembali ke dashboard
          </Link>
        </div>

        {/* Form Filter Tanggal */}
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-xs">
          <h2 className="mb-3 text-sm font-bold text-slate-900">
            Laporan Transaksi Harian
          </h2>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <input
              className="w-full sm:w-auto rounded-xl border border-slate-200 px-3.5 py-2 text-sm text-slate-800 focus:border-slate-800 focus:outline-none"
              type="date"
              value={date || new Date().toISOString().split("T")[0]}
              onChange={(event) => setDate(event.target.value)}
            />
            <Button text={loading ? "Memuat..." : "Muat Laporan"} onClick={loadReport} disabled={loading} />
          </div>
        </div>

        {/* State Error Message */}
        {message && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm font-medium text-rose-800">
            {message}
          </div>
        )}

        {/* Detail Laporan */}
        {report && (
          <div className="space-y-4">
            {/* Informasi Header & Ringkasan */}
            <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-xs space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-4">
                <div>
                  <span className="text-sm font-bold uppercase tracking-widest text-neutral-light-gray">
                    Laporan Harian Shift
                  </span>
                  <h3 className="text-base font-bold text-slate-900">
                    Tanggal: {new Date(report.shift_date).toLocaleDateString("id-ID", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </h3>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-sm font-bold uppercase tracking-wider ${
                    report.status === "approved"
                      ? "bg-emerald-100 text-emerald-800"
                      : report.status === "closed"
                      ? "bg-amber-100 text-amber-800"
                      : "bg-slate-100 text-slate-700"
                  }`}
                >
                  {report.status}
                </span>
              </div>

              {/* Informasional Staff */}
              <div className="text-sm">
                <span className="font-semibold text-slate-500">Petugas Teller: </span>
                <span className="font-bold text-slate-800">
                  {(report.assigned_staff || []).join(", ") || "-"}
                </span>
              </div>

              {/* Grid Rekapitulasi Kas */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 text-sm">
                <div className="rounded-xl bg-slate-50 p-3">
                  <p className="text-sm font-semibold text-neutral-light-gray uppercase">Saldo Awal</p>
                  <p className="mt-1 font-bold text-slate-900">{money(report.opening_balance)}</p>
                </div>
                <div className="rounded-xl bg-slate-50 p-3">
                  <p className="text-sm font-semibold text-emerald-600 uppercase">Total Deposit</p>
                  <p className="mt-1 font-bold text-emerald-600">{money(report.total_deposits)}</p>
                </div>
                <div className="rounded-xl bg-slate-50 p-3">
                  <p className="text-sm font-semibold text-rose-600 uppercase">Total Penarikan</p>
                  <p className="mt-1 font-bold text-rose-600">{money(report.total_withdrawals)}</p>
                </div>
                <div className="rounded-xl bg-slate-50 p-3">
                  <p className="text-sm font-semibold text-neutral-light-gray uppercase">Saldo Digital</p>
                  <p className="mt-1 font-bold text-slate-900">{money(report.closing_digital_balance)}</p>
                </div>
              </div>

              {/* Rekonsiliasi Kas Fisik vs Selisih */}
              <div className="flex flex-col sm:flex-row justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50/50 p-4 text-sm">
                <div>
                  <span className="text-slate-500">Saldo Fisik di Laci: </span>
                  <span className="font-bold text-slate-900">{money(report.closing_physical_balance)}</span>
                </div>
                <div>
                  <span className="text-slate-500">Selisih Kas: </span>
                  <span
                    className={`font-bold ${
                      report.difference === 0 ? "text-emerald-700" : "text-rose-600"
                    }`}
                  >
                    {money(report.difference)}
                  </span>
                </div>
              </div>
            </div>

            {/* Denominasi Uang */}
            <div className="grid gap-4 md:grid-cols-2">
              {/* Denominasi Awal */}
              <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-xs">
                <h3 className="mb-3 text-sm font-bold text-slate-800">
                  Rincian Uang Fisik (Saldo Awal)
                </h3>
                {openingDenominations.length > 0 ? (
                  <div className="overflow-hidden rounded-xl border border-slate-100">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-slate-50 text-sm font-bold uppercase tracking-wider text-neutral-light-gray">
                        <tr>
                          <th className="px-3 py-2">Pecahan</th>
                          <th className="px-3 py-2 text-center">Jumlah</th>
                          <th className="px-3 py-2 text-right">Subtotal</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {openingDenominations.map((item) => (
                          <tr key={item.id || item.denomination}>
                            <td className="px-3 py-1.5">{money(item.denomination)}</td>
                            <td className="px-3 py-1.5 text-center">{item.quantity}</td>
                            <td className="px-3 py-1.5 text-right font-semibold text-slate-900">
                              {money(item.amount)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-sm text-neutral-light-gray">Tidak ada data pecahan awal.</p>
                )}
              </div>

              {/* Denominasi Akhir (jika ada) */}
              <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-xs">
                <h3 className="mb-3 text-sm font-bold text-slate-800">
                  Rincian Uang Fisik (Saldo Akhir)
                </h3>
                {closingDenominations.length > 0 ? (
                  <div className="overflow-hidden rounded-xl border border-slate-100">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-slate-50 text-sm font-bold uppercase tracking-wider text-neutral-light-gray">
                        <tr>
                          <th className="px-3 py-2">Pecahan</th>
                          <th className="px-3 py-2 text-center">Jumlah</th>
                          <th className="px-3 py-2 text-right">Subtotal</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {closingDenominations.map((item) => (
                          <tr key={item.id || item.denomination}>
                            <td className="px-3 py-1.5">{money(item.denomination)}</td>
                            <td className="px-3 py-1.5 text-center">{item.quantity}</td>
                            <td className="px-3 py-1.5 text-right font-semibold text-slate-900">
                              {money(item.amount)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-sm text-neutral-light-gray">Tidak ada data pecahan penutupan.</p>
                )}
              </div>
            </div>

            {/* Tabel Transaksi */}
            <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-xs">
              <h3 className="mb-3 text-sm font-bold text-slate-800">
                Daftar Transaksi Harian
              </h3>
              {(report.transactions || []).length > 0 ? (
                <div className="overflow-x-auto rounded-xl border border-slate-100">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-sm font-bold uppercase tracking-wider text-neutral-light-gray">
                      <tr>
                        <th className="px-3 py-2">Jenis</th>
                        <th className="px-3 py-2">Nasabah</th>
                        <th className="px-3 py-2 text-right">Nominal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {(report.transactions || []).map((item) => {
                        const isDeposit =
                          item.transaction_type === "deposit" || item.type === "deposit";
                        return (
                          <tr key={item.id}>
                            <td className="px-3 py-2">
                              <span
                                className={`rounded-full px-2 py-0.5 text-sm font-bold uppercase`}
                              >
                                {isDeposit ? "Setor Tunai" : "Tarik Tunai"}
                              </span>
                            </td>
                            <td className="px-3 py-2 font-medium text-slate-800">
                              {item.customer?.student_name || "Nasabah"}
                            </td>
                            <td className="px-3 py-2 text-right font-bold text-slate-900">
                              {money(item.amount)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-sm text-neutral-light-gray">Tidak ada transaksi pada tanggal ini.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default ReportPage;