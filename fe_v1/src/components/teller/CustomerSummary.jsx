function CustomerSummary({ customer }) {
  return (
    <div className="flex-1 rounded border border-neutral-clay p-4 font-plus-jakarta-sans">
      <div className="mb-4">
        <p className="font-semibold">{customer.student_name}</p>
        <p className="text-sm font-medium text-neutral-light-gray">
          NIS: {customer.nis}
        </p>
        <p className="text-sm font-medium text-neutral-light-gray">
          Jurusan: {customer.major}
        </p>
        <p className="text-sm font-medium text-neutral-light-gray">
          Angkatan: {customer.cohort_year}
        </p>
        <p className="text-sm font-medium text-neutral-light-gray">
          Status: {customer.status}
        </p>
      </div>
      <div className="border-t border-neutral-clay py-2">
        <p className="text-sm font-semibold text-neutral-light-gray">
          Nomor Rekening
        </p>
        <p className="text-sm font-bold text-neutral-dark-gray">
          {customer.account_number}
        </p>
      </div>
    </div>
  );
}

export default CustomerSummary;
