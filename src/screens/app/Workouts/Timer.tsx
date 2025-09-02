// src/components/Layout/Blocks/Timer.tsx

import React, { useState, useRef } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import IconButton from '~/components/Buttons/IconButton';
import __base from '~/assets/styles/base';

import TimerBar from '~/components/Layout/Blocks/TimerBar';
import CustomButton from '~/components/Buttons/CustomButton';

export default function Timer({
  onBack,
}: {
  onBack: () => void;
}) {
  const [running, setRunning] = useState(true);
  const videoRef = useRef<Video>(null);

  const handleToggle = () => {
    setRunning(prev => !prev);
  };

  const handleDone = () => {
    Alert.alert('done');
    setRunning(false);
  };

  return (
    <View style={__base.container}>
      <Video
        ref={videoRef}
        source={require('~/assets/videos/exercise-1.mp4')}
        style={[StyleSheet.absoluteFill, { opacity: 0.5 }]}
        shouldPlay={running}
        isLooping
        resizeMode={ResizeMode.COVER}
        isMuted={false}
      />

      <View style={__base.headerWithExtra}>
        <IconButton onPress={onBack} route="Workouts" icon="chevron-back" />
      </View>

      <TimerBar maxTime={10} paused={!running} onDone={handleDone} />

      <View style={styles.controls}>
        <CustomButton
          title={running ? 'Pause' : 'Play'}
          backgroundColor="transparent"
          borderColor="#FFF"
          textColor="#FFF"
          onPress={handleToggle}
        />
        <CustomButton
          title="Done"
          backgroundColor="transparent"
          borderColor="#00FFB0"
          textColor="#00FFB0"
          onPress={handleDone}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 30,
    gap: 10
  },
});
