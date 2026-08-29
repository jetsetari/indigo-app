import { StyleSheet, Dimensions } from 'react-native';
const { width, height } = Dimensions.get('window');

export const styles = StyleSheet.create({
  imageWrapper: {
    width: 75, height: 75, justifyContent: 'center', 
    alignItems: 'flex-start', flexShrink: 0,

  },
  imageBox: {
    width: '100%', height: '100%', backgroundColor: '#222', 
    justifyContent: 'center', alignItems: 'center',
    overflow: 'hidden',

  },
  image: {
    width: 75, height: 75, margin: 2,
    borderColor: '#FFF', borderWidth: 1
  }
});
