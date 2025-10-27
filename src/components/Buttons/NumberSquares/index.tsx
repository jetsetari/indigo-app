import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';

type Props<T extends number | string = number> = {
  values: T[];                 // values to render, shown as numbers
  selected: T | null;          // current selection
  onSelect: (v: T) => void;
  dots?: Set<T> | T[];         // optional: show green dot on these values
  label?: string;              // optional header label
};

export default function NumberSquares<T extends number | string>({
  values, selected, onSelect, dots, label,
}: Props<T>) {
  const hasDot = (v: T) =>
    dots instanceof Set ? dots.has(v) : Array.isArray(dots) ? dots.includes(v) : false;

  return (
    <View style={s.wrap}>
      {!!label && <Text style={s.label}>{label}</Text>}
      <View style={s.row}>
        {values.map((v) => {
          const isSelected = selected === v;
          return (
            <Pressable key={`${v}`} onPress={() => onSelect(v)} style={[s.square, isSelected && s.squareSelected]}>
              <Text style={[s.text, isSelected && s.textSelected]}>{v}</Text>
              {hasDot(v) && <View style={s.dot} />}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { gap: 8 },
  label: { color: '#cbd5e1', fontSize: 14, fontWeight: '600' },
  row: { flexDirection: 'row', gap: 5 },
  square: {
    width: 35, height: 35, borderRadius: 0,
    borderWidth: 1, borderColor: '#ffffff80',
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  squareSelected: { backgroundColor: '#fff', borderColor: '#fff' },
  text: { color: '#fff', fontWeight: '800', fontSize: 16 },
  textSelected: { color: '#000' },
  dot: {
    position: 'absolute', bottom: 5, left: 5, width: 6, height: 6, borderRadius: 10000, backgroundColor: '#22c55e',
  },
});
