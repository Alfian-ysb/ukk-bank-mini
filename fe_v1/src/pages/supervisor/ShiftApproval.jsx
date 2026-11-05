import { useEffect, useState } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import { get } from "../../api";
import Table from "../../components/Table";
import Button from "../../components/Button";
import { useNavigate } from "react-router-dom";

const ShiftApproval = () => {
  const [shifts, setShifts] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState("all"); 
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const fetchShifts = async () => {
    try {
      const response = await get("/supervisor/shifts");
      setShifts(response.data || []);
    } catch (error) {
      setMessage(error.message);
    }
  };

  useEffect(() => {
    fetchShifts();
  }, []);

  const filteredShifts = shifts.filter((shift) => {
    if (selectedStatus === "all") return true;
    return shift.status?.toLowerCase() === selectedStatus.toLowerCase();
  });

  return (
    <DashboardLayout title="Approve Shift">
      {message && (
        <p className="mb-4 text-sm font-medium text-red-600">{message}</p>
      )}

      <section className="rounded-lg bg-white p-5 shadow-sm">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-2xl font-plus-jakarta-sans font-semibold text-neutral-dark-gray">
            Laporan Harian
          </h2>

          <div className="flex items-center gap-2">
            <label htmlFor="status-filter" className="text-xs font-semibold text-neutral-light-gray">
              Filter Status:
            </label>
            <select
              id="status-filter"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="rounded-lg border-2 border-primary cursor-pointer bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-xs focus:border-slate-500 focus:outline-none"
            >
              <option value="all">Semua Status</option>
              <option value="open">Open</option>
              <option value="closed">Closed (Menunggu Approval)</option>
              <option value="approved">Approved</option>
            </select>
          </div>
        </div>

        {filteredShifts.length ? (
          <Table
            headers={[
              "Tanggal",
              "Teller / Staff",
              "Saldo Sistem",
              "Saldo Fisik",
              "Status",
              "Aksi",
            ]}
            data={filteredShifts.map((shift) => {
              const rawDate = shift.shift_date || shift.date;
              const parsedDate = rawDate ? new Date(rawDate) : null;
              const formattedDate =
                parsedDate && !isNaN(parsedDate)
                  ? parsedDate.toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })
                  : "Tanggal Tidak Valid";

              const staffDisplay = shift.teller
                ? shift.teller
                : Array.isArray(shift.assigned_staff)
                ? `${shift.assigned_staff.join(", ")}`
                : "-";

              const actionButtons = (
                <div className="flex items-center gap-2">
                  <Button
                    text="Lihat"
                    onClick={() => navigate(`/supervisor/shifts/${shift.id}`)}
                    theme="outline"
                  />
                </div>
              );

              return [
                formattedDate,
                staffDisplay,
                `Rp${Number(shift.closing_digital_balance || 0).toLocaleString("id-ID")}`,
                `Rp${Number(shift.closing_physical_balance || 0).toLocaleString("id-ID")}`,
                shift.status,
                actionButtons,
              ];
            })}
          />
        ) : (
          <p className="py-4 text-center text-sm text-gray-500">
            {shifts.length === 0
              ? "Tidak ada data shift."
              : `Tidak ada shift dengan status "${selectedStatus}".`}
          </p>
        )}
      </section>
    </DashboardLayout>
  );
};

export default ShiftApproval;