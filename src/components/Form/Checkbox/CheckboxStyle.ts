import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    marginTop: 10,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 0,
    borderWidth: 1,
    borderColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000',
  },
  checked: {
    backgroundColor: '#FFF',
  },
  label: {
    color: '#FFF',
    fontFamily: 'Inter-Light',
    fontSize: 14,
  },
  link: {
    textDecorationLine: 'underline',
    color: '#FFF',
  },
});
