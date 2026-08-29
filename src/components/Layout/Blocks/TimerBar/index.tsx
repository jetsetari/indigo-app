// components/TimerBar/index.tsx

import { useState, useEffect, useRef } from 'react';

export type TimerBarProps = {
  maxTime?: number;
  paused?: boolean;
  onDone?: () => void;
  onRemainingChange?: (remaining: number) => void;
};

/** Invisible countdown; remaining time is shown by the parent. */
export default function TimerBar({
  maxTime = 10,
  paused = false,
  onDone,
  onRemainingChange,
}: TimerBarProps) {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const doneRef = useRef(false);
  const onDoneRef = useRef(onDone);
  const onRemainingChangeRef = useRef(onRemainingChange);
  const [, setRemaining] = useState(maxTime);

  useEffect(() => {
    onDoneRef.current = onDone;
  }, [onDone]);

  useEffect(() => {
    onRemainingChangeRef.current = onRemainingChange;
  }, [onRemainingChange]);

  useEffect(() => {
    doneRef.current = false;
    setRemaining(maxTime);
    onRemainingChangeRef.current?.(maxTime);
  }, [maxTime]);

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

  return null;
}
