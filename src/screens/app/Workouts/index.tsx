// src/screens/Workouts/index.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { View, Text } from 'react-native';

import StickyHeader from '~/components/Layout/StickyHeader';
import HeaderText from '~/components/Layout/HeaderText';
import PlanCard from '~/components/Layout/Blocks/PlanCard';
import WorkoutDayCard from '~/components/Layout/Blocks/WorkoutDayCard';
import BottomTabs from '~/components/Layout/BottomTabs';
import Loading from '~/components/Loading';
import Overview from './Overview';

import __base from '~/assets/styles/base';
import styles from '~/assets/styles/screens/WorkoutStyles';

import { getProgramWeekWithExercises, type ProgramWeek } from '~/data/supabase/workoutsHandler';

type DayOption = {
  day: string;
  label: string;
  slug: string;     // e.g. program-2-w1-d1
  dayIndex: number;
  completed?: boolean;
};

export default function WorkoutScreen() {
  const [exercise, setExercise] = useState(false);
  const [loading, setLoading] = useState(true);
  const [noData, setNoData] = useState(false);

  const [planTitle, setPlanTitle] = useState('Workout Plan');
  const [planSubtitle, setPlanSubtitle] = useState('Week 1');
  const [planImage, setPlanImage] = useState<any>(undefined);
  const [planDays, setPlanDays] = useState<DayOption[]>([]);
  const [selectedSlug, setSelectedSlug] = useState('');

  const handleStart = useCallback((slug: string) => {
    setSelectedSlug(slug);
    setExercise(true);
  }, []);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setNoData(false);

        // fixed: program 2, week 1
        const week: ProgramWeek | null = await getProgramWeekWithExercises(2, 1);
        if (!alive) return;

        if (!week || !week.days.length) {
          setNoData(true);
          setPlanDays([]);
          setSelectedSlug('');
          return;
        }

        setPlanTitle(`Program ${week.program_id}`);
        setPlanSubtitle(`Week ${week.week_index}`);

        const firstCover =
          week.days[0]?.items[0]?.exercise?.cover
            ? { uri: week.days[0].items[0].exercise!.cover! }
            : undefined;
        setPlanImage(firstCover);

        const days: DayOption[] = week.days.map((d) => {
          const first = d.items[0];
          const left = first?.superset_label ? `${first.superset_label} · ` : '';
          const right = first?.exercise?.name ?? (d.title ?? 'Workout');
          const slug = `program-${week.program_id}-w${week.week_index}-d${d.day_index}`;
          return {
            day: `Day ${d.day_index}${d.title ? ` | ${d.title}` : ''}`,
            label: `${left}${right}`,
            slug,
            dayIndex: d.day_index,
            completed: false,
          };
        });
        console.log(days);

        setPlanDays(days);
        if (days[0]?.slug) setSelectedSlug(days[0].slug);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  if (exercise) return <Overview onBack={() => setExercise(false)} />;
  if (loading) return <Loading />;

  return (
    <>
      <StickyHeader title="Workout Plan" noSticky>
        <HeaderText
          title="Pick your perfect plan"
          subtitle="Cut fat, gain muscle, or fight like a warrior."
        />

        {noData ? (
          <View style={[styles.planBlock, { alignItems: 'center', paddingVertical: 24 }]}>
            <Text style={[__base.text, { opacity: 0.7 }]}>
              No workouts found for Program 2 · Week 1.
            </Text>
          </View>
        ) : (
          <View style={styles.planBlock}>
            <PlanCard
              title={planTitle}
              description={planSubtitle}
              image={planImage}
              onPress={() => selectedSlug && handleStart(selectedSlug)}
            />
            {planDays.map((d) => (
              <WorkoutDayCard
                key={d.slug}
                focus={d.label}
                day={d.day}
                completed={!!d.completed}
                onPress={() => handleStart(d.slug)}
              />
            ))}
          </View>
        )}

        <View style={__base.footerSpace} />
      </StickyHeader>
      <BottomTabs />
    </>
  );
}
