import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  planCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111',
    borderRadius: 0,
    padding: 10,
    borderColor: '#FFF',
    borderWidth: 1,
    marginBottom: 5,
  },
  planImageWrapper: {
    width: 50,
    height: 50,
    borderRadius: 0,
    backgroundColor: '#222',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  planImage: {
    width: 50,
    height: 50,
    borderRadius: 0,
  },
  planContent: {
    flex: 1,
  },
  planTitle: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  planSubtitle: {
    color: '#aaa',
    fontSize: 14,
    marginTop: 2,
  },
});
