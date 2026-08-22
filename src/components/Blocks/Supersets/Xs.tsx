import React, { useMemo, useState, useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import ExerciseItemXs from '~/components/Blocks/ExerciseItem/Xs';
import { groupBySuperset, colorForSuperset } from '~/data/helpers/workouts';
import { groupBySupersetNumber, setsCountForItem } from '~/data/helpers/workoutRun';
import { getLogsForDate } from '~/data/supabase/clientWorkoutLogsHandler';
import { useUserStore } from '~/data/store/userStore';
import type { WorkoutItem } from '~/data/types';
import { Feather } from '@expo/vector-icons';
import __base from '~/assets/styles/base';

type Props = { 
  items: WorkoutItem[];
  selectedDate?: string; // ISO date string
};

export default function SupersetsXs({ items, selectedDate }: Props) {
  const navigation = useNavigation<any>();
  const client = useUserStore((s) => s.client);
  const [logsCountByItem, setLogsCountByItem] = useState<Map<number, number>>(new Map());
  
  const groupMap = useMemo(() => groupBySupersetNumber(items), [items]);
  const groups = useMemo(() => groupBySuperset(items), [items]);

  // Load logs for the selected date
  useEffect(() => {
    if (!client?.id || !selectedDate) return;
    let alive = true;
    (async () => {
      try {
        const counts = await getLogsForDate(client.id, selectedDate);
        if (alive) setLogsCountByItem(counts);
      } catch (error) {
        console.error('Error loading logs:', error);
      }
    })();
    return () => { alive = false; };
  }, [client?.id, selectedDate]);

  if (!groups.length) return null;

  const handleItemPress = (item: WorkoutItem) => {
    // Find which superset this item belongs to
    let supersetNum = 0;
    for (const [key, groupItems] of groupMap.entries()) {
      if (groupItems.some((i: any) => i.id === item.id)) {
        supersetNum = key;
        break;
      }
    }

    // Find set index (how many sets are logged for this item)
    const loggedSets = logsCountByItem.get(item.id) ?? 0;
    const totalSets = setsCountForItem(items, item.id);
    const setIndex = Math.min(loggedSets, totalSets - 1);

    // Check if all sets are done
    const allSetsDone = loggedSets >= totalSets;
    const itemsAll = items;
    const idxAll = itemsAll.findIndex((x: any) => x.id === item.id);

    // Incomplete → perform next set (past sets show on Exercise).
    // Complete → history for this exercise only.
    if (allSetsDone) {
      navigation.navigate('LogExercise', {
        item,
        setIndex: Math.max(0, totalSets - 1),
        supersetNum,
        itemsAll,
        idxAll,
        mode: 'history',
        returnTo: 'Home',
        date: selectedDate,
      });
    } else {
      navigation.navigate('Exercise', {
        item,
        setIndex,
        supersetNum,
        itemsAll,
        idxAll,
        returnTo: 'Home',
      });
    }
  };

  return (
    <View style={{ gap: 5, marginBottom: 5 }}>
      {groups.map(([groupNum, list]) => {
        const { border, bg } = colorForSuperset(list[0]?.supersetLabel);

        return (
          <View key={`g-${groupNum}`} style={{ gap: 0 }}>
            <View style={{ borderColor: border, backgroundColor: bg, borderWidth: 1, padding: 5, gap: 5 }}>
              {list.map((it) => {
                // Use custom_exercise_name if available, otherwise fall back to exercise.name
                const tTitle = (it.customExerciseName?.trim() || it.exercise?.name) ?? 'Exercise';
                const tSubtitle = it.reps ?? '';
                const tLabel = it.supersetLabel ?? '';
                const cover = it.exercise?.cover;
                const { border: itemBorder, bg: itemBg } = colorForSuperset(it.supersetLabel);
                
                // Check if this exercise is done (all sets logged)
                const totalSets = setsCountForItem(items, it.id);
                const loggedSets = logsCountByItem.get(it.id) ?? 0;
                const done = loggedSets >= totalSets;
                
                return (
                  <TouchableOpacity
                    key={it.id}
                    onPress={() => handleItemPress(it)}
                    activeOpacity={0.7}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <ExerciseItemXs
                        cover={cover}
                        title={tTitle}
                        subtitle={tSubtitle}
                        label={tLabel}
                        borderColor={itemBorder}
                        backgroundColor={itemBg}
                        loggedSets={loggedSets}
                        totalSets={totalSets}
                        progressColor={itemBorder}
                      />
                      {done && (
                        <View style={{ marginLeft: 8, backgroundColor: itemBorder, borderRadius: 12, width: 24, height: 24, justifyContent: 'center', alignItems: 'center' }}>
                          <Feather name="check" size={16} color="#FFF" />
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        );
      })}
    </View>
  );
}
