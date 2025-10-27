import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  section: { marginBottom: 0 },
  titleWrapper: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  title: { color: '#FFF', fontSize: 18, fontFamily: 'Inter-Bold' },
  option: {
    borderWidth: 1, borderColor: '#444', borderRadius: 0,
    paddingHorizontal: 5, height: 50,
    flexDirection: 'row', justifyContent: 'space-between',
    marginBottom: 10, alignItems: 'center',
  },
  optionLeft: { flexDirection: 'row', alignItems: 'center' },
  optionSelected: { backgroundColor: '#222', borderColor: '#FFF' },
  label: { color: '#FFF', fontSize: 15, fontFamily: 'Inter-Regular', marginLeft: 10 },
  image: { width: 40, height: 40 },
});
