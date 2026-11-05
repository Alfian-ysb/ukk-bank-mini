import { useRef, useState } from "react";
import { upload } from "../../../api";
import Button from "../../../components/Button";
import CustomerCsvPreviewModal from "./CustomerCsvPreviewModal";
import { getCsvDelimiter, parseCsv, serializeCsv } from "./customerCsv";

function CustomerCsvImport({ onImported }) {
  const [csvFile, setCsvFile] = useState(null);
  const [csvDelimiter, setCsvDelimiter] = useState(";");
  const [previewRows, setPreviewRows] = useState(null);
  const [error, setError] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [hasFile, setHasFile] = useState(false);
  const csvInputRef = useRef(null);

  async function openImportPreview() {
    if (!csvFile) return;

    try {
      setError("");
      const csvText = await csvFile.text();
      const delimiter = getCsvDelimiter(csvText);
      setCsvDelimiter(delimiter);
      setPreviewRows(parseCsv(csvText, delimiter));
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  async function importCustomers() {
    if (!csvFile || !previewRows) return;

    try {
      setError("");
      setIsUploading(true);
      const editedCsv = new File(
        [serializeCsv(previewRows, csvDelimiter)],
        csvFile.name,
        { type: "text/csv" },
      );
      await upload("/admin/customers/import", editedCsv);
      setCsvFile(null);
      setPreviewRows(null);
      if (csvInputRef.current) csvInputRef.current.value = "";
      await onImported();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsUploading(false);
    }
  }

  function closePreview() {
    setPreviewRows(null);
    setError("");
  }

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center gap-3 rounded-lg border border-gray-200 p-3">
        <input
          ref={csvInputRef}
          type="file"
          accept=".csv,.txt,text/csv"
          onChange={(event) => {
            setCsvFile(event.target.files?.[0] || null);
            setPreviewRows(null);
            setHasFile(!!event.target.files?.[0]);
            setError("");
          }}
          className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
          disabled={isUploading}
        />
        <Button
          text="Upload CSV"
          onClick={hasFile ? openImportPreview : () => {csvInputRef.current?.click()}}
          disabled={isUploading}
        />
        <Button
          text="Unduh Template CSV"
          theme="outline"
          onClick={() => {
            const link = document.createElement("a");
            link.href = `${import.meta.env.BASE_URL}customersTenplate.csv`;
            link.download = "template-nasabah.csv";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          }}
        />
      </div>

      {error && !previewRows && <p className="mb-4 text-red-600">{error}</p>}

      <CustomerCsvPreviewModal
        rows={previewRows}
        error={error}
        isUploading={isUploading}
        onRowsChange={setPreviewRows}
        onClose={closePreview}
        onSubmit={importCustomers}
      />
    </>
  );
}

export default CustomerCsvImport;
