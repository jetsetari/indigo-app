import { View, Text, TouchableOpacity, StyleSheet, Platform, Modal } from 'react-native';
import { useCallback, useEffect, useRef, useState, type ReactElement } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import StickyHeader from '~/components/Layout/StickyHeader';
import __base from '~/assets/styles/base';
import BottomTabs from '~/components/Layout/BottomTabs';
import { styles } from '~/assets/styles/screens/StartStyles';
import SettingsButton from '~/components/Buttons/SettingsButton';
import { useUserStore } from '~/data/store/userStore';
import HeaderWithExtra from '~/components/Layout/HeaderWithExtra';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { logout } from '~/data/supabase/authHandler';
import { fetchClientByEmail, fetchClientById, getLatestMeasurement, getRecentMeasurements, type WeekRow } from '~/data/supabase/clientsHandler';
import { formatWeight } from '~/data/helpers/units';
import { formatDisplayDateWeekday, localTodayISO } from '~/data/helpers/date';
import HeaderClose from '~/components/Layout/HeaderClose';
import InfoBox from '~/components/Layout/InfoBox';
import MeasurementsInline from '~/components/Blocks/Measurement';
import { styles as datePickerStyles } from '~/components/Form/DatePicker/DatePickerStyle';

import ProfileSettings from './Settings/Profile';
import Metrics from './Settings/Metrics';
import Goals from './Settings/Goals';
import Level from './Settings/Level';

import dayjs from 'dayjs';

function isoToDate(iso: string) {
  const parsed = dayjs(`${iso.slice(0, 10)}T12:00:00`);
  return parsed.isValid() ? parsed.toDate() : new Date();
}

function membershipDays(iso?: string | null) {
  if (!iso) return null;
  const start = dayjs(iso);
  if (!start.isValid()) return null;
  return Math.max(1, dayjs().startOf('day').diff(start.startOf('day'), 'day'));
}

