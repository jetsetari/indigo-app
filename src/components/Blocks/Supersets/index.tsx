import React, { useMemo } from 'react';
import { View, Text } from 'react-native';
import ExerciseItem from '~/components/Blocks/ExerciseItem';
import { groupBySuperset, colorForSuperset } from '~/data/helpers/workouts';
import type { WorkoutItem } from '~/data/types';

type Props = { items: WorkoutItem[] };
import __base from '~/assets/styles/base';

export default function Supersets({ items }: Props) {
  const groups = useMemo(() => groupBySuperset(items), [items]);

  if (!groups.length) return null;

  return (
    <View style={{ gap: 15, marginBottom: 20 }}>
      {groups.map(([groupNum, list]) => {
        const { border, bg } = colorForSuperset(list[0]?.supersetLabel);
        const title = groupNum > 0 ? `Superset ${groupNum}` : 'Exercises';

        return (
          <View key={`g-${groupNum}`} style={{ gap: 5, marginBottom: 0 }}>
            <Text style={__base.textBold}>{title}</Text>
            <View style={{ borderColor: border, backgroundColor: bg, borderWidth: 1, padding: 5, gap: 5 }}>
              {list.map((it) => {
                const tTitle = it.exercise?.name ?? 'Exercise';
                const tSubtitle = it.reps ?? '';
                const tLabel = it.supersetLabel ?? '';
                const cover = it.exercise?.cover;
                const { border: itemBorder, bg: itemBg } = colorForSuperset(it.supersetLabel);
                return (
                  <ExerciseItem
                    key={it.id}
                    cover={cover}
                    title={tTitle}
                    subtitle={tSubtitle}
                    label={tLabel}
                    borderColor={itemBorder}
                    backgroundColor={itemBg}
                  />
                );
              })}
            </View>
          </View>
        );
      })}
    </View>
  );
}
