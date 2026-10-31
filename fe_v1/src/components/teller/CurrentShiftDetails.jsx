import React from "react";

const formatMoney = (value) => `Rp${Number(value || 0).toLocaleString("id-ID")}`;

const CurrentShiftDetails = ({ shift }) => {
  const openingDenominations = (shift.denominations || []).filter(
    (item) => item.type === "opening"
  );

  return (
    <div className="rounded border border-slate-200 bg-white p-6 shadow-xs space-y-5">
      {/* Header Shift Status */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
            LKM MITRA SISWA ABADI
          </span>
          <h2 className="text-base font-bold text-slate-900">
            Laporan Harian (Shift #{shift.id})
          </h2>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${
            shift.status === "open"
              ? "bg-emerald-100 text-emerald-800"
              : "bg-slate-100 text-slate-800"
          }`}
        >
          {shift.status}
        </span>
      </div>

      {/* Informasi Petugas & Saldo Awal */}
      <div className="grid grid-cols-1 gap-4 text-xs md:grid-cols-2">
        <div className="space-y-1.5">
          <p className="text-slate-400 uppercase text-[10px] font-bold tracking-wider">
            Petugas Teller
          </p>
          <div className="flex flex-wrap gap-1.5">
            {(shift.assigned_staff || []).map((staff, idx) => (
              <span key={idx} className="rounded-md bg-slate-100 px-2.5 py-1 font-semibold text-slate-700">
                {staff}
              </span>
            ))}
          </div>
        </div>

        <div className="space-y-1.5">
          <p className="text-slate-400 uppercase text-[10px] font-bold tracking-wider">
            Rekapitulasi Saldo Awal
          </p>
          <p className="text-lg font-bold text-slate-900">{formatMoney(shift.opening_balance)}</p>
        </div>
      </div>

      {/* Tabel Denominasi Pembukaan */}
      {openingDenominations.length > 0 && (
        <div>
          <h3 className="mb-2 text-xs font-bold text-slate-700">Rincian lembaran: Saldo awal</h3>
          <div className="overflow-hidden rounded-xl border border-slate-200">
            <table className="w-full border-collapse text-left text-xs">
              <thead className="bg-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-3 py-2">Nominal</th>
                  <th className="px-3 py-2 text-center">Jumlah</th>
                  <th className="px-3 py-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white text-slate-700">
                {openingDenominations.map((item) => (
                  <tr key={item.id}>
                    <td className="px-3 py-1.5 font-medium">{formatMoney(item.denomination)}</td>
                    <td className="px-3 py-1.5 text-center">
                      {item.quantity} {item.denomination >= 1000 ? "lembar" : "keping"}
                    </td>
                    <td className="px-3 py-1.5 text-right font-semibold text-slate-900">
                      {formatMoney(item.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Transfer Kas */}
      {shift.cash_transfers?.length > 0 && (
        <div className="rounded-xl bg-slate-50 p-4 text-xs">
          <h3 className="mb-2 font-bold text-slate-800">Transfer Kas</h3>
          <div className="space-y-1">
            {shift.cash_transfers.map((transfer) => (
              <div key={transfer.id} className="flex justify-between text-slate-600">
                <span>{transfer.from_location} &rarr; {transfer.to_location}</span>
                <span className="font-semibold text-slate-900">{formatMoney(transfer.amount)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CurrentShiftDetails;