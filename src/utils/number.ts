export const parseNumber = (value: string | number): number => {
  if (value === null || value === undefined || value === "") return 0;

  const cleaned = value.toString().trim();
  const noSpaces = cleaned.replace(/\s+/g, "");

  // kalau bukan angka sama sekali (misal huruf semua), langsung 0
  if (!/[0-9]/.test(noSpaces)) return 0;

  // ada koma → anggap desimal
  if (noSpaces.includes(",")) {
    const normalized = noSpaces.replace(/\./g, "").replace(",", ".");
    const parsed = Number(normalized);
    return isNaN(parsed) ? 0 : parsed;
  }

  const parts = noSpaces.split(".");

  if (parts.length > 2) {
    // contoh "20.000.000"
    const normalized = noSpaces.replace(/\./g, "");
    const parsed = Number(normalized);
    return isNaN(parsed) ? 0 : parsed;
  }

  // satu titik dengan ≤2 digit di belakang → desimal
  if (parts.length === 2 && parts[1].length <= 2) {
    const parsed = Number(noSpaces);
    return isNaN(parsed) ? 0 : parsed;
  }

  // default → hapus titik (anggap ribuan)
  const normalized = noSpaces.replace(/\./g, "");
  const parsed = Number(normalized);
  return isNaN(parsed) ? 0 : parsed;
};

type FormatMode = "round" | "floor" | "ceil" | "none";

export const formatNumber = (
  raw: number | string,
  decimals = 0,
  mode: FormatMode = "none"
): string => {
  const n = typeof raw === "string" ? Number(raw) : raw;
  if (!Number.isFinite(n)) return "0";

  const d = Math.max(0, decimals);
  const factor = Math.pow(10, d);

  let processed = n;
  switch (mode) {
    case "floor":
      processed = Math.floor(n * factor) / factor;
      break;
    case "ceil":
      processed = Math.ceil(n * factor) / factor;
      break;
    case "round":
      processed = Math.round((n + Number.EPSILON) * factor) / factor;
      break;
    case "none":
    default:
      processed = n; // biarkan toLocale yang membulatkan saat render
      break;
  }

  return processed.toLocaleString("id-ID", {
    minimumFractionDigits: d,
    maximumFractionDigits: d,
    useGrouping: true,
  });
};
