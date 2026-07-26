// components/TimerBar/index.tsx

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Animated,
} from 'react-native';

export type TimerBarProps = {
  maxTime?: number;
  paused?: boolean;
  onDone?: () => void;
  onRemainingChange?: (remaining: number) => void;
};

const BAR_CONTAINER_HEIGHT = 400;

export default function TimerBar({
  maxTime = 10,
  paused = false,
  onDone,
  onRemainingChange,
}: TimerBarProps) {
  const [remaining, setRemaining] = useState(maxTime);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const doneRef = useRef(false);
  const onDoneRef = useRef(onDone);
  const onRemainingChangeRef = useRef(onRemainingChange);

  const animatedHeight = useRef(
    new Animated.Value(BAR_CONTAINER_HEIGHT)
  ).current;

  useEffect(() => {
    onDoneRef.current = onDone;
  }, [onDone]);

  useEffect(() => {
    onRemainingChangeRef.current = onRemainingChange;
  }, [onRemainingChange]);

  // Reset when maxTime changes (new exercise / set)
  useEffect(() => {
    doneRef.current = false;
    setRemaining(maxTime);
    onRemainingChangeRef.current?.(maxTime);
    animatedHeight.setValue(BAR_CONTAINER_HEIGHT);
  }, [maxTime, animatedHeight]);

  useEffect(() => {
    if (paused || doneRef.current) return;

    intervalRef.current = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 0) return 0;
        const next = prev - 1;
        onRemainingChangeRef.current?.(next);
        if (next <= 0) {
          doneRef.current = true;
          if (intervalRef.current) clearInterval(intervalRef.current);
          onDoneRef.current?.();
        }
        return next;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [paused, maxTime]);

  useEffect(() => {
    const newHeight = maxTime > 0 ? (remaining / maxTime) * BAR_CONTAINER_HEIGHT : 0;

    Animated.timing(animatedHeight, {
      toValue: newHeight,
      duration: 500,
      useNativeDriver: false,
    }).start();
  }, [remaining, maxTime, animatedHeight]);

  return (
    <View style={styles.wrapper}>
      <View style={styles.barContainer}>
        <Animated.View
          style={[styles.bar, { height: animatedHeight }]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    marginVertical: 20,
    position: 'absolute',
    right: 10,
    bottom: 100,
  },
  barContainer: {
    width: 30,
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
});
