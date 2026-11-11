function CustomerSearch({
  accountNumber,
  isFindingCustomer,
  onAccountNumberChange,
  onFind,
  onOpenScanner,
}) {
  return (
    <form onSubmit={onFind} className="flex w-full gap-4 flex-col md:flex-row">
      <input
        className="w-full rounded-lg border p-2"
        placeholder="Nomor rekening"
        value={accountNumber}
        onChange={(event) => onAccountNumberChange(event.target.value)}
      />
      <button
        type="button"
        className="text-nowrap md:w-2/10 cursor-pointer rounded-lg border py-2 md:py-0 px-3 hover:bg-primary/10"
        onClick={onOpenScanner}
      >
        Scan QR
      </button>
      <button
        type="submit"
        disabled={isFindingCustomer}
        className="text-nowrap md:w-2/10 cursor-pointer rounded-lg border bg-primary py-2 md:py-2 px-3 text-neutral-light disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isFindingCustomer ? "Mencari..." : "Cari nasabah"}
      </button>
    </form>
  );
}

export default CustomerSearch;
