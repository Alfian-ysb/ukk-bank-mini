import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";
import ShiftActionForms from "../../components/teller/ShiftActionForms";
import CustomerSearch from "../../components/teller/CustomerSearch";
import QrScannerModal from "../../components/teller/QrScannerModal";
import useCustomerLookup from "../../hooks/useCustomerLookup";
import { get, post } from "../../api";

const openingDenominations = [100000, 50000, 20000, 10000, 5000];

const createOpeningDenominations = () =>
  openingDenominations.map((denomination) => ({ denomination, quantity: 0 }));

function TellerDashboard() {
  const [shiftStatus, setShiftStatus] = useState("loading");
  const [assignedStaff, setAssignedStaff] = useState([{ name: "", className: "" }]);
  const [opening, setOpening] = useState(createOpeningDenominations);
  const [message, setMessage] = useState("");
  const [isOpeningShift, setIsOpeningShift] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const {
    accountNumber,
    message: lookupMessage,
    isFindingCustomer,
    setAccountNumber,
    setMessage: setLookupMessage,
    findCustomer,
  } = useCustomerLookup();

  useEffect(() => {
    async function loadCurrentShift() {
      try {
        const response = await get("/teller/shifts/current");
        setShiftStatus(
          response.data?.status?.toLowerCase() === "open" ? "open" : "not-open",
        );
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
    const quantity = value === "" ? 0 : Math.max(0, parseInt(value, 10) || 0);
    setter((items) =>
      items.map((item, itemIndex) =>
        itemIndex === index ? { ...item, quantity } : item,
      ),
    );
  }

  async function openShift() {
    if (isOpeningShift) return;

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

      setIsOpeningShift(true);
      setMessage("");
      await post("/teller/shifts/open", {
        assigned_staff: staffNames,
        opening_denominations: opening,
      });
      setShiftStatus("open");
      setMessage("Shift berhasil dibuka!");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setIsOpeningShift(false);
    }
  }

  function handleFindCustomer(event) {
    event.preventDefault();
    findCustomer();
  }

  function handleAccountDetected(scannedAccountNumber) {
    setAccountNumber(scannedAccountNumber);
    findCustomer(scannedAccountNumber);
  }

  return (
    <DashboardLayout title="Dashboard Teller">
      <div className="grid gap-4 md:grid-cols-3">
        <Menu
          to="/teller/shift"
          title="Shift"
          text="Buka atau tutup shift teller."
        />
        <Menu
          to="/teller/transaction"
          title="Transaksi"
          text="Setor dan tarik uang nasabah."
        />
        <Menu
          to="/teller/report"
          title="Laporan"
          text="Lihat transaksi berdasarkan tanggal."
        />
      </div>

      <section className="mt-4 space-y-4">
        {shiftStatus === "loading" && (
          <p className="text-center text-sm text-slate-500">
            Memeriksa status shift...
          </p>
        )}

        {shiftStatus === "not-open" && (
          <ShiftActionForms
            canOpenShift
            canCloseShift={false}
            assignedStaff={assignedStaff}
            setAssignedStaff={setAssignedStaff}
            opening={opening}
            updateDenomination={updateDenomination}
            setOpening={setOpening}
            openShift={openShift}
            isOpeningShift={isOpeningShift}
          />
        )}

        {shiftStatus === "open" && (
          <>
            <div className="rounded border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
              Shift sudah dibuka.
            </div>
            <section className="w-full rounded bg-white p-4 shadow-[4px_4px_12px_rgba(0,0,0,0.05)]">
              <h2 className="mb-3 text-lg font-semibold">Cari Nasabah</h2>
              {lookupMessage && (
                <div className="mb-4 flex items-center justify-between rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  <span>{lookupMessage}</span>
                  <button
                    type="button"
                    onClick={() => setLookupMessage("")}
                    className="ml-2 font-bold text-red-500 hover:text-red-800"
                    title="Tutup"
                  >
                    ✕
                  </button>
                </div>
              )}
              <CustomerSearch
                accountNumber={accountNumber}
                isFindingCustomer={isFindingCustomer}
                onAccountNumberChange={setAccountNumber}
                onFind={handleFindCustomer}
                onOpenScanner={() => {
                  setLookupMessage("");
                  setIsScannerOpen(true);
                }}
              />
            </section>
            {isScannerOpen && (
              <QrScannerModal
                onClose={() => setIsScannerOpen(false)}
                onError={(error) =>
                  setLookupMessage(
                    error?.message ||
                      "Kamera tidak dapat digunakan. Izinkan akses kamera lalu coba lagi.",
                  )
                }
                onAccountDetected={handleAccountDetected}
              />
            )}
          </>
        )}

        {message && (
          <div
            className={`rounded border p-4 text-sm ${
              shiftStatus === "error" || shiftStatus === "not-open"
                ? "border-amber-200 bg-amber-50 text-amber-800"
                : "border-emerald-200 bg-emerald-50 text-emerald-800"
            }`}
            role="status"
          >
            {message}
          </div>
        )}
      </section>
    </DashboardLayout>
  );
}

function Menu({ to, title, text }) {
  return (
    <Link className="rounded bg-white p-4 shadow-[4px_4px_12px_rgba(0,0,0,0.05)]" to={to}>
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="mt-2 text-sm text-gray-600">{text}</p>
    </Link>
  );
}

export default TellerDashboard;
