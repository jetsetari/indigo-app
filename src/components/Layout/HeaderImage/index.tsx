// src/components/Layout/HeaderImage.tsx
import React from 'react';
import { View, Image } from 'react-native';
import { styles } from './HeaderImageStyle';
import { LogoMark } from '~/components/Layout/Logo';

type Props = {
  image?: string; // a URI like https://... or file://...
};

function HeaderImage({ image }: Props) {
  const uri = typeof image === 'string' && image.trim().length > 0 ? image : undefined;

  return (
    <View style={styles.imageWrapper}>
      <View style={styles.imageBox}>
        {uri ? (
          <Image source={{ uri }} style={styles.image} resizeMode="cover" />
        ) : (
          <LogoMark width={75} />
        )}
      </View>
    </View>
  );
}

export default HeaderImage;
