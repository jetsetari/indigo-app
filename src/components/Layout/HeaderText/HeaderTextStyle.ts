import { StyleSheet, Dimensions } from 'react-native';
const { width, height } = Dimensions.get('window');

export const styles = StyleSheet.create({
  headerText: {
    flexShrink: 1, marginRight: 10,
    minWidth: 0, marginBottom: 30
  },
  subline : {
    fontFamily: 'Inter-Light', fontSize: 16,
    color: '#FFF', marginBottom: 0, width: '100%'
  },
  h1 : {
    fontFamily: 'Inter-SemiBold', fontSize: 20,
    color: '#FFF'
  }
});