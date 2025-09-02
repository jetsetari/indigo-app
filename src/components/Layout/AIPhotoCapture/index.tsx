import React, { useRef, useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, Dimensions } from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { Feather } from '@expo/vector-icons';

import { styles } from './AIPhotoCaptureStyle';

const { width } = Dimensions.get('window');
const labels = ['Front', 'Back', 'Side'];

export default function AIPhotoCapture({
  onComplete,
}: {
  onComplete?: (images: string[]) => void;
}) {
  const cameraRef = useRef<any>(null);
  const [permission, requestPermission] = useCameraPermissions();
  // Use literal 'front' / 'back' values
  const [cameraFacing, setCameraFacing] = useState<CameraType>('front');
  const [step, setStep] = useState(0);
  const [photos, setPhotos] = useState<string[]>(['', '', '']);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!permission) return;
    if (!permission.granted) {
      requestPermission();
    }
  }, [permission]);

  const handleSnap = async () => {
    if (!cameraRef.current) return;
    setLoading(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        skipProcessing: false,
      });

      const newPhotos = [...photos];
      newPhotos[step] = photo.uri;
      setPhotos(newPhotos);

      if (step < labels.length - 1) {
        setStep(step + 1);
      } else if (onComplete) {
        onComplete(newPhotos);
      }
    } catch (err) {
      console.error('❌ Error capturing photo:', err);
    }
    setLoading(false);
  };

  const handleRetake = () => {
    const newPhotos = [...photos];
    newPhotos[step] = '';
    setPhotos(newPhotos);
  };

  if (!permission || !permission.granted) {
    return (
      <View style={styles.permissionWrapper}>
        <Text style={styles.permissionText}>
          Camera permission is required.
        </Text>
        <TouchableOpacity
          style={styles.permissionButton}
          onPress={requestPermission}
        >
          <Text style={styles.permissionButtonText}>
            Grant Permission
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>
      {/* Camera preview or captured photo */}
      {photos[step] ? (
        <Image
          source={{ uri: photos[step] }}
          style={styles.camera}
          resizeMode="cover"
        />
      ) : (
        <CameraView
          ref={cameraRef}
          style={styles.camera}
          facing={cameraFacing}
        />
      )}

      {/* Overlay frame (non-interactive) */}
      <View style={styles.frame} pointerEvents="none" />

      {/* Toggle camera button */}
      {!photos[step] && (
        <TouchableOpacity
          style={styles.toggleBtn}
          onPress={() =>
            setCameraFacing(prev => (prev === 'front' ? 'back' : 'front'))
          }
        >
          <Feather name="rotate-cw" size={18} color="#FFF" />
        </TouchableOpacity>
      )}

      {/* Capture / Retake button */}
      {!loading && (
        photos[step] ? (
          <TouchableOpacity
            onPress={handleRetake}
            style={styles.captureBtn}
          >
            <Text style={styles.retakeText}>Retake</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={handleSnap}
            style={styles.captureBtn}
          >
            <Feather name="camera" size={24} color="#FFF" />
          </TouchableOpacity>
        )
      )}

      {/* Thumbnails */}
      <View style={styles.thumbs}>
        {labels.map((_, i) => (
          <TouchableOpacity
            key={i}
            onPress={() => setStep(i)}
            style={[
              styles.thumb,
              i === step && styles.activeThumb,
              { alignItems: 'center', justifyContent: 'center' },
            ]}
          >
            {!photos[i] ? (
              <Feather name="camera" size={26} color="#AAA" />
            ) : (
              <Image
                source={{ uri: photos[i] }}
                style={styles.thumb}
                resizeMode="cover"
              />
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* Instruction */}
      <Text style={styles.title}>
        {photos[step]
          ? `Review your ${labels[step]} photo`
          : `Take your ${labels[step]} photo`}
      </Text>
    </View>
  );
}
