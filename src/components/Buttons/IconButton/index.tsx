// src/components/Buttons/IconButton/index.tsx
import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import { styles } from './IconButtonStyle';

type Props = {
  chevronColor?: string;
  backgroundColor?: string;
  route?: string;                   // keep: navigate when provided
  icon?: 'chevron-back' | 'close';
  onPress?: () => void;
  back?: boolean;                   // NEW: force goBack() when true (default when no route)
};

export default function IconButton({
  chevronColor = '#000',
  backgroundColor = '#FFF',
  route,
  icon = 'chevron-back',
  onPress,
  back,
}: Props) {
  const navigation = useNavigation();

  const handlePress = () => {
    if (onPress) return onPress();

    const shouldGoBack = back === true || !route; // default to goBack when no route passed
    if (shouldGoBack) {
      if ((navigation as any).canGoBack?.()) {
        (navigation as any).goBack();
        return;
      }
      // fallback if no history
      if (route) (navigation as any).navigate(route as never);
      else (navigation as any).navigate('Home' as never);
      return;
    }

    (navigation as any).navigate(route as never);
  };

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.8} style={styles.button}>
      <View style={[styles.square, { backgroundColor }]}>
        <Ionicons name={icon} size={20} color={chevronColor} />
      </View>
    </TouchableOpacity>
  );
}
