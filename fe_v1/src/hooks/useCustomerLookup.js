import { useCallback, useState } from "react";
import { get, post } from "../api";
import { getErrorMessage } from "../pages/teller/transactionUtils";
import { useNavigate } from "react-router-dom";

function useCustomerLookup() {
  const [accountNumber, setAccountNumber] = useState("");
  const navigate = useNavigate();
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

      navigate("/teller/transaction/" + response.data.id);

      setMessage("");
    } catch (error) {
      setCustomer(null);
      setMessage(getErrorMessage(error));
    } finally {
      setIsFindingCustomer(false);
    }
  }

  const findCustomerById = useCallback(async (customerId) => {
    if (!customerId) {
      setMessage("ID nasabah tidak valid.");
      return;
    }

    setIsFindingCustomer(true);
    try {
      const response = await get("/teller/customer/" + customerId);

      setCustomer(response.data);

      setMessage("");
    } catch (error) {
      setCustomer(null);
      setMessage(getErrorMessage(error));
    } finally {
      setIsFindingCustomer(false);
    }
  }, []);

  return {
    accountNumber,
    customer,
    message,
    isFindingCustomer,
    setAccountNumber,
    setCustomer,
    setMessage,
    findCustomer,
    findCustomerById,
  };
}

export default useCustomerLookup;
