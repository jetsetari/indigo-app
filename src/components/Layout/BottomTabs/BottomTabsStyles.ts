import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  wrapper: {
    
    paddingVertical: 12,
    position: 'absolute',
    paddingHorizontal: 20,
    bottom: 10,
    left: 0, 
    right: 0,
    alignItems: 'center'
  },
  tabsWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 10
  },
  tab: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    flexDirection: 'row',
    padding: 10
  },
  tabActive: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    flexDirection: 'row',
    padding: 10,
    paddingHorizontal: 20,
    backgroundColor: '#000'
  },
  label: {
    fontSize: 16,
    color: '#999999',
  },
  activeLabel: {
    color: '#FFF',
    fontWeight: '600',
  },
});