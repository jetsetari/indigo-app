// src/data/supabase/authHandler.ts
import { getSupabase } from './connection';
import { ensureClientByEmail } from './clientsHandler';
import { useUserStore } from '~/data/store/userStore';
import type { RegisterInput } from '~/data/types';
import type { ClientUpsertInput } from '~/data/types';

export async function registerAndBootstrap(input: RegisterInput) {
  const supabase = getSupabase();

  const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({
    email: input.email,
    password: input.password,
    options: { data: {
      first_name: input.first_name ?? null,
      last_name : input.last_name  ?? null,
      dob       : input.dob ? input.dob.toISOString() : null,
      language  : input.language ?? 'nl',
      gender    : input.gender ?? null,
      avatar_url: input.avatar_url ?? null,
    } },
  });
  if (signUpErr && !/registered/i.test(signUpErr.message)) throw signUpErr;

  let user = signUpData?.user;
  let session = signUpData?.session;
  if (!session) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: input.email, password: input.password,
    });
    if (error) throw error;
    user = data.user; session = data.session;
  }

  const client = await ensureClientByEmail({
    email: input.email,
    first_name: input.first_name ?? '',
    last_name : input.last_name ?? null,
    dob       : input.dob ? new Date(input.dob) : null,
    gender    : input.gender ?? null,
    avatar_url: input.avatar_url ?? null,
    language  : input.language ?? 'nl',
  } satisfies ClientUpsertInput);

  try { await supabase.auth.updateUser({ data: { client_id: client.id } }); } catch {}

  const { setAuth, setClient } = useUserStore.getState();
  setAuth({ session, user });
  setClient(client);

  return { user, session, client };
}

export async function signIn(email: string, password: string) {
  const supabase = getSupabase();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim().toLowerCase(), password,
  });
  if (error) throw error;

  const meta = (data.user?.user_metadata ?? {}) as any;
  const client = await ensureClientByEmail({
    email,
    first_name: (meta.first_name ?? '').toString(),
    last_name : (meta.last_name ?? null),
    dob       : meta.dob ? new Date(meta.dob) : null,
    gender    : meta.gender ?? null,
    avatar_url: meta.avatar_url ?? null,
    language  : (meta.language ?? 'nl').toString(),
  });

  const { setAuth, setClient } = useUserStore.getState();
  setAuth({ session: data.session, user: data.user });
  setClient(client);

  return { user: data.user, session: data.session, client };
}


export async function signOut() {
  const supabase = getSupabase();
  await supabase.auth.signOut();
  useUserStore.getState().reset?.();
}
