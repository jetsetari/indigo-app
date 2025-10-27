import React from 'react';
import { View, Text, ImageBackground } from 'react-native';
import { styles } from './HeaderTitleImageStyle';

type Props = {
  image?: string;
  title: string;
  subtitle?: string;
  description?: string;
};

export default function HeaderTitleImage({ image, title, subtitle, description }: Props) {
  return (
    <View style={styles.wrap}>
      <ImageBackground
        source={image ? { uri: image } : undefined}
        style={styles.bg}
        imageStyle={styles.bgImage}
      >
        <View style={styles.overlay} />
        <View style={styles.textWrap}>
          {!!title && <Text style={styles.title}>{title}</Text>}
          {!!subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
          {!!description && <Text style={styles.description}>{description}</Text>}
        </View>
      </ImageBackground>
    </View>
  );
}
