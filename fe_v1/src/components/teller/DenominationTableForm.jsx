import React from "react";

const formatMoney = (value) => `Rp${Number(value || 0).toLocaleString("id-ID")}`;

const DenominationTableForm = ({ title, items = [], onChange }) => {
  const totalBalance = items.reduce(
    (acc, item) => acc + item.denomination * (item.quantity || 0),
    0
  );

  return (
    <div>
      <h3 className="mb-2 text-xs font-bold text-slate-700">{title}</h3>
      <div className="overflow-hidden rounded-xl border border-slate-200">
        <table className="w-full border-collapse text-left text-sm">
          <thead className="bg-primary text-neutral-light font-bold tracking-wider">
            <tr>
              <th className="px-3 py-2">Nominal</th>
              <th className="px-3 py-2 text-center">Jumlah</th>
              <th className="px-3 py-2 text-right">Subtotal</th>
            </tr>
          </thead>
          <tbody className="divide-y text-sm divide-slate-100 bg-white text-slate-700">
            {items.map((item, index) => {
              const subtotal = item.denomination * (item.quantity || 0);
              const unitLabel = item.denomination >= 1000 ? "Lembar" : "Keping";

              return (
                <tr key={item.denomination} className="hover:bg-slate-50/50">
                  <td className="px-3 py-1.5 font-medium">
                    {formatMoney(item.denomination)}
                  </td>
                  <td className="px-3 py-1.5">
                    <div className="flex items-center justify-center gap-1.5">
                      <input
                        className="w-16 rounded-md border border-slate-300 px-2 py-1 text-center font-bold text-slate-900 focus:border-slate-800 focus:outline-none"
                        type="number"
                        min="0"
                        value={item.quantity === 0 ? "" : item.quantity}
                        placeholder="0"
                        onChange={(e) => onChange(index, e.target.value)}
                      />
                      <span className="text-slate-400">{unitLabel}</span>
                    </div>
                  </td>
                  <td className="px-3 py-1.5 text-right font-semibold text-slate-900">
                    {formatMoney(subtotal)}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot className="border-t-2 border-slate-200 bg-slate-50 font-bold text-slate-900">
            <tr>
              <td colSpan={2} className="px-3 py-2.5 uppercase tracking-wider text-[11px]">
                Total Saldo
              </td>
              <td className="px-3 py-2.5 text-right text-sm font-bold text-slate-900">
                {formatMoney(totalBalance)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

export default DenominationTableForm;