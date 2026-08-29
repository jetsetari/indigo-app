// src/screens/app/Workouts/LogExercise.tsx
import React, { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import FullBleed from '~/components/Layout/FullBleed';
import IconButton from '~/components/Buttons/IconButton';
import CustomButton from '~/components/Buttons/CustomButton';
import PastSetRow from '~/components/Blocks/PastSetRow';
import {
  insertWorkoutLog,
  getLogsForItem,
  getLogsForItems,
  getLogsForDate,
  updateWorkoutLog,
  type ClientWorkoutLog,
} from '~/data/supabase/clientWorkoutLogsHandler';
import { findNextIncompleteStep, groupBySupersetNumber, repsForSet, setsCountForItem } from '~/data/helpers/workoutRun';
import { hasWorkoutWeight } from '~/data/helpers/workouts';
import { localTodayISO, formatWorkoutDateLabel } from '~/data/helpers/date';
import { useUserStore } from '~/data/store/userStore';
import type { WorkoutItem } from '~/data/types';
import __base from '~/assets/styles/base';

type Params = {
  item: WorkoutItem;
  setIndex: number;
  supersetNum: number;
  itemsAll?: WorkoutItem[];
  idxAll?: number;
  returnTo?: 'Home' | 'Schedule';
  date?: string;
  /** history = review/edit this exercise's sets; log = just finished a set */
  mode?: 'history' | 'log';
  /** @deprecated use mode: 'history' */
  readonly?: boolean;
};

const parseNumber = (v?: string | number | null) => {
  const n = Number(String(v ?? '').replace(/[^\d.-]/g, ''));
  return Number.isFinite(n) ? n : 0;
};

const formatLogSummary = (log: ClientWorkoutLog, showWeight: boolean) => {
  const reps = log.reps?.trim() || '—';
  const isTime = /^\d+\s*s$/i.test(reps);
  const repsLabel = isTime ? reps.replace(/\s/g, '') : `${reps} reps`;
  if (showWeight && hasWorkoutWeight(log.weight)) return `${repsLabel} · ${log.weight} kg`;
  return repsLabel;
};

export default function LogExercise() {
  const nav = useNavigation<any>();
  const { params } = useRoute<any>();
  const client = useUserStore((s) => s.client);

  const item: WorkoutItem = params?.item;
  const setIndex: number = params?.setIndex ?? 0;
  const itemsAll: WorkoutItem[] = params?.itemsAll ?? [];
  const returnTo: 'Home' | 'Schedule' | undefined = params?.returnTo;
  const currentDate = params?.date || localTodayISO();
  const isHistory =
    params?.mode === 'history' || !!params?.readonly || !!params?.reviewOnly;

  const [selectedSetIndex, setSelectedSetIndex] = useState<number>(setIndex);
  const [itemLogs, setItemLogs] = useState<ClientWorkoutLog[]>([]);
  const [supersetLogs, setSupersetLogs] = useState<Map<number, ClientWorkoutLog[]>>(new Map());
  const [logsCountByItem, setLogsCountByItem] = useState<Map<number, number>>(new Map());
  const [currentLog, setCurrentLog] = useState<ClientWorkoutLog | null>(null);
  const [saving, setSaving] = useState(false);

  const scrollViewRef = useRef<ScrollView>(null);
  const notesInputRef = useRef<TextInput>(null);
  const notesContainerRef = useRef<View>(null);

  const displayItem = item;
  const title = (displayItem?.customExerciseName?.trim() || displayItem?.exercise?.name) ?? 'Exercise';
  const cover = displayItem?.exercise?.cover ?? undefined;
  const showWeight = hasWorkoutWeight(displayItem?.weight);

  const [reps, setReps] = useState<string>('');
  const [weight, setWeight] = useState<string>('');
  const [liked, setLiked] = useState<boolean | null>(null);
  const [notes, setNotes] = useState<string>('');

  const isTimeBased = /^\s*\d+\s*s\s*$/i.test(String(reps));
  const loggedCount = itemLogs.length;

  const totalSets = useMemo(() => {
    if (!displayItem) return 0;
    return setsCountForItem(itemsAll.length ? itemsAll : [displayItem], displayItem.id);
  }, [itemsAll, displayItem]);

  const supersetItems = useMemo(() => {
    if (!displayItem || !itemsAll.length) return [];
    const groups = groupBySupersetNumber(itemsAll);
    for (const group of groups.values()) {
      if (group.some((i) => i.id === displayItem.id)) {
        return group.filter((i) => i.id !== displayItem.id);
      }
    }
    return [];
  }, [itemsAll, displayItem]);

  const supersettedWithLine = useMemo(() => {
    if (!supersetItems.length) return null;
    const parts = supersetItems.map((sib) => {
      const name = (sib.customExerciseName?.trim() || sib.exercise?.name) ?? 'Exercise';
      const label = sib.supersetLabel ? `${sib.supersetLabel} · ${name}` : name;
      const logs = supersetLogs.get(sib.id) ?? [];
      const last = logs[logs.length - 1];
      if (!last) return label;
      return `${label} · last ${formatLogSummary(last, hasWorkoutWeight(sib.weight))}`;
    });
    return `Supersetted with ${parts.join(' · ')}`;
  }, [supersetItems, supersetLogs]);

  const applyLogToForm = useCallback((log: ClientWorkoutLog | null, forItem: WorkoutItem, setIdx: number) => {
    const target = String(repsForSet(forItem, setIdx) ?? '');
    if (log) {
      const loggedReps = log.reps?.trim() ?? '';
      setReps(loggedReps || target);
      setWeight(hasWorkoutWeight(log.weight) ? String(log.weight) : (hasWorkoutWeight(forItem.weight) ? String(forItem.weight) : ''));
      setLiked(log.like);
      setNotes(log.notes ?? '');
    } else {
      setReps(target);
      setWeight(hasWorkoutWeight(forItem.weight) ? String(forItem.weight) : '');
      setLiked(null);
      setNotes('');
    }
  }, []);

  const programmedTarget = useMemo(
    () => String(repsForSet(displayItem, isHistory ? selectedSetIndex : setIndex) ?? ''),
    [displayItem, isHistory, selectedSetIndex, setIndex]
  );

  const reloadLogs = useCallback(async () => {
    if (!client?.id || !displayItem?.id) return [] as ClientWorkoutLog[];
    const [logs, counts] = await Promise.all([
      getLogsForItem(client.id, displayItem.id, currentDate),
      getLogsForDate(client.id, currentDate),
    ]);
    setItemLogs(logs);
    setLogsCountByItem(counts);

    if (supersetItems.length) {
      const siblingIds = [displayItem.id, ...supersetItems.map((i) => i.id)];
      const byItem = await getLogsForItems(client.id, siblingIds, currentDate);
      setSupersetLogs(byItem);
    } else {
      setSupersetLogs(new Map([[displayItem.id, logs]]));
    }

    return logs;
  }, [client?.id, displayItem?.id, currentDate, supersetItems]);

  useFocusEffect(
    useCallback(() => {
      let alive = true;
      (async () => {
        try {
          if (!client?.id || !displayItem?.id) return;
          const logs = await reloadLogs();
          if (!alive) return;
          const idx = isHistory
            ? Math.min(selectedSetIndex, Math.max(0, logs.length - 1))
            : selectedSetIndex;
          const logForSet = logs[idx] ?? null;
          setCurrentLog(logForSet);
          applyLogToForm(logForSet, displayItem, idx);
        } catch (error) {
          console.error('Error loading logs:', error);
        }
      })();
      return () => { alive = false; };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [client?.id, displayItem?.id, currentDate, reloadLogs, isHistory])
  );

  useEffect(() => {
    if (!displayItem) return;
    const logForSet = itemLogs[selectedSetIndex] ?? null;
    setCurrentLog(logForSet);
    applyLogToForm(logForSet, displayItem, selectedSetIndex);
  }, [selectedSetIndex, itemLogs, displayItem, applyLogToForm]);

  const setLabel = isHistory
    ? `Set ${selectedSetIndex + 1}${totalSets ? ` of ${totalSets}` : ''}`
    : `Logging set ${setIndex + 1}${totalSets ? ` of ${totalSets}` : ''}`;

  // Preview next incomplete step as if this set were just logged
  const nextAfterThisLog = useMemo(() => {
    if (isHistory || !itemsAll.length || !item?.id) return null;
    const preview = new Map(logsCountByItem);
    const currentLogged = preview.get(item.id) ?? 0;
    preview.set(item.id, Math.max(currentLogged, setIndex + 1));
    return findNextIncompleteStep(itemsAll, preview, {
      itemId: item.id,
      setIndex,
    });
  }, [isHistory, itemsAll, item?.id, logsCountByItem, setIndex]);

  const nextExerciseLabel = useMemo(() => {
    if (!nextAfterThisLog) return null;
    const nextItem = nextAfterThisLog.item;
    const name = (nextItem.customExerciseName?.trim() || nextItem.exercise?.name || 'Exercise').trim();
    const tag = nextItem.supersetLabel?.trim();
    const shortName = name.length > 28 ? `${name.slice(0, 26)}…` : name;
    return tag ? `${tag} ${shortName}` : shortName;
  }, [nextAfterThisLog]);

  const step = (setter: (v: string) => void, delta: number) => () => {
    if (isTimeBased) {
      // Adjust seconds, keep "s" suffix (e.g. 60s → 65s)
      const next = Math.max(0, parseNumber(reps) + delta * 5);
      setter(`${next}s`);
      return;
    }
    setter(String(Math.max(0, parseNumber(reps) + delta)));
  };

  const stepKg = (delta: number) => () => {
    setWeight(String(Math.max(0, parseNumber(weight) + delta)));
  };

  const exitWorkout = () => {
    nav.navigate(returnTo || 'Home');
  };

  const goBack = () => {
    if (nav.canGoBack?.()) nav.goBack();
    else exitWorkout();
  };

  const continueToNext = async () => {
    if (!client?.id) {
      exitWorkout();
      return;
    }
    const counts = await getLogsForDate(client.id, currentDate);
    const nextStep = findNextIncompleteStep(itemsAll, counts, {
      itemId: item.id,
      setIndex,
    });
    if (nextStep) {
      const nextIdxAll = itemsAll.findIndex((candidate) => candidate.id === nextStep.item.id);
      nav.replace('Exercise', {
        item: nextStep.item,
        setIndex: nextStep.setIndex,
        supersetNum: nextStep.supersetNum,
        itemsAll,
        idxAll: nextIdxAll,
        returnTo,
      });
    } else {
      exitWorkout();
    }
  };

  const onSave = async () => {
    if (!displayItem || saving) return;
    setSaving(true);
    try {
      const existingAtSet = itemLogs[setIndex] ?? null;

      if (currentLog || (!isHistory && existingAtSet)) {
        const logToUpdate = currentLog ?? existingAtSet!;
        await updateWorkoutLog(logToUpdate.id, {
          reps: reps || null,
          weight: weight ? Number(weight) : null,
          like: liked,
          notes: notes || null,
        });
        const logs = await reloadLogs();
        setCurrentLog(logs[selectedSetIndex] ?? null);
        if (isHistory) {
          goBack();
          return;
        }
        await continueToNext();
        return;
      }

      await insertWorkoutLog({
        workoutItemId: displayItem.id,
        reps: reps || null,
        weight: weight ? Number(weight) : null,
        like: liked,
        notes: notes || null,
        date: currentDate,
      });

      await continueToNext();
    } catch (error) {
      console.error('Error saving log:', error);
    } finally {
      setSaving(false);
    }
  };

  const primaryTitle = saving
    ? 'Saving…'
    : isHistory
      ? 'Save changes'
      : nextExerciseLabel
        ? `Log & Continue → ${nextExerciseLabel}`
        : 'Log & Finish';

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <FullBleed
        backgroundUri={cover}
        Top={
          isHistory
            ? <IconButton back icon="close" />
            : <IconButton route={returnTo || 'Home'} icon="close" />
        }
        Center={null}
        Bottom={
          <ScrollView
            ref={scrollViewRef}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
          >
            <View style={{ gap: 14 }}>
              <View style={{ marginBottom: 4 }}>
                <Text style={__base.headline}>{title}</Text>
                <Text style={[__base.text, { marginTop: 4, color: '#CBD5E1' }]}>
                  {formatWorkoutDateLabel(currentDate)}
                  {displayItem?.supersetLabel
                    ? ` · ${displayItem.supersetLabel}${totalSets ? ` · ${loggedCount}/${totalSets} sets` : ''}`
                    : totalSets
                      ? ` · ${loggedCount}/${totalSets} sets`
                      : ''}
                </Text>
                {!!supersettedWithLine && (
                  <Text style={[__base.text, { marginTop: 6, color: '#94a3b8', fontSize: 13 }]}>
                    {supersettedWithLine}
                  </Text>
                )}
              </View>

              {/* History only: list this exercise's sets for editing */}
              {isHistory && itemLogs.length > 0 && (
                <View style={{ gap: 6 }}>
                  <Text style={[__base.textLabel, { color: '#FFF' }]}>Your sets</Text>
                  {itemLogs.map((log, idx) => {
                    const selected = selectedSetIndex === idx;
                    return (
                      <PastSetRow
                        key={log.id}
                        log={log}
                        setNumber={idx + 1}
                        showWeight={showWeight}
                        selected={selected}
                        onPress={() => setSelectedSetIndex(idx)}
                      />
                    );
                  })}
                </View>
              )}

              <Text style={[__base.textLabel, { color: '#FFF' }]}>{setLabel}</Text>

              {!isHistory && (
                <>
                  <Text style={__base.text}>Did you like this exercise?</Text>
                  <View style={{ flexDirection: 'row', gap: 12 }}>
                    <Pressable
                      onPress={() => setLiked(true)}
                      style={{ borderWidth: 2, borderColor: liked === true ? '#22c55e' : '#fff', padding: 10 }}
                    >
                      <Feather name="thumbs-up" size={22} color="#fff" />
                    </Pressable>
                    <Pressable
                      onPress={() => setLiked(false)}
                      style={{ borderWidth: 2, borderColor: liked === false ? '#ef4444' : '#fff', padding: 10 }}
                    >
                      <Feather name="thumbs-down" size={22} color="#fff" />
                    </Pressable>
                  </View>
                </>
              )}

              {isHistory && (
                <View style={{ flexDirection: 'row', gap: 12 }}>
                  <Pressable
                    onPress={() => setLiked(true)}
                    style={{ borderWidth: 2, borderColor: liked === true ? '#22c55e' : '#fff', padding: 10 }}
                  >
                    <Feather name="thumbs-up" size={22} color="#fff" />
                  </Pressable>
                  <Pressable
                    onPress={() => setLiked(false)}
                    style={{ borderWidth: 2, borderColor: liked === false ? '#ef4444' : '#fff', padding: 10 }}
                  >
                    <Feather name="thumbs-down" size={22} color="#fff" />
                  </Pressable>
                </View>
              )}

              <View style={{ gap: 14, flexDirection: 'row' }}>
                <View style={{ flex: 1 }}>
                  <Text style={[__base.textLabel, { marginBottom: 5 }]}>{isTimeBased ? 'seconds' : 'reps'}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Pressable onPress={step(setReps, -1)} style={{ borderWidth: 1, borderColor: '#fff', padding: 8, width: 35, height: 35 }}>
                      <Feather name="minus" size={16} color="#fff" />
                    </Pressable>
                    <TextInput
                      value={reps}
                      onChangeText={setReps}
                      placeholder={isTimeBased ? 'e.g. 300s' : 'e.g. 10'}
                      placeholderTextColor="#94a3b8"
                      style={{ flex: 1, color: '#fff', borderWidth: 1, borderColor: '#FFF', padding: 10, height: 35 }}
                    />
                    <Pressable onPress={step(setReps, +1)} style={{ borderWidth: 1, borderColor: '#fff', padding: 8, width: 35, height: 35 }}>
                      <Feather name="plus" size={16} color="#fff" />
                    </Pressable>
                  </View>
                  {!!programmedTarget && (
                    <Text style={[__base.text, { color: '#94a3b8', fontSize: 12, marginTop: 4 }]}>
                      Target: {programmedTarget}
                    </Text>
                  )}
                </View>

                {showWeight && (
                  <View style={{ flex: 1 }}>
                    <Text style={[__base.textLabel, { marginBottom: 5 }]}>kg</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <Pressable onPress={stepKg(-2)} style={{ borderWidth: 1, borderColor: '#fff', padding: 8, width: 35, height: 35 }}>
                        <Feather name="minus" size={16} color="#fff" />
                      </Pressable>
                      <TextInput
                        value={weight}
                        onChangeText={setWeight}
                        keyboardType="numeric"
                        placeholder="e.g. 80"
                        placeholderTextColor="#94a3b8"
                        style={{ flex: 1, color: '#fff', borderWidth: 1, borderColor: '#FFF', padding: 10, height: 35 }}
                      />
                      <Pressable onPress={stepKg(+2)} style={{ borderWidth: 1, borderColor: '#fff', padding: 8, width: 35, height: 35 }}>
                        <Feather name="plus" size={16} color="#fff" />
                      </Pressable>
                    </View>
                  </View>
                )}
              </View>

              <View ref={notesContainerRef}>
                <Text style={[__base.textLabel, { marginBottom: 5 }]}>Notes</Text>
                <TextInput
                  ref={notesInputRef}
                  value={notes}
                  onChangeText={setNotes}
                  placeholder="Do you have a note for the coach?"
                  placeholderTextColor="#94a3b8"
                  style={{ color: '#fff', borderColor: '#FFF', borderWidth: 1, padding: 10, minHeight: 80 }}
                  multiline
                  onFocus={() => {
                    setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 300);
                  }}
                />
              </View>

              <CustomButton
                title={primaryTitle}
                backgroundColor="#FFF"
                textColor="#000"
                onPress={onSave}
                disabled={saving || (isHistory && !currentLog)}
              />

              {isHistory && (
                <CustomButton
                  title="Back"
                  backgroundColor="transparent"
                  textColor="#FFF"
                  borderColor="#FFF"
                  onPress={goBack}
                />
              )}
            </View>
          </ScrollView>
        }
      />
    </KeyboardAvoidingView>
  );
}
