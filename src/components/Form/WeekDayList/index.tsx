import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Controller, type FieldValues, type Path } from 'react-hook-form';
import { Feather } from '@expo/vector-icons';
import { styles } from './WeekDayListStyle';
import __base from '~/assets/styles/base';

type Props<T extends FieldValues = FieldValues> = {
  control: unknown;                 // RHF Control<any>
  name: Path<T>;
  label?: string;                   // from translations
  required?: boolean;               // visual asterisk only
  rules?: any;                      // optional RHF rules (e.g., { required: 'Pick at least one' })
  days?: string[];                  // override day list if needed
  warningThreshold?: number;        // default 4
  warningText?: string;             // from translations
};

const DEFAULT_DAYS = ['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU'];

export default function FormWeekDayList<T extends FieldValues = FieldValues>({
  control,
  name,
  label,
  required,
  rules,
  days = DEFAULT_DAYS,
  warningThreshold = 4,
  warningText,
}: Props<T>) {
  return (
    <Controller
      // @ts-expect-error: relaxed typing to avoid leaking generics everywhere
      control={control}
      name={name}
      rules={rules}
      render={({ field: { value, onChange }, fieldState: { error } }) => {
        const selected: string[] = Array.isArray(value) ? value : [];
        const overThreshold = useMemo(
          () => selected.length > warningThreshold,
          [selected.length, warningThreshold]
        );

        const toggleDay = (day: string) => {
          if (selected.includes(day)) onChange(selected.filter(d => d !== day));
          else onChange([...selected, day]);
        };

        return (
          <View style={styles.wrapper}>
            {!!label && (
              <Text style={styles.label}>
                {label}
                {required && <Text style={__base.asterix}> *</Text>}
              </Text>
            )}

            <View style={styles.days}>
              {days.map((day) => {
                const isSelected = selected.includes(day);
                return (
                  <TouchableOpacity
                    key={day}
                    style={[styles.dayBox, isSelected && styles.dayBoxSelected]}
                    onPress={() => toggleDay(day)}
                  >
                    {isSelected && <Feather name="check" size={18} color="#000" />}
                    <Text style={styles.dayText}>{day}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {overThreshold && !!warningText && (
              <Text style={styles.warning}>{warningText}</Text>
            )}

            {!!error?.message && (
              <Text style={[__base.errorMsg, { marginTop: 8 }]}>
                {String(error.message)}
              </Text>
            )}
          </View>
        );
      }}
    />
  );
}
