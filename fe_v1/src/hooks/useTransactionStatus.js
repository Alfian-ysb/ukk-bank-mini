import { useEffect, useRef, useState } from "react";
import { get } from "../api";
import {
  getErrorMessage,
  getTransactionStatus,
} from "../pages/teller/transactionUtils";

const POLL_INTERVAL = 3000;
const REQUEST_TIMEOUT = 120000;

function useTransactionStatus({ onCustomerBalanceChange }) {
  const [status, setStatus] = useState("");
  const [transactionId, setTransactionId] = useState(null);
  const [message, setMessage] = useState("");
  const [statusEndpoint, setStatusEndpoint] = useState("");
  const transactionStartedAt = useRef(0);

  useEffect(() => {
    if (status !== "pending") return undefined;

    let cancelled = false;
    let timeoutId;
    let expiryTimeoutId;

    function expireRequest() {
      if (cancelled) return;
      setStatus("expired");
      setMessage(
        "Waktu menunggu persetujuan habis. Periksa status transaksi di backend sebelum mencoba lagi.",
      );
      setStatusEndpoint("");
    }

    async function pollStatus() {
      if (Date.now() - transactionStartedAt.current >= REQUEST_TIMEOUT) {
        expireRequest();
        return;
      }

      try {
        const response = await get(statusEndpoint);
        if (cancelled) return;

        const nextStatus = getTransactionStatus(response);
        if (nextStatus) {
          setStatus(nextStatus);
          setMessage(
            response.message ||
              (nextStatus === "pending"
                ? "Transaksi menunggu persetujuan nasabah."
                : ""),
          );
        }

        if (
          ["approved", "completed"].includes(nextStatus) &&
          response.data?.customer_balance !== undefined
        ) {
          onCustomerBalanceChange(response.data.customer_balance);
        }

        if (["approved", "completed", "rejected", "expired"].includes(nextStatus)) {
          setStatusEndpoint("");
          return;
        }
      } catch (error) {
        if (!cancelled) setMessage(getErrorMessage(error));
      }

      if (!cancelled) {
        timeoutId = window.setTimeout(pollStatus, POLL_INTERVAL);
      }
    }

    expiryTimeoutId = window.setTimeout(expireRequest, REQUEST_TIMEOUT);
    if (statusEndpoint) {
      timeoutId = window.setTimeout(pollStatus, POLL_INTERVAL);
    }

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
      window.clearTimeout(expiryTimeoutId);
    };
  }, [onCustomerBalanceChange, status, statusEndpoint]);

  function start(response) {
    const nextStatus = getTransactionStatus(response) || "completed";
    transactionStartedAt.current = Date.now();
    setStatus(nextStatus);
    setStatusEndpoint(response.statusEndpoint);
    setMessage(
      nextStatus === "pending"
        ? "Transaksi menunggu persetujuan nasabah."
        : response.message ||
          (nextStatus === "completed" ? "Transaksi berhasil diselesaikan." : ""),
    );
    return nextStatus;
  }

  function reset() {
    setStatus("");
    setStatusEndpoint("");
  }

  return {
    status,
    message,
    start,
    reset,
    setMessage,
  };
}

export default useTransactionStatus;
