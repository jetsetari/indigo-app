import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

type Option = {
  label: string;
  slug: string;
  screen: string;
  image: any; // image import or require
};

type Props = {
  title?: string;
  icon?: string;
  options: Option[];
  selected?: string;
  onChange: (selectedSlug: string) => void;
};

export default function SingleSelectSection({ title, icon, options, selected, onChange }: Props) {
  const navigation = useNavigation<any>();

  const handleSelect = (opt: Option) => {
    onChange(opt.slug);
    navigation.navigate(opt.screen);
  };

  return (
    <View style={styles.section}>
      { title && <View style={styles.titleWrapper}>
        {icon && <Text style={{ marginRight: 5 }}>{icon}</Text>}
        <Text style={styles.title}>{title}</Text>
      </View> }
      {options.map((opt) => {
        const isSelected = selected === opt.slug;
        return (
          <TouchableOpacity
            key={opt.slug}
            style={[styles.option, isSelected && styles.optionSelected]}
            onPress={() => handleSelect(opt)}
          >
            <View style={styles.optionLeft}>
              <Image source={opt.image} style={styles.image} />
              <Text style={styles.label}>{opt.label}</Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 0,
  },
  titleWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    color: '#FFF',
    fontSize: 18,
    fontFamily: 'Inter-Bold',
  },
  option: {
    borderWidth: 1,
    borderColor: '#444',
    borderRadius: 0,
    paddingHorizontal: 5,
    height: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    alignItems: 'center',
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionSelected: {
    backgroundColor: '#222',
    borderColor: '#FFF',
  },
  label: {
    color: '#FFF',
    fontSize: 15,
    fontFamily: 'Inter-Regular',
    marginLeft: 10,
  },
  image: {
    width: 40,
    height: 40,
  },
});
