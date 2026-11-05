import Button from "../../../components/Button";
import { CUSTOMER_CSV_FIELDS } from "./customerCsv";

function CustomerCsvPreviewModal({
  rows,
  error,
  isUploading,
  onRowsChange,
  onClose,
  onSubmit,
}) {
  if (!rows) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="customer-import-title"
    >
      <div className="flex max-h-[90vh] w-full max-w-6xl flex-col rounded-lg bg-white p-5 shadow-xl">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <h2 id="customer-import-title" className="text-xl font-semibold">
              Pratinjau dan edit data CSV
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              {rows.length} baris data. Perubahan di bawah akan dikirim saat Anda
              memilih Kirim Data.
            </p>
          </div>
          <button
            type="button"
            className="cursor-pointer rounded px-2 py-1 text-2xl leading-none hover:bg-gray-100"
            aria-label="Tutup pratinjau"
            disabled={isUploading}
            onClick={onClose}
          >
            &times;
          </button>
        </div>

        {error && <p className="mb-3 text-red-600">{error}</p>}

        <div className="overflow-auto rounded border border-gray-200">
          <table className="min-w-full border-collapse text-sm">
            <thead className="sticky top-0 bg-gray-100">
              <tr>
                <th className="border-b border-gray-200 px-3 py-2 text-left">#</th>
                {CUSTOMER_CSV_FIELDS.map((field) => (
                  <th
                    key={field}
                    className="border-b border-gray-200 px-3 py-2 text-left"
                  >
                    {field}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rowIndex) => (
                <tr key={rowIndex} className="odd:bg-white even:bg-gray-50">
                  <td className="border-b border-gray-100 px-3 py-2">
                    {rowIndex + 1}
                  </td>
                  {CUSTOMER_CSV_FIELDS.map((field) => (
                    <td
                      key={field}
                      className="border-b border-gray-100 px-2 py-1"
                    >
                      <input
                        type="text"
                        aria-label={`Baris ${rowIndex + 1}, ${field}`}
                        value={row[field]}
                        disabled={isUploading}
                        onChange={(event) => {
                          const value = event.target.value;
                          onRowsChange((currentRows) =>
                            currentRows.map((currentRow, index) =>
                              index === rowIndex
                                ? { ...currentRow, [field]: value }
                                : currentRow,
                            ),
                          );
                        }}
                        className="w-full min-w-32 rounded border border-gray-300 px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex justify-end gap-3">
          <Button
            text="Batal"
            theme="outline"
            disabled={isUploading}
            onClick={onClose}
          />
          <Button
            text={isUploading ? "Mengirim..." : "Kirim Data"}
            disabled={isUploading}
            onClick={onSubmit}
          />
        </div>
      </div>
    </div>
  );
}

export default CustomerCsvPreviewModal;
