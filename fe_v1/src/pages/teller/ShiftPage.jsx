import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";
import { get, post } from "../../api";
import CurrentShiftDetails from "../../components/teller/CurrentShiftDetails";
import ShiftActionForms from "../../components/teller/ShiftActionForms";

const denominationsOpening = [100000, 50000, 20000, 10000, 5000];
const denominationsClosing = [100000, 50000, 20000, 10000, 5000, 2000, 1000, 500, 200, 100];

const emptyDenominations = (list) =>
  list.map((denomination) => ({ denomination, quantity: 0 }));

function ShiftPage() {
  const [assignedStaff, setAssignedStaff] = useState([{ name: "", className: "" }]);
  const [opening, setOpening] = useState(emptyDenominations(denominationsOpening));
  const [closing, setClosing] = useState(emptyDenominations(denominationsClosing));
  const [message, setMessage] = useState("");
  const [shiftStatus, setShiftStatus] = useState("loading");
  const [currentShift, setCurrentShift] = useState(null);

  useEffect(() => {
    async function loadCurrentShift() {
      try {
        const response = await get("/teller/shifts/current");
        setCurrentShift(response.data || null);
        setShiftStatus(response.data?.status?.toLowerCase() === "open" ? "open" : "not-open");
      } catch (error) {
        if (error.status === 404) {
          setShiftStatus("not-open");
          return;
        }
        setShiftStatus("error");
        setMessage(error.message);
      }
    }

    loadCurrentShift();
  }, []);

  function updateDenomination(setter, index, value) {
    const val = value === "" ? 0 : Math.max(0, parseInt(value, 10) || 0);
    setter((items) =>
      items.map((item, itemIndex) =>
        itemIndex === index ? { ...item, quantity: val } : item
      )
    );
  }

  async function openShift() {
    try {
      const staffNames = assignedStaff.map(({ name, className }) => {
        const trimmedName = name.trim();
        const trimmedClass = className.trim();

        if (!trimmedName || !trimmedClass) {
          throw new Error("Lengkapi nama dan kelas setiap petugas teller.");
        }

        return `${trimmedName} - ${trimmedClass}`;
      });

      if (staffNames.length < 1 || staffNames.length > 3) {
        throw new Error("Masukkan 1-3 petugas teller.");
      }

      const response = await post("/teller/shifts/open", {
        assigned_staff: staffNames,
        opening_denominations: opening,
      });
      setCurrentShift(response.data || null);
      setShiftStatus("open");
      setMessage(response.message || "Shift berhasil dibuka!");
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function closeShift() {
    try {
      const response = await post("/teller/shifts/close", {
        closing_denominations: closing,
      });
      setCurrentShift(response.data || currentShift);
      setShiftStatus("closed");
      setMessage(response.message || "Shift berhasil ditutup!");
    } catch (error) {
      setMessage(error.message);
    }
  }

  const today = new Date();
  const formattedToday = today.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const canOpenShift = shiftStatus === "not-open";
  const canCloseShift = shiftStatus === "open";

  return (
    <DashboardLayout title="Shift & Laporan Harian Teller">
      <div className="mx-auto space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            to="/teller/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
          >
            &larr; Kembali ke Dashboard
          </Link>
          <span className="text-xs font-medium text-slate-400">
            {formattedToday}
          </span>
        </div>

        {/* Status Shift Aktif */}
        {currentShift && <CurrentShiftDetails shift={currentShift} />}

        {/* Form Buka / Tutup Shift */}
        <ShiftActionForms
          canOpenShift={canOpenShift}
          canCloseShift={canCloseShift}
          assignedStaff={assignedStaff}
          setAssignedStaff={setAssignedStaff}
          opening={opening}
          closing={closing}
          updateDenomination={updateDenomination}
          setOpening={setOpening}
          setClosing={setClosing}
          openShift={openShift}
          closeShift={closeShift}
        />

        {shiftStatus === "loading" && (
          <p className="text-center text-xs text-slate-400">Memeriksa status shift...</p>
        )}

        {message && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs font-medium text-amber-800">
            {message}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default ShiftPage;