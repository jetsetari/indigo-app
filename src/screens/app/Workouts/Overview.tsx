// src/screens/Workouts/Overview.tsx
import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { View, Text } from 'react-native';

import HeaderTitleImage from '~/components/Layout/HeaderTitleImage';
import StickyHeader from '~/components/Layout/StickyHeader';
import Loading from '~/components/Loading';
import PlanCard from '~/components/Layout/Blocks/PlanCard';
import CustomButton from '~/components/Buttons/CustomButton';
import CustomIcon from '~/components/Layout/CustomIcon';

import __base from '~/assets/styles/base';
import { getProgramWeekWithExercises, type ProgramWeek } from '~/data/supabase/workoutsHandler';
import Timer from './Timer';

type Props = {
  onBack: () => void;
  /** Optional slug from Home/Workouts, e.g. "program-2-w1-d3" */
  slug?: string;
};

function parseDayIndexFromSlug(slug?: string): number {
  if (!slug) return 1;
  // match ...-w<week>-d<day>
  const m = slug.match(/-w(\d+)-d(\d+)$/i);
  if (m && m[2]) {
    const day = parseInt(m[2], 10);
    return Number.isFinite(day) ? day : 1;
  }
  return 1;
}

export default function Overview({ onBack, slug }: Props) {
  const [loading, setLoading] = useState(true);
  const [week, setWeek] = useState<ProgramWeek | null>(null);
  const [exerciseMode, setExerciseMode] = useState(false);

  // Fixed: program 2, week 1 (as requested)
  const programId = 2;
  const weekIndex = 1;

  const dayIndex = useMemo(() => parseDayIndexFromSlug(slug), [slug]);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      const data = await getProgramWeekWithExercises(programId, weekIndex);
      if (!alive) return;
      setWeek(data);
      setLoading(false);
    })();
    return () => { alive = false; };
  }, []);

  const day = useMemo(
    () => week?.days.find(d => d.day_index === dayIndex) ?? null,
    [week, dayIndex]
  );

  const planImage = useMemo(() => {
    const cover = day?.items?.[0]?.exercise?.cover;
    return cover ? { uri: cover } : undefined;
  }, [day]);

  // Simple stats
  const stats = useMemo(() => {
    const count = day?.items?.length ?? 0;
    // naive duration estimate: per exercise 5 min + rests
    const totalRest = (day?.items ?? []).reduce((acc, it) => acc + (it.rest_seconds ?? 0), 0);
    const minutes = Math.max(1, Math.round(count * 5 + totalRest / 60));
    const kcal = Math.round(count * 50); // placeholder estimate
    return { count, minutes, kcal };
  }, [day]);

  const handleStartExercise = useCallback(() => setExerciseMode(true), []);

  if (exerciseMode) return <Timer onBack={() => setExerciseMode(false)} />;
  if (loading) return <Loading />;

  return (
    <StickyHeader title="Workout Plan" noSticky padded={false}>
      <HeaderTitleImage
        image={planImage ?? require('~/assets/images/dummy/workout-1.jpg')}
        subtitle={`Week ${week?.week_index ?? weekIndex} · Day ${dayIndex}${day?.title ? ` · ${day.title}` : ''}`}
        title={`Program ${week?.program_id ?? programId}`}
        onBack={onBack}
      />

      <View style={{ paddingHorizontal: 20 }}>
        <Text style={[__base.textSubline]}>
          Your session for today. Review the movements below and start when ready.
        </Text>

        <View style={__base.space} />
        <View style={__base.infoBox}>
          <View style={__base.infoBoxColumn}>
            <CustomIcon icon="Barbell" size={25} />
            <Text style={__base.infoBoxValue}>{stats.count}</Text>
            <Text style={__base.infoBoxLabel}>Exercises</Text>
          </View>
          <View style={__base.infoBoxColumn}>
            <CustomIcon icon="Time" size={25} />
            <Text style={__base.infoBoxValue}>{stats.minutes}</Text>
            <Text style={__base.infoBoxLabel}>Minutes</Text>
          </View>
          <View style={__base.infoBoxColumn}>
            <CustomIcon icon="Kcal" size={25} />
            <Text style={__base.infoBoxValue}>{stats.kcal}</Text>
            <Text style={__base.infoBoxLabel}>Kcal</Text>
          </View>
        </View>

        {/* Exercise list */}
        {day?.items?.map((it) => {
          const ex = it.exercise;
          const left = it.superset_label ? `${it.superset_label} · ` : '';
          const subtitleParts: string[] = [];
          if (it.sets != null) subtitleParts.push(`${it.sets} sets`);
          if (it.reps) subtitleParts.push(`${it.reps} reps`);
          if (it.weight != null) subtitleParts.push(`${it.weight} kg`);
          if (it.rest_seconds != null) subtitleParts.push(`${it.rest_seconds}s rest`);
          const subtitle = subtitleParts.join(' · ');

          return (
            <PlanCard
              key={it.id}
              title={`${left}${ex?.name ?? 'Exercise'}`}
              description={subtitle || ex?.description || ''}
              image={ex?.cover ? { uri: ex.cover } : undefined}
              onPress={handleStartExercise}
            />
          );
        })}

        <View style={__base.space} />
        <CustomButton
          title="Start Workout"
          backgroundColor="#000"
          borderColor="#FFF"
          textColor="#FFF"
          onPress={handleStartExercise}
        />
        <View style={__base.footerSpace} />
      </View>
    </StickyHeader>
  );
}
