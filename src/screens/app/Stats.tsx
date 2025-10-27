import { useState, useEffect } from 'react';
import { Image, FlatList } from 'react-native';
import { useUserStore } from '~/data/store/userStore';
import { getWeekMeasurementRows } from '~/data/supabase/clientsHandler';

import { useNavigation } from '@react-navigation/native';
import { TouchableOpacity, View, Text } from 'react-native';
import HeaderText from '~/components/Layout/HeaderText';
import StickyHeader from '~/components/Layout/StickyHeader';
import __base from '~/assets/styles/base';
import BottomTabs from '~/components/Layout/BottomTabs';
import Checklist from '~/components/Blocks/Checklist';
import InfoBox from '~/components/Layout/InfoBox';
import SelectWeek from '~/components/Blocks/SelectWeek';
import dayjs from 'dayjs';
import MeasurementsInline from '~/components/Blocks/Measurement';
import WeeklyMeasurementBars from '~/components/Blocks/WeeklyMeasurements';
import HeaderClose from '~/components/Layout/HeaderClose';

export default function Stats() {
  const navigation = useNavigation<any>();
  const infoBoxItems = {
    box1: { icon: 'Weight',   value: '98kg', label: 'Weight' },
    box2: { icon: 'Birthday', value: '16%',  label: 'Bodyfat' },
  };
  const todayISO = dayjs().format('YYYY-MM-DD');
  const [weekStart, setWeekStart] = useState(dayjs().startOf('week').add(1, 'day').format('YYYY-MM-DD'));
  const [selectedDate, setSelectedDate] = useState(todayISO);
  const clientId = useUserStore((s)=>s.client?.id);
  const [weekRows, setWeekRows] = useState<Record<string, any>>({});

  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!clientId) return;
    (async () => {
      const rows = await getWeekMeasurementRows(clientId, weekStart);
      const byDate: Record<string, any> = {};
      rows.forEach(r => { byDate[r.date.slice(0,10)] = r; });
      setWeekRows(byDate);
    })();
  }, [clientId, weekStart]);

  const days = Array.from({length:7}, (_,i) => dayjs(weekStart).add(i,'day').format('YYYY-MM-DD'));

  const start = dayjs(weekStart);
  const end   = start.add(6, 'day');
  const title = `Edit ${dayjs(selectedDate || start).format('ddd D MMM')}`;
  const subtitle = `${start.format('MMM D')} – ${end.format('MMM D, YYYY')}`;
  
  if(open){
    return (<StickyHeader title="Home" noSticky={true} padded={false}>
      <View style={[__base.paddingHorizontal, { paddingBottom: 0, paddingTop: 70 }]}>
        <HeaderClose
          onClose={() => setOpen(false)}
          title={title}
          subtitle={subtitle}
        />
      </View>
      <MeasurementsInline dateISO={selectedDate} />
    </StickyHeader>)
  }


  return (
    <>
      <StickyHeader title="Home" noSticky={true} padded={false}>
        <View style={[__base.paddingHorizontal, { paddingBottom: 0, paddingTop: 70 }]}>
          <HeaderText title={`Your Progress, Clearly Tracked`} subtitle="From body stats to daily wins"/>
        </View>
        <View>
          <InfoBox box1={infoBoxItems.box1} box2={infoBoxItems.box2} />
          <WeeklyMeasurementBars
              weekStartISO={weekStart}
              selectedDateISO={selectedDate}
              onSelectDate={setSelectedDate}
            />
          <SelectWeek
            weekStartISO={weekStart}
            selectedDateISO={selectedDate}
            onSelectDate={setSelectedDate}
            onChangeWeek={(delta) =>
              setWeekStart(dayjs(weekStart).add(delta, 'week').format('YYYY-MM-DD'))
            }
            maxDateISO={todayISO}
          />
          <View style={[__base.paddingHorizontal, { paddingBottom: 0, paddingTop: 10, marginBottom: 100 }]}>
            <View style={{ paddingHorizontal:0, paddingTop:10, rowGap:5, marginBottom: 30 }}>
              {days.map((iso) => {
                const r = weekRows[iso];
                return (
                  <TouchableOpacity
                    key={iso}
                    onPress={() => { setSelectedDate(iso); setOpen(true); }}
                    style={{
                      padding:10, borderWidth:1, borderColor:'#333', borderRadius:0,
                      flexDirection:'row', alignItems:'flex-start', columnGap:10,
                      paddingVertical: 10
                    }}
                  >
                    <View style={{ flex:1 }}>
                      <Text style={{ color:'#fff', fontWeight:'600' }}>
                        {dayjs(iso).format('ddd D MMM')}
                      </Text>
                      {(r?.weight || r?.bodyfat) ? (
                        <Text style={{ color:'#bbb', marginTop:2 }}>
                          {r?.weight ? `${r.weight}kg` : ''}{r?.weight && r?.bodyfat ? ' · ' : ''}{r?.bodyfat ? `${r.bodyfat}%` : ''}
                        </Text>
                      ) : null}
                    </View>
                    <View style={{ flexDirection:'row', columnGap:5 }}>
                      {r?.picture_front && <Image source={{uri:r.picture_front}} style={{width:28,height:28,borderRadius:0}} />}
                      {r?.picture_side  && <Image source={{uri:r.picture_side }} style={{width:28,height:28,borderRadius:0}} />}
                      {r?.picture_back  && <Image source={{uri:r.picture_back }} style={{width:28,height:28,borderRadius:0}} />}
                    </View>

                    <Text style={{ color:'#888' }}>Edit</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <Checklist date={selectedDate} />
          </View>
        </View>
      </StickyHeader>
      <BottomTabs />
    </>
  );
}
