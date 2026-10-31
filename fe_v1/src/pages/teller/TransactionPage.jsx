import { useState } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";
import { post } from "../../api";

const money = (value) => `Rp ${Number(value || 0).toLocaleString("id-ID")}`;

function TransactionPage() {
  const [accountNumber, setAccountNumber] = useState("");
  const [customer, setCustomer] = useState(null);
  const [transaction, setTransaction] = useState({
    transaction_type: "deposit",
    amount: "",
  });
  const [message, setMessage] = useState("");

  async function findCustomer(event) {
    event.preventDefault();
    try {
      setCustomer(
        (await post("/teller/customer", { account_number: accountNumber }))
          .data,
      );
      setMessage("");
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function saveTransaction(event) {
    event.preventDefault();

    // 1. Ambil teks jenis transaksi untuk pesan konfirmasi
    const isDeposit = transaction.transaction_type === "deposit";
    const typeLabel = isDeposit ? "SETOR TUNAI (Deposit)" : "PENARIKAN TUNAI";
    const formattedAmount = money(transaction.amount);

    // 2. Tampilkan popup konfirmasi bawaan browser
    const isConfirmed = window.confirm(
      `Apakah Anda yakin ingin memproses transaksi berikut?\n\n` +
        `Nasabah: ${customer.student_name}\n` +
        `Jenis: ${typeLabel}\n` +
        `Nominal: ${formattedAmount}`,
    );

    // Jika user klik "Batal", batalkan proses
    if (!isConfirmed) return;

    try {
      const response = await post(
        `/teller/customer/${customer.id}/transaction`,
        {
          ...transaction,
          amount: Number(transaction.amount),
        },
      );
      setMessage(response.message);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setTransaction({ transaction_type: "deposit", amount: "" });
      setAccountNumber("");
      setCustomer(null);
    }
  }

  return (
    <DashboardLayout title="Transaksi Teller">
      <p className="mb-4">
        <Link className="underline" to="/teller/dashboard">
          Kembali ke dashboard
        </Link>
      </p>
      <section className="rounded bg-white p-4 w-full">
        <h2 className="mb-3 text-lg font-semibold">Transaksi</h2>
        <form onSubmit={findCustomer} className="flex w-full gap-4">
          <input
            className="rounded border p-2 w-full"
            placeholder="Nomor rekening"
            value={accountNumber}
            onChange={(event) => setAccountNumber(event.target.value)}
          />
          <button type="submit" className="w-2/10 rounded border px-3 cursor-pointer">
            Cari nasabah
          </button>
        </form>
        {customer && (
          <div className="flex gap-4 mt-4">
            <form className="space-y-2 flex-2 p-4 rounded border border-neutral-clay flex flex-col  items-end" onSubmit={saveTransaction}>
            <p className="font-semibold text-lg w-full">
              Formulir Transaksi:
            </p>
            <select
              className="w-full rounded border p-2 cursor-pointer"
              value={transaction.transaction_type}
              onChange={(event) =>
                setTransaction({
                  ...transaction,
                  transaction_type: event.target.value,
                })
              }
            >
              <option value="deposit">Deposit</option>
              <option value="withdrawal">Penarikan</option>
            </select>
            <input
              className="w-full rounded border p-2"
              type="number"
              min="10000"
              placeholder="Jumlah"
              required
              value={transaction.amount}
              onChange={(event) =>
                setTransaction({ ...transaction, amount: event.target.value })
              }
            />
            <button className="rounded cursor-pointer bg-primary px-3 py-2 text-white">
              Simpan transaksi
            </button>
          </form>
          <div className="flex-1 font-plus-jakarta-sans p-4 rounded border border-neutral-clay">
              <div className="mb-4">
                <p className="font-semibold">{customer.student_name}</p>
                <p className="text-sm text-neutral-light-gray font-medium">NIS: {customer.nis}</p>
                <p className="text-sm text-neutral-light-gray font-medium">Jurusan: {customer.major}</p>
                <p className="text-sm text-neutral-light-gray font-medium">Angkatan: {customer.cohort_year}</p>
                <p className="text-sm text-neutral-light-gray font-medium">Status: {customer.status}</p>
              </div>
              <div className="border-t border-neutral-clay py-2">
                <p className="text-sm text-neutral-light-gray font-semibold">Nomor Rekening</p>
                <p className="text-sm text-neutral-dark-gray font-bold">{customer.account_number}</p>
              </div>
          </div>
          </div>
        )}
      </section>
      {message && <p className="mt-4">{message}</p>}
    </DashboardLayout>
  );
}

export default TransactionPage;
