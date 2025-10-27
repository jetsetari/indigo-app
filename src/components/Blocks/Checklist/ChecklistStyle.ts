import { StyleSheet, Dimensions } from 'react-native';
export const styles = StyleSheet.create({
  section: { marginTop: 8, marginBottom: 15 },
  title: { color: '#fff', fontSize: 14, fontWeight: '700', marginBottom: 8 },
  card: {
    borderWidth: 1, borderColor: '#444', padding: 10,
    flexDirection: 'row', alignItems: 'center', marginBottom: 10, backgroundColor: '#000',
  },
  cardOn: { backgroundColor: '#222', borderColor: '#fff' },
  emoji: { fontSize: 18, width: 25, marginRight: 8 },
  itemLabel: { color: '#fff', fontSize: 14, flex: 1 },
  box: { width: 25, height: 25, borderWidth: 2, borderColor: '#888', alignItems: 'center', justifyContent: 'center' },
  boxOn: { borderColor: '#fff', backgroundColor: '#111' },
  tick: { color: '#fff', fontSize: 12, fontWeight: '800' },
});