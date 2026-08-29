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
  tone?: 'default' | 'danger';
};

export default function SettingsButton({
  icon,
  title,
  onPress,
  tone = 'default',
}: Props) {
  const danger = tone === 'danger';
  return (
    <TouchableOpacity
      style={[styles.card, danger && styles.cardDanger]}
      onPress={onPress}
    >
      <View style={styles.left}>
        <Feather
          name={icon}
          size={20}
          color={danger ? '#E8A0A0' : '#FFF'}
          style={styles.icon}
        />
        <Text style={[styles.title, danger && styles.titleDanger]}>{title}</Text>
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
  cardDanger: {
    backgroundColor: '#1C1212',
    borderColor: '#5C3333',
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
    fontSize: 14,
  },
  titleDanger: {
    color: '#E8A0A0',
  },
});
