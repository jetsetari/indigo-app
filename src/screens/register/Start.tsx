import React from 'react';

import { View, StyleSheet, Image, Text, TouchableOpacity } from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { useNavigation } from '@react-navigation/native';

import CustomButton from '~/components/Buttons/CustomButton';
import Logo from '~/components/Layout/Logo';

import __base from '~/assets/styles/base';

export default function Start() {
  const navigation = useNavigation<any>();
  return (
    <View style={__base.container}>
      <Video source={require('~/assets/videos/background-4.mp4')} style={[StyleSheet.absoluteFill, { opacity: 0.3 }]} shouldPlay isLooping resizeMode={ResizeMode.COVER} isMuted />
      <View style={__base.contentCenter}>
        <View style={__base.contentCenterLogo}>
          <Logo />
        </View>
        <View style={__base.contentCenterBottom}>
          <View style={__base.divider} />
          <CustomButton title="Login" backgroundColor='transparent' textColor='#FFF' onPress={() => navigation.navigate('Login') } />
          <View style={__base.space} />
          <Text style={[__base.text, __base.textCenter]}>Don’t have an account yet?</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={[__base.textBold, __base.textUnderline, __base.textCenter]}>Sign up here</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
