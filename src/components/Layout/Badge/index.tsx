import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Polygon } from 'react-native-svg';
import { Feather } from '@expo/vector-icons';

/**
 * A hexagon badge with border, inner background, and centered Feather icon.
 *
 * @param size       Badge width/height in pixels (default: 100)
 * @param border     Outer hexagon fill color
 * @param background Inner hexagon fill color
 * @param icon       Feather icon name (e.g. "heart")
 */
export function Badge({
  size = 100,
  border,
  background,
  icon,
}: {
  size?: number;
  border: string;
  background: string;
  icon: keyof typeof Feather.glyphMap;
}) {
  // Compute hex points for a regular flat-topped hexagon
  const outer = hexagonPoints(size, 0);
  const inset = size * 0.1;
  const inner = hexagonPoints(size, inset);

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        <Polygon points={outer} fill={border} />
        <Polygon points={inner} fill={background} />
      </Svg>
      <View style={[StyleSheet.absoluteFillObject, styles.iconWrapper]}>
        <Feather name={icon} size={size * 0.4} color="#fff" />
      </View>
    </View>
  );
}

function hexagonPoints(size: number, inset: number): string {
  const half = size / 2;
  const quarter = size / 4;
  return [
    `${half},${inset}`,
    `${size - inset},${quarter + inset / 2}`,
    `${size - inset},${size - quarter - inset / 2}`,
    `${half},${size - inset}`,
    `${inset},${size - quarter - inset / 2}`,
    `${inset},${quarter + inset / 2}`,
  ].join(' ');
}

const styles = StyleSheet.create({
  iconWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
