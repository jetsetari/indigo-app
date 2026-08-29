import React from 'react';
import { View, Image, Text } from 'react-native';
import { styles } from './LogoStyle';

const LOGO = require('~/assets/images/logo.png');
const SYMBOL = require('~/assets/device/icon.png');
/** icon.png is a 1024 square with ~174px black padding around the white circle. */
const ICON_CROP = 1024 / 668;
/** Circle should sit inside the box, not flush to the edges. */
const CIRCLE_SIZE = 0.62;

type LogoMarkProps = {
  width: number;
  color?: string;
};

export function LogoMark({ width }: LogoMarkProps) {
  const img = Math.ceil(width * ICON_CROP * CIRCLE_SIZE);
  const offset = Math.round((width - img) / 2);
  return (
    <View style={{ width, height: width, overflow: 'hidden' }}>
      <Image
        source={SYMBOL}
        style={{
          position: 'absolute',
          width: img,
          height: img,
          left: offset,
          top: offset,
          opacity: 0.1,
        }}
        resizeMode="cover"
      />
    </View>
  );
}

function Logo() {
  return (
    <View style={styles.logoContainer}>
      <Image source={LOGO} style={styles.logo} resizeMode="contain" />
      <Text style={styles.logoText}>Take The Work Out</Text>
    </View>
  );
}

export default Logo;
