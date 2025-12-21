import React, { useMemo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
dayjs.extend(isoWeek);

type Status = 'none' | 'partial' | 'done';
type DOW = 'MO'|'TU'|'WE'|'TH'|'FR'|'SA'|'SU';

type Props = {
  weekStartISO: string;                 // Monday (YYYY-MM-DD)
  selectedDateISO: string;              // selected day
  onSelectDate: (iso: string) => void;
  onChangeWeek: (delta: -1 | 1) => void;
  preferredDays?: DOW[];                // e.g. ["MO","WE","FR"]
  statusByDate?: Record<string, Status>; // { "2025-09-14":"done", ... }
  maxDateISO?: string;                  // default: today (future disabled)
};

const DOW_LABELS: { key: DOW; short: string }[] = [
  { key: 'MO', short: 'Mon' },
  { key: 'TU', short: 'Tue' },
  { key: 'WE', short: 'Wed' },
  { key: 'TH', short: 'Thu' },
  { key: 'FR', short: 'Fri' },
  { key: 'SA', short: 'Sat' },
  { key: 'SU', short: 'Sun' },
];

export default function SelectWeek({
  weekStartISO,
  selectedDateISO,
  onSelectDate,
  onChangeWeek,
  preferredDays = [],
  statusByDate = {},
  maxDateISO,
}: Props) {
  const today = dayjs();
  // Calculate max allowed date: today + 14 days (2 weeks)
  // If maxDateISO is provided (e.g., today), use that as base, otherwise use today
  const baseDate = maxDateISO ? dayjs(maxDateISO) : today;
  const maxAllowedDate = baseDate.add(14, 'day');

  const todayISO = today.format('YYYY-MM-DD');

  const days = useMemo(() => {
    const start = dayjs(weekStartISO);
    return Array.from({ length: 7 }, (_, i) => {
      const d = start.add(i, 'day');
      const dISO = d.format('YYYY-MM-DD');
      return {
        iso: dISO,
        dateNum: d.date(),
        dow: DOW_LABELS[i].key,
        dowShort: DOW_LABELS[i].short,
        // Disable only if date is after the 2-week limit (14 days from base date)
        isFuture: d.isAfter(maxAllowedDate, 'day'),
        isToday: dISO === todayISO,
      };
    });
  }, [weekStartISO, maxAllowedDate, todayISO]);

  // Check if we're at the 2-week limit (if the end of this week extends beyond maxAllowedDate)
  const weekEnd = dayjs(weekStartISO).add(6, 'day');
  const isAtMaxWeek = weekEnd.isAfter(maxAllowedDate, 'day');

  return (
    <View style={s.row}>
      {/* Prev week */}
      <Pressable onPress={() => onChangeWeek(-1)} style={s.navBtn}>
        <Feather name="chevron-left" size={18} color="#000" />
      </Pressable>

      {/* Days */}
      <View style={s.days}>
        {days.map((d) => {
          const selected = d.iso === selectedDateISO;
          const preferred = preferredDays.includes(d.dow);
          const status = statusByDate[d.iso] ?? 'none';
          const disabled = d.isFuture;
          const isToday = d.isToday && !selected; // Only highlight today if not selected

          return (
            <Pressable
              key={d.iso}
              onPress={() => !disabled && onSelectDate(d.iso)}
              disabled={disabled}
              style={[s.dayWrap, disabled && { opacity: 0.5 }]}
            >
              <View style={[
                s.dateBox, 
                selected && s.dateBoxSelected,
                isToday && s.dateBoxToday
              ]}>
                <Text style={[
                  s.dateText, 
                  selected && s.dateTextSelected,
                  isToday && s.dateTextToday
                ]}>
                  {d.dateNum}
                </Text>
                <Text style={[
                  s.dowText, 
                  preferred && s.dowPreferred, 
                  selected && s.dateTextSelected,
                  isToday && s.dowTextToday
                ]}>
                  {d.dowShort}
                </Text>
              </View>

              {/* dots */}
              {status !== 'none' && (
                <View style={[s.dot, status === 'done' ? s.dotGreen : s.dotGrey]} />
              )}
            </Pressable>
          );
        })}
      </View>

      {/* Next week (disabled at 2-week limit) */}
      <Pressable
        onPress={() => !isAtMaxWeek && onChangeWeek(1)}
        disabled={isAtMaxWeek}
        style={[s.navBtn, isAtMaxWeek && { opacity: 0.2, pointerEvents: 'none' }]}
      >
        <Feather name="chevron-right" size={18} color="#000" />
      </Pressable>
    </View>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 8, backgroundColor: '#FFF', paddingVertical: 10 },
  navBtn: { width: 20, height: 55, borderWidth: 2, borderColor: '#000', borderRadius: 0, alignItems: 'center', justifyContent: 'center' },
  days: { flex: 1, flexDirection: 'row', justifyContent: 'space-between' },
  dayWrap: { alignItems: 'center', gap: 6, minWidth: 38 },
  dateBox: { alignItems: 'center', justifyContent: 'center', paddingVertical: 10, paddingHorizontal: 10 },
  dateBoxSelected: { backgroundColor: '#000' },
  dateBoxToday: { borderWidth: 2, borderColor: '#4DD4AC', borderRadius: 0 },
  dateText: { fontSize: 16, fontFamily: 'Inter-SemiBold', color: '#000' },
  dateTextSelected: { color: '#fff' },
  dateTextToday: { color: '#4DD4AC', fontWeight: '700' },
  dowText: { marginTop: 2, fontSize: 11, color: '#9ca3af', fontFamily: 'Inter-Regular' },
  dowTextToday: { color: '#4DD4AC', fontWeight: '600' },
  dowPreferred: { color: '#000', borderBottomWidth: 1 },
  dot: { width: 6, height: 6, borderRadius: 5, marginTop: 6, position: 'absolute', bottom: 25, left: 6 },
  dotGreen: { backgroundColor: '#22c55e' },
  dotGrey: { backgroundColor: '#9ca3af' },
});
