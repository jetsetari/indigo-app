import React from 'react';

import { View, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import BgVideo from '~/components/Layout/BgVideo';

import CustomButton from '~/components/Buttons/CustomButton';
import Logo from '~/components/Layout/Logo';
import useTranslation from '~/data/helpers/translation';

import __base from '~/assets/styles/base';

export default function Start() {
  const navigation = useNavigation<any>();
  const t = useTranslation().home;

  return (
    <View style={__base.container}>
      <BgVideo source={{ uri: 'https://vimeo.com/1120852196' }} overlayStyle={{backgroundColor: 'rgba(0,0,0,0.8)'}} resizeMode="cover"/>
      <View style={__base.contentCenter}>
        <View style={__base.contentCenterLogo}>
          <Logo />
        </View>
        <View style={__base.contentCenterBottom}>
          <View style={__base.divider} />
          <CustomButton title="Login" backgroundColor='transparent' textColor='#FFF' onPress={() => navigation.navigate('Login') } />
          <View style={__base.space} />
          <Text style={[__base.text, __base.textCenter]}>{ t.noAccount }</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={[__base.textBold, __base.textUnderline, __base.textCenter]}>{ t.signup }</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
