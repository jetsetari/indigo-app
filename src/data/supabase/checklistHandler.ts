import { supabase } from './connection';

export type ChecklistItem = {
  id: number;
  emoji: string;
  name: string;
  start_date: string; // 'YYYY-MM-DD'
};

export async function fetchChecklistItems(clientId: number, isoDate: string): Promise<ChecklistItem[]> {
  const { data, error } = await supabase
    .from('client_checklist')
    .select('id,emoji,name,start_date')
    .eq('client_id', clientId)
    .lte('start_date', isoDate)
    .order('start_date', { ascending: true })
    .order('name', { ascending: true });

  if (error) throw error;
  return (data ?? []) as ChecklistItem[];
}

export async function fetchChecklistState(clientId: number, isoDate: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('client_measurements')
    .select('checklist')
    .eq('client_id', clientId)
    .eq('date', isoDate)
    .order('id', { ascending: true })
    .limit(1);

  if (error) throw error;
  return (data?.[0]?.checklist ?? []) as string[];
}

export async function toggleChecklistCell(
  clientId: number,
  isoDate: string, 
  taskId: number,
  checked: boolean
) {
  const { error } = await supabase.rpc('toggle_checklist_cell', {
    p_client_id: clientId,
    p_date: isoDate,
    p_task_id: String(taskId),
    p_checked: checked,
  });
  if (error) throw error;
}
