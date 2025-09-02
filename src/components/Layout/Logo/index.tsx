import React, { useRef } from 'react';
import { View, Image, Text } from 'react-native';
import { styles } from './LogoStyle';

function Logo() {


  return (
    <View style={styles.logoContainer}>
      <Image source={require('~/assets/images/logo.png')} style={styles.logo} resizeMode="contain" />
      <Text style={ styles.logoText }>We'll Take The Work Out</Text>
    </View>
  );
}

export default Logo;