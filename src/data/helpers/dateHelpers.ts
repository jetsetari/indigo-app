// ~/data/helpers/dateHelpers.ts

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
  return date.toLocaleDateString('en-GB', { weekday: 'short' }).slice(0, 2);
};

// Returns short date (e.g. "01" for 1st)
export const formatDateShort = (date: Date): string => {
  return date.getDate().toString().padStart(2, '0');
};
