import { convertHeight, convertWeight, parseUnitSystem, roundWeight, type UnitSystem } from '~/data/helpers/units';

export type { UnitSystem };

// Height options for dropdown:
// - metric: centimeters
// - imperial: inches (simple and unambiguous for a dropdown)
export function getHeightOptions(system: UnitSystem) {
  if (system === 'imperial') {
    // 48"–84" (4'0"–7'0")
    return Array.from({ length: 84 - 48 + 1 }, (_, i) => {
      const inches = 48 + i;
      return { label: `${inches}"`, value: inches };
    });
  }
  // metric: 140–210 cm
  return Array.from({ length: 210 - 140 + 1 }, (_, i) => {
    const cm = 140 + i;
    return { label: `${cm} cm`, value: cm };
  });
}

export function snapHeightToOptions(value: number, system: UnitSystem): number {
  const options = getHeightOptions(system);
  return options.reduce((best, option) => {
    const candidate = Number(option.value);
    return Math.abs(candidate - value) < Math.abs(best - value) ? candidate : best;
  }, Number(options[0].value));
}

// Weight picker config
export function getWeightPickerConfig(system: UnitSystem, t?: any) {
  if (system === 'imperial') {
    return { min: 80, max: 400, unit: t?.weight?.unitLbs ?? 'lbs' };
  }
  return { min: 35, max: 200, unit: t?.weight?.unitKg ?? 'kg' };
}

export function convertMetricsFields(
  from: UnitSystem | string | null | undefined,
  to: UnitSystem | string | null | undefined,
  values: { weight?: unknown; desiredWeight?: unknown; height?: unknown },
  weightRange?: { min: number; max: number },
) {
  const fromSystem = parseUnitSystem(from);
  const toSystem = parseUnitSystem(to);
  const next: { weight?: number; desiredWeight?: string; height?: number } = {};

  if (fromSystem === toSystem) return next;

  if (values.weight != null && values.weight !== '') {
    const n = Number(values.weight);
    if (Number.isFinite(n)) {
      let weight = Math.round(convertWeight(n, fromSystem, toSystem));
      if (weightRange) weight = Math.min(weightRange.max, Math.max(weightRange.min, weight));
      next.weight = weight;
    }
  }

  if (values.desiredWeight != null && values.desiredWeight !== '') {
    const n = Number(values.desiredWeight);
    if (Number.isFinite(n)) {
      next.desiredWeight = String(roundWeight(convertWeight(n, fromSystem, toSystem), toSystem));
    }
  }

  if (values.height != null && values.height !== '') {
    const n = Number(values.height);
    if (Number.isFinite(n)) {
      next.height = snapHeightToOptions(convertHeight(n, fromSystem, toSystem), toSystem);
    }
  }

  return next;
}
