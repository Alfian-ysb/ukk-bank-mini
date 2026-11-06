export const CUSTOMER_CSV_FIELDS = [
  "nis",
  "student_name",
  "email",
  "major",
  "cohort_year",
  "pin",
  "password",
];

export function getCsvDelimiter(text) {
  let semicolons = 0;
  let commas = 0;
  let inQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];

    if (character === '"') {
      if (inQuotes && text[index + 1] === '"') {
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (!inQuotes && (character === "\n" || character === "\r")) {
      break;
    } else if (!inQuotes && character === ";") {
      semicolons += 1;
    } else if (!inQuotes && character === ",") {
      commas += 1;
    }
  }

  return semicolons > commas ? ";" : ",";
}

export function parseCsv(text, delimiter) {
  const records = [];
  let record = [];
  let field = "";
  let inQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];

    if (character === '"') {
      if (inQuotes && text[index + 1] === '"') {
        field += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (!inQuotes && character === delimiter) {
      record.push(field);
      field = "";
    } else if (!inQuotes && (character === "\n" || character === "\r")) {
      if (character === "\r" && text[index + 1] === "\n") {
        index += 1;
      }
      record.push(field);
      records.push(record);
      record = [];
      field = "";
    } else {
      field += character;
    }
  }

  if (inQuotes) {
    throw new Error("Format CSV tidak valid: ada tanda kutip yang belum ditutup.");
  }

  if (field || record.length > 0) {
    record.push(field);
    records.push(record);
  }

  const [headerRecord, ...dataRecords] = records;
  if (!headerRecord) {
    throw new Error("File CSV tidak memiliki header.");
  }

  const headers = headerRecord.map((header, index) => {
    const normalized = index === 0 ? header.replace(/^\uFEFF/, "") : header;
    return normalized.trim().toLowerCase().replace(/\s+/g, "_");
  });
  const missingFields = CUSTOMER_CSV_FIELDS.filter(
    (name) => name !== "email" && !headers.includes(name),
  );

  if (missingFields.length > 0) {
    throw new Error(`Kolom CSV tidak lengkap: ${missingFields.join(", ")}.`);
  }

  if (new Set(headers).size !== headers.length) {
    throw new Error("File CSV memiliki nama kolom yang duplikat.");
  }

  const rows = dataRecords
    .filter((values) => values.some((value) => value.trim() !== ""))
    .map((values) =>
      Object.fromEntries(
        CUSTOMER_CSV_FIELDS.map((name) => {
          const columnIndex = headers.indexOf(name);
          return [name, columnIndex < 0 ? "" : (values[columnIndex] ?? "")];
        }),
      ),
    );

  if (rows.length === 0) {
    throw new Error("File CSV tidak memiliki data nasabah.");
  }

  return rows;
}

export function serializeCsv(rows, delimiter) {
  const escapeValue = (value) => {
    const text = String(value ?? "");
    return text.includes(delimiter) || /["\r\n]/.test(text)
      ? `"${text.replace(/"/g, '""')}"`
      : text;
  };
  const header = CUSTOMER_CSV_FIELDS.join(delimiter);
  const data = rows.map((row) =>
    CUSTOMER_CSV_FIELDS.map((field) => escapeValue(row[field])).join(delimiter),
  );

  return [header, ...data].join("\r\n");
}
