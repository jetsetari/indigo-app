import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';

type Props = {
  complete?: boolean;
  onPress: () => void;
  completeLabel?: string;
  label?: string;
  icon?: React.ComponentProps<typeof Feather>['name'];
  disabled?: boolean;
  backgroundColor?: string;
  textColor?: string;
  borderColor?: string;
  fullWidth?: boolean;
  style?: object;
};

export default function StartWorkoutButton({
  complete = false,
  onPress,
  completeLabel = 'Edit',
  label,
  icon,
  disabled = false,
  backgroundColor = '#4DD4AC',
  textColor = '#000',
  borderColor,
  fullWidth = false,
  style,
}: Props) {
  const text = label ?? (complete ? completeLabel : 'Start');
  const featherIcon = icon ?? (complete ? 'edit-3' : 'play');

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={[
        styles.button,
        fullWidth && styles.fullWidth,
        { backgroundColor },
        borderColor ? { borderColor, borderWidth: 1 } : null,
        style,
      ]}
      disabled={disabled}
    >
      <Feather name={featherIcon} size={fullWidth ? 16 : 14} color={textColor} />
      <Text style={[styles.label, fullWidth && styles.fullWidthLabel, { color: textColor }]}>{text}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#4DD4AC',
    paddingLeft: 12,
    paddingRight: 14,
    paddingVertical: 8,
  },
  fullWidth: {
    width: '100%',
    height: 42,
    paddingLeft: 12,
    paddingRight: 12,
    paddingVertical: 0,
    marginBottom: 8,
  },
  label: {
    color: '#000',
    fontSize: 13,
    fontFamily: 'Inter-Bold',
  },
  fullWidthLabel: {
    fontSize: 14,
  },
});
