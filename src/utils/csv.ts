export interface CsvRow {
  date: string;
  soroswap_volume: number;
  phoenix_volume: number;
  blend_volume: number;
  total_volume: number;
}

/**
 * Converts volume data points to CSV rows.
 */
export function toCsvRows(data: CsvRow[]): string {
  const header = "date,soroswap_volume,phoenix_volume,blend_volume,total_volume";
  const rows = data.map((row) =>
    [row.date, row.soroswap_volume, row.phoenix_volume, row.blend_volume, row.total_volume].join(",")
  );
  return [header, ...rows].join("\n");
}

/**
 * Triggers a client-side CSV download.
 */
export function downloadCsv(csv: string, filename: string): void {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}