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