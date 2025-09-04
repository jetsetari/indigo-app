import { View, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import HeaderImage from '~/components/Layout/HeaderImage';
import StickyHeader from '~/components/Layout/StickyHeader';
import __base from '~/assets/styles/base';
import HeaderText from '~/components/Layout/HeaderText';
import BottomTabs from '~/components/Layout/BottomTabs';
import CustomIcon from '~/components/Layout/CustomIcon';
import { styles } from '~/assets/styles/screens/StartStyles';
import { Badge } from '~/components/Layout/Badge';
import SettingsButton from '~/components/Buttons/SettingsButton';
import { useUserStore } from '~/data/store/userStore';
import HeaderWithExtra from '~/components/Layout/HeaderWithExtra';

export default function Stats() {
  const navigation = useNavigation<any>();
  const client = useUserStore(s => s.client);
  const displayName = client?.first_name ?? '';
  const avatarUrl = client?.avatar_url ?? undefined;

  return (
    <>
      <StickyHeader title="Home" noSticky={true}>
        <HeaderWithExtra title={client?.first_name+' '+client?.last_name} subtitle="Member since August 2025" image={avatarUrl} />


        {/* Achievements */}
        {/*<View style={styles.section}>
          <View style={styles.rowBetween}>
            <Text style={[__base.textBold]}>Latest Achievements</Text>
            <TouchableOpacity><Text style={__base.link}>See All</Text></TouchableOpacity>
          </View>
          <View style={__base.infoBox}>
            <View style={__base.infoBoxColumn}>
              <View style={__base.infoBoxIcon}>
                <Badge size={60} border="#F97316" background="#EA580C" icon="heart" />
              </View>
              <Text style={__base.infoBoxValue}>Consistency</Text>
              <Text style={__base.infoBoxLabel}>Level 1</Text>
            </View>
            <View style={__base.infoBoxColumn}>
              <View style={__base.infoBoxIcon}>
                <Badge size={60} border="#A855F7" background="#9333EA" icon="activity" />
              </View>
              <Text style={__base.infoBoxValue}>Progress</Text>
              <Text style={__base.infoBoxLabel}>Level 1</Text>
            </View>
            <View style={__base.infoBoxColumn}>
              <View style={__base.infoBoxIcon}>
                <Badge size={60} border="#84CC16" background="#65A30D" icon="heart" />
              </View>
              <Text style={__base.infoBoxValue}>Workout</Text>
              <Text style={__base.infoBoxLabel}>Level 1</Text>
            </View>
          </View>
        </View>*/}
         {/* General Settings */}
        <View style={styles.section}>
          <Text style={[__base.textBold, { marginBottom: 10 }]}>General Settings</Text>
          <SettingsButton
            icon="user"
            title="Profile Settings"
            onPress={() => alert('ProfileSettings')}
          />
          <SettingsButton
            icon="smartphone"
            title="Apple Health"
            onPress={() => alert('AppleHealth')}
          />
          <SettingsButton
            icon="credit-card"
            title="Subscription & Billing"
            onPress={() => alert('Billing')}
          />
          <SettingsButton
            icon="sliders"
            title="Units & Metrics"
            onPress={() => alert('UnitsMetrics')}
          />
        </View>

        {/* Notifications */}
        <View style={styles.section}>
          <Text style={[__base.textBold, { marginBottom: 10 }]}>Notifications</Text>
          <SettingsButton
            icon="bell"
            title="General Notification"
            onPress={() => alert('GeneralNotification')}
          />
          <SettingsButton
            icon="mail"
            title="Email Notification"
            onPress={() => alert('EmailNotification')}
          />
        </View>

        {/* Security & Privacy */}
        <View style={styles.section}>
          <Text style={[__base.textBold, { marginBottom: 10 }]}>Security & Privacy</Text>
          <SettingsButton
            icon="lock"
            title="Change Password"
            onPress={() => alert('ChangePassword')}
          />
        </View>

        {/* Danger Zone */}
        <View style={styles.section}>
          <Text style={[__base.textBold, { marginBottom: 10 }]}>Danger Zone</Text>
          <SettingsButton
            icon="trash-2"
            title="Delete Account"
            onPress={() => alert('DeleteAccount')}
          />
        </View>
      </StickyHeader>
      <BottomTabs />
    </>
  );
}
