import { useEffect, useState } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import VaultOpeningBalanceForm from "../../components/admin/VaultOpeningBalanceForm";
import { get, patch } from "../../api";

const settingLabels = {
  bank_name: "Nama bank",
  bank_address: "Alamat bank",
  batas_saldo_minimal: "Batas saldo minimal",
  bank_contact: "Kontak bank",
};

function SettingsPage() {
  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    get("/admin/settings")
      .then((response) => setSettings(response.data || []))
      .catch((requestError) => setError(requestError.message))
      .finally(() => setLoading(false));
  }, []);

  function changeValue(id, value) {
    setSettings((currentSettings) =>
      currentSettings.map((setting) =>
        setting.id === id ? { ...setting, value } : setting,
      ),
    );
  }

  async function saveSetting(event, setting) {
    event.preventDefault();
    setError("");
    setMessage("");
    setSavingId(setting.id);

    try {
      const response = await patch(`/admin/settings/${setting.id}`, {
        value: setting.value,
      });
      setSettings((currentSettings) =>
        currentSettings.map((currentSetting) =>
          currentSetting.id === setting.id
            ? { ...currentSetting, ...response.data }
            : currentSetting,
        ),
      );
      setMessage(response.message || "Pengaturan berhasil diperbarui.");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSavingId(null);
    }
  }

  return (
    <DashboardLayout title="Settings">
      <section className="max-w-3xl rounded-lg bg-white p-5 shadow-sm">
        <div className="mb-5">
          <h2 className="text-lg font-semibold text-neutral-dark-gray">
            Pengaturan bank
          </h2>
          <p className="mt-1 text-sm text-neutral-light-gray">
            Ubah nilai pengaturan yang diperlukan, lalu simpan perubahannya.
          </p>
        </div>

        {error && (
          <p className="mb-4 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </p>
        )}
        {message && (
          <p className="mb-4 rounded border border-green-200 bg-green-50 p-3 text-sm text-green-700">
            {message}
          </p>
        )}

        {loading ? (
          <p className="text-sm text-neutral-light-gray">
            Memuat pengaturan...
          </p>
        ) : settings.length === 0 ? (
          <p className="text-sm text-neutral-light-gray">
            Belum ada pengaturan.
          </p>
        ) : (
          <div className="space-y-4">
            {settings.map((setting) => (
              <form
                key={setting.id}
                onSubmit={(event) => saveSetting(event, setting)}
                className="rounded border border-neutral-clay p-4"
              >
                <label
                  htmlFor={`setting-${setting.id}`}
                  className="mb-2 block text-sm font-semibold text-neutral-dark-gray"
                >
                  {settingLabels[setting.name] || setting.name}
                </label>
                <div className="flex flex-col gap-3 sm:flex-row">
                  {(() => {
                    switch (setting.name) {
                        case "bank_address":
                            return <textarea name={setting.name} id={`setting-${setting.id}`} value={setting.value} onChange={(event) => changeValue(setting.id, event.target.value)} className="w-full rounded border p-2" required></textarea>
                        case "batas_saldo_minimal":
                            return <input type="number" name={setting.name} id={`setting-${setting.id}`} value={setting.value} onChange={(event) => changeValue(setting.id, event.target.value)} className="w-full rounded border p-2" required />
                        case "bank_contact":
                            return <input type="tel" name={setting.name} id={`setting-${setting.id}`} value={setting.value} onChange={(event) => changeValue(setting.id, event.target.value)} className="w-full rounded border p-2" required />
                        default:
                            return <input type="text" name={setting.name} id={`setting-${setting.id}`} value={setting.value} onChange={(event) => changeValue(setting.id, event.target.value)} className="w-full rounded border p-2" required />
                    }
                  })()}
                  <button
                    type="submit"
                    disabled={savingId === setting.id}
                    className="rounded bg-primary px-4 py-2 h-fit text-white disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {savingId === setting.id ? "Menyimpan..." : "Simpan"}
                  </button>
                </div>
              </form>
            ))}
          </div>
        )}
      </section>
      <div className="mt-6 max-w-3xl">
        <VaultOpeningBalanceForm />
      </div>
    </DashboardLayout>
  );
}

export default SettingsPage;
