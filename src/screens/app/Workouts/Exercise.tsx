import React, { useState, useCallback } from 'react';
import { View, Text, Pressable, Linking } from 'react-native';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import IconButton from '~/components/Buttons/IconButton';
import FullBleed from '~/components/Layout/FullBleed';
import CustomButton from '~/components/Buttons/CustomButton';
import { repsForSet } from '~/data/helpers/workoutRun';
import { localTodayISO } from '~/data/helpers/date';
import { getLogsForItem, type ClientWorkoutLog } from '~/data/supabase/clientWorkoutLogsHandler';
import { useUserStore } from '~/data/store/userStore';
import type { WorkoutItem } from '~/data/types';
import __base from '~/assets/styles/base';
import { Feather } from '@expo/vector-icons';
import TimerBar from '~/components/Layout/Blocks/TimerBar';
import PastSetRow from '~/components/Blocks/PastSetRow';
import { isYouTubeUrl } from '~/components/Layout/BgVideo';

// "300s" => "300 seconds", "10" => "10 reps"
const formatToken = (t?: string) => {
  if (!t) return '';
  const m = t.match(/^(\d+)([a-zA-Z]*)$/);
  if (!m) return t;
  const [, n, unit] = m;
  if (!unit) return `${n} reps`;
  if (unit.toLowerCase() === 's') return `${n} seconds`;
  return `${n} ${unit}`;
};

const tokenToSeconds = (t?: string | number | null) => {
  if (!t) return null;
  const s = String(t).trim();
  const m = s.match(/^(\d+)\s*s$/i);
  return m ? parseInt(m[1], 10) : null;
};

type Params = {
  item: WorkoutItem;
  setIndex: number;
  supersetNum: number;
  returnTo?: 'Home' | 'Schedule';
};

