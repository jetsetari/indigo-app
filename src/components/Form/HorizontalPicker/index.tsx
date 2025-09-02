import React, { useRef, useState } from 'react';
import {
  View,
  FlatList,
  Text,
  Dimensions,
  StyleSheet,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from 'react-native';

const { width } = Dimensions.get('window');
const ITEM_WIDTH = 20;
const VISIBLE_ITEMS = Math.floor(width / ITEM_WIDTH);

type Props = {
  label?: string;
  min?: number;
  max?: number;
  value: number;
  unit?: string;
  onChange: (value: number) => void;
};

export default function HorizontalPicker({
  min = 100,
  max = 300,
  value,
  unit = 'lbs',
  onChange,
  label,
}: Props) {
  const flatListRef = useRef<FlatList>(null);
  const [internalValue, setInternalValue] = useState(value);

  const data = Array.from({ length: max - min + 1 }, (_, i) => min + i);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / ITEM_WIDTH);
    const selected = data[index];
    setInternalValue(selected);
    onChange(selected);
  };

  return (
    <View style={styles.wrapper}>
      { label && <Text style={styles.label}>{label}</Text> }

      <View style={styles.scaleWrapper}>
        <FlatList
          ref={flatListRef}
          data={data}
          keyExtractor={(item) => item.toString()}
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={ITEM_WIDTH}
          decelerationRate="fast"
          contentContainerStyle={{
            paddingHorizontal: (width - ITEM_WIDTH) / 2,
          }}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          renderItem={({ item }) => (
            <View style={styles.item}>
              <View
                style={[
                  styles.tick,
                  item % 10 === 0 ? styles.longTick : styles.shortTick,
                ]}
              />
              {item % 10 === 0 && (
                <Text style={styles.tickLabel}>{item}</Text>
              )}
            </View>
          )}
        />
        <View style={styles.centerIndicator} />
      </View>

      <Text style={styles.valueDisplay}>
        <Text style={styles.valueNumber}>{internalValue}</Text>
        <Text style={styles.valueUnit}> {unit}</Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingVertical: 40,
    alignItems: 'center',
    backgroundColor: '#000',
    maxHeight: 150,
    marginBottom: 30
  },
  label: {
    color: '#FFF',
    fontSize: 16,
    marginBottom: 20,
    fontFamily: 'Inter-SemiBold',
    textAlign: 'left',
  },
  scaleWrapper: {
    position: 'relative',
  },
  item: {
    width: ITEM_WIDTH,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  tick: {
    width: 2,
    backgroundColor: '#888',
    height: 20,
  },
  longTick: {
    height: 30,
    backgroundColor: '#FFF',
  },
  shortTick: {
    height: 15,
  },
  tickLabel: {
    marginTop: 4,
    color: '#FFF',
    fontSize: 12,
    fontFamily: 'Inter-Light',
  },
  centerIndicator: {
    position: 'absolute',
    top: 0,
    bottom: 30,
    left: width / 2 - 1,
    width: 2,
    backgroundColor: '#FFF',
  },
  valueDisplay: {
    marginTop: -20,
    flexDirection: 'row',
    alignItems: 'flex-end'
  },
  valueNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFF',
  },
  valueUnit: {
    fontSize: 18,
    color: '#FFF',
    marginLeft: 4,
    fontFamily: 'Inter-Light',
  },
});
