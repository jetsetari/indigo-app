import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  wrap: { width: '100%', height: 220, backgroundColor: '#000' },
  bg: { flex: 1, justifyContent: 'flex-end' },
  bgImage: { resizeMode: 'cover' },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  textWrap: { paddingHorizontal: 16, paddingBottom: 14 },
  title: { color: '#fff', fontSize: 20, fontWeight: '800' },
  subtitle: { color: '#fff', fontSize: 16, fontWeight: '700', marginTop: 2 },
  description: { color: '#ddd', fontSize: 13, marginTop: 6, lineHeight: 18 },
});