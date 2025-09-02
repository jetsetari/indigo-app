import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  stickyHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 110,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    paddingTop: 70,
  },
  stickyHeaderTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#000',
  },
  scrollContainer: {
    padding: 0, backgroundColor: '#000000',
    flexGrow: 1,
  },
  scrollContainerNoPadding: {
    backgroundColor: '#000000',
    flexGrow: 1,
  },
});
