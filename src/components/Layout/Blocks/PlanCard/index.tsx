import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Feather } from '@expo/vector-icons';
import styles from './PlanCardStyle';

type Props = {
  title: string;
  description: string;
  image?: any;
  onPress?: () => void;
};

export default function PlanCard({ title, description, image, onPress }: Props) {
  return (
    <TouchableOpacity style={styles.planCard} onPress={onPress}>
      <View style={styles.planImageWrapper}>
        {image ? (
          <Image source={image} style={styles.planImage} />
        ) : (
          <Feather name="image" size={20} color="#FFF" />
        )}
      </View>
      <View style={styles.planContent}>
        <Text style={styles.planTitle}>{title}</Text>
        <Text style={styles.planSubtitle}>{description}</Text>
      </View>
      <Feather name="chevron-right" size={20} color="#888" />
    </TouchableOpacity>
  );
}
