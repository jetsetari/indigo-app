import React, { useRef } from 'react';
import { View, Text } from 'react-native';
import { styles } from './LoadingStyle';
import LottieView from 'lottie-react-native';

type LoadingProps = { text?: string };

function Loading({ text }: LoadingProps) {
  const animation = useRef<LottieView>(null);

  return (
    <View style={styles.container}>
      <LottieView
        ref={animation}
        autoPlay
        loop
        style={styles.spinner}
        source={require('./lottie/indigo.json')}
      />
      {text ? <Text style={styles.message}>{text}</Text> : null}
    </View>
  );
}

export default Loading;
