import { useState } from "react";
import { useEffect } from "react";
import { get, post } from "../../api";

function VaultOpeningBalanceForm() {
  const [balance, setBalance] = useState("");
  const [hasBalance, setHasBalance] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [isAlreadySetup, setIsAlreadySetup] = useState(false);

  useEffect(() => {
    get("/admin/vault/opening-balance")
      .then((response) => {
        setIsAlreadySetup(true);
        setMessage(
          `Saldo awal sudah diset sebesar Rp ${Number(
            response.data?.amount || 0,
          ).toLocaleString("id-ID")}.`,
        );
        setHasBalance(response.data?.amount || "");
      })
      .catch((requestError) => {
        if (requestError.status !== 404) {
          setError(requestError.message);
        }
      })
      .finally(() => setIsChecking(false));
  }, []);

  async function submit(event) {
    event.preventDefault();
    setMessage("");
    setError("");

    if (isAlreadySetup) {
      return;
    }

    if (!balance || Number(balance) <= 0) {
      setError("Masukkan saldo awal lebih dari 0.");
      return;
    }

    const formattedBalance = `Rp ${Number(balance).toLocaleString("id-ID")}`;
    const isConfirmed = window.confirm(
      `Apakah Anda yakin ingin menyimpan saldo awal brankas sebesar ${formattedBalance}?`,
    );

    if (!isConfirmed) return;

    setIsSaving(true);
    try {
      const response = await post("/admin/vault/opening-balance", {
        amount: Number(balance),
      });
      setMessage(response.message || "Saldo awal brankas berhasil disimpan.");
      setBalance("");
      setIsAlreadySetup(true);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form
      className="space-y-3 rounded-lg bg-white p-5 shadow-sm"
      onSubmit={submit}
    >
      <div>
        <h2 className="text-lg font-semibold text-neutral-dark-gray">
          Setup saldo awal brankas
        </h2>
        <p className="mt-1 text-sm text-neutral-light-gray">
          Setup ini hanya dapat digunakan satu kali.
        </p>
      </div>
      <label className="block text-sm font-medium text-neutral-dark-gray">
        Saldo awal
        {isAlreadySetup ? (
          <p className="mt-1 w-full rounded border p-2">
            Rp{hasBalance}
          </p>
        ) : (
          <input
          className="mt-1 w-full rounded border p-2"
          type="number"
          min="1"
          placeholder="Contoh: 2500000"
          value={balance}
          onChange={(event) => setBalance(event.target.value)}
          required
        />
        )}
      </label>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {message && <p className="text-sm text-green-600">{message}</p>}
      <button
        type="submit"
        disabled={isChecking || isSaving || isAlreadySetup}
        className="cursor-pointer rounded bg-primary px-3 py-2 text-white disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isChecking
          ? "Memeriksa..."
          : isAlreadySetup
            ? "Sudah di-setup"
            : isSaving
              ? "Menyimpan..."
              : "Simpan saldo awal"}
      </button>
    </form>
  );
}

export default VaultOpeningBalanceForm;
