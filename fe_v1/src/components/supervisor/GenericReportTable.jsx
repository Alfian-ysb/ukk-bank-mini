import React from "react";

/**
 * Komponen Tabel Generik Laporan
 * @param {string} title - Judul section tabel
 * @param {Array<string>} headers - Array label untuk header tabel (e.g. ["Nominal", "Jumlah", "Total"])
 * @param {Array<any>} data - Array data yang akan ditayangkan
 * @param {Function} renderRow - Render function untuk mengkustomisasi setiap baris <tr>
 * @param {number} colSpan - Jumlah kolom untuk pesan data kosong (default: headers.length)
 */
const GenericReportTable = ({ title, headers = [], data = [], renderRow, colSpan }) => {
  const totalColumns = colSpan || headers.length;

  return (
    <div className="mb-6">
      {title && <h2 className="mb-1.5 font-bold text-slate-900">{title}</h2>}
      <table className="w-full border-collapse border border-slate-300 text-sm">
        {headers.length > 0 && (
          <thead className="bg-neutral-clay text-sm font-bold text-neutral-dark">
            <tr className="border-b border-slate-300">
              {headers.map((header, idx) => {
                // Rata kanan untuk kolom terakhir atau yang mengandung kata 'Total'/'Nominal'
                const isRight = idx === headers.length - 1;
                const isCenter = header.toLowerCase() === "jumlah";
                
                return (
                  <th
                    key={idx}
                    className={`px-3 py-1.5 font-bold ${
                      isRight ? "text-right" : isCenter ? "text-center" : "text-left"
                    }`}
                  >
                    {header}
                  </th>
                );
              })}
            </tr>
          </thead>
        )}
        <tbody className="divide-y divide-slate-300">
          {data.length === 0 ? (
            <tr>
              <td colSpan={totalColumns} className="px-3 py-1.5 text-center text-slate-400">
                Tidak ada data
              </td>
            </tr>
          ) : (
            data.map((item, index) => renderRow(item, index))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default GenericReportTable;