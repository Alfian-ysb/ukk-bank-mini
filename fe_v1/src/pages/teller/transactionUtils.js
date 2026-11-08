export const TRANSACTION_STATUSES = [
  "pending",
  "approved",
  "rejected",
  "expired",
  "completed",
];

export const ACTIVE_STATUSES = ["pending", "approved", "completed"];

export function money(value) {
  return `Rp ${Number(value || 0).toLocaleString("id-ID")}`;
}

export function getTransactionStatus(payload) {
  const dataStatus = payload?.data?.status || payload?.data?.transaction_status;
  const rootStatus = payload?.transaction_status;
  const status = dataStatus || rootStatus;

  if (status && TRANSACTION_STATUSES.includes(String(status).toLowerCase())) {
    return String(status).toLowerCase();
  }

  return null;
}

export function getStatusEndpoint(payload) {
  const dynamicUrl =
    payload?.data?.status_url ||
    payload?.data?.status_endpoint ||
    payload?.status_url ||
    payload?.status_endpoint;

  if (dynamicUrl) return dynamicUrl;

  const requestId = payload?.data?.request_id;
  return requestId ? `/api/teller/transaction-requests/${requestId}` : "";
}

export function getErrorMessage(error) {
  switch (error.status) {
    case 401:
      return error.message || "Sesi staff tidak valid atau sudah berakhir. Silakan login kembali.";
    case 403:
      return error.message || "Anda tidak memiliki izin untuk melakukan transaksi ini.";
    case 404:
      return error.message || "Nasabah atau transaksi tidak ditemukan.";
    case 409:
      return error.message || "Transaksi tidak dapat diproses karena konflik data.";
    case 422:
      return error.message || "Data transaksi tidak valid.";
    default:
      return error.message || "Transaksi gagal diproses.";
  }
}
