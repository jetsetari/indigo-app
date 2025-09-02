
import React, { useRef } from 'react';
import { View, Image, Text } from 'react-native';
import { styles } from './HeaderTextStyle';


type Props = {
  title: string;
  subtitle: string;
};

function HeaderText({ title, subtitle }: Props) {

  return (
    <View style={styles.headerText}>
      <Text style={styles.h1}>{ title }</Text>
      <Text style={styles.subline}>{ subtitle }</Text>
    </View>
  );
}

export default HeaderText;