export type UnitSystem = 'metric' | 'imperial';

/** Body metrics are stored in metric (kg, cm). `metric_system` is display-only. */
const LBS_PER_KG = 2.2046226218;
const CM_PER_INCH = 2.54;

export function parseUnitSystem(value?: string | null): UnitSystem {
  return value === 'imperial' ? 'imperial' : 'metric';
}

export function weightUnit(system?: string | null): 'kg' | 'lbs' {
  return parseUnitSystem(system) === 'imperial' ? 'lbs' : 'kg';
}

export function heightUnit(system?: string | null): 'cm' | 'in' {
  return parseUnitSystem(system) === 'imperial' ? 'in' : 'cm';
}

export function convertWeight(value: number, from: UnitSystem, to: UnitSystem): number {
  if (from === to) return value;
  return from === 'metric' ? value * LBS_PER_KG : value / LBS_PER_KG;
}

export function convertHeight(value: number, from: UnitSystem, to: UnitSystem): number {
  if (from === to) return value;
  return from === 'metric' ? value / CM_PER_INCH : value * CM_PER_INCH;
}

export function roundWeight(value: number, system: UnitSystem): number {
  return system === 'imperial' ? Math.round(value) : Math.round(value * 10) / 10;
}

function toNumber(value: unknown): number | null {
  if (value == null || value === '') return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function formatNumber(value: number): string {
  return Number.isInteger(value) ? String(value) : String(Math.round(value * 10) / 10);
}

/** Stored kg → value in the user's unit system. */
export function toDisplayWeight(kg: unknown, system?: string | null): number | null {
  const n = toNumber(kg);
  if (n == null) return null;
  const to = parseUnitSystem(system);
  return roundWeight(convertWeight(n, 'metric', to), to);
}

/** Form value in the user's unit system → stored kg. */
export function toStoredWeight(display: unknown, system?: string | null): number | null {
  const n = toNumber(display);
  if (n == null) return null;
  const from = parseUnitSystem(system);
  return roundWeight(convertWeight(n, from, 'metric'), 'metric');
}

/** Stored cm → value in the user's unit system. */
export function toDisplayHeight(cm: unknown, system?: string | null): number | null {
  const n = toNumber(cm);
  if (n == null) return null;
  return Math.round(convertHeight(n, 'metric', parseUnitSystem(system)));
}

/** Form value in the user's unit system → stored cm. */
export function toStoredHeight(display: unknown, system?: string | null): number | null {
  const n = toNumber(display);
  if (n == null) return null;
  return Math.round(convertHeight(n, parseUnitSystem(system), 'metric'));
}

export function formatWeight(kg: number | string | null | undefined, system?: string | null): string {
  const display = toDisplayWeight(kg, system);
  if (display == null) return '';
  return `${formatNumber(display)} ${weightUnit(system)}`;
}

export function formatHeight(cm: number | string | null | undefined, system?: string | null): string {
  const display = toDisplayHeight(cm, system);
  if (display == null) return '';
  return `${display} ${heightUnit(system)}`;
}
