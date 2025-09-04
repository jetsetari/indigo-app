import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  input: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: 'transparent', 
    paddingHorizontal: 10, borderRadius: 0, height: 45, width: '100%', 
    borderWidth: 1, borderColor: '#FFF', marginBottom: 5
  },
  inputFocused: {
    borderWidth: 2,
  },
  label: {
    fontFamily: 'Inter-SemiBold', fontSize: 13, color: '#FFF', 
    marginBottom: 5,
  },
  inputField: {
    flex: 1, fontFamily: 'Inter-Light', fontSize: 14, 
    color: '#FFF', height: 45, width: '100%',
  },
  icon: {
    marginLeft: 10,
  },
  strengthWrapper: {
    marginTop: 6,
  },
  strengthBar: {
    height: 6, borderRadius: 3, backgroundColor: '#ccc', 
    marginBottom: 4,
  },
  strengthLabel: {
    fontFamily: 'Inter-Light', fontSize: 14, color: '#444',
  },
  weak: { backgroundColor: '#FF6B6B', width: '33%' },
  medium: { backgroundColor: '#F8A41C', width: '66%' },
  strong: { backgroundColor: '#4CAF50', width: '100%' },
});
