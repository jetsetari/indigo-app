import React from 'react';
import { View, Image } from 'react-native';
import { styles } from './HeaderImageStyle';
import { Feather } from '@expo/vector-icons';

type Props = {
  image?: string; // e.g., './images/avatar.jpg'
};

function HeaderImage({ image }: Props) {
  const localImage = image ? require('./images/avatar.jpg') : null;

  return (
    <View style={styles.imageWrapper}>
      <View style={styles.imageBox}>
        {localImage ? (
          <Image source={localImage} style={styles.image} resizeMode="cover" />
        ) : (
          <Feather name="camera" size={26} color="#FFF" />
        )}
      </View>
    </View>
  );
}

export default HeaderImage;
