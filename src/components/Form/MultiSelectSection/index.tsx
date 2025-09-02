import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';

type Option = {
  label: string;
  slug: string;
};

type Props = {
  title: string;
  icon?: string;
  options: Option[];
  selected: string[];
  onChange: (updated: string[]) => void;
};

export default function MultiSelectSection({ title, icon, options, selected, onChange }: Props) {
  const toggleOption = (slug: string) => {
    if (selected.includes(slug)) {
      onChange(selected.filter((s) => s !== slug));
    } else {
      onChange([...selected, slug]);
    }
  };

  return (
    <View style={styles.section}>
      <View style={styles.titleWrapper}>
        { icon && <Text style={{ marginRight: 5 }}>{icon ? `${icon} ` : ''}</Text>} 
        <Text style={[styles.title, { fontWeight: 'bold' }]}>{title}</Text>
      </View>
      {options.map((opt) => {
        const isSelected = selected.includes(opt.slug);
        return (
          <TouchableOpacity
            key={opt.slug}
            style={[styles.option, isSelected && styles.optionSelected]}
            onPress={() => toggleOption(opt.slug)}
          >
            <Text style={styles.label}>{opt.label}</Text>
            {isSelected && <Feather name="check" size={18} color="#FFF" />}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 20,
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
    padding: 14,
    height: 45,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    alignItems: 'center'
  },
  optionSelected: {
    backgroundColor: '#222',
    borderColor: '#FFF',
  },
  label: {
    color: '#FFF',
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
});
