import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Controller, type FieldValues, type Path } from 'react-hook-form';
import dayjs from 'dayjs';
import { Feather } from '@expo/vector-icons';

import { styles } from './WeekCalendarStyle';
import __base from '~/assets/styles/base';
import { runDateValidators, type DateRule } from '../validation';

type WeekItem = {
  date: string;  // 'YYYY-MM-DD'
  day: string;   // 'D'
  weekday: string; // 'ddd'
  hasData?: number; // optional indicator
};

function generateWeek(offset: number): WeekItem[] {
  // Monday start (matches your current file)
  const startOfWeek = dayjs().startOf('week').add(1 + offset * 7, 'day');
  return Array.from({ length: 7 }).map((_, i) => {
    const date = startOfWeek.add(i, 'day');
    return {
      date: date.format('YYYY-MM-DD'),
      day: date.format('D'),
      weekday: date.format('ddd'),
      hasData: 0,
    };
  });
}

export type FormWeekCalendarProps<T extends FieldValues = FieldValues> = {
  control: unknown;                 // RHF Control<any>
  name: Path<T>;                    // stores selected day
  label?: string;
  required?: boolean;               // visual asterisk + validator
  rules?: DateRule[];               // shared date rules (e.g., maxDate: today)
  weekOffset?: number;              // external control (optional)
  onChangeWeekOffset?: (next: number) => void;
  // When your form value should be a Date instead of 'YYYY-MM-DD'
  valueType?: 'string' | 'date';    // default 'string'
  hasDataForDate?: (isoDate: string) => number; // optional indicator fn
};

export default function FormWeekCalendar<T extends FieldValues = FieldValues>({
  control,
  name,
  label,
  required = false,
  rules = [],
  weekOffset: extOffset,
  onChangeWeekOffset,
  valueType = 'string',
  hasDataForDate,
}: FormWeekCalendarProps<T>) {
  const [internalOffset, setInternalOffset] = React.useState(0);
  const offset = extOffset ?? internalOffset;
  const setOffset = (n: number) => (onChangeWeekOffset ? onChangeWeekOffset(n) : setInternalOffset(n));

  const week = useMemo(() => {
    const w = generateWeek(offset);
    if (hasDataForDate) {
      return w.map(d => ({ ...d, hasData: hasDataForDate(d.date) }));
    }
    return w;
  }, [offset, hasDataForDate]);

  const left = () => setOffset(offset - 1);
  const right = () => setOffset(offset + 1);
  const isDate = (v: unknown): v is Date =>
  !!v && typeof v === 'object' && v instanceof Date;

  return (
    <Controller<any>                                // relax RHF generics
      // @ts-expect-error relaxed control typing ok
      control={control}
      name={name}
      rules={{
        validate: (v: unknown) => {
          const d = valueType === 'date'
            ? (isDate(v) ? v : (v ? new Date(String(v)) : null))
            : (v ? dayjs(String(v)).toDate() : null);
          const res = runDateValidators(d, rules, !!required);
          return res === true ? true : res;
        },
      }}
      defaultValue={
        (valueType === 'string'
          ? dayjs().format('YYYY-MM-DD')
          : new Date()) as any             // <- avoid string|Date union error
      }
      render={({ field: { value, onChange }, fieldState: { error } }) => {
        const selectedISO =
          valueType === 'string'
            ? (value as string)
            : (isDate(value) ? dayjs(value).format('YYYY-MM-DD') : '');

        const select = (iso: string) => {
          onChange(valueType === 'string' ? iso : dayjs(iso).toDate());
        };

        return (
          <View style={{ marginBottom: 15 }}>
            {!!label && (
              <Text style={styles.weekLabel}>
                {label}{required && <Text style={__base.asterix}> *</Text>}
              </Text>
            )}

            <View style={styles.navigationRow}>
              <TouchableOpacity onPress={left}>
                <Feather name="chevron-left" size={24} />
              </TouchableOpacity>
              <Text style={styles.weekLabel}>
                {dayjs(week[0].date).format('MMM D')} - {dayjs(week[6].date).format('MMM D')}
              </Text>
              <TouchableOpacity onPress={right}>
                <Feather name="chevron-right" size={24} />
              </TouchableOpacity>
            </View>

            <View style={styles.weekRow}>
              {week.map((item) => {
                const isSelected = item.date === selectedISO;
                return (
                  <TouchableOpacity
                    key={item.date}
                    style={styles.dayContainer}
                    onPress={() => select(item.date)}
                  >
                    <View style={[styles.dayWrapper, isSelected && styles.selectedDay]}>
                      <Text style={[styles.dayNumber, isSelected && styles.selectedDayNumber]}>{item.day}</Text>
                      <Text style={[styles.weekday, isSelected && styles.selectedWeekday]}>{item.weekday}</Text>
                    </View>
                    {item.hasData! > 0 && <View style={styles.dot} />}
                  </TouchableOpacity>
                );
              })}
            </View>

            {!!error?.message && (
              <Text style={[__base.errorMsg, { marginTop: 6 }]}>{String(error.message)}</Text>
            )}
          </View>
        );
      }}
    />
  );
}
