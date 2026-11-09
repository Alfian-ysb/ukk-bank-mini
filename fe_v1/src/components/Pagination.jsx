function Pagination({ pagination, onPageChange, disabled = false }) {
  if (!pagination) return null;

  const currentPage = Number(pagination.current_page) || 1;
  const lastPage = Number(pagination.last_page) || 1;
  const total = Number(pagination.total) || 0;
  const from = pagination.from ?? 0;
  const to = pagination.to ?? 0;

  return (
    <nav
      className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm"
      aria-label="Paginasi"
    >
      <p className="text-gray-600">
        Menampilkan {from}–{to} dari {total} data
      </p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={disabled || currentPage <= 1}
          className="rounded-md border border-gray-300 px-3 py-2 text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Sebelumnya
        </button>
        <span className="text-gray-600">
          Halaman {currentPage} dari {lastPage}
        </span>
        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={disabled || currentPage >= lastPage}
          className="rounded-md border border-gray-300 px-3 py-2 text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Berikutnya
        </button>
      </div>
    </nav>
  );
}

export default Pagination;
