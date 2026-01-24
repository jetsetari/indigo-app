import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useController, type FieldValues, type Path } from 'react-hook-form';
import { Feather } from '@expo/vector-icons';
import { styles } from '../SelectMulti/SelectMultiStyle';
import __base from '~/assets/styles/base';

type Option = { label: string; slug: string };

export type FormSelectSingleProps<T extends FieldValues = FieldValues> = {
  control: any;                 // RHF Control<any>
  name: Path<T>;                // string (single value)
  title: string;
  icon?: string;
  options: Option[];
  required?: boolean;           // visual asterisk only (use rules to enforce)
  rules?: any;                  // e.g. { required: 'Please select one' }
};

export default function FormSelectSingle<T extends FieldValues>({
  control,
  name,
  title,
  icon,
  options,
  required = false,
  rules,
}: FormSelectSingleProps<T>) {
  const { field, fieldState } = useController({ control, name, rules });
  const selected: string | null = field.value || null;

  const select = (slug: string) => {
    // Toggle: if already selected, deselect; otherwise select
    if (selected === slug) {
      field.onChange(null);
    } else {
      field.onChange(slug);
    }
  };

  return (
    <View style={styles.section}>
      <View style={styles.titleWrapper}>
        {!!icon && <Text style={{ marginRight: 5 }}>{icon} </Text>}
        <Text style={styles.title}>
          {title}
          {required && <Text style={__base.asterix}> *</Text>}
        </Text>
      </View>

      {options.map((opt) => {
        const isSelected = selected === opt.slug;
        return (
          <TouchableOpacity
            key={opt.slug}
            style={[styles.option, isSelected && styles.optionSelected]}
            onPress={() => select(opt.slug)}
            activeOpacity={0.85}
          >
            <Text style={styles.label}>{opt.label}</Text>
            {isSelected && <Feather name="check" size={18} color="#FFF" />}
          </TouchableOpacity>
        );
      })}

      {!!fieldState.error?.message && (
        <Text style={[__base.errorMsg, { marginTop: 6 }]}>{String(fieldState.error.message)}</Text>
      )}
    </View>
  );
}
