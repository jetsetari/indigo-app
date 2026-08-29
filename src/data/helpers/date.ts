// ~/data/helpers/date.ts
import dayjs from 'dayjs';

function toDayjs(isoOrDate: string | Date) {
  if (typeof isoOrDate === 'string' && /^\d{4}-\d{2}-\d{2}/.test(isoOrDate)) {
    return dayjs(`${isoOrDate.slice(0, 10)}T12:00:00`);
  }
  return dayjs(isoOrDate);
}

// Returns an array of 7 Date objects starting from the Monday of the given date's week
export const getWeekDates = (date: Date): Date[] => {
  const day = date.getDay(); // Sunday = 0, Monday = 1, ..., Saturday = 6
  const diff = day === 0 ? -6 : 1 - day; // Adjust so Monday is the first day
  const monday = new Date(date);
  monday.setDate(date.getDate() + diff);

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
};

// Returns 2-letter day label, e.g. "Mo", "Tu"
export const formatDayLabel = (date: Date): string => {
  return date.toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 2);
};

// Returns short date (e.g. "01" for 1st)
export const formatDateShort = (date: Date): string => {
  return date.getDate().toString().padStart(2, '0');
};

/** Today's calendar date in the device local timezone (YYYY-MM-DD). */
export function localTodayISO(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Oct 31, 2026 */
export function formatDisplayDate(isoOrDate: string | Date): string {
  const d = toDayjs(isoOrDate);
  return d.isValid() ? d.format('MMM D, YYYY') : String(isoOrDate);
}

/** Saturday, Oct 31, 2026 */
export function formatDisplayDateLong(isoOrDate: string | Date): string {
  const d = toDayjs(isoOrDate);
  return d.isValid() ? d.format('dddd, MMM D, YYYY') : String(isoOrDate);
}

/** Sat, Oct 31 */
export function formatDisplayDateWeekday(isoOrDate: string | Date): string {
  const d = toDayjs(isoOrDate);
  return d.isValid() ? d.format('ddd, MMM D') : String(isoOrDate);
}

/** Oct 31 */
export function formatMonthDay(isoOrDate: string | Date): string {
  const d = toDayjs(isoOrDate);
  return d.isValid() ? d.format('MMM D') : String(isoOrDate);
}

/** Oct 27 – Nov 2, 2026 */
export function formatWeekRange(startISO: string, endISO?: string): string {
  const start = toDayjs(startISO);
  const end = endISO ? toDayjs(endISO) : start.add(6, 'day');
  if (!start.isValid() || !end.isValid()) return '';
  if (start.year() === end.year()) {
    if (start.month() === end.month()) {
      return `${start.format('MMM D')} – ${end.format('D, YYYY')}`;
    }
    return `${start.format('MMM D')} – ${end.format('MMM D, YYYY')}`;
  }
  return `${start.format('MMM D, YYYY')} – ${end.format('MMM D, YYYY')}`;
}

/** Sat, Oct 31, 2026 */
export function formatWorkoutDateLabel(isoOrDate: string | Date): string {
  const d = toDayjs(isoOrDate);
  if (!d.isValid()) return String(isoOrDate);
  return d.format('ddd, MMM D, YYYY');
}
