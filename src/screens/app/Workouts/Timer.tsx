// src/components/Layout/Blocks/Timer.tsx

import React, { useState, useRef } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import IconButton from '~/components/Buttons/IconButton';
import __base from '~/assets/styles/base';

import BgVideo from '~/components/Layout/BgVideo';

import TimerBar from '~/components/Layout/Blocks/TimerBar';
import CustomButton from '~/components/Buttons/CustomButton';

export default function Timer({
  onBack,
}: {
  onBack: () => void;
}) {
  const [running, setRunning] = useState(true);
  //const videoRef = useRef<Video>(null);

  const handleToggle = () => {
    setRunning(prev => !prev);
  };

  const handleDone = () => {
    onBack();
    setRunning(false);
  };

  return (
    <View style={__base.container}>
      <BgVideo
        source={require('~/assets/videos/exercise-1.mp4')}
        overlayStyle={{ backgroundColor: 'rgba(0,0,0,0.7)' }}
      />

      {/*<View style={__base.headerWithExtra}>
        <IconButton onPress={onBack} route="Workouts" icon="chevron-back" />
      </View>*/}

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
