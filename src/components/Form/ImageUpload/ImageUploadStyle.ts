import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  columnWrap: { alignItems: 'center', justifyContent: 'flex-start' },
  box: {
    backgroundColor: '#111',
    borderWidth: 1,
    borderColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  placeholder: { 
    backgroundColor: '#181818', borderStyle: 'dashed' 
  },
  btn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#000', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10,
  },
  btnText: { color: '#fff', fontSize: 14, fontFamily: 'Inter-Medium' },
  disabled: { opacity: 0.5 },
  remove: {
    position: 'absolute', right: 5, top: 5, width: 30, height: 30,
    alignItems: 'center', justifyContent: 'center', zIndex: 1,
    backgroundColor: '#a11919', borderColor: '#FFF', borderWidth: 1
  },
  caption: { 
    marginTop: 10, color: '#BDBDBD', fontSize: 13, fontFamily: 'Inter-Medium', textAlign: 'center' 
  },
});