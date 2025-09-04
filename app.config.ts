// app.config.ts
import 'dotenv/config';
import type { ExpoConfig } from 'expo/config';

const config: ExpoConfig = {
  name: 'Indigo',
  slug: 'indigo',
  scheme: 'indigo',
  version: '1.0.1',
  orientation: "portrait",
  icon: "./src/assets/device/icon.png",
  userInterfaceStyle: "light",
  plugins: ["expo-audio", "expo-video", "expo-font"],
  splash: {
    image: "./src/assets/device/splash.png",
    resizeMode: "contain",
    backgroundColor: "#ffffff",
  },
  ios: {
    bundleIdentifier: 'com.jetsetari.indigo',
    infoPlist: {
      NSPhotoLibraryUsageDescription: 'We need access to your photos so you can pick a profile image.',
      NSPhotoLibraryAddUsageDescription: 'We may save images to your library when you export or download.',
      NSCameraUsageDescription: 'We need camera access so you can take a profile photo.',
    },
  },

  android: {
    package: 'com.jetsetari.indigo',
    permissions: ['android.permission.READ_MEDIA_IMAGES', 'android.permission.CAMERA'],
  },
  extra: {
    eas: {
      projectId: "2aaa1c31-6016-499a-a3fa-993bb72a0869"
    }
  }
};

export default config;
