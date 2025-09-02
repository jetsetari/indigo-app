import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 10,
    height: 50,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: 'transparent',
    marginBottom: 15,
  },
  focused: {
    borderColor: '#F8A41C',
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    color: '#222',
  },
  clearIcon: {
    marginLeft: 10,
  },
});
