import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  section: { marginBottom: 20 },
  titleWrapper: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  title: { color: '#FFF', fontSize: 18, fontFamily: 'Inter-Bold' },
  option: {
    borderWidth: 1,
    borderColor: '#444',
    borderRadius: 0,
    padding: 10,
    height: 45,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    alignItems: 'center',
  },
  optionSelected: { backgroundColor: '#222', borderColor: '#FFF' },
  label: { color: '#FFF', fontSize: 14, fontFamily: 'Inter-Regular' },
});
