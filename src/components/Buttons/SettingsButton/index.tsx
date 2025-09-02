// components/Layout/Blocks/SettingsButton.tsx

import React from 'react';
import {
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { Feather } from '@expo/vector-icons';

type Props = {
  icon: React.ComponentProps<typeof Feather>['name'];
  title: string;
  onPress?: () => void;
};

export default function SettingsButton({
  icon,
  title,
  onPress,
}: Props) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.left}>
        <Feather name={icon} size={20} color="#FFF" style={styles.icon} />
        <Text style={styles.title}>{title}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111',
    borderRadius: 0,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderColor: '#333',
    borderWidth: 1,
    marginBottom: 5,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 12,
  },
  title: {
    color: '#FFF',
    fontSize: 16,
  },
});
