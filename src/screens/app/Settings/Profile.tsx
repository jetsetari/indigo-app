import React, { useCallback, useMemo } from 'react';
import { View } from 'react-native';
import { useForm } from 'react-hook-form';
import { FormInput, FormDropdown, FormDatePicker, FormImageUpload } from '~/components/Form';
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
  avatarUrl: string | null;
};

export default function ProfileSettings() {
  const client = useUserStore(s => s.client);
  
  // Convert dob string to Date object if it exists
  const dobDate = useMemo(() => {
    if (!client?.dob) return null;
    const dob = client.dob as any;
    if (dob instanceof Date && !Number.isNaN(dob.getTime())) return dob;
    // Handle string dates (ISO format: YYYY-MM-DD)
    const dateStr = typeof dob === 'string' ? dob : String(dob);
    if (dateStr.match(/^\d{4}-\d{2}-\d{2}/)) {
      const parsed = new Date(dateStr.slice(0, 10) + 'T00:00:00');
      return Number.isNaN(parsed.getTime()) ? null : parsed;
    }
    return null;
  }, [client?.dob]);

  const { control, handleSubmit } = useForm<Values>({
    defaultValues: {
      firstName: client?.firstName || '',
      lastName:  client?.lastName  || '',
      gender:    client?.gender    || '',
      dob:       dobDate as any,
      avatarUrl: client?.avatarUrl || null,
    },
    mode: 'onSubmit',
  });

  const onSubmit = useCallback(handleSubmit(async (v) => {
    try {
      const dob =
        v.dob instanceof Date
          ? v.dob.toISOString().slice(0, 10)
          : typeof v.dob === 'string' && v.dob
            ? v.dob.slice(0, 10)
            : null;

      await updateClient({
        firstName: v.firstName?.trim() || null,
        lastName:  v.lastName?.trim()  || null,
        gender:    v.gender || null,
        dob,
        avatar_url: v.avatarUrl || null,
      });
      toastSuccess('Saved', 'Profile updated.');
    } catch (e:any) {
      toastError('Save failed', e?.message || 'Try again.');
    }
  }), [handleSubmit]);

  return (
    <View style={{ paddingBottom: 100 }}>
      <FormImageUpload 
        control={control} 
        name="avatarUrl" 
        filepath="clients" 
        variant="square" 
        size={75} 
        source="both" 
        label="Profile picture" 
      />
      <FormInput control={control} name="firstName" label="First name" required />
      <FormInput control={control} name="lastName"  label="Last name" required />
      <FormDropdown control={control} name="gender" label="Gender" options={genderOptions} />
      <FormDatePicker control={control} name="dob" label="Date of birth" />
      <CustomButton title="Save" backgroundColor="#000" textColor="#FFF" onPress={onSubmit} />
    </View>
  );
}
