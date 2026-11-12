const STATUS_LABELS = {
  pending: "Menunggu persetujuan",
  approved: "Disetujui",
  rejected: "Ditolak",
  expired: "Kedaluwarsa",
  completed: "Selesai",
};

const STATUS_STYLES = {
  pending: "border-amber-200 bg-amber-50 text-amber-800",
  approved: "border-blue-200 bg-blue-50 text-blue-800",
  rejected: "border-red-200 bg-red-50 text-red-800",
  expired: "border-slate-200 bg-slate-50 text-slate-700",
  completed: "border-emerald-200 bg-emerald-50 text-emerald-800",
};

function TransactionStatus({ status, message, children }) {
  if (!status) return null;

  return (
    <div
      className={`mt-4 rounded-lg border p-4 text-sm ${
        STATUS_STYLES[status] || STATUS_STYLES.pending
      }`}
      role="status"
    >
      <p className="font-semibold">
        Status transaksi: {STATUS_LABELS[status] || status}
      </p>
      {message && <p className="mt-1">{message}</p>}
      {children && <div className="mt-3">{children}</div>}
    </div>
  );
}

export default TransactionStatus;
