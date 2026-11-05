import React from 'react';
import Button from '../Button';

const TransactionFilter = ({
  filterType,
  setFilterType,
  date,
  setDate,
  week,
  setWeek,
  month,
  setMonth,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  onSubmit,
  onReset,
}) => {
  return (
    <section className="mb-6 rounded-lg bg-white p-5 shadow-sm print:hidden">
      <h3 className="mb-3 text-lg font-semibold text-gray-700">Filter Transaksi</h3>
      <form onSubmit={onSubmit} className="flex flex-wrap items-end gap-4">
        {/* Pilihan Opsi Filter */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Tipe Filter</label>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="cursor-pointer rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none"
          >
            <option value="all">Semua Data</option>
            <option value="date">Per Hari</option>
            <option value="week">Per Minggu</option>
            <option value="month">Per Bulan</option>
            <option value="range">Rentang Tanggal</option>
          </select>
        </div>

        {/* Input Filter Hari */}
        {filterType === 'date' && (
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Pilih Tanggal</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="cursor-pointer rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none"
              required
            />
          </div>
        )}

        {/* Input Filter Minggu */}
        {filterType === 'week' && (
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Tanggal dalam Minggu</label>
            <input
              type="date"
              value={week}
              onChange={(e) => setWeek(e.target.value)}
              className="cursor-pointer rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none"
              required
            />
          </div>
        )}

        {/* Input Filter Bulan */}
        {filterType === 'month' && (
          <div>
            <label className=" block text-xs font-medium text-gray-600 mb-1">Pilih Bulan & Tahun</label>
            <input
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="cursor-pointer rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none"
              required
            />
          </div>
        )}

        {/* Input Filter Rentang Tanggal */}
        {filterType === 'range' && (
          <>
            <div>
              <label className="cursor-pointer block text-xs font-medium text-gray-600 mb-1">Tanggal Mulai</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="cursor-pointer block text-xs font-medium text-gray-600 mb-1">Tanggal Selesai</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none"
                required
              />
            </div>
          </>
        )}

        {/* Tombol Aksi */}
        {filterType !== 'all' && (
          <Button
            type="submit"
            text="Terapkan Filter"
            theme="primary"
          />
        )}

        <Button
          type="button"
          onClick={onReset}
          text="Reset Filter"
          theme="outline"
        />
      </form>
    </section>
  );
};

export default TransactionFilter;