import { post } from "../api";
import {
  getErrorMessage,
  getStatusEndpoint,
  money,
} from "../pages/teller/transactionUtils";

function useTransactionSubmission({
  customer,
  transaction,
  onTransactionStarted,
  onTransactionError,
  onCustomerBalanceChange,
  onReset,
}) {
  async function saveTransaction(event) {
    event.preventDefault();

    const isDeposit = transaction.transaction_type === "deposit";
    const typeLabel = isDeposit ? "SETOR TUNAI (Deposit)" : "PENARIKAN TUNAI";
    const isConfirmed = window.confirm(
      `Apakah Anda yakin ingin memproses transaksi berikut?\n\n` +
        `Nasabah: ${customer.student_name}\n` +
        `Jenis: ${typeLabel}\n` +
        `Nominal: ${money(transaction.amount)}`,
    );

    if (!isConfirmed) return;

    try {
      const response = await post(`/teller/customer/${customer.id}/transaction`, {
        ...transaction,
        amount: Number(transaction.amount),
      });

      const nextStatus = onTransactionStarted({
        ...response,
        statusEndpoint: getStatusEndpoint(response),
      });

      if (
        ["approved", "completed"].includes(nextStatus) &&
        response.data?.customer_balance !== undefined
      ) {
        onCustomerBalanceChange(response.data.customer_balance);
      }
      onReset();
    } catch (error) {
      onTransactionError(getErrorMessage(error));
    }
  }

  return saveTransaction;
}

export default useTransactionSubmission;
