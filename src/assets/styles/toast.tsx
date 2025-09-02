// ~/data/theme/toastConfig.ts
import React from 'react';
import { BaseToast, ErrorToast } from 'react-native-toast-message';
import type { ToastConfig } from 'react-native-toast-message';

export const toastConfig: ToastConfig = {
  success: (props) => (
    <BaseToast
      {...props}
      style={{ borderLeftColor: '#4CAF50', marginTop: 20 }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 5,
        marginTop: 2
      }}
      text2Style={{
        fontSize: 18,
      }}
    />
  ),

  error: (props) => (
    <ErrorToast
      {...props}
      style={{ borderLeftColor: '#F44336', marginTop: 20 }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 5,
        marginTop: 2
      }}
      text2Style={{
        fontSize: 18,
      }}
    />
  ),
};
