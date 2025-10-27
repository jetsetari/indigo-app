import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useUserStore } from '~/data/store/userStore';
import { fetchChecklistItems, fetchChecklistState, toggleChecklistCell, type ChecklistItem } from '~/data/supabase/checklistHandler';
import { toastError } from '~/data/helpers/toast';
import { styles } from './ChecklistStyle';

type Props = {
  /** Date to show. Defaults to today. Accepts Date or 'YYYY-MM-DD'. */
  date?: Date | string;
};

function toIso(d?: Date | string): string {
  if (!d) return new Date().toISOString().slice(0, 10);
  if (typeof d === 'string') return d.slice(0, 10);
  return d.toISOString().slice(0, 10);
}
function isToday(iso: string): boolean {
  return iso === new Date().toISOString().slice(0, 10);
}
function ddmm(iso: string): string {
  const [y, m, d] = iso.split('-');
  return `${d}-${m}`;
}

export default function Checklist({ date }: Props) {
  const isoDate = useMemo(() => toIso(date), [date]);
  const clientId = useUserStore((s) => s.client?.id);

  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      if (!clientId) return;
      try {
        setLoading(true);
        const [list, state] = await Promise.all([
          fetchChecklistItems(clientId, isoDate),
          fetchChecklistState(clientId, isoDate),
        ]);

        if (!alive) return;
        setItems(list);
        setChecked(new Set(state.map(String)));
      } catch (e: any) {
        if (!alive) return;
        toastError('Error', e?.message ?? 'Failed to load checklist.');
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [clientId, isoDate]);

  const toggle = async (item: ChecklistItem) => {
    if (!clientId) return;
    const idStr = String(item.id);
    const nextChecked = !checked.has(idStr);

    // optimistic update
    const snapshot = new Set(checked);
    const draft = new Set(checked);
    if (nextChecked) draft.add(idStr); else draft.delete(idStr);
    setChecked(draft);

    try {
      await toggleChecklistCell(clientId, isoDate, item.id, nextChecked);
    } catch (e: any) {
      // revert on error
      setChecked(snapshot);
      toastError('Error', e?.message ?? 'Could not update checklist.');
    }
  };

  const title = isToday(isoDate) ? "Today's checklist" : `Checklist ${ddmm(isoDate)}`;

  if (!clientId) return null;
  if (loading) {
    return (
      <View style={styles.section}>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.card}><Text style={styles.itemLabel}>Loading…</Text></View>
      </View>
    );
  }

  if (!items.length) {
    return (
      <View style={styles.section}>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.card}><Text style={styles.itemLabel}>No tasks for this day</Text></View>
      </View>
    );
  }

  return (
    <View style={styles.section}>
      <Text style={styles.title}>{title}</Text>
      {items.map((it) => {
        const isOn = checked.has(String(it.id));
        return (
          <TouchableOpacity
            key={it.id}
            style={[styles.card, isOn && styles.cardOn]}
            activeOpacity={0.8}
            onPress={() => toggle(it)}
          >
            <Text style={styles.emoji}>{it.emoji ?? '•'}</Text>
            <Text style={styles.itemLabel}>{it.name}</Text>
            <View style={[styles.box, isOn && styles.boxOn]}>
              {isOn && <Text style={styles.tick}>✓</Text>}
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}


