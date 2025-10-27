import { View, Text } from 'react-native';
import { useState } from 'react';
import StickyHeader from '~/components/Layout/StickyHeader';
import __base from '~/assets/styles/base';
import BottomTabs from '~/components/Layout/BottomTabs';
import { styles } from '~/assets/styles/screens/StartStyles';
import SettingsButton from '~/components/Buttons/SettingsButton';
import { useUserStore } from '~/data/store/userStore';
import HeaderWithExtra from '~/components/Layout/HeaderWithExtra';
import { useNavigation } from '@react-navigation/native';
import { logout } from '~/data/supabase/authHandler';
import HeaderClose from '~/components/Layout/HeaderClose';


import ProfileSettings from './Settings/Profile';
import Metrics from './Settings/Metrics';
import EatingHabbits from './Settings/EatingHabbits';
import Goals from './Settings/Goals';
import Level from './Settings/Level';
import Supplements from './Settings/Supplements';

import dayjs from 'dayjs';

export default function Profile() {
  const client = useUserStore(s => s.client);
  const displayName = (client?.firstName+' '+client?.lastName) || '';
  const avatarUrl = client?.avatarUrl ?? undefined;
  const navigation = useNavigation<any>();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState<string>('Settings');
  const [openChild, setOpenChild] = useState<React.ReactElement>(<></>);

  const openSettings = (type: string) => {
    switch (type) {
      case 'profile':      setTitle('Profile');      setOpenChild(<ProfileSettings />); break;
      case 'metrics':      setTitle('Metrics');      setOpenChild(<Metrics />); break;
      case 'eatinghabbits':setTitle('Eating Habits');setOpenChild(<EatingHabbits />); break;
      case 'goals':        setTitle('Goals');        setOpenChild(<Goals />); break;
      case 'level':        setTitle('Level');        setOpenChild(<Level />); break;
      case 'supplements':  setTitle('Supplements');  setOpenChild(<Supplements />); break;
    }
    setOpen(true);
  };


  if(open){
    return (<StickyHeader title="Settings" noSticky={true} padded={false}>
      <View style={[__base.paddingHorizontal, { paddingBottom: 0, paddingTop: 70 }]}>
        <HeaderClose onClose={() => setOpen(false)} title={title} subtitle={"General Settings"}/>
        { openChild }
      </View>
    </StickyHeader>)
  }



  return (
    <>
      <StickyHeader title="Home" noSticky={true}>
        <HeaderWithExtra title={`${displayName}`} subtitle={`Member since ${dayjs(client?.createdAt).format('DD-MM hh:mm:ss')}`} image={avatarUrl} />

        {/* General Settings */}
        <View style={styles.section}>
          <Text style={[__base.textBold, { marginBottom: 10 }]}>General Settings</Text>
          <SettingsButton icon="user" title="Profile Settings" onPress={() => openSettings('profile')} />
          <SettingsButton icon="cloud-lightning" title="Metrics" onPress={() => openSettings('metrics')} />
          <SettingsButton icon="aperture" title="Eating Habits" onPress={() => openSettings('eatinghabbits')} />
          <SettingsButton icon="feather" title="Goals" onPress={() => openSettings('goals')} />
          <SettingsButton icon="flag" title="Level" onPress={() => openSettings('level')} />
          <SettingsButton icon="box" title="Supplements" onPress={() => openSettings('supplements')} />
        </View>

        {/* Security & Privacy */}
        <View style={styles.section}>
          <Text style={[__base.textBold, { marginBottom: 10 }]}>Account</Text>
          <SettingsButton icon="log-out" title="Log out" onPress={() => logout(navigation)} />
        </View>

        {/* Danger Zone */}
        <View style={styles.section}>
          <Text style={[__base.textBold, { marginBottom: 10 }]}>Danger Zone</Text>
          <SettingsButton icon="trash-2" title="Delete Account" onPress={() => alert('DeleteAccount')} />
        </View>
      </StickyHeader>
      <BottomTabs />
    </>
  );
}
