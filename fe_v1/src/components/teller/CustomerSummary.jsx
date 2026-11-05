function CustomerSummary({ customer }) {
  return (
    <div className="flex-1 rounded-lg border border-neutral-clay p-4 font-plus-jakarta-sans">
      <div className="mb-4">
        <p className="font-bold text-2xl">{customer.student_name}</p>
        <div className="flex gap-4">
          <p className="text-sm font-medium text-neutral-light-gray">
            NIS:{" "}
            <span className="text-neutral-dark-gray font-semibold">
              {customer.nis}
            </span>
          </p>
        </div>
      </div>
      <div className="border-t border-neutral-clay py-2">
        <ul className="flex justify-between">
          <li>
            <p className="text-sm font-semibold text-neutral-light-gray">
              Nomor Rekening
            </p>
            <p className="text-lg font-bold text-neutral-dark-gray">
              {customer.account_number}
            </p>
          </li>
          <li>
            <p className="text-sm font-semibold text-neutral-light-gray">
              Jurusan
            </p>
            <p className="text-lg font-bold text-neutral-dark-gray">
              {customer.major}
            </p>
          </li>
          <li>
            <p className="text-sm font-semibold text-neutral-light-gray">
              Angkatan
            </p>
            <p className="text-lg font-bold text-neutral-dark-gray">
              {customer.cohort_year}
            </p>
          </li>
          <li>
            <p className="text-sm font-medium text-neutral-light-gray">
              Status
            </p>
            <p className="text-lg font-bold text-neutral-dark-gray">
              {customer.status}
            </p>
          </li>
        </ul>
        {/* {customer.balance !== undefined && (
          <p className="mt-2 text-sm font-semibold text-neutral-dark-gray">
            Saldo: Rp {Number(customer.balance || 0).toLocaleString("id-ID")}
          </p>
        )} */}
      </div>
    </div>
  );
}

export default CustomerSummary;
