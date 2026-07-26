// src/screens/app/Workouts/LogExercise.tsx
import React, { useMemo, useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, Pressable, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import RNPickerSelect from 'react-native-picker-select';
import FullBleed from '~/components/Layout/FullBleed';
import IconButton from '~/components/Buttons/IconButton';
import CustomButton from '~/components/Buttons/CustomButton';
import { insertWorkoutLog, getLogsForDate, getLogsForItem, updateWorkoutLog, type ClientWorkoutLog } from '~/data/supabase/clientWorkoutLogsHandler';
import { repsForSet } from '~/data/helpers/workoutRun';
import { useUserStore } from '~/data/store/userStore';
import type { WorkoutItem } from '~/data/types';
import __base from '~/assets/styles/base';

// route expects current item + neighbors for "continue"
type Params = {
  item: WorkoutItem;
  setIndex: number;
  supersetNum: number;
  itemsAll?: WorkoutItem[];   // full ordered list for the day
  idxAll?: number;            // current global index
  returnTo?: 'Home' | 'Schedule'; // Track where we came from
  date?: string;              // ISO date string (YYYY-MM-DD)
};

const parseNumber = (v?: string | number | null) => {
  const n = Number(String(v ?? '').replace(/[^\d.-]/g, ''));
  return Number.isFinite(n) ? n : 0;
};

export default function LogExercise() {
  const nav = useNavigation<any>();
  const { params } = useRoute<any>();
  const client = useUserStore((s) => s.client);
  
  const item: WorkoutItem = params?.item;
  const setIndex: number = params?.setIndex ?? 0;
  const supersetNum: number = params?.supersetNum ?? 1;
  const list: WorkoutItem[] = params?.itemsInSuperset ?? [];
  const readOnly: boolean = !!params?.readonly;
  const itemsAll: WorkoutItem[] = params?.itemsAll ?? [];
  const returnTo: 'Home' | 'Schedule' | undefined = params?.returnTo;

  const idx: number = params?.idxInSuperset ?? Math.max(0, list.findIndex(x => x?.id === item?.id));

  // Exercise selection state (for readonly mode)
  const [selectedExerciseId, setSelectedExerciseId] = useState<number | null>(readOnly ? item?.id ?? null : null);
  const [selectedSetIndex, setSelectedSetIndex] = useState<number>(setIndex);
  const [logsCountByItem, setLogsCountByItem] = useState<Map<number, number>>(new Map());
  const [currentLog, setCurrentLog] = useState<ClientWorkoutLog | null>(null);
  const pickerRef = useRef<any>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const notesInputRef = useRef<TextInput>(null);
  const notesContainerRef = useRef<View>(null);

  // Get current date (from params or today)
  const currentDate = params?.date || new Date().toISOString().slice(0, 10);

  // Load logs for the date
  useFocusEffect(
    React.useCallback(() => {
      let alive = true;
      (async () => {
        if (!client?.id) return;
        try {
          const counts = await getLogsForDate(client.id, currentDate);
          if (alive) setLogsCountByItem(counts);
        } catch (error) {
          console.error('Error loading logs:', error);
        }
      })();
      return () => { alive = false; };
    }, [client?.id, currentDate])
  );

  // Build dropdown options from all exercises
  const exerciseOptions = useMemo(() => {
    if (!itemsAll.length) return [];
    return itemsAll.map((it: any) => {
      // Use custom_exercise_name if available, otherwise fall back to exercise.name
      const exerciseName = (it.customExerciseName?.trim() || it.exercise?.name) ?? 'Exercise';
      const supersetLabel = it.supersetLabel ? ` (${it.supersetLabel})` : '';
      return {
        label: `${exerciseName}${supersetLabel}`,
        value: String(it.id),
      };
    });
  }, [itemsAll]);

  // Selected exercise
  const selectedExercise = useMemo(() => {
    if (!selectedExerciseId) return null;
    return itemsAll.find((it: any) => it.id === selectedExerciseId) ?? null;
  }, [itemsAll, selectedExerciseId]);

  // Auto-select first exercise if none selected in readonly mode
  useEffect(() => {
    if (readOnly && itemsAll.length > 0 && !selectedExerciseId) {
      setSelectedExerciseId(itemsAll[0].id);
    }
  }, [readOnly, itemsAll, selectedExerciseId]);

  // Current item to display (selected exercise in readonly, or passed item)
  const displayItem = readOnly && selectedExercise ? selectedExercise : item;
  const displaySetIndex = readOnly ? selectedSetIndex : setIndex;

  // Use custom_exercise_name if available, otherwise fall back to exercise.name
  const title = (displayItem?.customExerciseName?.trim() || displayItem?.exercise?.name) ?? 'Exercise';
  const cover = displayItem?.exercise?.cover ?? undefined;

  // defaults
  const defaultReps = repsForSet(displayItem, displaySetIndex) ?? '';
  const defaultWeight = displayItem?.weight != null ? String(displayItem.weight) : '';

  const [reps, setReps] = useState<string>(String(defaultReps));
  const [weight, setWeight] = useState<string>(defaultWeight);
  const [liked, setLiked] = useState<boolean | null>(null);
  const [notes, setNotes] = useState<string>('');

  const isTimeBased = /^\s*\d+\s*s\s*$/i.test(String(reps));
  const showWeight = displayItem?.weight != null;

  // Get total sets for selected exercise
  const totalSets = useMemo(() => {
    if (!selectedExercise) return 0;
    const repsArray = selectedExercise.reps ? selectedExercise.reps.split(',').map(s => s.trim()).filter(Boolean) : [];
    return Math.max(repsArray.length, selectedExercise.sets ?? 1);
  }, [selectedExercise]);

  // Load log data for selected exercise and set
  useEffect(() => {
    if (!readOnly || !selectedExercise || !client?.id) {
      setCurrentLog(null);
      return;
    }
    
    let alive = true;
    (async () => {
      try {
        const logs = await getLogsForItem(client.id, selectedExercise.id, currentDate);
        // Get log for the selected set (setIndex is 0-based, logs are ordered by creation)
        const logForSet = logs[selectedSetIndex] ?? null;
        if (alive) {
          setCurrentLog(logForSet);
          if (logForSet) {
            setReps(logForSet.reps ?? '');
            setWeight(logForSet.weight != null ? String(logForSet.weight) : '');
            setLiked(logForSet.like);
            setNotes(logForSet.notes ?? '');
          } else {
            // Reset to defaults if no log found
            const newReps = repsForSet(selectedExercise, selectedSetIndex) ?? '';
            const newWeight = selectedExercise.weight != null ? String(selectedExercise.weight) : '';
            setReps(String(newReps));
            setWeight(newWeight);
            setLiked(null);
            setNotes('');
          }
        }
      } catch (error) {
        console.error('Error loading log:', error);
      }
    })();
    return () => { alive = false; };
  }, [readOnly, selectedExercise, selectedSetIndex, client?.id, currentDate]);

  // Handle exercise selection from dropdown
  const handleExerciseChange = (value: string | null) => {
    if (value) {
      setSelectedExerciseId(Number(value));
      setSelectedSetIndex(0); // Reset to first set when exercise changes
    }
  };

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
    if (readOnly && currentLog) {
      // Update existing log (for notes editing in readonly mode)
      await updateWorkoutLog(currentLog.id, {
        reps: currentLog.reps,
        weight: currentLog.weight,
        like: currentLog.like,
        notes: notes || null,
      });
      // Reload logs to refresh the display
      if (client?.id) {
        const counts = await getLogsForDate(client.id, currentDate);
        setLogsCountByItem(counts);
        const logs = await getLogsForItem(client.id, displayItem.id, currentDate);
        const logForSet = logs[selectedSetIndex] ?? null;
        setCurrentLog(logForSet);
      }
    } else {
      // Create new log entry
      await insertWorkoutLog({
        workoutItemId: displayItem.id,
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
          returnTo, // pass returnTo to next Exercise
        });
      } else {
        // end of list → go back to Home or Workouts
        nav.navigate(returnTo || 'Home');
      }
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <FullBleed
        backgroundUri={cover}
        Top={<IconButton route={returnTo || 'Home'} />}  // back to correct screen
        Center={null}
        Bottom={
          <ScrollView
            ref={scrollViewRef}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
          >
            <View style={{ gap: 14 }}>
              {/* Title and like buttons */}
              <View style={{ marginBottom: 16 }}>
                <Text style={__base.headline}>{title}</Text>
                {(!readOnly || selectedExercise) && (
                  <>
                    <Text style={__base.text}>Did you like this exercise?</Text>
                    <View style={{ flexDirection: 'row', gap: 12, marginTop: 10 }}>
                      <Pressable onPress={() => setLiked(true)} style={{ borderWidth: 2, borderColor: liked === true ? '#22c55e' : '#fff', padding: 10, borderRadius: 0 }}>
                        <Feather name="thumbs-up" size={22} color="#fff" />
                      </Pressable>
                      <Pressable onPress={() => setLiked(false)} style={{ borderWidth: 2, borderColor: liked === false ? '#ef4444' : '#fff', padding: 10, borderRadius: 0 }}>
                        <Feather name="thumbs-down" size={22} color="#fff" />
                      </Pressable>
                    </View>
                  </>
                )}
              </View>
            {/* Exercise Selection (readonly mode) */}
            {readOnly && itemsAll.length > 0 && (
              <View style={{ gap: 12 }}>
                <View>
                  <Text style={[__base.textLabel, { marginBottom: 5, color: '#FFF' }]}>Select Exercise</Text>
                  <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={() => pickerRef.current?.togglePicker?.()}
                    style={{
                      borderWidth: 1,
                      borderColor: '#FFF',
                      borderRadius: 0,
                      height: 45,
                      width: '100%',
                      paddingHorizontal: 10,
                      justifyContent: 'center',
                      marginBottom: 5,
                    }}
                  >
                    <View pointerEvents="none">
                      <RNPickerSelect
                        ref={pickerRef}
                        onValueChange={handleExerciseChange}
                        items={exerciseOptions}
                        value={selectedExerciseId ? String(selectedExerciseId) : null}
                        useNativeAndroidPickerStyle={false}
                        style={{
                          inputIOS: {
                            fontFamily: 'Inter-Regular',
                            fontSize: 14,
                            color: '#FFF',
                            height: 45,
                          },
                          inputAndroid: {
                            fontFamily: 'Inter-Regular',
                            fontSize: 14,
                            color: '#FFF',
                            height: 45,
                          },
                          iconContainer: {
                            top: 12,
                            right: 0,
                          },
                        }}
                        Icon={() => <Feather name="chevrons-down" size={20} color="#FFF" />}
                        placeholder={{ label: 'Select an exercise...', value: null }}
                      />
                    </View>
                  </TouchableOpacity>
                </View>
                {selectedExercise && totalSets > 0 && (
                  <View>
                    <Text style={[__base.textLabel, { marginBottom: 5, color: '#FFF' }]}>Select Set</Text>
                    <View style={{ flexDirection: 'row', gap: 5 }}>
                      {Array.from({ length: totalSets }, (_, i) => i + 1).map((setNum) => (
                        <Pressable
                          key={setNum}
                          onPress={() => setSelectedSetIndex(setNum - 1)}
                          style={{
                            width: 35,
                            height: 35,
                            borderRadius: 0,
                            borderWidth: 1,
                            borderColor: selectedSetIndex === setNum - 1 ? '#FFF' : '#ffffff80',
                            backgroundColor: selectedSetIndex === setNum - 1 ? '#FFF' : 'transparent',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Text style={{
                            color: selectedSetIndex === setNum - 1 ? '#000' : '#FFF',
                            fontWeight: '800',
                            fontSize: 16,
                          }}>
                            {setNum}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                  </View>
                )}
              </View>
            )}

              {/* Logging form (only show if exercise selected in readonly, or always in edit mode) */}
              {(!readOnly || selectedExercise) && (
                <>
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
                        editable={!readOnly}
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
                          editable={!readOnly}
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
                  <View ref={notesContainerRef}>
                    <Text style={[__base.textLabel, {marginBottom: 5}]}>Notes</Text>
                    <TextInput
                      ref={notesInputRef}
                      value={notes}
                      onChangeText={setNotes}
                      placeholder="Do you have a note for the coach?"
                      placeholderTextColor="#94a3b8"
                      editable={true}
                      style={{ color: '#fff', borderColor: '#FFF', borderWidth: 1, borderRadius: 0, padding: 10, minHeight: 80 }}
                      multiline
                      onFocus={() => {
                        // Scroll to end to ensure notes field is visible above keyboard
                        setTimeout(() => {
                          scrollViewRef.current?.scrollToEnd({ animated: true });
                        }, 300);
                      }}
                    />
                  </View>
                </>
              )}

              {readOnly ? (
                <View style={{ gap: 10 }}>
                  <CustomButton 
                    title="Save Notes" 
                    backgroundColor="#FFF" 
                    textColor="#000" 
                    onPress={onSave}
                  />
                  <CustomButton 
                    title="Back" 
                    backgroundColor="transparent" 
                    textColor="#FFF" 
                    borderColor="#FFF"
                    onPress={() => nav.navigate(returnTo || 'Home')}
                  />
                </View>
              ) : (
                <CustomButton title="Log & Continue" backgroundColor="#FFF" textColor="#000" onPress={onSave} />
              )}
            </View>
          </ScrollView>
        }
      />
    </KeyboardAvoidingView>
  );
}
