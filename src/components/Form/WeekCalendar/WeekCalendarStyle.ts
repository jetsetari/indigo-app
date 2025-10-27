import { StyleSheet, Dimensions } from 'react-native';
const { width } = Dimensions.get('window');

export const styles = StyleSheet.create({
  navigationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 0,
    marginBottom: 8,
  },
  weekLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    backgroundColor: '#FFF',
  },
  dayContainer: {
    alignItems: 'center',
    width: (width / 7)-20,
    backgroundColor: '#FFF'
  },
  dayWrapper: {
    paddingVertical: 8,
    borderRadius: 0,
    backgroundColor: '#FFF',
    alignItems: 'center',
    width: (width / 7)-20,
  },
  selectedDay: {
    backgroundColor: '#000',
  },
  dayNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
  },
  selectedDayNumber: {
    color: '#FFF',
  },
  weekday: {
    fontSize: 12,
    color: '#999',
  },
  selectedWeekday: {
    color: '#FFF',
  },
  dot: {
    marginTop: 4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#000',
  },
});
