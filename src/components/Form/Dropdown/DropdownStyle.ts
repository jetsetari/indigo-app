import { StyleSheet, Platform } from 'react-native';

export const styles = StyleSheet.create({
  input: {
    fontFamily: 'Inter-Light', fontSize: 14,
    color: '#222', backgroundColor: 'transparent', 
    paddingHorizontal: 10, borderRadius: 0, height: 45, width: '100%', 
    borderWidth: 1, borderColor: '#FFF', marginBottom: 5
  },
  selectWrapper: {
    flex: 1, 
    justifyContent: 'center',
  },
  inputFocused: {
    borderWidth: 2,
  },
  pickerWrapper: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
  },
  selectText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    paddingVertical: Platform.OS === 'ios' ? 0 : 8,
    color: '#FFF',
    height: 45,
    alignItems: 'center'
  },
  icon: {
    top: Platform.OS === 'ios' ? 12 : 10,
    right: 0,
  },
  label : {
    fontFamily: 'Inter-Light', fontSize: 14, color: '#FFF', 
    marginBottom: 5,
  }
})