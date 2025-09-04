import React from 'react';
import { useColorScheme } from 'react-native';
import Toast, { BaseToast, ErrorToast, type ToastConfig } from 'react-native-toast-message';

const palette = {
  dark: {
    card: '#FFF',
    text: '#000',
    sub: '#333',
    border: '#2A2A2A',
    success: '#22C55E',
    error: '#EF4444',
    info: '#60A5FA',
  },
};

const useColors = () => palette['dark'];

const ThemedSuccess = (props: any) => {
  const c = useColors();
  return (
    <BaseToast
      {...props}
      style={{ borderLeftColor: c.success, backgroundColor: c.card, borderRadius: 0, marginTop: 20, borderColor: c.border }}
      contentContainerStyle={{ paddingHorizontal: 14 }}
      text1Style={{ color: c.text, fontSize: 16, fontWeight: '700' }}
      text2Style={{ color: c.sub, fontSize: 14, marginTop: 2 }}
    />
  );
};

const ThemedError = (props: any) => {
  const c = useColors();
  return (
    <ErrorToast
      {...props}
      style={{ borderLeftColor: c.error, backgroundColor: c.card, borderRadius: 0, marginTop: 20, borderColor: c.border }}
      contentContainerStyle={{ paddingHorizontal: 14 }}
      text1Style={{ color: c.text, fontSize: 16, fontWeight: '700' }}
      text2Style={{ color: c.sub, fontSize: 14, marginTop: 2 }}
    />
  );
};

const ThemedInfo = (props: any) => {
  const c = useColors();
  return (
    <BaseToast
      {...props}
      style={{ borderLeftColor: c.info, backgroundColor: c.card, borderRadius: 0, marginTop: 20, borderColor: c.border }}
      contentContainerStyle={{ paddingHorizontal: 14 }}
      text1Style={{ color: c.text, fontSize: 16, fontWeight: '700' }}
      text2Style={{ color: c.sub, fontSize: 14, marginTop: 2 }}
    />
  );
};

const toastConfig: ToastConfig = {
  success: (p) => <ThemedSuccess {...p} />,
  error:   (p) => <ThemedError {...p} />,
  info:    (p) => <ThemedInfo {...p} />,
};

export default toastConfig;
