import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, Alert, ActivityIndicator } from 'react-native';
import { useForm } from 'react-hook-form';
import { useNavigation } from '@react-navigation/native';
import { FormInput, FormDropdown, FormDatePicker, FormImageUpload } from '~/components/Form';
import CustomButton from '~/components/Buttons/CustomButton';
import SettingsButton from '~/components/Buttons/SettingsButton';
import { useUserStore } from '~/data/store/userStore';
import { updateClient, fetchClientByEmail, fetchClientById } from '~/data/supabase/clientsHandler';
import { deleteAccount } from '~/data/supabase/authHandler';
import { toastSuccess, toastError } from '~/data/helpers/toast';
import { genderOptions } from '~/data/content/options';
import { toDateOnly } from '~/data/helpers';
import __base from '~/assets/styles/base';
import { styles } from '~/assets/styles/screens/StartStyles';

type Values = {
  firstName: string;
  lastName: string;
  gender: string;
  dob: string | Date | null;
  avatarUrl: string | null;
};

function parseDob(raw: unknown): Date | null {
  if (!raw) return null;
  if (raw instanceof Date && !Number.isNaN(raw.getTime())) return raw;
  const dateStr = typeof raw === 'string' ? raw : String(raw);
  if (dateStr.match(/^\d{4}-\d{2}-\d{2}/)) {
    const parsed = new Date(dateStr.slice(0, 10) + 'T00:00:00');
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }
  return null;
}

export default function ProfileSettings({ onSaved }: { onSaved?: () => void }) {
  const client = useUserStore(s => s.client);
  const navigation = useNavigation<any>();
  const [deleting, setDeleting] = useState(false);

  const dobDate = useMemo(() => parseDob(client?.dob), [client?.dob]);

  const formValues = useMemo<Values>(() => ({
    firstName: client?.firstName || '',
    lastName:  client?.lastName  || '',
    gender:    client?.gender    || '',
    dob:       dobDate,
    avatarUrl: client?.avatarUrl || null,
  }), [client?.firstName, client?.lastName, client?.gender, dobDate, client?.avatarUrl]);

  const { control, handleSubmit, reset } = useForm<Values>({
    defaultValues: formValues,
    mode: 'onSubmit',
  });

  useEffect(() => {
    reset(formValues);
  }, [formValues, reset]);

  useEffect(() => {
    const current = useUserStore.getState().client;
    const id = current?.id;
    const email = current?.email;
    if (!id && !email) return;
    const load = email ? fetchClientByEmail(email) : fetchClientById(String(id));
    load.then((fresh) => {
      if (!fresh) return;
      const latest = useUserStore.getState().client;
      useUserStore.getState().setClient(latest ? { ...latest, ...fresh } : fresh);
    }).catch(() => {});
  }, []);

  const onSubmit = useCallback(handleSubmit(async (v) => {
    try {
      await updateClient({
        firstName: v.firstName?.trim() || null,
        lastName:  v.lastName?.trim()  || null,
        gender:    v.gender || null,
        dob:       toDateOnly(v.dob as any),
        avatar_url: v.avatarUrl || null,
      });
      toastSuccess('Saved', 'Profile updated.');
      onSaved?.();
    } catch (e:any) {
      toastError('Save failed', e?.message || 'Try again.');
    }
  }), [handleSubmit, onSaved]);

  const confirmDeleteAccount = () => {
    Alert.alert(
      'Delete account?',
      'This permanently deletes your account and all workout data. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Account',
          style: 'destructive',
          onPress: async () => {
            try {
              setDeleting(true);
              await deleteAccount(navigation);
            } catch {
              // toast already shown in deleteAccount
            } finally {
              setDeleting(false);
            }
          },
        },
      ],
    );
  };

  if (deleting) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80 }}>
        <ActivityIndicator size="large" color="#FFF" />
        <Text style={[__base.text, { marginTop: 16 }]}>Deleting account…</Text>
      </View>
    );
  }

  return (
    <View style={{ paddingBottom: 100 }}>
      <View style={{ alignItems: 'center', marginBottom: 28 }}>
        <FormImageUpload
          control={control}
          name="avatarUrl"
          filepath="clients"
          variant="square"
          size={140}
          source="both"
          placeholder="logo"
          label="Profile picture"
        />
      </View>
      <FormInput control={control} name="firstName" label="First name" required />
      <FormInput control={control} name="lastName"  label="Last name" required />
      <FormDropdown control={control} name="gender" label="Gender" options={genderOptions} />
      <FormDatePicker control={control} name="dob" label="Date of birth" />
      <CustomButton title="Save" backgroundColor="#FFF" textColor="#000" borderColor="#FFF" onPress={onSubmit} />

      <View style={[styles.section, { marginTop: 28 }]}>
        <Text style={[__base.textBold, { marginBottom: 10 }]}>Danger Zone</Text>
        <SettingsButton icon="trash-2" title="Delete Account" tone="danger" onPress={confirmDeleteAccount} />
      </View>
    </View>
  );
}
