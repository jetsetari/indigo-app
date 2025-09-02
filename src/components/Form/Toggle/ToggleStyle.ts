import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 0,
    padding: 2,
    alignSelf: 'center',
    marginBottom: 20,
    width: '100%',
  },
  option: {
    paddingVertical: 8,
    height: 40,
    borderRadius: 0,
    width: '50%',
    textAlign: 'center',
    justifyContent: 'center',
    backgroundColor: '#000'
  },
  selectedOption: {
    backgroundColor: '#FFF',
  },
  optionText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    textAlign: 'center',
    color: '#FFF',
  },
  selectedText: {
    color: '#000',
    fontFamily: 'Inter-Bold',
  },
});
