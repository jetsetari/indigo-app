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
  // This screen is no longer used - logic moved to Workouts/index.tsx
  // Keeping file for backwards compatibility
  const nav = useNavigation<any>();
  nav.goBack();
  return null;
}
