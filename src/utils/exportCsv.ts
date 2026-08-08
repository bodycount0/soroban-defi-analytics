// exportCsv.ts — client-side CSV download utility (ref #4)
export function buildCsvFilename(): string {
  return `soroban-tvl-${new Date().toISOString().split("T")[0]}.csv`;
}
export function downloadCsv(data: any[], filename: string): void {
  const header = "date,soroswap_volume,phoenix_volume,blend_volume,total_volume\n";
  const rows = data.map(r => `${r.date},${r.soroswap},${r.phoenix},${r.blend},${r.total}`).join("\n");
  const blob = new Blob([header+rows], { type:"text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href=url; a.download=filename; a.click();
  URL.revokeObjectURL(url);
}
