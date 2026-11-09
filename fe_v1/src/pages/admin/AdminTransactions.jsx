import { useEffect, useState } from 'react';
import { get } from '../../api';
import DashboardLayout from '../../components/DashboardLayout';
import Pagination from '../../components/Pagination';
import TransactionFilter from '../../components/supervisor/TransactionFilter';
import TransactionTable from '../../components/supervisor/TransactionTable';

const AdminTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({});

  const [filterType, setFilterType] = useState('all');
  const [date, setDate] = useState('');
  const [week, setWeek] = useState('');
  const [month, setMonth] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true);
    setMessage("");

    const queryParams = new URLSearchParams({
      ...filters,
      page: String(page),
      per_page: "15",
    });

    get(`/admin/transactions?${queryParams.toString()}`)
      .then((response) => {
        if (!active) return;
        setTransactions(response.data || []);
        setPagination(response.pagination || null);
      })
      .catch((error) => {
        if (!active) return;
        setTransactions([]);
        setPagination(null);
        setMessage(error.message || "Gagal mengambil data");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [filters, page]);

  const handleFilterSubmit = (e) => {
    e.preventDefault();

    let nextFilters = {};
    if (filterType === 'date') nextFilters = { date };
    else if (filterType === 'week') nextFilters = { week };
    else if (filterType === 'month') nextFilters = { month };
    else if (filterType === 'range') nextFilters = { start_date: startDate, end_date: endDate };

    setPage(1);
    setFilters(nextFilters);
  };

  const handleResetFilter = () => {
    setFilterType('all');
    setDate('');
    setWeek('');
    setMonth('');
    setStartDate('');
    setEndDate('');
    setPage(1);
    setFilters({});
  };

  return (
    <DashboardLayout title="Transaksi">
      <TransactionFilter
        filterType={filterType}
        setFilterType={setFilterType}
        date={date}
        setDate={setDate}
        week={week}
        setWeek={setWeek}
        month={month}
        setMonth={setMonth}
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
        onSubmit={handleFilterSubmit}
        onReset={handleResetFilter}
      />

      {message && <p className="mb-4 text-sm font-medium text-red-600">{message}</p>}
      <TransactionTable
        transactions={transactions}
        loading={loading}
        exportUrl="/admin/transactions/export"
        filters={filters}
      />
      <Pagination
        pagination={pagination}
        onPageChange={setPage}
        disabled={loading}
      />
    </DashboardLayout>
  );
};

export default AdminTransactions