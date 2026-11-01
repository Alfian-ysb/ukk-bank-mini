import React from "react";

/**
 * Helper internal untuk format Rupiah
 */
const formatRupiah = (number) => {
  const formatted = new Intl.NumberFormat("id-ID", {
    maximumFractionDigits: 0,
  }).format(number || 0);
  return `Rp${formatted}`;
};

/**
 * Komponen Tabel Rincian Pecahan Uang Fisik
 * @param {string} title - Judul tabel (contoh: "Rincian Uang Fisik (Saldo Awal)")
 * @param {Array} items - Array data pecahan [{ id, denomination, quantity, amount }]
 * @param {boolean} showTotal - Opsional: tampilkan baris total di bagian bawah
 */
const DenominationTable = ({ title, items = [], showTotal = false }) => {
  const totalAmount = items.reduce((acc, curr) => acc + (curr.amount || 0), 0);

  return (
    <div className="rounded border border-slate-100 bg-white p-6 shadow-sm">
      {title && <h3 className="mb-4 text-sm font-bold text-slate-800">{title}</h3>}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            <tr>
              <th className="px-4 py-3 rounded-l-lg">Pecahan</th>
              <th className="px-4 py-3 text-center">Jumlah</th>
              <th className="px-4 py-3 text-right rounded-r-lg">Subtotal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-4 py-4 text-center text-xs text-slate-400">
                  Tidak ada data pecahan
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={item.id || item.denomination}>
                  <td className="px-4 py-3">{formatRupiah(item.denomination)}</td>
                  <td className="px-4 py-3 text-center">{item.quantity}</td>
                  <td className="px-4 py-3 text-right font-semibold text-slate-800">
                    {formatRupiah(item.amount)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
          {showTotal && items.length > 0 && (
            <tfoot className="border-t border-slate-200">
              <tr>
                <td colSpan={2} className="px-4 py-3 font-bold text-slate-700">
                  Total
                </td>
                <td className="px-4 py-3 text-right font-bold text-slate-900">
                  {formatRupiah(totalAmount)}
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
};

export default DenominationTable;