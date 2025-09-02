import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111',
    borderRadius: 0,
    padding: 12,
    borderColor: '#333',
    borderWidth: 1,
    marginBottom: 5,
  },
  left: {
    flex: 1,
  },
  day: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  focus: {
    color: '#aaa',
    fontSize: 13,
    marginTop: 2,
  },
  right: {
    paddingLeft: 8,
  },
});
