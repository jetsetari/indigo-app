import React, { useCallback } from 'react';
import { View } from 'react-native';
import { useForm } from 'react-hook-form';
import { FormInput, FormDropdown, FormDatePicker } from '~/components/Form';
import CustomButton from '~/components/Buttons/CustomButton';
import { useUserStore } from '~/data/store/userStore';
import { updateClient } from '~/data/supabase/clientsHandler';
import { toastSuccess, toastError } from '~/data/helpers/toast';
import { genderOptions } from '~/data/content/options';

type Values = {
  firstName: string;
  lastName: string;
  gender: string;
  dob: string | Date;
};

export default function ProfileSettings() {
  const client = useUserStore(s => s.client);
  const { control, handleSubmit } = useForm<Values>({
    defaultValues: {
      firstName: client?.firstName || '',
      lastName:  client?.lastName  || '',
      gender:    client?.gender    || '',
      dob:       client?.dob       || '',
    },
    mode: 'onSubmit',
  });

  const onSubmit = useCallback(handleSubmit(async (v) => {
    try {
      await updateClient({
        firstName: v.firstName?.trim() || null,
        lastName:  v.lastName?.trim()  || null,
        gender:    v.gender || null,
        dob:       v.dob || null,
      });
      toastSuccess('Saved', 'Profile updated.');
    } catch (e:any) {
      toastError('Save failed', e?.message || 'Try again.');
    }
  }), []);

  return (
    <View style={{ paddingBottom: 100 }}>
      <FormInput control={control} name="firstName" label="First name" required />
      <FormInput control={control} name="lastName"  label="Last name" required />
      <FormDropdown control={control} name="gender" label="Gender" options={genderOptions} />
      <FormDatePicker control={control} name="dob" label="Date of birth" />
      <CustomButton title="Save" backgroundColor="#000" textColor="#FFF" onPress={onSubmit} />
    </View>
  );
}
