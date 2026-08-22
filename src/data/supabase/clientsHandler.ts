import { supabase } from '../supabase/connection';
import { camelToSnake, snakeToCamel } from '../helpers';
import { useUserStore } from '../store/userStore';
import { MeasurementRow } from '../types';
import { IntakeKey } from './authHandler';

export function prepareClientRow(input: any) {
  const {
    password, confirmPassword, agreed, terms, user_id, userId,
    ...rest
  } = input ?? {};

  const avatarUrl =
    (rest as any).avatarUrl ?? (rest as any).avatar_url ?? null;
  if (avatarUrl !== undefined) {
    (rest as any).avatarUrl = avatarUrl;         // ensure one source
  }

  if (rest?.dob instanceof Date) {
    rest.dob = rest.dob.toISOString().slice(0, 10);
  } else if (typeof rest?.dob === 'string' && /^\d{4}-\d{2}-\d{2}/.test(rest.dob)) {
    rest.dob = rest.dob.slice(0, 10);
  }
  const row = camelToSnake(rest);
  if ('avatar_url' in row || 'avatarUrl' in (input ?? {})) {
    row.avatar_url = avatarUrl ?? null;
  }

  return row;
}

function stripUndefined<T extends Record<string, any>>(obj: T): Partial<T> {
  return Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined)) as Partial<T>;
}

export async function fetchClientByEmail(email: string) {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('email', email)
    .order('id', { ascending: true })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new Error('Client not found');
  return snakeToCamel(data);
}

export async function fetchClientByUserId(userId: string) {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('user_id', userId)
    .order('id', { ascending: true })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new Error('Client not found');
  return snakeToCamel(data);
}

export async function fetchClientById(id: string) {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new Error('Client not found');
  return snakeToCamel(data);
}

/** Resolve which client row to update — prefer id, then email, then auth user. */
async function resolveClientIdentity(patch?: { email?: string; id?: string }) {
  const store = useUserStore.getState();
  const clientId = patch?.id ?? store.client?.id ?? undefined;
  let email =
    patch?.email ??
    store.client?.email ??
    store.user?.email ??
    undefined;

  if (!email) {
    const { data: { user } } = await supabase.auth.getUser();
    email = user?.email ?? undefined;
  }

  if (clientId) {
    return { id: clientId as string, email: email as string | undefined };
  }

  if (email) {
    const { data, error } = await supabase
      .from('clients')
      .select('id, email')
      .eq('email', email)
      .maybeSingle();
    if (error) throw error;
    if (data?.id) return { id: data.id as string, email: (data.email ?? email) as string };
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (user?.id) {
    const { data, error } = await supabase
      .from('clients')
      .select('id, email')
      .eq('user_id', user.id)
      .maybeSingle();
    if (error) throw error;
    if (data?.id) {
      return {
        id: data.id as string,
        email: (data.email ?? user.email ?? email) as string | undefined,
      };
    }
  }

  throw new Error('No email available to update client');
}

export async function saveClient(data: any) {
  if (!data?.email) throw new Error('email is required');
  const row = prepareClientRow(data);

  const { data: existing, error: selErr } = await supabase
    .from('clients').select('id').eq('email', data.email).maybeSingle();
  if (selErr) throw selErr;

  if (existing?.id) {
    const { error } = await supabase.from('clients').update(row).eq('id', existing.id);
    if (error) throw error;
  } else {
    const { error } = await supabase.from('clients').insert(row);
    if (error) throw error;
  }

  const client = await fetchClientByEmail(data.email);
  useUserStore.getState().setClient?.(client);
  return client;
}



export async function updateClient(patch: any) {
  const store = useUserStore.getState();
  const { id, email } = await resolveClientIdentity(patch);

  // Build row from your existing mapper
  const built = prepareClientRow(patch);

  // 1) Strip undefined so we never send them to Supabase
  const row = stripUndefined(built);

  // Never overwrite primary keys via patch accidentally
  delete (row as any).id;
  delete (row as any).user_id;

  // 2) Protect avatar_url: only include it if caller explicitly provided it in patch
  if (
    !Object.prototype.hasOwnProperty.call(patch, 'avatar_url') &&
    !Object.prototype.hasOwnProperty.call(patch, 'avatarUrl')
  ) {
    delete (row as any).avatar_url;
  }
  // (If you pass avatar_url: null in patch, it WILL clear it in DB, by design.)

  const { error } = await supabase.from('clients').update(row).eq('id', id);
  if (error) throw error;

  const client = email
    ? await fetchClientByEmail(email)
    : await fetchClientById(id);
  store.setClient?.(client);
  return client;
}

export async function appendDoneScreen(key: 'metrics'|'goals'|'level'|'eatinghabbits'|'supplements') {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) throw new Error('No user');

  const { data: row, error: selErr } = await supabase
    .from('clients')
    .select('id, done_screens')
    .eq('email', user.email)
    .order('id', { ascending: true })
    .limit(1)
    .maybeSingle();
  if (selErr) {
    console.log(selErr);
    throw selErr;
  }
  if (!row?.id) throw new Error('Client not found');

  const next = Array.from(new Set([...(row?.done_screens ?? []), key]));
  const { error: updErr } = await supabase
    .from('clients')
    .update({ done_screens: next })
    .eq('id', row.id);
  if (updErr){
    console.log(updErr);
    throw updErr;
  } 
}
type MeasurementType = 'ai' | 'manual';
export async function addClientMeasurement(input: MeasurementRow) {
  const today = new Date().toISOString().slice(0, 10);
  const date = input.date ?? today;
  const toNum = (v: any) =>
    v === '' || v === undefined || v === null ? null : Number(v);

  // Prefer upsert-by-date so re-running onboarding doesn't fail on duplicates.
  return addClientMeasurementDate({
    clientId: input.clientId,
    weight: toNum(input.weight),
    bodyfat: toNum((input as any).bodyfat),
    pictureFront: (input as any).pictureFront ?? null,
    pictureSide: (input as any).pictureSide ?? null,
    pictureBack: (input as any).pictureBack ?? null,
    dateISO: date,
    measurementType: ((input as any).measurementType as MeasurementType) || 'manual',
  });
}


