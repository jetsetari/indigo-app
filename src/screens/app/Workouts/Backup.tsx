// src/screens/Workouts/index.tsx
import React, { useEffect, useState } from 'react';
import { View } from 'react-native';

import StickyHeader from '~/components/Layout/StickyHeader';
import HeaderText from '~/components/Layout/HeaderText';
import WeekCalendar from '~/components/Form/WeekCalendar';
import PlanCard from '~/components/Layout/Blocks/PlanCard';
import WorkoutDayCard from '~/components/Layout/Blocks/WorkoutDayCard';
import BottomTabs from '~/components/Layout/BottomTabs';
import Loading from '~/components/Loading';

import Overview from './Overview';

import __base from '~/assets/styles/base';
import styles from '~/assets/styles/screens/WorkoutStyles';

import { plansExamples } from '~/data/content/options';
import { getProgramWeekWithExercises, type ProgramWeek } from '~/data/supabase/workoutsHandler';

export default function WorkoutScreen() {
  const [exercise, setExercise] = useState(false);
  const [loading, setLoading] = useState(true);

  // UI-ready data built from DB (or fallback)
  const [planTitle, setPlanTitle] = useState<string>('Workout Plan');
  const [planSubtitle, setPlanSubtitle] = useState<string>('Week 1');
  const [planImage, setPlanImage] = useState<any>(undefined);
  const [planDays, setPlanDays] = useState<Array<{ day: string; label: string; completed?: boolean }>>([]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        // program 2, week 1
        const week: ProgramWeek | null = await getProgramWeekWithExercises(2, 1);

        if (!alive) return;

        if (week && week.days.length) {
          // Title/subtitle
          setPlanTitle(`Program ${week.program_id}`);
          setPlanSubtitle(`Still need description`);

          // Use first item's cover as plan image (if your component supports remote images)
          const firstCover =
            week.days[0]?.items[0]?.exercise?.cover
              ? { uri: week.days[0].items[0].exercise!.cover! }
              : undefined;
          setPlanImage(firstCover);

          // Build day list (e.g., "Day 1 | A1 · Bench Press")
          const days = week.days.map(d => {
            const first = d.items[0];
            const labelLeft = first?.superset_label ? `${first.superset_label} · ` : '';
            const labelRight = first?.exercise?.name ?? (d.title ?? 'Workout');
            return {
              day: `Day ${d.day_index}${d.title ? ` | ${d.title}` : ''}`,
              label: `${labelLeft}${labelRight}`,
              completed: false,
            };
          });
          setPlanDays(days);
        } else {
          // Fallback to your example content
          const firstPlan = plansExamples[0];
          setPlanTitle(firstPlan.title);
          setPlanSubtitle(firstPlan.subtitle);
          setPlanImage(firstPlan.image);
          setPlanDays(
            firstPlan.days.map((d: any) => ({
              day: `${d.day} | ${d.label}`,
              label: d.label,
              completed: d.completed,
            })),
          );
        }
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

        <View style={styles.planBlock}>
          <PlanCard
            title={planTitle}
            description={planSubtitle}
            image={planImage}
            onPress={() => setExercise(true)}
          />
          {planDays.map((d, idx) => (
            <WorkoutDayCard
              key={idx}
              focus={d.label}
              day={d.day}
              completed={!!d.completed}
              onPress={() => setExercise(true)}
            />
          ))}
        </View>


        <View style={__base.footerSpace} />
      </StickyHeader>
      <BottomTabs />
    </>
  );
}
