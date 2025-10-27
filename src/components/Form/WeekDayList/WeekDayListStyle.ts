import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 40,
  },
  label: {
    fontSize: 16,
    color: '#FFF',
    marginBottom: 10,
    fontFamily: 'Inter-Medium',
  },
  warning: {
    fontSize: 14,
    marginTop: 30,
    fontFamily: 'Inter-Light',
    color: '#FFCC00',
    marginBottom: -20,
  },
  days: {
    flexDirection: 'row',
    gap: 10,
  },
  dayBox: {
    width: 36,
    height: 36,
    borderWidth: 1,
    borderColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  dayBoxSelected: {
    backgroundColor: '#FFF',
  },
  dayText: {
    position: 'absolute',
    bottom: -16,
    fontSize: 11,
    color: '#FFF',
    fontFamily: 'Inter-Light',
    textAlign: 'center',
    width: '100%',
  },
});
