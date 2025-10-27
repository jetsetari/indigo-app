// src/components/Form/FormDatePicker.tsx
import React, { useMemo, useState } from 'react';
import { Platform, View, Text, TouchableOpacity, Modal } from 'react-native';
import { Controller, type FieldValues, type Path } from 'react-hook-form';
import { Feather } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';

import { runDateValidators, type DateRule } from '../validation';
import { styles } from './DatePickerStyle';
import __base from '~/assets/styles/base';

export type FormDatePickerProps<T extends FieldValues = FieldValues> = {
  control: unknown; // RHF Control<any>
  name: Path<T>;
  label: string;
  placeholder?: string;
  required?: boolean;
  info?: string;
  rules?: DateRule[];
  minimumDate?: Date;
  maximumDate?: Date;
  displayFormat?: (date: Date) => string;
};

export default function FormDatePicker<T extends FieldValues = FieldValues>({
  control,
  name,
  label,
  placeholder,
  required,
  info,
  rules = [],
  minimumDate,
  maximumDate,
  displayFormat,
}: FormDatePickerProps<T>) {
  const [focused, setFocused] = useState(false);
  const [iosOpen, setIosOpen] = useState(false);
  const isIOS = Platform.OS === 'ios';
  const [touched, setTouched] = useState(false);

  const format = (d?: Date | null) =>
    d ? (displayFormat ? displayFormat(d) : d.toLocaleDateString()) : (placeholder || label);

  const open = () => (isIOS ? setIosOpen(true) : setFocused(f => !f));
  const close = () => (isIOS ? setIosOpen(false) : setFocused(false));
  const onPickerChange = (onChange: (date: Date | null) => void) => (e: DateTimePickerEvent, d?: Date) => {
    if (e.type === 'set') onChange(d ?? null);
    if (!isIOS) setFocused(false);
  };

  return (
    <Controller
      // @ts-expect-error loosened control typing
      control={control}
      name={name}
      rules={{ validate: (v: unknown) => runDateValidators((v as Date) ?? null, rules, !!required) }}
      render={({ field: { value, onChange }, fieldState: { error } }) => {
        const errorMsg = useMemo(() => {
          if (!touched) return '';
          const res = runDateValidators((value as Date) ?? null, rules, !!required);
          return res === true ? '' : (res as string);
        }, [value, rules, required, touched]);

        return (
          <View style={__base.inputWrapper}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={__base.label}>
                {label}
                {required && <Text style={__base.asterix}> *</Text>}
              </Text>
              {!!info && (
                <TouchableOpacity onPress={() => alert(info)} style={__base.info}>
                  <Feather name="info" size={18} color={'#888'} />
                </TouchableOpacity>
              )}
            </View>
            <TouchableOpacity activeOpacity={0.9} style={styles.input} onPress={() => { open(); setTouched(true); }}>
              <Text style={styles.dateText}>{format((value as Date) ?? null)}</Text>
              <Feather name="calendar" size={18} color="#FFF" />
            </TouchableOpacity>
            {!isIOS && focused && (
              <DateTimePicker
                mode="date"
                display="calendar"
                value={(value as Date) ?? new Date()}
                onChange={onPickerChange(onChange)}
                minimumDate={minimumDate}
                maximumDate={maximumDate}
              />
            )}
            {isIOS && (
              <Modal visible={iosOpen} transparent animationType="none" onRequestClose={close}>
                <View style={styles.modalOverlay}>
                  <View style={styles.modalContainer}>
                    <DateTimePicker
                      mode="date"
                      display="spinner"
                      value={(value as Date) ?? new Date()}
                      onChange={onPickerChange(onChange)}
                      minimumDate={minimumDate}
                      maximumDate={maximumDate}
                    />
                    <TouchableOpacity style={styles.modalClose} onPress={close}>
                      <Text style={styles.modalCloseText}>Done</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Modal>
            )}

            {!!(errorMsg || error?.message) && (
              <Text style={[__base.errorMsg, { marginTop: 4 }]}>{String(errorMsg || error?.message)}</Text>
            )}
          </View>
        );
      }}
    />
  );
}
