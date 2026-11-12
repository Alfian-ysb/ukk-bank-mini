import { useEffect, useState } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import VaultOpeningBalanceForm from "../../components/admin/VaultOpeningBalanceForm";
import { get, patch } from "../../api";
import { setStoredBankName } from "../../context/authSession";
import { useDialog } from "../../context/dialogContext";
import CurrencyInput from "react-currency-input-field";
import Button from "../../components/Button";

const settingLabels = {
  bank_name: "Nama bank",
  bank_address: "Alamat bank",
  minimum_balance: "Batas saldo minimal",
  bank_contact: "Kontak bank (621234567890)",
  minimum_withdrawal: "Batas minimal penarikan",
  max_withdrawal: "Batas maksimal penarikan",
};

function formatPhoneNumber(value) {
  let cleaned = (value || "").replace(/\D/g, "");

  if (cleaned.startsWith("0")) {
    cleaned = "62" + cleaned.slice(1);
  }

  return cleaned;
}

function SettingsPage() {
  const { confirmDialog } = useDialog();
  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    get("/admin/settings")
      .then((response) => setSettings(response.data || []))
      .catch((requestError) => setError(requestError.message))
      .finally(() => setLoading(false));
  }, []);

  function changeValue(id, value, settingName) {
    let formattedValue = value;

    // Terapkan auto-koreksi hanya untuk bank_contact
    if (settingName === "bank_contact") {
      formattedValue = formatPhoneNumber(value);
    }

    setSettings((currentSettings) =>
      currentSettings.map((setting) =>
        setting.id === id ? { ...setting, value: formattedValue } : setting,
      ),
    );
  }

  async function saveAllSettings(event) {
    event.preventDefault();
    setError("");
    setMessage("");

    const isConfirmed = await confirmDialog(
      "Apakah Anda yakin ingin menyimpan semua perubahan pengaturan bank?",
    );

    if (!isConfirmed) return;

    setIsSaving(true);

    try {
      // Kirim request patch secara paralel untuk seluruh pengaturan
      const patchPromises = settings.map((setting) =>
        patch(`/admin/settings/${setting.id}`, {
          value: setting.value,
        }),
      );

      const responses = await Promise.all(patchPromises);

      // Update state lokal berdasarkan respons API
      const updatedSettings = settings.map((setting, index) => {
        const resData = responses[index]?.data;
        if (setting.name === "bank_name") {
          setStoredBankName(resData?.value ?? setting.value);
        }
        return resData ? { ...setting, ...resData } : setting;
      });

      setSettings(updatedSettings);
      setMessage("Semua pengaturan berhasil diperbarui.");
    } catch (requestError) {
      setError(requestError.message || "Gagal menyimpan beberapa pengaturan.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <DashboardLayout title="Settings">
      <section className="max-w-3xl mx-auto mt-4 rounded-lg bg-white p-5 shadow-sm font-inter">
        <div className="mb-5">
          <h2 className="text-lg font-semibold text-neutral-dark-gray">
            Pengaturan bank
          </h2>
          <p className="mt-1 text-sm text-neutral-light-gray">
            Ubah nilai pengaturan yang diperlukan, lalu simpan perubahannya.
          </p>
        </div>

        {error && (
          <p className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </p>
        )}
        {message && (
          <p className="mb-4 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
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
          <form onSubmit={saveAllSettings} className="space-y-4">
            {settings.map((setting) => (
              <div
                key={setting.id}
                className="rounded-lg border border-neutral-clay p-4"
              >
                <label
                  htmlFor={`setting-${setting.id}`}
                  className="mb-2 block text-sm font-semibold text-neutral-dark-gray"
                >
                  {settingLabels[setting.name] || setting.name}
                </label>
                <div>
                  {(() => {
                    switch (setting.name) {
                      case "bank_address":
                        return (
                          <textarea
                            name={setting.name}
                            id={`setting-${setting.id}`}
                            value={setting.value || ""}
                            onChange={(event) =>
                              changeValue(
                                setting.id,
                                event.target.value,
                                setting.name,
                              )
                            }
                            className="w-full rounded-lg border border-neutral-clay p-2"
                            required
                          ></textarea>
                        );
                      case "minimum_balance":
                      case "minimum_withdrawal":
                      case "max_withdrawal":
                        return (
                          <CurrencyInput
                            className="w-full rounded-lg border border-neutral-clay p-2"
                            id={`setting-${setting.id}`}
                            name={setting.name}
                            placeholder={
                              settingLabels[setting.name] || "Masukkan nilai"
                            }
                            defaultValue={0}
                            intlConfig={{ locale: "id-ID", currency: "IDR" }}
                            decimalsLimit={0}
                            value={setting.value || 0}
                            onValueChange={(val) => {
                              changeValue(setting.id, val || "", setting.name);
                            }}
                          />
                        );
                      case "bank_contact":
                        return (
                          <input
                            type="tel"
                            name={setting.name}
                            id={`setting-${setting.id}`}
                            value={setting.value || ""}
                            onChange={(event) =>
                              changeValue(
                                setting.id,
                                event.target.value,
                                setting.name,
                              )
                            }
                            placeholder="628123456789"
                            className="w-full rounded-lg border border-neutral-clay p-2"
                            required
                          />
                        );
                      default:
                        return (
                          <input
                            type="text"
                            name={setting.name}
                            id={`setting-${setting.id}`}
                            value={setting.value || ""}
                            onChange={(event) =>
                              changeValue(
                                setting.id,
                                event.target.value,
                                setting.name,
                              )
                            }
                            className="w-full rounded-lg border border-neutral-clay p-2"
                            required
                          />
                        );
                    }
                  })()}
                </div>
              </div>
            ))}

            {/* Tombol tunggal simpan di bagian bawah */}
            <div className="flex justify-end pt-2">
              <Button
                type="submit"
                text={
                  isSaving ? "Menyimpan Semua..." : "Simpan Semua Pengaturan"
                }
                theme="primary"
                disabled={isSaving}
              />
            </div>
          </form>
        )}
      </section>

      <div className="mt-6 max-w-3xl mx-auto">
        <VaultOpeningBalanceForm />
      </div>
    </DashboardLayout>
  );
}

export default SettingsPage;
