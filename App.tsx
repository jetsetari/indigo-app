import { useEffect } from 'react';
import { setAudioModeAsync } from 'expo-audio';

import { View } from 'react-native';
import { useFonts } from 'expo-font';
import Toast from 'react-native-toast-message';

import Routes from '~/data/routes';
import Loading from '~/components/Loading';
import toastConfig from '~/assets/styles/toast';
import __base from '~/assets/styles/base';

export default function App() {

  useEffect(() => {
    (async () => {
      try {
        await setAudioModeAsync({
          allowsRecording: false,
          playsInSilentMode: true,
        });
      } catch {}
    })();
  }, []);

  // Load Inter fonts
  const [fontsLoaded] = useFonts({
    'Inter-Bold': require('~/assets/fonts/Inter-Bold.ttf'),
    'Inter-BoldItalic': require('~/assets/fonts/Inter-BoldItalic.ttf'),
    'Inter-ExtraLight': require('~/assets/fonts/Inter-ExtraLight.ttf'),
    'Inter-ExtraLightItalic': require('~/assets/fonts/Inter-ExtraLightItalic.ttf'),
    'Inter-Italic': require('~/assets/fonts/Inter-Italic.ttf'),
    'Inter-Light': require('~/assets/fonts/Inter-Light.ttf'),
    'Inter-LightItalic': require('~/assets/fonts/Inter-LightItalic.ttf'),
    'Inter-Medium': require('~/assets/fonts/Inter-Medium.ttf'),
    'Inter-MediumItalic': require('~/assets/fonts/Inter-MediumItalic.ttf'),
    'Inter-Regular': require('~/assets/fonts/Inter-Regular.ttf'),
    'Inter-SemiBold': require('~/assets/fonts/Inter-SemiBold.ttf'),
    'Inter-SemiBoldItalic': require('~/assets/fonts/Inter-SemiBoldItalic.ttf'),
    'Inter-Thin': require('~/assets/fonts/Inter-Thin.ttf'),
    'Inter-ThinItalic': require('~/assets/fonts/Inter-ThinItalic.ttf'),
  });

  if (!fontsLoaded) {
    return <Loading />;
  }

  return (
    <>
      <View style={__base.mainWrapper}>
        <Toast config={toastConfig} />
      </View>
      <Routes />
    </>
  );
}
