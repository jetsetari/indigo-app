import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useController, type FieldValues, type Path } from 'react-hook-form';
import { Feather } from '@expo/vector-icons';
import { styles } from './SelectMultiStyle';
import __base from '~/assets/styles/base';

type Option = { label: string; slug: string };

export type FormSelectMultiProps<T extends FieldValues = FieldValues> = {
  control: any;                 // RHF Control<any>
  name: Path<T>;                // string[]
  title: string;
  icon?: string;
  options: Option[];
  required?: boolean;           // visual asterisk only (use rules to enforce)
  rules?: any;                  // e.g. { validate: v => (v?.length ? true : 'Pick at least one') }
};

export default function FormSelectMulti<T extends FieldValues>({
  control,
  name,
  title,
  icon,
  options,
  required = false,
  rules,
}: FormSelectMultiProps<T>) {
  const { field, fieldState } = useController({ control, name, rules });
  const selected: string[] = Array.isArray(field.value) ? field.value : [];

  const toggle = (slug: string) => {
    if (selected.includes(slug)) field.onChange(selected.filter(s => s !== slug));
    else field.onChange([...selected, slug]);
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
        const isSelected = selected.includes(opt.slug);
        return (
          <TouchableOpacity
            key={opt.slug}
            style={[styles.option, isSelected && styles.optionSelected]}
            onPress={() => toggle(opt.slug)}
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
