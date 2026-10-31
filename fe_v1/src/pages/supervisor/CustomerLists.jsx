import { useEffect, useState } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import { get } from "../../api";
import Table from "../../components/Table";

const CustomerList = () => {
  const [customers, setCustomers] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    get("/supervisor/customers")
      .then((response) => {
        setCustomers(response.data || []);
      })
      .catch((error) => {
        setMessage(error.message);
      });
  }, []);

  return (
    <DashboardLayout title="Daftar Nasabah">
      {message && <p className="mb-4 text-sm font-medium text-red-600">{message}</p>}

      <section className="rounded-lg bg-white p-5 shadow-sm">
        <h2 className="mb-3 text-2xl font-plus-jakarta-sans font-semibold text-gray-700">Daftar Nasabah</h2>
        {customers.length > 0 ? (
        <Table
          headers={[
            "No. Rekening",
            "NIS",
            "Nama Siswa",
            "Jurusan",
            "Angkatan",
            "Status",
          ]}
          data={customers.map((customer) => [
            customer.account_number,
            customer.nis,
            customer.student_name,
            customer.major,
            customer.cohort_year,
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${
                customer.status === "active"
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {customer.status}
            </span>
          ])}
        />
      ) : (
        <p className="text-sm text-gray-500">Tidak ada data customer.</p>
      )}
      </section>
    </DashboardLayout>
  );
}

export default CustomerList;