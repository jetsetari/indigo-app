import { StyleSheet, Dimensions } from 'react-native';
const { width, height } = Dimensions.get('window');

export const styles = StyleSheet.create({
  infoBox: {
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center', 
    backgroundColor: '#111', borderRadius: 0,
    marginBottom: 20, padding: 15, 
  },
  infoBoxColumn: {
    alignItems: 'center', flex: 1, justifyContent: 'flex-start',
    flexDirection: 'row', alignContent: 'center', 
  },
  infoBoxRow: {
    flexDirection: 'column',
  },
  infoBoxIcon: {
   width: 25, alignItems: 'center', justifyContent: 'center',
   alignContent: 'center', height: 25,
   marginRight: 15, paddingTop: 5
  },
  infoBoxValue: {
    color: '#FFF', fontSize: 16, fontWeight: 'bold',
  },
  infoBoxLabel: {
    color: '#EEE', fontSize: 12, 
    fontFamily: 'Inter-Regular',
  },
});