import { StyleSheet, Dimensions } from 'react-native';
const { width, height } = Dimensions.get('window');

export const styles = StyleSheet.create({
  headerText: {
    flex: 1, paddingRight: 20, width: '100%', marginTop: 20
  },
  subline : {
    fontFamily: 'Inter-Light', fontSize: 18,
    color: '#FFF', marginBottom: 0, width: '100%'
  },
  h1 : {
    fontFamily: 'Inter-SemiBold', fontSize: 26,
    color: '#FFF'
  },
});
