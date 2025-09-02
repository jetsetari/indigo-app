import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import dayjs from 'dayjs';
import { styles } from './WeekCalendarStyles';
import { Feather } from '@expo/vector-icons';

const generateWeek = (offset: number) => {
  const startOfWeek = dayjs().startOf('week').add(1 + offset * 7, 'day'); // Monday start
  return Array.from({ length: 7 }).map((_, i) => {
    const date = startOfWeek.add(i, 'day');
    return {
      date: date.format('YYYY-MM-DD'),
      day: date.format('D'),
      weekday: date.format('ddd'),
      hasData: 0, // mock
    };
  });
};

export default function WeekCalendar() {
  const [selectedDate, setSelectedDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [weekOffset, setWeekOffset] = useState(0);
  const currentWeek = generateWeek(weekOffset);

  return (
    <View style={{ marginBottom: 15 }}>
      <View style={styles.navigationRow}>
        <TouchableOpacity onPress={() => setWeekOffset(weekOffset - 1)}>
          <Feather name="chevron-left" size={24} />
        </TouchableOpacity>
        <Text style={styles.weekLabel}>
          {dayjs(currentWeek[0].date).format('MMM D')} - {dayjs(currentWeek[6].date).format('MMM D')}
        </Text>
        <TouchableOpacity onPress={() => setWeekOffset(weekOffset + 1)}>
          <Feather name="chevron-right" size={24} />
        </TouchableOpacity>
      </View>

      <View style={styles.weekRow}>
        {currentWeek.map((item) => {
          const isSelected = item.date === selectedDate;
          return (
            <TouchableOpacity
              key={item.date}
              style={styles.dayContainer}
              onPress={() => setSelectedDate(item.date)}
            >
              <View style={[styles.dayWrapper, isSelected && styles.selectedDay]}>
                <Text style={[styles.dayNumber, isSelected && styles.selectedDayNumber]}>{item.day}</Text>
                <Text style={[styles.weekday, isSelected && styles.selectedWeekday]}>{item.weekday}</Text>
              </View>
              {item.hasData > 0 && <View style={styles.dot} />}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}
