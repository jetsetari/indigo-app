import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  label: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    color: '#222',
    marginBottom: 10,
  },
  radioGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 25,
  },
  radioItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 5,
    backgroundColor: '#FFF'
  },
  radioOuterActive: {
    borderColor: '#F8A41C',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#F8A41C',
  },
  radioLabel: {
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    color: '#000',
  },
});
