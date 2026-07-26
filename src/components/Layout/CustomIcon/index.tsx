// components/CustomIcon.tsx

import React from 'react';
import { Image, ImageStyle, StyleProp } from 'react-native';

type IconName = any /* | 'Another' | 'MoreIcon' */;

interface Props {
  icon: IconName;
  size?: number;
  style?: StyleProp<ImageStyle>;
}

const iconMap: Record<IconName, any> = {
  Barbell: require('~/assets/images/Icons/Barbell.png'),
  Weight: require('~/assets/images/Icons/Weight.png'),
  Birthday: require('~/assets/images/Icons/Birthday.png'),
};

export default function CustomIcon({
  icon,
  size = 30,
  style,
}: Props) {
  const source = iconMap[icon];
  if (!source) {
    console.warn(`No icon found for "${icon}"`);
    return null;
  }

  return (
    <Image
      source={source}
      style={[{ width: size, height: size, marginBottom: 10 }, style]}
      resizeMode="contain"
    />
  );
}
