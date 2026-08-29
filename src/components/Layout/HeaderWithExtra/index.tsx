// src/components/Layout/HeaderWithExtra.tsx
import React, { ReactNode, Children } from 'react';
import { View } from 'react-native';

import IconButton from '~/components/Buttons/IconButton';
import HeaderText from '~/components/Layout/HeaderText';
import HeaderImage from '~/components/Layout/HeaderImage';
import { styles } from './HeaderWithExtraStyle';

type Props = {
  back?: string;
  onBack?: () => void;
  title: string;
  subtitle?: string;
  image?: string;
  hideImage?: boolean;
  children?: ReactNode; // right-side slot
};

export default function HeaderWithExtra({ back, onBack, title, subtitle = '', image, hideImage, children }: Props) {
  const hasChildren = Children.count(children) > 0;
  const showBack = !!back || !!onBack;

  return (
    <View style={styles.headerWithExtra}>
      <View style={styles.headerWithExtraWrapper}>
        {showBack ? (
          <IconButton
            route={back}
            back={!onBack}
            onPress={onBack}
          />
        ) : null}
        <HeaderText title={title} subtitle={subtitle} style={{ marginBottom: 0, flex: 1 }} />
      </View>

      {hasChildren ? (
        // Optional wrapper so the right content doesn’t get squeezed
        <View style={{ flexShrink: 0, marginLeft: 12 }}>{children}</View>
      ) : hideImage ? null : (
        <HeaderImage image={image} />
      )}
    </View>
  );
}
