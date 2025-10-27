// src/screens/app/Workouts/LogExercise.tsx
import React, { useMemo, useState } from 'react';
import { View, Text, TextInput, Pressable } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import FullBleed from '~/components/Layout/FullBleed';
import IconButton from '~/components/Buttons/IconButton';
import CustomButton from '~/components/Buttons/CustomButton';
import { insertWorkoutLog } from '~/data/supabase/clientWorkoutLogsHandler';
import { repsForSet } from '~/data/helpers/workoutRun';
import type { WorkoutItem } from '~/data/types';
import __base from '~/assets/styles/base';

// route expects current item + neighbors for "continue"
type Params = {
  item: WorkoutItem;
  setIndex: number;
  supersetNum: number;
  itemsAll?: WorkoutItem[];   // full ordered list for the day
  idxAll?: number;            // current global index
};

const parseNumber = (v?: string | number | null) => {
  const n = Number(String(v ?? '').replace(/[^\d.-]/g, ''));
  return Number.isFinite(n) ? n : 0;
};

export default function LogExercise() {
  const nav = useNavigation<any>();
  const { params } = useRoute<any>();
  
  const item: WorkoutItem = params?.item;
  const setIndex: number = params?.setIndex ?? 0;
  const supersetNum: number = params?.supersetNum ?? 1;
  const list: WorkoutItem[] = params?.itemsInSuperset ?? [];
  const readOnly: boolean = !!params?.readonly;
  const itemsAll: WorkoutItem[] = params?.itemsAll ?? [];

  const idx: number = params?.idxInSuperset ?? Math.max(0, list.findIndex(x => x?.id === item?.id));

  const title = item?.exercise?.name ?? 'Exercise';
  const cover = item?.exercise?.cover ?? undefined;

  // defaults
  const defaultReps = repsForSet(item, setIndex) ?? '';
  const defaultWeight = item?.weight != null ? String(item.weight) : '';

  const [reps, setReps] = useState<string>(String(defaultReps));
  const [weight, setWeight] = useState<string>(defaultWeight);
  const [liked, setLiked] = useState<boolean | null>(null);
  const [notes, setNotes] = useState<string>('');

  const isTimeBased = /^\s*\d+\s*s\s*$/i.test(String(reps));
  const showWeight = item?.weight != null;

  const nextItem: WorkoutItem | null = useMemo(() => {
    if (!list?.length || idx < 0) return null;
    return list[idx + 1] ?? null;
  }, [list, idx]);

  const idxAll: number =
    typeof params?.idxAll === 'number'
      ? params.idxAll
      : Math.max(0, itemsAll.findIndex(x => x?.id === item?.id));

  const step = (setter: (v: string) => void, delta: number) => () => {
    // only step pure numbers; leave "300s" as free text
    if (isTimeBased) return;
    const n = Math.max(0, parseNumber(reps) + delta);
    setter(String(n));
  };

  const stepKg = (delta: number) => () => {
    const n = Math.max(0, parseNumber(weight) + delta);
    setWeight(String(n));
  };

  const onSave = async () => {
    await insertWorkoutLog({
      workoutItemId: item.id,
      reps: reps || null,
      weight: weight ? Number(weight) : null,
      like: liked,
      notes: notes || null,
    });

    // Next item globally (across supersets)
    const nextItem = itemsAll[idxAll + 1] ?? null;

    if (nextItem) {
      const nextSuperset =
        // support either shape coming from your data
        (nextItem as any).superset_number ??
        (nextItem as any).supersetNum ??
        supersetNum;

      nav.replace('Exercise', {
        item: nextItem,
        setIndex,                 // keep same set unless you change logic later
        supersetNum: nextSuperset,
        itemsAll,
        idxAll: idxAll + 1,
      });
    } else {
      // end of list → go back to StartWorkout with required params
      nav.navigate('StartWorkout', {
        items: itemsAll,
        supersetNum: 1,
      });
    }
  };

  return (
    <FullBleed
      backgroundUri={cover}
      Top={<IconButton onPress={() => nav.goBack()} />}  // back
      Center={
        <View style={{ marginBottom: 16 }}>
          <Text style={__base.headline}>{title}</Text>
          <Text style={__base.text}>Did you like this exercise?</Text>
          <View style={{ flexDirection: 'row', gap: 12, marginTop: 10 }}>
            <Pressable onPress={() => setLiked(true)} style={{ borderWidth: 2, borderColor: liked === true ? '#22c55e' : '#fff', padding: 10, borderRadius: 0 }}>
              <Feather name="thumbs-up" size={22} color="#fff" />
            </Pressable>
            <Pressable onPress={() => setLiked(false)} style={{ borderWidth: 2, borderColor: liked === false ? '#ef4444' : '#fff', padding: 10, borderRadius: 0 }}>
              <Feather name="thumbs-down" size={22} color="#fff" />
            </Pressable>
          </View>
        </View>
      }
      Bottom={
        <View style={{ gap: 14 }}>
          <View style={{ gap: 14, flexDirection: 'row' }}>
            {/* Reps / Seconds */}
            <View style={{flex: 1}}>
              <Text style={[__base.textLabel, {marginBottom: 5}]}>{isTimeBased ? 'seconds' : 'reps'}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Pressable onPress={step(setReps, -1)} style={{ borderWidth: 1, borderColor: '#fff', padding: 8, borderRadius: 0, width: 35, height: 35 }}>
                  <Feather name="minus" size={16} color="#fff" />
                </Pressable>
                <TextInput
                  value={reps}
                  onChangeText={setReps}
                  placeholder={isTimeBased ? 'e.g. 300s' : 'e.g. 10'}
                  placeholderTextColor="#94a3b8"
                  style={{ flex: 1, color: '#fff', borderWidth: 1, borderColor: '#FFF', borderRadius: 0, padding: 10, width: 200, height: 35 }}
                />
                <Pressable onPress={step(setReps, +1)} style={{ borderWidth: 1, borderColor: '#fff', padding: 8, borderRadius: 0, width: 35, height: 35 }}>
                  <Feather name="plus" size={16} color="#fff" />
                </Pressable>
              </View>
            </View>

            {/* KG */}
            {showWeight && (
              <View style={{flex: 1}}>
                <Text style={[__base.textLabel, {marginBottom: 5}]}>kg</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Pressable onPress={stepKg(-2)} style={{ borderWidth: 1, borderColor: '#fff', padding: 8, borderRadius: 0, width: 35, height: 35 }}>
                    <Feather name="minus" size={16} color="#fff" />
                  </Pressable>
                  <TextInput
                    value={weight}
                    onChangeText={setWeight}
                    keyboardType="numeric"
                    placeholder="e.g. 80"
                    placeholderTextColor="#94a3b8"
                    style={{ flex: 1, color: '#fff', borderWidth: 1, borderColor: '#FFF', borderRadius: 0, padding: 10, width: 200, height: 35 }}
                  />
                  <Pressable onPress={stepKg(+2)} style={{ borderWidth: 1, borderColor: '#fff', padding: 8, borderRadius: 0, width: 35, height: 35 }}>
                    <Feather name="plus" size={16} color="#fff" />
                  </Pressable>
                </View>
              </View>
            )}
          </View>

          {/* Notes */}
          <View>
            <Text style={[__base.textLabel, {marginBottom: 5}]}>Notes</Text>
            <TextInput
              value={notes}
              onChangeText={setNotes}
              placeholder="Do you have a note for the coach?"
              placeholderTextColor="#94a3b8"
              style={{ color: '#fff', borderColor: '#FFF', borderWidth: 1, borderRadius: 0, padding: 10, minHeight: 80 }}
              multiline
            />
          </View>
          {readOnly ? (
            <CustomButton title="Back" backgroundColor="#FFF" textColor="#000" onPress={() => nav.navigate('StartWorkout', { items: itemsAll, supersetNum })}/>
          ) : (
            <CustomButton title="Log & Continue" backgroundColor="#FFF" textColor="#000" onPress={onSave} />
          )}
        </View>
      }
    />
  );
}
