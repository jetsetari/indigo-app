// src/data/routes/index.tsx
import React, { useEffect, useRef } from 'react';
import { StatusBar, Linking } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { supabase } from '~/data/supabase/connection';
//import { useIAP } from '~/components/Layout/IAPProvider';

import Start from '~/screens/register/Start';
import Register from '~/screens/register/Register';
import Login from '~/screens/register/Login';
import ForgotPassword from '~/screens/register/ForgotPassword';
//import Payment from '~/screens/register/Payment';

import Metrics from '~/screens/intake/Metrics';
import Goals from '~/screens/intake/Goals';
import Level from '~/screens/intake/Level';
import EatingHabits from '~/screens/intake/EatingHabits';
import Supplements from '~/screens/intake/Supplements';

import Home from '~/screens/app/Home';

import SelectWorkout from '~/screens/app/Workouts/SelectWorkout';
import ScheduleWorkout from '~/screens/app/Workouts/ScheduleWorkout';
import StartWorkout from '~/screens/app/Workouts/StartWorkout';
//import ExerciseStart from '~/screens/app/Workouts/ExerciseStart';
import Exercise from '~/screens/app/Workouts/Exercise';
import LogExercise from '~/screens/app/Workouts/LogExercise';

import Workouts from '~/screens/app/Workouts';
import Stats from '~/screens/app/Stats';
import Profile from '~/screens/app/Profile';
import ChangePassword from '~/screens/app/ChangePassword';
//import MainLayout from '~/components/Layout/MainLayout';

export type RootStackParamList = {
  Start: undefined;
  Register: undefined;
  Login: undefined;
  ForgotPassword: undefined;
  Main: undefined;
  Metrics: undefined;
  Goals: undefined;
  Level: undefined;
  EatingHabits: undefined;
  Supplements: undefined;
  Payment: undefined;

  Home: undefined;
  SelectWorkout: undefined;
  ScheduleWorkout: { isoDate?: string };
  StartWorkout: undefined;
  ExerciseStart: undefined;
  Exercise: undefined;
  LogExercise: undefined;
  Workouts: undefined;
  Stats: undefined;
  Profile: undefined;
  ChangePassword: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function Routes() {
  const hasAccess  = false;
  const navigationRef = useRef<any>(null);
  const linking = {
    prefixes: ['indigo://'],
    config: {
      screens: {
        ChangePassword: 'reset-password',
      },
    },
  };

  useEffect(() => {
    // Handle deep links for password reset
    const handlePasswordResetLink = async (url: string) => {
      try {
        // Extract hash fragments from URL (e.g., #access_token=...&type=recovery&...)
        const hashMatch = url.match(/#(.+)/);
        if (hashMatch) {
          const hashParams = new URLSearchParams(hashMatch[1]);
          const accessToken = hashParams.get('access_token');
          const refreshToken = hashParams.get('refresh_token');
          const type = hashParams.get('type');

          // Only process if it's a recovery type and we have tokens
          if (type === 'recovery' && accessToken && refreshToken) {
            // Set the session in Supabase
            const { error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });

            if (!error) {
              // Navigate to ChangePassword screen
              navigationRef.current?.navigate('ChangePassword');
            }
          }
        }
      } catch (error) {
        console.error('Error handling password reset link:', error);
      }
    };

    // Handle initial URL (when app opens from closed state)
    Linking.getInitialURL().then((url) => {
      if (url && url.includes('reset-password')) {
        handlePasswordResetLink(url);
      }
    });

    // Handle deep links when app is already running
    const subscription = Linking.addEventListener('url', (event) => {
      if (event.url.includes('reset-password')) {
        handlePasswordResetLink(event.url);
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  return (
    <>
      <StatusBar hidden />
      <NavigationContainer ref={navigationRef} linking={linking}>
        <Stack.Navigator
          screenOptions={{ headerShown: false, animation: 'fade', gestureEnabled: false, fullScreenGestureEnabled: false, }}
        >
          { !hasAccess ? (
            <>
              <Stack.Screen name="Start" component={Start} />
              <Stack.Screen name="Login" component={Login} />
              <Stack.Screen name="Register" component={Register} />
              <Stack.Screen name="Metrics" component={Metrics} />
              <Stack.Screen name="Goals" component={Goals} />
              <Stack.Screen name="Level" component={Level} />
              <Stack.Screen name="EatingHabits" component={EatingHabits} />
              <Stack.Screen name="Supplements" component={Supplements} />
              <Stack.Screen name="Home" component={Home} />
              <Stack.Screen name="Schedule" component={Workouts} />
              <Stack.Screen name="SelectWorkout" component={SelectWorkout} />
              <Stack.Screen name="ScheduleWorkout" component={ScheduleWorkout} />
              <Stack.Screen name="StartWorkout" component={StartWorkout} />
              <Stack.Screen name="Exercise" component={Exercise} />
              <Stack.Screen name="LogExercise" component={LogExercise} />
              <Stack.Screen name="Stats" component={Stats} />
              <Stack.Screen name="Profile" component={Profile} />
              <Stack.Screen name="ChangePassword" component={ChangePassword} />
              <Stack.Screen name="ForgotPassword" component={ForgotPassword} />


              {/*<Stack.Screen name="Payment" component={Payment} />
              
              */}
            </>
          ) : (
            <Stack.Screen name="Start" component={Start} />
            // <Stack.Screen name="Main" options={{ gestureEnabled: false }} component={MainLayout} />
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
}
