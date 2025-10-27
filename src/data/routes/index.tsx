// src/data/routes/index.tsx
import React from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
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

  return (
    <>
      <StatusBar hidden />
      <NavigationContainer>
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
              <Stack.Screen name="Workouts" component={Workouts} />
              <Stack.Screen name="SelectWorkout" component={SelectWorkout} />
              <Stack.Screen name="StartWorkout" component={StartWorkout} />
              <Stack.Screen name="Exercise" component={Exercise} />
              <Stack.Screen name="LogExercise" component={LogExercise} />
              <Stack.Screen name="Stats" component={Stats} />
              <Stack.Screen name="Profile" component={Profile} />
              <Stack.Screen name="ChangePassword" component={ChangePassword} />


              {/*<Stack.Screen name="ForgotPassword" component={ForgotPassword} />
              <Stack.Screen name="Payment" component={Payment} />
              
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
