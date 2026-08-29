
import React from 'react';
import { View, Text, type StyleProp, type ViewStyle } from 'react-native';
import { styles } from './HeaderTextStyle';

type Props = {
  title: string;
  subtitle: string;
  style?: StyleProp<ViewStyle>;
};

function HeaderText({ title, subtitle, style }: Props) {
  return (
    <View style={[styles.headerText, style]}>
      <Text style={styles.h1} numberOfLines={1} ellipsizeMode="tail">
        {title}
      </Text>
      <Text style={styles.subline} numberOfLines={1} ellipsizeMode="tail">
        {subtitle}
      </Text>
    </View>
  );
}

export default HeaderText;