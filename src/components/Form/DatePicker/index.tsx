// src/components/Form/DatePicker.tsx

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Platform,
  Alert,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Feather } from '@expo/vector-icons';
import { styles } from './DatePickerStyle';

type Props = {
  label: string;
  value: Date | null;
  onChange: (date: Date) => void;
  required?: boolean;
  /** Optional explanation text; if provided, shows an ℹ️ icon */
  info?: string;
};

export default function FormDatePicker({
  label,
  value,
  onChange,
  required = false,
  info,
}: Props) {
  const [show, setShow] = useState(false);
  const [tempDate, setTempDate] = useState<Date>(value || new Date());

  const handleChange = (_event: any, selectedDate?: Date) => {
    if (selectedDate) setTempDate(selectedDate);
  };
  const confirmDate = () => {
    onChange(tempDate);
    setShow(false);
  };

  const displayDate = value
    ? value.toLocaleDateString('en-GB')
    : 'Select a date';

  return (
    <View style={{ marginBottom: 15 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Text style={styles.label}>
          {label}
          {required && <Text style={{ color: 'red' }}> *</Text>}
        </Text>
        {info && (
          <TouchableOpacity
            onPress={() => Alert.alert(label, info)}
            style={{ marginLeft: 6, marginBottom: 5 }}
          >
            <Feather name="info" size={18} color="#FFF" />
          </TouchableOpacity>
        )}
      </View>

      <TouchableOpacity
        activeOpacity={0.9}
        style={styles.input}
        onPress={() => setShow(true)}
      >
        <Text style={styles.dateText}>{displayDate}</Text>
        <Feather name="calendar" size={18} color="#FFF" />
      </TouchableOpacity>

      {Platform.OS === 'android' && show && (
        <DateTimePicker
          value={value || new Date()}
          mode="date"
          display="default"
          onChange={(e, selected) => {
            setShow(false);
            if (selected) onChange(selected);
          }}
          locale="en-GB"
        />
      )}

      {Platform.OS === 'ios' && (
        <Modal transparent animationType="fade" visible={show}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <DateTimePicker
                value={tempDate}
                mode="date"
                display="spinner"
                onChange={handleChange}
                locale="en-GB"
                style={styles.picker}
              />
              <TouchableOpacity style={styles.modalClose} onPress={confirmDate}>
                <Text style={styles.modalCloseText}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}
