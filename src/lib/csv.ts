export function generateCSV(
  data: Record<string, unknown>[],
  columns: string[]
): string {
  const escapeField = (value: unknown): string => {
    const str = value == null ? "" : String(value);
    if (str.includes(",") || str.includes('"') || str.includes("\n")) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const header = columns.map(escapeField).join(",");
  const rows = data.map((row) =>
    columns.map((col) => escapeField(row[col])).join(",")
  );

  return [header, ...rows].join("\n");
}
