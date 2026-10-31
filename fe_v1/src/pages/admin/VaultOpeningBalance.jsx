import { useState } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";
import { post } from "../../api";

function VaultOpeningBalance() {
  const [balance, setBalance] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function submit(event) {
    event.preventDefault();
    setMessage("");
    setError("");

    if (!balance || Number(balance) <= 0) {
      setError("Masukkan saldo awal lebih dari 0.");
      return;
    }

    const formattedBalance = `Rp ${Number(balance).toLocaleString("id-ID")}`;

    const isConfirmed = window.confirm(
      `Apakah Anda yakin ingin menyimpan saldo awal brankas sebesar ${formattedBalance}?`
    );
  
    if (!isConfirmed) return;

    try {
      const response = await post("/admin/vault/opening-balance", {
        amount: Number(balance),
      });
      setMessage(response.message || "Saldo awal brankas berhasil disimpan.");
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  return (
    <DashboardLayout title="Setup Saldo Awal Brankas">
      <p className="mb-4">
        <Link className="underline" to="/admin/dashboard">
          Kembali ke dashboard
        </Link>
      </p>

      <form className="max-w-md space-y-3 rounded bg-white p-4" onSubmit={submit}>
        <p>Setup ini hanya dapat digunakan satu kali.</p>
        <label className="block">
          Saldo awal
          <input
            className="mt-1 w-full rounded border p-2"
            type="number"
            min="1"
            placeholder="Contoh: 2500000"
            value={balance}
            onChange={(event) => setBalance(event.target.value)}
            required
          />
        </label>
        {error && <p className="text-red-600">{error}</p>}
        {message && <p className="text-green-600">{message}</p>}
        <button className="rounded cursor-pointer bg-primary px-3 py-2 text-white">
          Simpan saldo awal
        </button>
      </form>
    </DashboardLayout>
  );
}

export default VaultOpeningBalance;
