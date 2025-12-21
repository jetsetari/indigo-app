import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import IconButton from '~/components/Buttons/IconButton';
import FullBleed from '~/components/Layout/FullBleed';
import CustomButton from '~/components/Buttons/CustomButton';
import { repsForSet } from '~/data/helpers/workoutRun';
import type { WorkoutItem } from '~/data/types';
import __base from '~/assets/styles/base';
import { Pressable } from 'react-native';
import { Feather } from '@expo/vector-icons';
import TimerBar from '~/components/Layout/Blocks/TimerBar';
import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

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
  returnTo?: 'Home' | 'Workouts'; // Track where we came from
};

export default function Exercise() {
  const nav = useNavigation<any>();
  const { params } = useRoute<any>();
  const item: WorkoutItem = params?.item;
  const setIndex: number = params?.setIndex ?? 0;
  const supersetNum: number = params?.supersetNum ?? 1;
  const returnTo: 'Home' | 'Workouts' | undefined = params?.returnTo;

  // Use custom_exercise_name if available, otherwise fall back to exercise.name
  const title = (item?.customExerciseName?.trim() || item?.exercise?.name) ?? 'Exercise';
  const headerImg = item?.exercise?.cover ?? undefined;
  const headerVideo = item?.exercise?.video ?? undefined;

  const description = item?.exercise?.description ?? '';
  const notes = item?.notes ?? '';
  const targetToken = repsForSet(item, setIndex);
  const targetReps = formatToken(String(targetToken || '').trim());
  const showWeight = item?.weight != null;

  const [running, setRunning] = useState(false);

  const [isPlaying, setIsPlaying] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  const token = repsForSet(item, setIndex);
  const seconds = tokenToSeconds(token);

  const start = () => { setIsPlaying(true); setHasStarted(true); };
  const pause = () => setIsPlaying(false);
  const done  = () => {
    const todayISO = new Date().toISOString().slice(0, 10);
    nav.navigate('LogExercise', {
      item,
      setIndex,
      supersetNum,
      itemsAll: params?.itemsAll,   // keep the chain
      idxAll: params?.idxAll,
      returnTo, // pass returnTo to LogExercise
      date: todayISO,
    });
  };


  const handleStart = () => setRunning(true);
  const handleDone = () => {
    const todayISO = new Date().toISOString().slice(0, 10);
    nav.navigate('LogExercise', {
      item,
      setIndex,
      supersetNum,
      itemsAll: params?.itemsAll,   // keep the chain
      idxAll: params?.idxAll,
      returnTo, // pass returnTo to LogExercise
      date: todayISO,
    });
  };

  return (
    <FullBleed
      backgroundUri={headerImg}
      backgroundVideoUri={headerVideo}
      darkOverlay={!isPlaying}                  // 👈 overlay disappears when playing
      Top={<IconButton route={returnTo || 'Home'} />}
      Center={
        !isPlaying && (                         // 👈 title/description hidden while playing
          <View style={{ marginBottom: 20, flex: 1 }}>
            <Text style={__base.headline}>{title}</Text>
            {!!description && <Text style={__base.text}>{description}</Text>}
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
              {!!seconds && (
                <View style={{ flex: 1 }}>
                  <Text style={__base.textLabel}>seconds</Text>
                  <Text style={__base.textInfo}>{seconds}</Text>
                </View>
              )}
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
              {!!seconds && (
                <View style={{ flex: 1 }}>
                  <Text style={__base.textLabel}>seconds</Text>
                  <Text style={__base.textInfo}>{seconds}</Text>
                </View>
              )}
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
        <TimerBar maxTime={seconds} paused={!isPlaying} onDone={done} />
      )}
    </FullBleed>
  );
}
