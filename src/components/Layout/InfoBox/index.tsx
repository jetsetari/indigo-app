import CustomIcon from '../CustomIcon';
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { styles } from './InfoBoxStyle';

type IconName = React.ComponentProps<typeof CustomIcon>['icon'];
type InfoBoxItem = {
  icon: IconName;
  value: string | number;
  label: string;
};

type Props = {
  box1: InfoBoxItem;
  box2: InfoBoxItem;
  onLogPress?: () => void;
};

function InfoBox({ box1, box2, onLogPress }: Props) {
  return (
    <View style={styles.infoBox}>
      <View style={styles.infoBoxColumn}>
        <View style={styles.infoBoxIcon}>
          <CustomIcon icon={box1.icon} size={25} />
        </View>
        <View style={styles.infoBoxRow}>
          <Text style={styles.infoBoxValue}>{box1.value}</Text>
          <Text style={styles.infoBoxLabel}>{box1.label}</Text>
        </View>
      </View>
      <View style={styles.infoBoxColumn}>
        <View style={styles.infoBoxIcon}>
          <CustomIcon icon={box2.icon} size={25} />
        </View>
        <View style={styles.infoBoxRow}>
          <Text style={styles.infoBoxValue}>{box2.value}</Text>
          <Text style={styles.infoBoxLabel}>{box2.label}</Text>
        </View>
      </View>
      {onLogPress ? (
        <TouchableOpacity onPress={onLogPress} activeOpacity={0.8} style={styles.logBtn} hitSlop={8}>
          <Feather name="file-text" size={16} color="#FFF" />
        </TouchableOpacity>
      ) : null}
    </View>
  );
}
export default InfoBox;