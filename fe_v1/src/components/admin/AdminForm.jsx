function AdminForm({
  title,
  fields,
  values,
  onChange,
  onSubmit,
  onCancel,
  submitLabel,
  error,
  message,
}) {
  return (
    <form className="space-y-3 rounded bg-white p-4 shadow-sm" onSubmit={onSubmit}>
      <h2 className="text-lg font-semibold">{title}</h2>
      {fields.map((field) => (
        <label className="block" key={field.name}>
          {field.label}
          {field.type === "select" ? (
            <select
              className="mt-1 w-full rounded border p-2"
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
              className="mt-1 w-full rounded border p-2"
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
      {error && <p className="text-red-600">{error}</p>}
      {message && <p className="text-green-600">{message}</p>}
      <div className="flex gap-2">
        <button className="rounded bg-primary px-3 py-2 text-white" type="submit">
          {submitLabel}
        </button>
        {onCancel && (
          <button className="rounded border px-3 py-2" type="button" onClick={onCancel}>
            Batal
          </button>
        )}
      </div>
    </form>
  );
}

export default AdminForm;
