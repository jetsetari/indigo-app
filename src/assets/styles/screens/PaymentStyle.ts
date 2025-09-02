import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  planBox: {
    borderWidth: 2,
    borderColor: '#555',
    padding: 16,
    marginBottom: 16,
    backgroundColor: '#000',
  },
  selectedBox: {
    backgroundColor: '#000',
    borderColor: '#FFF',
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  planTitle: {
    color: '#888',
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
  planPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
  },
  perMonth: {
    fontSize: 14,
    fontWeight: 'normal',
  },
  planDesc: {
    color: '#AAA',
    fontSize: 13,
    marginTop: 4,
  },
  learnMore: {
    marginTop: 6,
    textDecorationLine: 'underline',
    color: '#BBB',
    fontSize: 13,
  },
  badge: {
    position: 'absolute',
    top: -10,
    right: 10,
    backgroundColor: '#FFD700',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 0,
    zIndex: 10,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#000',
  },
  disclaimer: {
    textAlign: 'center',
    fontSize: 14,
    color: '#888',
    marginBottom: 5,
  },
  linksRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 30,
  },
  link: {
    fontSize: 14,
    color: '#FFF',
    textDecorationLine: 'underline',
  },
  dot: {
    fontSize: 14,
    color: '#AAA',
  },
});