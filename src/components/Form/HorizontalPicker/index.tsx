// src/components/Form/FormHorizontalPicker.tsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, FlatList, Text, NativeScrollEvent, NativeSyntheticEvent, FlatListProps } from 'react-native';
import { useController, type FieldValues, type Path } from 'react-hook-form';
import __base from '~/assets/styles/base';
import { styles, H_PADDING, ITEM_WIDTH } from './HorizontalPickerStyle';

type Props<T extends FieldValues = FieldValues> = {
  control: any;                 // RHF Control<any>
  name: Path<T>;
  label?: string;
  min?: number;
  max?: number;
  unit?: string;
  required?: boolean;           // visual only; enforce via rules
  rules?: any;                  // RHF rules (e.g., { required: 'Weight required' })
};

export default function FormHorizontalPicker<T extends FieldValues>({
  control,
  name,
  label,
  min = 100,
  max = 300,
  unit = 'lbs',
  required,
  rules,
}: Props<T>) {
  // Bind to RHF without using a render callback
  const { field, fieldState } = useController({ control, name, rules });

  // ------- picker state/refs -------
  const flatListRef = useRef<FlatList<number>>(null);
  const didInitialJump = useRef(false);
  const lastSentFromScrollRef = useRef<number | null>(null);
  const pendingValueRef = useRef<number>(toNumberOr(min, field.value));

  const clamp = (v: number) => Math.min(Math.max(v, min), max);
  const indexFromValue = (v: number) => clamp(v) - min;

  const data = useMemo<number[]>(
    () => Array.from({ length: max - min + 1 }, (_, i) => min + i),
    [min, max]
  );

  const [internalValue, setInternalValue] = useState<number>(
    clamp(toNumberOr(min, field.value))
  );

  // Jump helper
  const jumpTo = (v: number, animated = false) => {
    const idx = indexFromValue(v);
    const offset = idx * ITEM_WIDTH;
    requestAnimationFrame(() => {
      flatListRef.current?.scrollToOffset({ offset, animated });
    });
  };

  // Sync when external form value changes
  useEffect(() => {
    const next = clamp(toNumberOr(min, field.value));
    setInternalValue(next);
    if (lastSentFromScrollRef.current === next) return;

    if (!didInitialJump.current) {
      didInitialJump.current = true;
      jumpTo(next, false);
    } else {
      jumpTo(next, false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [field.value, min, max]);

  // Track while scrolling (don’t commit yet)
  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = Math.max(0, e.nativeEvent.contentOffset.x);
    const rawIndex = Math.round(offsetX / ITEM_WIDTH);
    const safeIndex = Math.min(Math.max(rawIndex, 0), data.length - 1);
    const selected = data[safeIndex];

    if (selected !== internalValue) {
      setInternalValue(selected);
      pendingValueRef.current = selected;
    }
  };

  // Commit once on release
  const commitFromScroll = () => {
    const v = pendingValueRef.current;
    lastSentFromScrollRef.current = v;
    field.onChange(v);
  };

  const onScrollEndDrag = () => commitFromScroll();
  const onMomentumScrollEnd = () => commitFromScroll();

  const getItemLayout: NonNullable<FlatListProps<number>['getItemLayout']> = (
    _,
    index
  ) => ({ length: ITEM_WIDTH, offset: ITEM_WIDTH * index, index });

  return (
    <View style={styles.wrapper}>
      {!!label && (
        <Text style={styles.label}>
          {label}
          {required && <Text style={__base.asterix}> *</Text>}
        </Text>
      )}

      <View style={styles.scaleWrapper} onLayout={() => jumpTo(internalValue, false)}>
        <FlatList
          ref={flatListRef}
          data={data}
          keyExtractor={(item) => String(item)}
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={ITEM_WIDTH}
          decelerationRate="fast"
          bounces={false}
          overScrollMode="never"
          contentContainerStyle={{ paddingHorizontal: H_PADDING }}
          onScroll={handleScroll}
          onScrollEndDrag={onScrollEndDrag}
          onMomentumScrollEnd={onMomentumScrollEnd}
          scrollEventThrottle={16}
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

      {!!fieldState.error?.message && (
        <Text style={[__base.errorMsg, { marginTop: 6 }]}>
          {String(fieldState.error.message)}
        </Text>
      )}
    </View>
  );
}

function toNumberOr(fallback: number, v: unknown) {
  if (typeof v === 'number') return v;
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}
