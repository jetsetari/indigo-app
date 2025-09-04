import { StyleSheet, Platform } from 'react-native';

export const styles = StyleSheet.create({
  label: {
    fontFamily: 'Inter-Light', fontSize: 13, color: '#FFF', 
    marginBottom: 5,
  },
  input: {
    backgroundColor: '#000',
    borderRadius: 0,
    paddingVertical: 12,
    paddingHorizontal: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1, 
    borderColor: '#FFF',
  },
  dateText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#FFF',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    alignItems: 'center',
  },
  modalClose: {
    marginTop: 10,
  },
  modalCloseText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: '#000',
  },
  picker: {
    width: '100%',
  },
});
