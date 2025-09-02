// components/TimerBar/index.tsx

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
} from 'react-native';

export type TimerBarProps = {
  maxTime?: number;
  paused?: boolean;
  onDone?: () => void;
};

const BAR_CONTAINER_HEIGHT = 400;

export default function TimerBar({
  maxTime = 10,
  paused = false,
  onDone,
}: TimerBarProps) {
  const [remaining, setRemaining] = useState(maxTime);
  const [repsLeft, setRepsLeft]   = useState(maxTime);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Animated value, initialized to full height
  const animatedHeight = useRef(
    new Animated.Value(BAR_CONTAINER_HEIGHT)
  ).current;

  // Core countdown logic
  useEffect(() => {
    if (paused || repsLeft <= 0) return;

    intervalRef.current = setInterval(() => {
      setRemaining(prev => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!);
          setRepsLeft(r => {
            const next = r - 1;
            if (next <= 0) onDone?.();
            return next;
          });
          return maxTime;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [paused, repsLeft, maxTime, onDone]);

  // Whenever `remaining` changes, animate the height
  useEffect(() => {
    const newHeight = (remaining / maxTime) * BAR_CONTAINER_HEIGHT;

    Animated.timing(animatedHeight, {
      toValue: newHeight,
      duration: 500,
      useNativeDriver: false,  // height can’t be driven natively
    }).start();
  }, [remaining, maxTime, animatedHeight]);

  return (
    <View style={styles.wrapper}>
      <View style={styles.barContainer}>
        <Animated.View
          style={[styles.bar, { height: animatedHeight }]}
        />
      </View>
      <Text style={styles.reps}>{repsLeft} Left</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    marginVertical: 20,
    position: 'absolute',
    right: 20,
    bottom: 80,
  },
  barContainer: {
    width: 40,
    height: BAR_CONTAINER_HEIGHT,
    borderWidth: 1,
    borderColor: '#FFF',
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  bar: {
    width: '100%',
    backgroundColor: '#FFF',
    position: 'absolute',
    bottom: 0,
  },
  reps: {
    color: '#FFF',
    fontSize: 18,
    marginTop: 8,
  },
});
