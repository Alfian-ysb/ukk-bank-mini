import Table from "../Table";

function AdminTable({ title, headers, rows, emptyMessage }) {
  return (
    <section className="rounded bg-white p-4 shadow-sm">
      <h2 className="mb-3 text-lg font-semibold">{title}</h2>
      {rows.length ? (
        <Table headers={headers} data={rows} />
      ) : (
        <p className="text-sm text-gray-500">{emptyMessage}</p>
      )}
    </section>
  );
}

export default AdminTable;
