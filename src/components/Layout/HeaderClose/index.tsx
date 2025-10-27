// src/components/Layout/HeaderWithExtra.tsx
import React, { ReactNode, Children } from 'react';
import { View } from 'react-native';

import IconButton from '~/components/Buttons/IconButton';
import HeaderText from '~/components/Layout/HeaderText';
import HeaderImage from '~/components/Layout/HeaderImage';
import { styles } from './HeaderCloseStyle';

type Props = {
  onClose?: () => void;
  title: string;
  subtitle?: string;
  image?: string;
  children?: ReactNode; // right-side slot
};

export default function HeaderClose({ onClose, title, subtitle = '', image, children }: Props) {
  const hasChildren = Children.count(children) > 0;

  return (
    <View style={styles.headerWithExtra}>
      <View style={styles.headerWithExtraWrapper}>
        {!image ? (
          // Optional wrapper so the right content doesn’t get squeezed
          <View style={{ flexShrink: 0, marginLeft: 12 }}/>
        ) : (
          <HeaderImage image={image} />
        )}
        <HeaderText title={title} subtitle={subtitle} />
      </View>
      {onClose ? <IconButton onPress={onClose} icon="close" /> : null}
    </View>
  );
}
