function TransactionForm({ transaction, onChange, onSubmit }) {
  return (
    <form
      className="flex flex-2 flex-col items-end space-y-2 rounded border border-neutral-clay p-4"
      onSubmit={onSubmit}
    >
      <p className="w-full text-lg font-semibold">Formulir Transaksi:</p>
      <select
        className="w-full cursor-pointer rounded border p-2"
        value={transaction.transaction_type}
        onChange={(event) =>
          onChange({
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
          onChange({ ...transaction, amount: event.target.value })
        }
      />
      <button className="cursor-pointer rounded bg-primary px-3 py-2 text-white">
        Simpan transaksi
      </button>
    </form>
  );
}

export default TransactionForm;
