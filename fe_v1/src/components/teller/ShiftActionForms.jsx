import React from "react";
import DenominationTableForm from "./DenominationTableForm";
import Button from "../Button";

const ShiftActionForms = ({
  canOpenShift,
  canCloseShift,
  assignedStaff,
  setAssignedStaff,
  opening,
  closing,
  updateDenomination,
  setOpening,
  setClosing,
  openShift,
  closeShift,
  isOpeningShift = false,
}) => {
  const updateStaff = (index, field, value) => {
    setAssignedStaff((staff) =>
      staff.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item
      )
    );
  };

  const addStaff = () => {
    if (assignedStaff.length < 3) {
      setAssignedStaff([...assignedStaff, { name: "", className: "" }]);
    }
  };

  const removeStaff = (index) => {
    if (assignedStaff.length > 1) {
      setAssignedStaff(assignedStaff.filter((_, itemIndex) => itemIndex !== index));
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Buka Shift */}
      {canOpenShift && (
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-[4px_4px_12px_rgba(0,0,0,0.05)]">
          <div className="mb-4 border-b border-slate-100 pb-3">
            <h2 className="text-lg font-bold text-slate-900">Buka Shift (Saldo Awal)</h2>
            <p className="text-sm text-slate-500">Input data teller dan rincian fisik uang awal</p>
          </div>

          <div className="mb-5 space-y-3">
            <label className="block text-sm font-semibold uppercase tracking-wider text-slate-500">
              Petugas Teller (1-3 Orang)
            </label>
            {assignedStaff.map((staff, index) => (
              <div key={index} className="flex items-end gap-2">
                <div className="flex-1">
                  <label className="mb-1 block text-xs text-slate-500">Nama</label>
                  <input
                    className="w-full rounded-lg border border-slate-200 px-3.5 py-2 text-sm text-slate-800 focus:border-slate-800 focus:outline-none"
                    placeholder="Nama petugas"
                    value={staff.name}
                    onChange={(event) => updateStaff(index, "name", event.target.value)}
                  />
                </div>
                <div className="flex-1">
                  <label className="mb-1 block text-xs text-slate-500">Kelas</label>
                  <input
                    className="w-full rounded-lg border border-slate-200 px-3.5 py-2 text-sm text-slate-800 focus:border-slate-800 focus:outline-none"
                    placeholder="Contoh: XI RPL 1"
                    value={staff.className}
                    onChange={(event) => updateStaff(index, "className", event.target.value.toUpperCase())}
                  />
                </div>
                {assignedStaff.length > 1 && (
                  <button
                    type="button"
                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
                    onClick={() => removeStaff(index)}
                    aria-label={`Hapus petugas ${index + 1}`}
                  >
                    Hapus
                  </button>
                )}
              </div>
            ))}
            {assignedStaff.length < 3 && (
              <button
                type="button"
                className="text-sm font-semibold text-slate-700 cursor-pointer mb-4"
                onClick={addStaff}
              >
                + Tambah petugas
              </button>
            )}
            </div>

          <DenominationTableForm
            title="Rincian Lembaran: Saldo Awal"
            items={opening}
            onChange={(idx, val) => updateDenomination(setOpening, idx, val)}
          />

          <Button
            onClick={openShift}
            text={isOpeningShift ? "Membuka Shift..." : "Buka Shift & Simpan Saldo Awal"}
            theme="primary"
            customClass="mt-6 w-full"
            disabled={isOpeningShift}
           />
        </div>
      )}

      {/* Tutup Shift */}
      {canCloseShift && (
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-xs">
          <div className="mb-4 border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-900">Tutup Shift (Saldo Akhir)</h2>
            <p className="text-xs text-slate-500">Hitung ulang fisik uang tunai di laci sebelum penutupan</p>
          </div>

          <DenominationTableForm
            title="Rincian Lembaran: Uang Fisik"
            items={closing}
            onChange={(idx, val) => updateDenomination(setClosing, idx, val)}
          />

          <Button
            onClick={closeShift}
            text="Tutup Shift & Ajukan Laporan"
            theme="primary"
            customClass="mt-6 w-full"
           />
        </div>
      )}
    </div>
  );
};

export default ShiftActionForms;