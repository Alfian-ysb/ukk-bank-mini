import { useRef } from "react";
import { Scanner } from "@yudiel/react-qr-scanner";

function getAccountNumberFromQr(rawValue) {
  const value = rawValue.trim();

  try {
    const payload = JSON.parse(value);
    if (typeof payload.account_number === "string") {
      return payload.account_number.trim();
    }
  } catch {
    // QR content can be a plain account number.
  }

  try {
    const url = new URL(value);
    return url.searchParams.get("account_number")?.trim() || "";
  } catch {
    return value;
  }
}

function QrScannerModal({ onClose, onError, onAccountDetected }) {
  const scanInProgress = useRef(false);

  function handleScan(detectedCodes) {
    const rawValue = detectedCodes[0]?.rawValue;
    if (!rawValue || scanInProgress.current) return;

    const accountNumber = getAccountNumberFromQr(rawValue);
    if (!accountNumber) {
      onError(new Error("QR tidak berisi nomor rekening yang valid."));
      return;
    }

    scanInProgress.current = true;
    onClose();
    onAccountDetected(accountNumber);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="qr-scanner-title"
    >
      <div className="w-full max-w-md rounded-lg bg-white p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 id="qr-scanner-title" className="text-lg font-semibold">
            Scan QR rekening
          </h3>
          <button
            type="button"
            className="rounded-lg px-2 py-1 text-xl leading-none hover:bg-neutral-light"
            aria-label="Tutup scanner"
            onClick={onClose}
          >
            &times;
          </button>
        </div>
        <div className="overflow-hidden rounded-lg border border-neutral-clay">
          <Scanner
            onScan={handleScan}
            onError={onError}
            formats={["qr_code"]}
            constraints={{ facingMode: "environment" }}
            allowMultiple={false}
            sound
          />
        </div>
        <p className="mt-3 text-sm text-neutral-light-gray">
          Arahkan kamera ke QR yang berisi nomor rekening nasabah.
        </p>
      </div>
    </div>
  );
}

export default QrScannerModal;
