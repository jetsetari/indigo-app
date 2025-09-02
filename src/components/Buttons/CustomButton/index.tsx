import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { styles } from './CustomButtonStyle';
import { Feather } from '@expo/vector-icons';

type Props = {
  title: string;
  onPress: () => void;
  backgroundColor?: string;
  textColor?: string;
  borderColor?: string;
  icon?: keyof typeof Feather.glyphMap;
  iconColor?: string;
  iconSize?: number;
  disabled?: boolean;
};

export default function CustomButton({
  title,
  onPress,
  backgroundColor = '#2D40CA',
  textColor = '#FFF',
  borderColor = '#FFF',
  icon,
  iconColor = '#FFF',
  iconSize = 18,
  disabled = false,
}: Props) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      disabled={disabled}
      style={{ opacity: disabled ? 0.5 : 1 }} // visual feedback
    >
      <View
        style={[
          styles.button,
          {
            backgroundColor,
            borderColor,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            width: '100%',
          },
        ]}
      >
        {icon && (
          <Feather name={icon} size={iconSize} color={iconColor} />
        )}
        <Text style={[styles.text, { color: textColor, textAlign: 'center', alignContent: 'center', flex: 1 }]}>{title}</Text>
      </View>
    </TouchableOpacity>
  );
}
