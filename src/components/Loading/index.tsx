import React, { useRef } from 'react';
import { View } from 'react-native';
import { styles } from './LoadingStyle';
import LottieView from 'lottie-react-native';

function Loading() {
  const animation = useRef<LottieView>(null);


  return (
    <View style={styles.container}>
      <LottieView
        ref={animation}
        autoPlay
        loop
        style={styles.spinner}
        source={require('./lottie/loader.json')}
      />
    </View>
  );
}

export default Loading;