export default function Exercise() {
  const nav = useNavigation<any>();
  const { params } = useRoute<any>();
  const client = useUserStore((s) => s.client);
  const item: WorkoutItem = params?.item;
  const setIndex: number = params?.setIndex ?? 0;
  const supersetNum: number = params?.supersetNum ?? 1;
  const returnTo: 'Home' | 'Schedule' | undefined = params?.returnTo;
  const itemsAll: WorkoutItem[] = params?.itemsAll ?? [];

  const title = (item?.customExerciseName?.trim() || item?.exercise?.name) ?? 'Exercise';
  const headerImg = item?.exercise?.cover ?? undefined;
  const headerVideo = item?.exercise?.video ?? undefined;
  const canOpenYouTube = !!headerVideo && isYouTubeUrl(headerVideo);

  const openYouTube = () => {
    if (!headerVideo) return;
    Linking.openURL(headerVideo).catch(() => {
      console.warn('Could not open YouTube URL', headerVideo);
    });
  };

  const description = item?.exercise?.description ?? '';
  const notes = item?.notes ?? '';
  const targetToken = repsForSet(item, setIndex);
  const targetReps = formatToken(String(targetToken || '').trim());
  const showWeight = item?.weight != null;

  const [isPlaying, setIsPlaying] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);
  const [pastLogs, setPastLogs] = useState<ClientWorkoutLog[]>([]);

  const token = repsForSet(item, setIndex);
  const seconds = tokenToSeconds(token);
  const displaySeconds = remainingSeconds ?? seconds;
  const todayISO = localTodayISO();

  useFocusEffect(
    useCallback(() => {
      let alive = true;
      (async () => {
        if (!client?.id || !item?.id) return;
        try {
          const logs = await getLogsForItem(client.id, item.id, todayISO);
          if (alive) setPastLogs(logs);
        } catch (error) {
          console.error('Error loading past logs:', error);
        }
      })();
      return () => { alive = false; };
      // eslint-disable-next-line react-hooks/exhaustive-deps -- refresh on focus for this item/date
    }, [client?.id, item?.id])
  );

  const start = () => {
    if (seconds != null && remainingSeconds == null) setRemainingSeconds(seconds);
    setIsPlaying(true);
    setHasStarted(true);
  };
  const pause = () => setIsPlaying(false);
  const done = () => {
    // Replace so the workout player doesn't stack Log/Exercise screens
    nav.replace('LogExercise', {
      item,
      setIndex,
      supersetNum,
      itemsAll: params?.itemsAll,
      idxAll: params?.idxAll,
      returnTo,
      date: todayISO,
    });
  };

  const openPastLog = (logIndex: number) => {
    nav.navigate('LogExercise', {
      item,
      setIndex: logIndex,
      supersetNum,
      itemsAll,
      idxAll: params?.idxAll,
      mode: 'history',
      returnTo,
      date: todayISO,
    });
  };

  const pastSetsBlock = pastLogs.length > 0 && !isPlaying && (
    <View style={{ gap: 8 }}>
      <Text style={__base.textLabel}>Past sets</Text>
      {pastLogs.map((log, idx) => (
        <PastSetRow
          key={log.id}
          log={log}
          setNumber={idx + 1}
          showWeight={showWeight}
          onPress={() => openPastLog(idx)}
        />
      ))}
    </View>
  );

  const secondsBlock = !!seconds && (
    <View style={{ flex: 1 }}>
      <Text style={__base.textLabel}>seconds</Text>
      <Text style={__base.textInfo}>{displaySeconds}</Text>
    </View>
  );

  return (
    <FullBleed
      backgroundUri={headerImg}
      backgroundVideoUri={headerVideo}
      darkOverlay={!isPlaying}
      Top={<IconButton route={returnTo || 'Home'} icon="close" />}
      Center={
        !isPlaying && (
          <View style={{ marginBottom: 20, flex: 1 }}>
            <Text style={__base.headline}>{title}</Text>
            {!!description && <Text style={__base.text}>{description}</Text>}
            {canOpenYouTube && (
              <Pressable
                onPress={openYouTube}
                style={{
                  marginTop: 12,
                  alignSelf: 'flex-start',
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 8,
                  borderWidth: 1,
                  borderColor: '#ffffff80',
                  paddingVertical: 8,
                  paddingHorizontal: 12,
                }}
              >
                <Feather name="play-circle" size={18} color="#FFF" />
                <Text style={__base.text}>Open in YouTube</Text>
              </Pressable>
            )}
          </View>
        )
      }
      Bottom={
        !hasStarted || !isPlaying ? (
          <View style={{ gap: 18 }}>
            <View style={{ flexDirection: 'row', gap: 24 }}>
              {!!targetReps && !seconds && (
                <View style={{ flex: 1 }}>
                  <Text style={__base.textLabel}>reps</Text>
                  <Text style={__base.textInfo}>{formatToken(String(token))}</Text>
                </View>
              )}
              {secondsBlock}
              {showWeight && (
                <View style={{ flex: 1 }}>
                  <Text style={__base.textLabel}>weight</Text>
                  <Text style={__base.textInfo}>{item.weight} kg</Text>
                </View>
              )}
            </View>

            {!!notes && (
              <View>
                <Text style={__base.textLabel}>Notes</Text>
                <Text style={__base.text}>{notes}</Text>
              </View>
            )}

            {pastSetsBlock}

            <CustomButton title={hasStarted ? 'Continue' : 'Start'} backgroundColor="#00000055" textColor="#FFF" onPress={start}/>
          </View>
        ) : (
          <>
            <View style={{ flexDirection: 'row', gap: 24 }}>
              {!!targetReps && !seconds && (
                <View style={{ flex: 1 }}>
                  <Text style={__base.textLabel}>reps</Text>
                  <Text style={__base.textInfo}>{formatToken(String(token))}</Text>
                </View>
              )}
              {secondsBlock}
              {showWeight && (
                <View style={{ flex: 1 }}>
                  <Text style={__base.textLabel}>weight</Text>
                  <Text style={__base.textInfo}>{item.weight} kg</Text>
                </View>
              )}
            </View>

            {!!notes && (
              <View>
                <Text style={__base.textLabel}>Notes</Text>
                <Text style={__base.text}>{notes}</Text>
              </View>
            )}
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <Pressable
                onPress={pause}
                style={{
                  width: 45, height: 45, borderWidth: 1, borderColor: '#fff',
                  borderRadius: 0, alignItems: 'center', justifyContent: 'center',
                  backgroundColor: 'rgba(0,0,0,0.50)',
                }}
              >
                <Feather name="pause" size={20} color="#fff" />
              </Pressable>
              <View style={{ flex: 1 }}>
                <CustomButton title="Done" backgroundColor="#00000030" borderColor='#00c39a' textColor="#00c39a" onPress={done} />
              </View>
            </View>
          </>
        )
      }
    >
      {!hasStarted && (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Pressable
            onPress={start}
            style={{
              width: 72, height: 72, borderWidth: 3, borderColor: '#fff',
              borderRadius: 0, alignItems: 'center', justifyContent: 'center',
              backgroundColor: 'rgba(0,0,0,0.50)',
            }}
          >
            <Feather name="play" size={28} color="#fff" />
          </Pressable>
        </View>
      )}

      {!!seconds && hasStarted && (
        <TimerBar
          maxTime={seconds}
          paused={!isPlaying}
          onDone={done}
          onRemainingChange={setRemainingSeconds}
        />
      )}
    </FullBleed>
  );
}
