import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import { styles } from './IconButtonStyle';

type Props = {
  chevronColor?: string;
  backgroundColor?: string;
  route?: string;                   // destination route name (optional now)
  icon?: 'chevron-back' | 'close';
  onPress?: () => void;             // optional custom press handler
};

export default function BackButton({
  chevronColor = '#000',
  backgroundColor = '#FFF',
  route,
  icon = 'chevron-back',
  onPress,
}: Props) {
  const navigation = useNavigation();

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else if (route) {
      navigation.navigate(route as never);
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.8}
      style={styles.button}
    >
      <View style={[styles.square, { backgroundColor }]}>
        <Ionicons name={icon} size={20} color={chevronColor} />
      </View>
    </TouchableOpacity>
  );
}
