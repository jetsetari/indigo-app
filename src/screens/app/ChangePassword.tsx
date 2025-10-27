import React, { useState } from 'react';
import { View, TextInput } from 'react-native';
import StickyHeader from '~/components/Layout/StickyHeader';
import HeaderWithExtra from '~/components/Layout/HeaderWithExtra';
import CustomButton from '~/components/Buttons/CustomButton';
import { toastError, toastSuccess } from '~/data/helpers/toast';
import { updatePassword } from '~/data/supabase/authHandler'; // implement there
import { useNavigation } from '@react-navigation/native';
import { useUserStore } from '~/data/store/userStore';

export default function ChangePassword() {
  const client = useUserStore(s => s.client);
  const navigation = useNavigation<any>();
  const [pwd, setPwd] = useState('');
  const [pwd2, setPwd2] = useState('');
  const [busy, setBusy] = useState(false);
  const avatarUrl = client?.avatarUrl ?? undefined;

  const save = async () => {
    try {
      if (!pwd || pwd.length < 8) throw new Error('Password must be at least 8 characters.');
      if (pwd !== pwd2) throw new Error('Passwords do not match.');
      setBusy(true);
      await updatePassword(pwd);
      toastSuccess('Updated', 'Your password has been changed.');
      navigation.goBack();
    } catch (e:any) {
      toastError('Could not change password', e.message ?? 'Try again.');
    } finally { setBusy(false); }
  };

  return (
    <StickyHeader title="Change Password">
      <HeaderWithExtra title="Update Password" subtitle="Change your password" />
      <View style={{ gap: 12 }}>
        <TextInput secureTextEntry placeholder="New password" onChangeText={setPwd} />
        <TextInput secureTextEntry placeholder="Repeat new password" onChangeText={setPwd2} />
        <CustomButton title={busy ? 'Saving…' : 'Save & Close'} backgroundColor="#000" textColor="#FFF" onPress={save} disabled={busy} />
      </View>
    </StickyHeader>
  );
}
