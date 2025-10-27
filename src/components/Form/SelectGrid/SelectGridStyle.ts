import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  card: {
    width: '48%',
    borderWidth: 1,
    borderColor: '#444',
    padding: 15,
    borderRadius: 0,
  },
  cardSelected: {
    backgroundColor: '#000',
    borderColor: '#FFF',
  },
  iconRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  icon: {
    fontSize: 16,
  },
  label: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#FFF',
  },
  desc: {
    fontSize: 12,
    fontFamily: 'Inter-Light',
    color: '#AAA',
    marginTop: 2,
  },
});
