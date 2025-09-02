import { StyleSheet, Dimensions } from 'react-native';
const { width, height } = Dimensions.get('window');

export const styles = StyleSheet.create({
  logoContainer: {
    width: '100%', paddingHorizontal: 30, textAlign: 'center'
  },
  logo: {
    width: width-60, marginBottom: 20,
  },
  logoText: {
    color: '#FFF', textAlign: 'center', fontSize: 18,
    fontFamily: 'Inter-Bold'
  }
});