export async function addClientMeasurementDate({
  clientId,
  weight,
  bodyfat,
  pictureFront,
  pictureSide,
  pictureBack,
  dateISO,                      // YYYY-MM-DD (optional, defaults today)
  measurementType = 'manual',   // 'ai' | 'manual'
}: {
  clientId: number;
  weight?: number | string | null;
  bodyfat?: number | string | null;
  pictureFront?: string | null;
  pictureSide?: string | null;
  pictureBack?: string | null;
  dateISO?: string;
  measurementType?: 'ai' | 'manual';
}) {
  const date = dateISO ?? new Date().toISOString().slice(0, 10);
  const toNum = (v: any) =>
    v === '' || v === undefined || v === null ? null : Number(v);

  // 1) See if a row already exists for (client_id, date)
  const { data: existingRows, error: selErr } = await supabase
    .from('client_measurements')
    .select('id, checklist')
    .eq('client_id', clientId)
    .eq('date', date)
    .order('id', { ascending: true })
    .limit(1);
  if (selErr) throw selErr;
  const existing = existingRows?.[0] ?? null;

  const payload = {
    client_id: clientId,
    date,
    weight: toNum(weight),
    bodyfat: toNum(bodyfat),
    picture_front: pictureFront ?? null,
    picture_side: pictureSide ?? null,
    picture_back: pictureBack ?? null,
    measurement_type: measurementType,
  };

  if (existing) {
    // 2) UPDATE existing row (keep checklist as-is)
    const { error } = await supabase
      .from('client_measurements')
      .update(payload)
      .eq('id', existing.id);
    if (error) throw error;
    return existing.id;
  } else {
    // 3) INSERT new row
    const { data, error } = await supabase
      .from('client_measurements')
      .insert(payload)
      .select('id')
      .limit(1);
    if (error) throw error;
    return data?.[0]?.id;
  }
}

export async function getMeasurementByDate(clientId: number, isoDate: string) {
  const { data, error } = await supabase
    .from('client_measurements')
    .select('id, date, weight, bodyfat, picture_front, picture_side, picture_back, measurement_type, checklist')
    .eq('client_id', clientId)
    .eq('date', isoDate)
    .order('id', { ascending: true })
    .limit(1);
  if (error) throw error;
  return data?.[0] ?? null;
}


export type WeekRow = {
  date: string; weight: number|null; bodyfat: number|null;
  picture_front: string|null; picture_side: string|null; picture_back: string|null;
};

export async function getWeekMeasurementRows(clientId: number, weekStartISO: string): Promise<WeekRow[]> {
  const start = new Date(weekStartISO);
  const end = new Date(start); end.setDate(start.getDate() + 6);
  const toISO = (d: Date) => d.toISOString().slice(0,10);

  const { data, error } = await supabase
    .from('client_measurements')
    .select('date, weight, bodyfat, picture_front, picture_side, picture_back')
    .eq('client_id', clientId)
    .gte('date', toISO(start))
    .lte('date', toISO(end));

  if (error) return [];
  return (data ?? []) as WeekRow[];
}

export type DayDatum = { date: string; weight: number | null };

export async function getWeekMeasurements(clientId: number, weekStartISO: string) {
  const start = new Date(weekStartISO);
  const end = new Date(start); end.setDate(start.getDate() + 6);
  const toISO = (d: Date) => d.toISOString().slice(0,10);

  const { data, error } = await supabase
    .from('client_measurements')
    .select('date, weight')
    .eq('client_id', clientId)
    .gte('date', toISO(start))
    .lte('date', toISO(end));
  if (error) return [];

  // index by yyyy-mm-dd
  const byDate = Object.fromEntries((data ?? []).map(r => [r.date.slice(0,10), r.weight as number | null]));

  // 7 days, carry last known forward
  const out: DayDatum[] = [];
  let last: number | null = null;
  for (let i=0;i<7;i++){
    const d = new Date(start); d.setDate(start.getDate()+i);
    const key = toISO(d);
    const w = (byDate[key] ?? null);
    if (w != null) last = w;
    out.push({ date: key, weight: w ?? last });
  }
  return out;
}