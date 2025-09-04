// src/components/Form/HorizontalPicker/index.tsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  FlatList,
  Text,
  Dimensions,
  StyleSheet,
  NativeScrollEvent,
  NativeSyntheticEvent,
  FlatListProps,
} from 'react-native';

const { width } = Dimensions.get('window');
const ITEM_WIDTH = 20;
const H_PADDING = (width - ITEM_WIDTH) / 2;

type Props = {
  label?: string;
  min?: number;
  max?: number;
  value: number;               // controlled value (e.g., 70)
  unit?: string;
  onChange: (value: number) => void;
};

export default function HorizontalPicker({
  label,
  min = 100,
  max = 300,
  value,
  unit = 'lbs',
  onChange,
}: Props) {
  const flatListRef = useRef<FlatList<number>>(null);

  // Flags/refs to coordinate scroll vs external updates
  const didInitialJump = useRef(false);
  const lastSentFromScrollRef = useRef<number | null>(null);
  const pendingValueRef = useRef<number>(value);

  const data = useMemo<number[]>(
    () => Array.from({ length: max - min + 1 }, (_, i) => min + i),
    [min, max]
  );

  const clamp = (v: number) => Math.min(Math.max(v, min), max);
  const indexFromValue = (v: number) => clamp(v) - min;

  const [internalValue, setInternalValue] = useState<number>(clamp(value));

  // Jump helper (single place)
  const jumpTo = (v: number, animated = false) => {
    const idx = indexFromValue(v);
    const offset = idx * ITEM_WIDTH;
    requestAnimationFrame(() => {
      flatListRef.current?.scrollToOffset({ offset, animated });
    });
  };

  // On mount & whenever min/max/value change:
  // - If the value came from our own scroll commit, do not jump (prevents snap-back).
  // - Otherwise, jump to keep initial/external value centered.
  useEffect(() => {
    const clamped = clamp(value);
    setInternalValue(clamped);

    if (lastSentFromScrollRef.current === clamped) {
      // came from our own scroll -> do not reposition
      return;
    }

    // One-shot initial jump after first layout OR external changes
    if (!didInitialJump.current) {
      didInitialJump.current = true;
      jumpTo(clamped, false);
    } else {
      jumpTo(clamped, false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, min, max]);

  // Keep UI value live while scrolling (do NOT call onChange here)
  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = Math.max(0, e.nativeEvent.contentOffset.x);
    const rawIndex = Math.round(offsetX / ITEM_WIDTH);
    const safeIndex = Math.min(Math.max(rawIndex, 0), data.length - 1);
    const selected = data[safeIndex];

    if (selected !== internalValue) {
      setInternalValue(selected);
      pendingValueRef.current = selected; // remember to commit on release
    }
  };

  // Commit helper on release (drag end or momentum end)
  const commitFromScroll = () => {
    const v = pendingValueRef.current;
    lastSentFromScrollRef.current = v; // mark as self-originated
    onChange(v);                       // single commit to parent/RHF
  };

  const onScrollEndDrag = () => commitFromScroll();
  const onMomentumScrollEnd = () => commitFromScroll();

  // Correct TS signature for FlatList.getItemLayout
  const getItemLayout: NonNullable<FlatListProps<number>['getItemLayout']> = (
    _data: ArrayLike<number> | null | undefined,
    index: number 
  ) => ({
    length: ITEM_WIDTH,
    offset: ITEM_WIDTH * index,
    index, 
  });

  return (
    <View style={styles.wrapper}>
      {label ? <Text style={styles.label}>{label}</Text> : null}

      <View style={styles.scaleWrapper} onLayout={() => jumpTo(value, false)}>
        <FlatList
          ref={flatListRef}
          data={data}
          keyExtractor={(item) => item.toString()}
          horizontal
          showsHorizontalScrollIndicator={false}
          // Smooth feel you liked
          snapToInterval={ITEM_WIDTH}
          decelerationRate="fast"
          bounces={false}
          overScrollMode="never"
          contentContainerStyle={{ paddingHorizontal: H_PADDING }}
          onScroll={handleScroll}
          onScrollEndDrag={onScrollEndDrag}
          onMomentumScrollEnd={onMomentumScrollEnd}
          scrollEventThrottle={16}
          // We avoid initialScrollIndex jank; jump via onLayout/effect instead
          getItemLayout={getItemLayout}
          renderItem={({ item }) => (
            <View style={styles.item}>
              <View
                style={[
                  styles.tick,
                  item % 10 === 0 ? styles.longTick : styles.shortTick,
                ]}
              />
              {item % 10 === 0 && <Text style={styles.tickLabel}>{item}</Text>}
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
    marginBottom: 30,
  },
  label: {
    color: '#FFF',
    fontSize: 16,
    marginBottom: 20,
    fontFamily: 'Inter-SemiBold',
    alignSelf: 'flex-start',
    paddingHorizontal: 20,
  },
  scaleWrapper: { position: 'relative' },
  item: {
    width: ITEM_WIDTH,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  tick: { width: 2, backgroundColor: '#888', height: 20 },
  longTick: { height: 30, backgroundColor: '#FFF' },
  shortTick: { height: 15 },
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
    alignItems: 'flex-end',
  },
  valueNumber: { fontSize: 32, fontWeight: 'bold', color: '#FFF' },
  valueUnit: { fontSize: 18, color: '#FFF', marginLeft: 4, fontFamily: 'Inter-Light' },
});
