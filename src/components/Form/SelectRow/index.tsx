import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Controller, type FieldValues, type Path } from 'react-hook-form';
import { styles } from './SelectRowStyle';
import __base from '~/assets/styles/base';

type Option = {
  label: string;
  slug: string;     // stored in the form
  screen: string;   // navigate to this screen on select
  image?: any;      // require(...) or imported image
};

export type FormSelectRowProps<T extends FieldValues = FieldValues> = {
  control: unknown;         // RHF Control<any>
  name: Path<T>;
  title?: string;
  icon?: string;
  options: Option[];        // same shape you already use
  required?: boolean;       // visual asterisk; use rules for validation
  rules?: any;              // RHF rules (e.g., { required: 'Pick one' })
};

export default function FormSelectRow<T extends FieldValues>({
  control,
  name,
  title,
  icon,
  options,
  required,
  rules,
}: FormSelectRowProps<T>) {
  const navigation = useNavigation<any>();

  return (
    <Controller
      // @ts-expect-error - keep control generic-loose
      control={control}
      name={name}
      rules={rules}
      render={({ field: { value, onChange }, fieldState: { error } }) => {
        const selected = (value as string) ?? '';

        const handleSelect = (opt: Option) => {
          onChange(opt.slug);
          navigation.navigate(opt.screen);
        };

        return (
          <View style={styles.section}>
            {!!title && (
              <View style={styles.titleWrapper}>
                {!!icon && <Text style={{ marginRight: 5 }}>{icon}</Text>}
                <Text style={styles.title}>
                  {title}{required && <Text style={__base.asterix}> *</Text>}
                </Text>
              </View>
            )}

            {options.map((opt) => {
              const isSelected = selected === opt.slug;
              return (
                <TouchableOpacity
                  key={opt.slug}
                  style={[styles.option, isSelected && styles.optionSelected]}
                  onPress={() => handleSelect(opt)}
                >
                  <View style={styles.optionLeft}>
                    {!!opt.image && <Image source={opt.image} style={styles.image} />}
                    <Text style={styles.label}>{opt.label}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}

            {!!error?.message && (
              <Text style={[__base.errorMsg, { marginTop: 6 }]}>
                {String(error.message)}
              </Text>
            )}
          </View>
        );
      }}
    />
  );
}
