import { StyleSheet, Dimensions } from 'react-native';
const { width, height } = Dimensions.get('window');

export const styles = StyleSheet.create({
  imageWrapper: { marginLeft: 'auto' },
  imageBox: { 
    width: 100, height: 100, borderColor: '#FFF', borderWidth: 2,
    alignItems: 'center', justifyContent: 'center',
  },
  image: {
    width: 96, height: 96, margin: 2
  }
});
