import { useEffect, useState } from 'react';
import { post } from '../../api';
import DashboardLayout from '../../components/DashboardLayout';
import TransactionFilter from '../../components/supervisor/TransactionFilter';
import TransactionTable from '../../components/supervisor/TransactionTable';


const AdminTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // State Filter
  const [filterType, setFilterType] = useState('all');
  const [date, setDate] = useState('');
  const [week, setWeek] = useState('');
  const [month, setMonth] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchTransactions = (params = {}) => {
    setLoading(true);
    setMessage("");

    const queryParams = new URLSearchParams();
    Object.keys(params).forEach((key) => {
      if (params[key]) queryParams.append(key, params[key]);
    });

    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';

    post(`/admin/transactions${queryString}`)
      .then((response) => {
        setTransactions(response.data || []);
      })
      .catch((error) => {
        setTransactions([]);
        setMessage(error.response?.data?.message || error.message || "Gagal mengambil data");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleFilterSubmit = (e) => {
    e.preventDefault();

    let params = {};
    if (filterType === 'date') params = { date };
    else if (filterType === 'week') params = { week };
    else if (filterType === 'month') params = { month };
    else if (filterType === 'range') params = { start_date: startDate, end_date: endDate };

    fetchTransactions(params);
  };

  const handleResetFilter = () => {
    setFilterType('all');
    setDate('');
    setWeek('');
    setMonth('');
    setStartDate('');
    setEndDate('');
    fetchTransactions();
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

      {/* {message && <p className="mb-4 text-sm font-medium text-red-600">{message}</p>} */}

      <TransactionTable transactions={transactions} loading={loading} />
    </DashboardLayout>
  );
};

export default AdminTransactions