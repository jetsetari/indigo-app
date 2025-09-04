import type { SupplementsOutput } from './validation';

export function mapSupplements(values: SupplementsOutput): string[] {
  return values.supplement_slugs ?? [];
}
