import { useState } from "react";
import { post } from "../api";
import { getErrorMessage } from "../pages/teller/transactionUtils";

function useCustomerLookup() {
  const [accountNumber, setAccountNumber] = useState("");
  const [customer, setCustomer] = useState(null);
  const [message, setMessage] = useState("");
  const [isFindingCustomer, setIsFindingCustomer] = useState(false);

  async function findCustomer(accountNumberToFind = accountNumber) {
    const normalizedAccountNumber = accountNumberToFind.trim();
    if (!normalizedAccountNumber) {
      setMessage("Nomor rekening wajib diisi.");
      return;
    }

    setIsFindingCustomer(true);
    try {
      const response = await post("/teller/customer", {
        account_number: normalizedAccountNumber,
      });
      setCustomer(response.data);
      setMessage("");
    } catch (error) {
      setCustomer(null);
      setMessage(getErrorMessage(error));
    } finally {
      setIsFindingCustomer(false);
    }
  }

  return {
    accountNumber,
    customer,
    message,
    isFindingCustomer,
    setAccountNumber,
    setCustomer,
    setMessage,
    findCustomer,
  };
}

export default useCustomerLookup;
