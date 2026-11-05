function AdminForm({
  title,
  fields,
  values,
  onChange,
  onSubmit,
  onCancel,
  submitLabel,
  onReset,
  error,
  message,
}) {
  return (
    <form className="space-y-3 w-full rounded-lg bg-white p-4 shadow-sm" onSubmit={onSubmit}>
      <h2 className="text-lg font-semibold">{title}</h2>
      {fields.map((field) => (
        <label className="block" key={field.name}>
          {field.label}
          {field.type === "select" ? (
            <select
              className="mt-1 w-full rounded-lg border-2 p-2 border-neutral-clay"
              name={field.name}
              value={values[field.name] || ""}
              onChange={onChange}
              required={field.required}
            >
              <option value="">Pilih {field.label.toLowerCase()}</option>
              {field.options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          ) : (
            <input
              className="mt-1 w-full rounded-lg border-2 p-2 border-neutral-clay"
              type={field.type || "text"}
              name={field.name}
              value={values[field.name] || ""}
              onChange={onChange}
              placeholder={field.placeholder}
              required={field.required}
              minLength={field.minLength}
              maxLength={field.maxLength}
            />
          )}
        </label>
      ))}
      {onReset && (
        <button className="cursor-pointer underline text-primary" type="button" onClick={onReset}>
          Reset
        </button>
      )}
      {error && <p className="text-red-600">{error}</p>}
      {message && <p className="text-green-600">{message}</p>}
      <div className="flex justify-between gap-12 mt-12">
      {onCancel && (
          <button className="rounded-lg w-full border px-3 py-2 cursor-pointer" type="button" onClick={onCancel}>
            Batal
          </button>
        )}
        <button className="rounded-lg w-full bg-primary px-3 py-2 text-white cursor-pointer" type="submit">
          {submitLabel}
        </button>
      </div>
    </form>
  );
}

export default AdminForm;
