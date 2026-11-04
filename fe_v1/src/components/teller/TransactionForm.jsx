import CurrencyInput from "react-currency-input-field";

function TransactionForm({
  transaction,
  onChange,
  onSubmit,
  disabled,
  error,
  onClearError,
}) {
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
      <CurrencyInput
        className="w-full rounded border p-2"
        id="amount"
        name="nominal"
        placeholder="Jumlah"
        defaultValue={0}
        intlConfig={{ locale: "id-ID", currency: "IDR" }}
        decimalsLimit={0}
        value={transaction.amount}
        onValueChange={(value) => {
          const numericValue = parseInt(value || "0", 10);
          onChange({ ...transaction, amount: numericValue });
        }}
      />
      <button
        type="submit"
        disabled={disabled}
        className="cursor-pointer rounded bg-primary px-3 py-2 text-white disabled:cursor-not-allowed disabled:opacity-60"
      >
        {disabled ? "Memproses..." : "Lanjutkan transaksi"}
      </button>
      {error && (
        <div
          className="flex w-full items-center justify-between rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700"
          role="alert"
        >
          <span>{error}</span>
          <button
            type="button"
            onClick={onClearError}
            className="ml-2 font-bold text-red-500 hover:text-red-800"
            title="Tutup"
          >
            ✕
          </button>
        </div>
      )}
    </form>
  );
}

export default TransactionForm;