export default function Profile() {
  const client = useUserStore(s => s.client);
  const user = useUserStore(s => s.user);
  const insets = useSafeAreaInsets();
  const displayName = (client?.firstName+' '+client?.lastName) || '';
  const avatarUrl = client?.avatarUrl ?? undefined;
  const memberDays = membershipDays(client?.createdAt ?? user?.created_at);
  const backfilled = useRef(false);

  useEffect(() => {
    if (backfilled.current || client?.createdAt) return;
    const email = client?.email ?? user?.email;
    const id = client?.id;
    if (!email && !id) return;
    backfilled.current = true;
    const load = email ? fetchClientByEmail(email) : fetchClientById(String(id));
    load.then((fresh) => {
      if (!fresh?.createdAt) return;
      const current = useUserStore.getState().client;
      useUserStore.getState().setClient(current ? { ...current, ...fresh } : fresh);
    }).catch(() => {});
  }, [client?.createdAt, client?.email, client?.id, user?.email]);
  const navigation = useNavigation<any>();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState<string>('Settings');
  const [openChild, setOpenChild] = useState<ReactElement>(<></>);
  const [logDate, setLogDate] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerValue, setPickerValue] = useState(new Date());
  const [latest, setLatest] = useState<{ weight: number | null; bodyfat: number | null } | null>(null);
  const [recentLogs, setRecentLogs] = useState<WeekRow[]>([]);

  const loadBody = useCallback(async () => {
    if (!client?.id) return;
    try {
      const [row, recent] = await Promise.all([
        getLatestMeasurement(client.id),
        getRecentMeasurements(client.id, 8),
      ]);
      setLatest(row);
      setRecentLogs(recent);
    } catch {
      setLatest(null);
      setRecentLogs([]);
    }
  }, [client?.id]);

  useFocusEffect(
    useCallback(() => {
      if (!client?.id || open || logDate) return;
      let alive = true;
      (async () => {
        try {
          const [row, recent] = await Promise.all([
            getLatestMeasurement(client.id),
            getRecentMeasurements(client.id, 8),
          ]);
          if (alive) {
            setLatest(row);
            setRecentLogs(recent);
          }
        } catch {
          if (alive) {
            setLatest(null);
            setRecentLogs([]);
          }
        }
      })();
      return () => { alive = false; };
    }, [client?.id, open, logDate])
  );

  const weightValue = formatWeight(latest?.weight ?? client?.lastWeight, client?.metricSystem) || '—';
  const bodyfatValue = latest?.bodyfat != null ? `${latest.bodyfat}%` : '—';
  const infoBoxItems = {
    box1: { icon: 'Weight' as const, value: weightValue, label: 'Weight' },
    box2: { icon: 'Birthday' as const, value: bodyfatValue, label: 'Bodyfat' },
  };

  const closeLog = () => {
    setLogDate(null);
    loadBody();
  };

  const shiftLogDate = (delta: -1 | 1) => {
    if (!logDate) return;
    const next = dayjs(logDate).add(delta, 'day').format('YYYY-MM-DD');
    if (next > localTodayISO()) return;
    setLogDate(next);
  };

  const applyPickedDate = (d: Date) => {
    const iso = dayjs(d).format('YYYY-MM-DD');
    const today = localTodayISO();
    setLogDate(iso > today ? today : iso);
  };

  const openDatePicker = () => {
    if (!logDate) return;
    setPickerValue(isoToDate(logDate));
    setPickerOpen(true);
  };

  const onPickerChange = (e: DateTimePickerEvent, d?: Date) => {
    if (e.type === 'dismissed') {
      setPickerOpen(false);
      return;
    }
    if (e.type !== 'set' || !d) return;
    if (Platform.OS === 'ios') {
      setPickerValue(d);
      return;
    }
    applyPickedDate(d);
    setPickerOpen(false);
  };

  const closeDatePicker = () => {
    applyPickedDate(pickerValue);
    setPickerOpen(false);
  };

  const openSettings = (type: string) => {
    switch (type) {
      case 'profile': setTitle('Profile'); setOpenChild(<ProfileSettings onSaved={() => setOpen(false)} />); break;
      case 'metrics': setTitle('Metrics'); setOpenChild(<Metrics />); break;
      case 'goals':   setTitle('Goals');   setOpenChild(<Goals />); break;
      case 'level':   setTitle('Level');   setOpenChild(<Level />); break;
    }
    setOpen(true);
  };

  if (logDate) {
    const atToday = logDate >= localTodayISO();
    const isIOS = Platform.OS === 'ios';
    return (
      <StickyHeader title="Log" noSticky padded={false}>
        <View style={[profileStyles.logWrap, { paddingBottom: Math.max(insets.bottom, 16) + 40 }]}>
          <HeaderClose
            onClose={closeLog}
            title="Log"
            subtitle="Weight & bodyfat"
          />
          <View style={profileStyles.dateNav}>
            <TouchableOpacity onPress={() => shiftLogDate(-1)} activeOpacity={0.8} style={profileStyles.dateBtn} hitSlop={8}>
              <Feather name="chevron-left" size={18} color="#FFF" />
            </TouchableOpacity>
            <TouchableOpacity onPress={openDatePicker} activeOpacity={0.8} style={profileStyles.dateLabelBtn}>
              <Text style={profileStyles.dateNavLabel}>{formatDisplayDateWeekday(logDate)}</Text>
              <Feather name="calendar" size={16} color="#FFF" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => shiftLogDate(1)}
              activeOpacity={0.8}
              disabled={atToday}
              style={[profileStyles.dateBtn, atToday && { opacity: 0.25 }]}
              hitSlop={8}
            >
              <Feather name="chevron-right" size={18} color="#FFF" />
            </TouchableOpacity>
          </View>
          <MeasurementsInline dateISO={logDate} onSaved={closeLog} />
        </View>
        {!isIOS && pickerOpen && (
          <DateTimePicker
            mode="date"
            display="calendar"
            value={pickerValue}
            onChange={onPickerChange}
            maximumDate={isoToDate(localTodayISO())}
          />
        )}
        {isIOS && (
          <Modal visible={pickerOpen} transparent animationType="none" onRequestClose={() => setPickerOpen(false)}>
            <View style={datePickerStyles.modalOverlay}>
              <View style={datePickerStyles.modalContainer}>
                <DateTimePicker
                  mode="date"
                  display="spinner"
                  value={pickerValue}
                  onChange={onPickerChange}
                  maximumDate={isoToDate(localTodayISO())}
                />
                <TouchableOpacity style={datePickerStyles.modalClose} onPress={closeDatePicker}>
                  <Text style={datePickerStyles.modalCloseText}>Done</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        )}
      </StickyHeader>
    );
  }

  if (open) {
    return (
      <StickyHeader title="Settings" noSticky={true} padded={false}>
        <View style={[__base.paddingHorizontal, { paddingBottom: 0, paddingTop: 70 }]}>
          <HeaderClose onClose={() => setOpen(false)} title={title} subtitle={"General Settings"}/>
          { openChild }
        </View>
      </StickyHeader>
    );
  }

  return (
    <>
      <StickyHeader title="Home" noSticky={true}>
        <HeaderWithExtra title={`${displayName}`} subtitle={memberDays != null ? `Member for ${memberDays} ${memberDays === 1 ? 'day' : 'days'}` : ''} image={avatarUrl} />
        <InfoBox
          box1={infoBoxItems.box1}
          box2={infoBoxItems.box2}
          onLogPress={() => setLogDate(localTodayISO())}
        />

        {recentLogs.length > 0 && (
          <View style={styles.section}>
            <Text style={[__base.textBold, { marginBottom: 10 }]}>Recent logs</Text>
            {recentLogs.map((row) => {
              const iso = row.date.slice(0, 10);
              const weight = row.weight != null ? formatWeight(row.weight, client?.metricSystem) : '';
              const bodyfat = row.bodyfat != null ? `${row.bodyfat}%` : '';
              const summary = [weight, bodyfat].filter(Boolean).join(' · ');
              return (
                <TouchableOpacity
                  key={iso}
                  onPress={() => setLogDate(iso)}
                  style={profileStyles.logRow}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={profileStyles.logDate}>{formatDisplayDateWeekday(iso)}</Text>
                    {!!summary && <Text style={profileStyles.logMeta}>{summary}</Text>}
                  </View>
                  <Text style={profileStyles.logEdit}>Edit</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* General Settings */}
        <View style={styles.section}>
          <Text style={[__base.textBold, { marginBottom: 10 }]}>General Settings</Text>
          <SettingsButton icon="user" title="Profile Settings" onPress={() => openSettings('profile')} />
          <SettingsButton icon="cloud-lightning" title="Metrics" onPress={() => openSettings('metrics')} />
          <SettingsButton icon="feather" title="Goals" onPress={() => openSettings('goals')} />
          <SettingsButton icon="flag" title="Level" onPress={() => openSettings('level')} />
        </View>

        {/* Security & Privacy */}
        <View style={styles.section}>
          <Text style={[__base.textBold, { marginBottom: 10 }]}>Account</Text>
          <SettingsButton icon="log-out" title="Log out" tone="danger" onPress={() => logout(navigation)} />
        </View>
      </StickyHeader>
      <BottomTabs />
    </>
  );
}

const profileStyles = StyleSheet.create({
  logWrap: {
    paddingHorizontal: 20,
    paddingTop: 70,
  },
  dateNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  dateBtn: {
    width: 30,
    height: 30,
    borderWidth: 1,
    borderColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateNavLabel: {
    color: '#FFF',
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
  dateLabelBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  logRow: {
    padding: 10,
    borderWidth: 1,
    borderColor: '#333',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  logDate: {
    color: '#fff',
    fontWeight: '600',
  },
  logMeta: {
    color: '#bbb',
    marginTop: 2,
    fontSize: 13,
  },
  logEdit: {
    color: '#888',
  },
});
