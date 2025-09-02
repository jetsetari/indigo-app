import { StyleSheet, Platform } from 'react-native';

export const styles = StyleSheet.create({
  label: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    color: '#222',
    marginBottom: 5,
  },
  input: {
    flexDirection: 'row',
    alignItems: 'center',
    fontFamily: 'Poppins-Regular',
    backgroundColor: '#FFF',
    paddingHorizontal: 15,
    borderRadius: 6,
    height: 50,
    width: '100%',
    borderWidth: 1,
    borderColor: '#FFF',
  },
  suggestion: {
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderBottomColor: '#DDD',
    borderBottomWidth: 1,
    marginTop: 2,
    backgroundColor: '#FFF',
  },
});
