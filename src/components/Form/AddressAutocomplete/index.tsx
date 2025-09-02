// src/components/Form/AddressAutocomplete.tsx

import React, {
  useState,
  useEffect,
} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import Constants from 'expo-constants';
import { styles } from './AddressAutocompleteStyle';

type Props = {
  label: string;
  onChange: (value: string) => void;
  value: string;
  required?: boolean;
  /** Tooltip explaining why we need address */
  info?: string;
};

export default function AddressAutocomplete({
  label,
  onChange,
  value,
  required = false,
  info,
}: Props) {
  const [results, setResults] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (value.length >= 3) fetchSuggestions();
      else setResults([]);
    }, 300);
    return () => clearTimeout(timer);
  }, [value]);

  const fetchSuggestions = async () => {
    try {
      setLoading(true);
      const apiKey = Constants.expoConfig?.extra?.GOOGLE_API_KEY!;
      const res = await fetch(
        `https://maps.googleapis.com/maps/api/place/autocomplete/json?` +
        `input=${encodeURIComponent(value)}` +
        `&key=${apiKey}&types=address&language=en&components=country:be`
      );
      const json = await res.json();
      if (json.status === 'OK') {
        setResults(json.predictions.map((p: any) => p.description));
      } else {
        console.warn('Places API error:', json.status);
      }
    } catch (err) {
      Toast.show({ type: 'error', text1: 'Error loading suggestions' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ marginBottom: 20 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Text style={styles.label}>
          {label} {required && <Text style={{ color: 'red' }}>*</Text>}
        </Text>
        {info && (
          <TouchableOpacity
            onPress={() => Alert.alert(label, info)}
            style={{ marginLeft: 6, marginBottom: 5 }}
          >
            <Feather name="info" size={18} color="#888" />
          </TouchableOpacity>
        )}
      </View>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChange}
        placeholder="Start typing your address..."
      />
      {loading && <ActivityIndicator size="small" style={{ marginTop: 8 }} />}
      {results.map((item) => (
        <TouchableOpacity
          key={item}
          onPress={() => {
            onChange(item);
            setResults([]);
          }}
          style={styles.suggestion}
        >
          <Text>{item}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}
