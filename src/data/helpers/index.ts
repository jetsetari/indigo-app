export const getMetrics = (metric:string) => {
  if (metric === 'kg/cm') {
    return Array.from({ length: 101 }, (_, i) => {
      const cm = 140 + i;
      return { label: `${cm} cm`, value: `${cm}` };
    });
  } else {
    return Array.from({ length: 61 }, (_, i) => {
      const inch = 48 + i; // 4'0" = 48 inches
      return { label: `${inch} in`, value: `${inch}` };
    });
  }
}

export const getWeightPickerConfig = (metricSystem: 'kg/cm' | 'lbs/inches', t: any) => {
  if (metricSystem === 'kg/cm') {
    return { min: 40, max: 200, unit: t.weight.unitKg };
  }
  return { min: 90, max: 400, unit: t.weight.unitLbs };
}

/** Local calendar date as YYYY-MM-DD (avoids UTC shift from toISOString). */
export function toDateOnly(value: Date | string | null | undefined): string | null {
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) return null;
    const y = value.getFullYear();
    const m = String(value.getMonth() + 1).padStart(2, '0');
    const d = String(value.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value)) {
    return value.slice(0, 10);
  }
  return null;
}

export const camelToSnakeKey = (k: string) =>
  k.replace(/([a-z0-9])([A-Z])/g, "$1_$2").replace(/-/g, "_").toLowerCase();

export const snakeToCamelKey = (k: string) =>
  k.toLowerCase().replace(/_([a-z0-9])/g, (_, c) => c.toUpperCase());

const isPlainObject = (v: any): v is Record<string, any> =>
  v != null && typeof v === "object" && v.constructor === Object;

export function camelToSnake<T>(input: T): any {
  if (Array.isArray(input)) return input.map(camelToSnake);
  if (!isPlainObject(input)) return input;
  const out: Record<string, any> = {};
  for (const [k, v] of Object.entries(input)) {
    out[camelToSnakeKey(k)] = camelToSnake(v);
  }
  return out;
}

export function snakeToCamel<T>(input: T): any {
  if (Array.isArray(input)) return input.map(snakeToCamel);
  if (!isPlainObject(input)) return input;
  const out: Record<string, any> = {};
  for (const [k, v] of Object.entries(input)) {
    out[snakeToCamelKey(k)] = snakeToCamel(v);
  }
  return out;
}


const SUPERSET_COLORS = [
  "#2563eb", "#16a34a", "#ea580c", "#9333ea", "#dc2626",
  "#0ea5e9", "#22c55e", "#f59e0b", "#a855f7", "#ef4444",
  "#14b8a6", "#84cc16", "#d946ef", "#f97316", "#3b82f6",
  "#10b981", "#f43f5e", "#8b5cf6", "#06b6d4", "#eab308",
];

export function colorForSuperset(label?: string | null) {
  if (!label) return { border: '#334155', bg: '#111827' };
  // label like "1A", "2B", ...
  const match = /^(\d+)/.exec(label);
  const idx = match ? Math.max(0, parseInt(match[1], 10) - 1) : 0;
  const base = SUPERSET_COLORS[idx % SUPERSET_COLORS.length];
  return { border: base, bg: `${base}50` }; // RN supports #RRGGBBAA e.g. #2563eb50
}