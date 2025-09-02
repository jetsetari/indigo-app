// components/Layout/Blocks/HeaderTitleImage.tsx
import React from 'react';
import {
  View,
  Text,
  ImageBackground,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import IconButton from '~/components/Buttons/IconButton';

type Props = {
  image: number | { uri: string };
  title: string;
  subtitle: string;
  onBack: () => void;
};

const { width } = Dimensions.get('window');
const HEIGHT = 300;

export default function HeaderTitleImage({
  image,
  title,
  subtitle,
  onBack,
}: Props) {
  return (
    <ImageBackground
      source={image}
      style={styles.container}
      resizeMode="cover"
    >
      {/* close button */}
      <View style={styles.closeBtn}>
        <IconButton onPress={onBack} route="Workouts" icon="close" />
      </View>

      {/* full dark overlay if you still want it: */}
      <View style={styles.overlay} />

      {/* gradient fade at bottom */}
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,1)']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.gradient}
      />

      {/* text on top */}
      <View style={styles.textContainer}>
        <Text style={styles.subtitle}>{subtitle}</Text>
        <Text style={styles.title}>{title}</Text>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    width,
    height: HEIGHT,
    justifyContent: 'flex-end',
  },
  closeBtn: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 2,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 150,       // adjust to cover just behind your text
  },
  textContainer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    zIndex: 3,         // make sure text is above gradient
  },
  subtitle: {
    color: '#fff',
    fontSize: 14,
    marginBottom: 4,
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
  },
});
