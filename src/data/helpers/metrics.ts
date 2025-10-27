// src/data/helpers/metrics.ts
type UnitSystem = 'metric' | 'imperial';
import useTranslation from '~/data/helpers/translation';

const t = useTranslation();
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

// Weight picker config
export function getWeightPickerConfig(system: UnitSystem, t: any) {
  if (system === 'imperial') {
    return { min: 80, max: 400, unit: 'lbs' }; // lbs
  }
  return { min: 35, max: 200, unit: 'kg' };   // kg
}