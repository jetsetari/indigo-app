import React, { useMemo, useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';

import IconButton from '~/components/Buttons/IconButton';
import FullBleed from '~/components/Layout/FullBleed';
import NumberSquares from '~/components/Buttons/NumberSquares';
import ExerciseItem from '~/components/Blocks/ExerciseItem';
import CustomButton from '~/components/Buttons/CustomButton';

import { groupBySupersetNumber, setsCountForGroup, nextTodoIndex } from '~/data/helpers/workoutRun';
import { getLogsForDate } from '~/data/supabase/clientWorkoutLogsHandler';
import type { WorkoutItem } from '~/data/types';
import { useUserStore } from '~/data/store/userStore';

import __base from '~/assets/styles/base';

type RouteParams = {
  items: WorkoutItem[];
  supersetNum?: number; // optional initial superset to preselect
  planTitle?: string;   // optional plan name for the header
};

export default function StartWorkout() {
  const nav = useNavigation<any>();
  const { params } = useRoute<any>();
  const allItems: WorkoutItem[] = params?.items ?? [];
  const initialSuperset = params?.supersetNum;
  const planTitle = params?.planTitle ?? 'Cutting Plan';
  const { client } = useUserStore.getState();
  const [logsCountByItem, setLogsCountByItem] = useState<Map<number, number>>(new Map());

  useFocusEffect(
    React.useCallback(() => {
      let alive = true;
      (async () => {
        if (!client?.id) return;
        const counts = await getLogsForDate(client.id /*, params?.isoDate */);
        if (alive) setLogsCountByItem(counts);
      })();
      return () => { alive = false; };
    }, [client?.id])
  );

  // Build groups
  const groupMap = useMemo(() => groupBySupersetNumber(allItems), [allItems]);
  const supersetKeys = useMemo(
    () => Array.from(groupMap.keys()).sort((a, b) => a - b),
    [groupMap]
  );

  // Selected superset & set
  const [supersetNum, setSupersetNum] = useState<number>(0);
  const [setIndex, setSetIndex] = useState<number>(0);

  // Preselect superset
  useEffect(() => {
    const preferred =
      initialSuperset && groupMap.has(initialSuperset) ? initialSuperset :
      supersetKeys.find(k => k > 0) ?? supersetKeys[0] ?? 0;
    setSupersetNum(preferred);
    setSetIndex(0);
  }, [initialSuperset, groupMap, supersetKeys]);

  // Current group
  const group = useMemo(() => groupMap.get(supersetNum) ?? [], [groupMap, supersetNum]);
  const totalSets = useMemo(() => setsCountForGroup(group), [group]);

  // Done state (for checkmarks / green dots)
  const [done, setDone] = useState<Set<number>>(new Set());
  const nextIdx = useMemo(() => nextTodoIndex(group, done), [group, done]);
  const nextItem = group[nextIdx];

  // Background/header image
  const headerImg = nextItem?.exercise?.cover ?? group[0]?.exercise?.cover ?? undefined;

  // Selection: user must pick an exercise to show CTA
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const selectedItem = useMemo(() => group.find(i => i.id === selectedId) || null, [group, selectedId]);

  // Dots logic (optional): mark supersets that have any completed items
  const supersetDotSet = useMemo(() => {
    const s = new Set<number>();
    for (const [k, arr] of groupMap.entries()) {
      const ts = setsCountForGroup(arr);
      const finished = ts > 0 && arr.every(it => (logsCountByItem.get(it.id) ?? 0) >= ts);
      if (finished) s.add(k);
    }
    return s;
  }, [groupMap, logsCountByItem]);

  // Optional set dots: mark current set if any item is marked done
  const setDotSet = useMemo(() => {
    const s = new Set<number>();
    if (group.length) {
      const anyDone = group.some(it => done.has(it.id));
      if (anyDone) s.add(setIndex + 1); // 1-based for UI
    }
    return s;
  }, [group, done, setIndex]);

  const isLoggedForSet = (itemId: number, setIdx: number) =>
  (logsCountByItem.get(itemId) ?? 0) >= (setIdx + 1);

  const onStart = () => {
    const item = selectedItem ?? nextItem ?? group[0];
    if (!item) return;
    const itemsAll = allItems;
    const idxAll = itemsAll.findIndex(x => x.id === item.id);

    nav.navigate('Exercise', { item, setIndex, supersetNum, itemsAll, idxAll });
  };

  const formatRepsForSet = (reps?: string|null, setIdx: number = 0) => {
    if (!reps) return '';
    const parts = reps.split(',').map(p => p.trim());
    const token = parts[Math.min(setIdx, parts.length - 1)] ?? '';
    const m = token.match(/^(\d+)([a-zA-Z]*)$/);
    if (!m) return token;
    const [, num, unit] = m;
    if (!unit) return `${num} Reps`;
    if (unit.toLowerCase() === 's') return `${num} seconds`;
    return `${num} ${unit}`; // fallback
  };

  // dots per SET: mark set N if ALL exercises in group are logged for that set
  const setsDoneDots = useMemo(() => {
    const dots = new Set<number>();
    if (!group.length || totalSets === 0) return dots;
    for (let k = 1; k <= totalSets; k++) {
      const allDone = group.every(it => (logsCountByItem.get(it.id) ?? 0) >= k);
      if (allDone) dots.add(k);
    }
    return dots;
  }, [group, totalSets, logsCountByItem]);

    // dots per SUPERSET: mark superset S if ALL sets for ALL its exercises are logged
    
  const alreadyLogged = selectedItem ? isLoggedForSet(selectedItem.id, setIndex) : false;


  return (
    <FullBleed
      backgroundUri={headerImg}
      Top={<IconButton route="Home" />}
      Center={<Text style={__base.headline}>{planTitle}</Text>}
      Bottom={
        <View style={{ gap: 12 }}>
          <View style={{ flexDirection: 'row', gap: 20 }}>
            <NumberSquares label="Superset" values={supersetKeys} selected={supersetNum} onSelect={(v) => { setSupersetNum(Number(v)); setSetIndex(0); setSelectedId(null); }} dots={supersetDotSet} />
            <NumberSquares label="Set" values={Array.from({ length: totalSets }, (_, i) => (i + 1))} selected={totalSets ? setIndex + 1 : null} onSelect={(v) => { setSetIndex(Number(v) - 1); setSelectedId(null); }} dots={setsDoneDots} />
          </View>

          {/* Exercise list */}
          <View style={{ gap: 5, marginTop: 8 }}>
            {group.map((it) => (
              <ExerciseItem
                key={it.id}
                cover={it.exercise?.cover}
                title={it.exercise?.name ?? 'Exercise'}
                subtitle={formatRepsForSet(it.reps, setIndex)}
                label={it.supersetLabel ?? ''}
                selected={selectedId === it.id}
                done={isLoggedForSet(it.id, setIndex)}      // ✅ green check when logged
                showCheck
                onPress={() => setSelectedId(it.id)}
              />
            ))}
          </View>

          {/* CTA only when an exercise is selected */}
          {selectedItem && (
            <CustomButton
              title={alreadyLogged ? 'See Exercise Log' : 'Start Workout'}
              backgroundColor="#fff"
              textColor="#000"
              onPress={() => {
                if (alreadyLogged) {
                  const itemsAll = allItems;
                  const idxAll = itemsAll.findIndex(x => x.id === selectedItem!.id);
                  nav.navigate('LogExercise', {
                    item: selectedItem, setIndex, supersetNum, itemsAll, idxAll, readonly: true
                  });
                } else {
                  const itemsAll = allItems;
                  const idxAll = itemsAll.findIndex(x => x.id === selectedItem!.id);
                  nav.navigate('Exercise', { item: selectedItem, setIndex, supersetNum, itemsAll, idxAll });
                }
              }}
            />
          )}
        </View>
      }
    />
  );
}
