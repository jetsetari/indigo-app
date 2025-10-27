import React, { useEffect, useMemo, useState } from 'react';
import { View, TouchableOpacity } from 'react-native';
import { getWeekMeasurements } from '~/data/supabase/clientsHandler';
import { useUserStore } from '~/data/store/userStore';


type Props = {
  weekStartISO: string;
  selectedDateISO: string;
  onSelectDate: (iso: string) => void;
};

export default function WeeklyMeasurementBars({ weekStartISO, selectedDateISO, onSelectDate }: Props) {
  const client = useUserStore(s => s.client);
  const [data, setData] = useState<{date:string;weight:number|null}[]>([]);

  useEffect(() => {
    if (!client?.id) return;
    getWeekMeasurements(client.id, weekStartISO).then(setData).catch(() => setData([]));
  }, [client?.id, weekStartISO]);

  const { min, max } = useMemo(() => {
    const vals = data.map(d => d.weight ?? 0).filter(n => n > 0);
    const mi = Math.min(...vals, 0);
    const ma = Math.max(...vals, 1);
    return { min: mi, max: ma === mi ? mi + 1 : ma };
  }, [data]);

  const H = 120;
  const [w, setW] = useState(0);
  const N = data.length || 7;
  const GAP = 5;                                // desired gap in px
  const BAR_W = Math.max(6, (w - GAP * (N - 1)) / N); // fill width, rest is gap

  return (
    <View style={{ paddingHorizontal:30, paddingTop:12, paddingBottom:4 }}>
      <View
        style={{ height: H, flexDirection: 'row', alignItems: 'flex-end' }}
        onLayout={e => setW(e.nativeEvent.layout.width)}
      >
        {data.map((d, i) => {
          const val = d.weight ?? min;
          const h = ((val - min) / (max - min)) * (H - 8);
          const active = d.date === selectedDateISO;
          return (
            <TouchableOpacity
              key={d.date}
              onPress={() => onSelectDate(d.date)}
              activeOpacity={0.8}
              style={{
                width: BAR_W,
                height: H,
                alignItems: 'center',
                justifyContent: 'flex-end',
                marginRight: i < N - 1 ? GAP : 0,     // gap between bars
              }}
            >
              <View
                style={{
                  width: '100%',
                  height: Math.max(6, h),
                  backgroundColor: active ? '#FFFFFF' : '#9E9E9E',
                  borderRadius: 0,
                }}
              />
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}
